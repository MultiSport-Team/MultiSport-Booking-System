import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import venueService from '../../services/venueService';
import authService from '../../services/authService';
import './UserPages.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // State Management
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageCarousel, setImageCarousel] = useState({}); // Track current image index for each venue
  const searchDebounceTimer = useRef(null);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debounced search when query or category changes
  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    if (searchQuery.trim() || selectedCategory) {
      setSearchLoading(true);
      searchDebounceTimer.current = setTimeout(() => {
        performSearch();
      }, 500); // 500ms debounce
    } else {
      // If no search query and no category, show all venues
      setFilteredVenues(venues);
      setSearchLoading(false);
    }

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery, selectedCategory, venues]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchVenues(), fetchCategories()]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const result = await venueService.getAllVenues();
      if (result.success) {
        let venues = result.data || [];
        console.log('Raw venues from API:', venues);
        
        // Fetch images for each venue from the dedicated images endpoint
        venues = await Promise.all(
          venues.map(async (venue) => {
            try {
              // Always fetch images from the images endpoint
              const imagesResult = await venueService.getVenueImages(venue.id);
              console.log(`Images for venue ${venue.id}:`, imagesResult);
              
              let images = Array.isArray(imagesResult.data) ? imagesResult.data : [];
              
              // Fallback: if no images and venue has image_url, create array with it
              if (images.length === 0 && venue.image_url) {
                images = [{ image_url: venue.image_url }];
              }
              
              return {
                ...venue,
                images: images,
              };
            } catch (imageError) {
              console.error(`Error fetching images for venue ${venue.id}:`, imageError);
              
              // Fallback to image_url if present
              let images = [];
              if (venue.image_url) {
                images = [{ image_url: venue.image_url }];
              }
              
              return {
                ...venue,
                images: images,
              };
            }
          })
        );
        
        console.log('Venues with images:', venues);
        setVenues(venues);
        setFilteredVenues(venues);
      } else {
        toast.error(result.message || 'Failed to load venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues');
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await venueService.getSportsCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const performSearch = async () => {
    try {
      setSearchLoading(true);

      // Build filters object
      const filters = {};
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      if (selectedCategory) {
        filters.sport_category_id = selectedCategory;
      }

      // Call API with filters
      const result = await venueService.getAllVenues(filters);

      if (result.success) {
        let filtered = result.data || [];
        
        // Fetch images for each venue in search results
        filtered = await Promise.all(
          filtered.map(async (venue) => {
            try {
              const imagesResult = await venueService.getVenueImages(venue.id);
              console.log(`Images for searched venue ${venue.id}:`, imagesResult);
              return {
                ...venue,
                images: Array.isArray(imagesResult.data) ? imagesResult.data : [],
              };
            } catch (imageError) {
              console.error(`Error fetching images for venue ${venue.id}:`, imageError);
              return {
                ...venue,
                images: [],
              };
            }
          })
        );
        
        setFilteredVenues(filtered);
      } else {
        // Fallback to client-side filtering
        let filtered = [...venues];

        if (searchQuery.trim()) {
          filtered = filtered.filter(
            (venue) =>
              venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (venue.sport_name &&
                venue.sport_name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        if (selectedCategory) {
          filtered = filtered.filter(
            (venue) => venue.sport_category_id === selectedCategory
          );
        }

        setFilteredVenues(filtered);
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      // Fallback to client-side filtering
      let filtered = [...venues];

      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (venue) =>
            venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (venue.sport_name &&
              venue.sport_name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      if (selectedCategory) {
        filtered = filtered.filter(
          (venue) => venue.sport_category_id === selectedCategory
        );
      }

      setFilteredVenues(filtered);
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchVenues(), fetchCategories()]);
      toast.success('Venues refreshed!');
    } catch (error) {
      toast.error('Failed to refresh venues');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleMoreMenuPress = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMenuOption = (option) => {
    setShowMoreMenu(false);

    if (option === 'Settings') {
      navigate('/settings');
    } else if (option === 'Bookings') {
      navigate('/my-bookings');
    } else if (option === 'Logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        authService.logout();
        navigate('/login');
      }
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleViewDetails = (venueId) => {
    navigate(`/venue-details/${venueId}`);
  };

  const handleBookNow = (venue) => {
    navigate(`/booking/${venue.id}`, { state: { venue } });
  };

  const nextImage = (venueId, totalImages) => {
    setImageCarousel((prev) => ({
      ...prev,
      [venueId]: ((prev[venueId] || 0) + 1) % totalImages,
    }));
  };

  const prevImage = (venueId, totalImages) => {
    setImageCarousel((prev) => ({
      ...prev,
      [venueId]: ((prev[venueId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  const goToImage = (venueId, index) => {
    setImageCarousel((prev) => ({
      ...prev,
      [venueId]: index,
    }));
  };

  const renderEmptyState = () => {
    if (searchLoading) {
      return (
        <div className="empty-state">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="empty-text mt-3">Searching venues...</p>
        </div>
      );
    }

    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h5 className="empty-text">No venues found</h5>
        <p className="empty-subtext">
          {searchQuery || selectedCategory
            ? 'Try adjusting your search or filters'
            : 'No venues available at the moment'}
        </p>
        {(searchQuery || selectedCategory) && (
          <button
            className="btn btn-danger mt-3"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="home-page d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Refresh overlay */}
      {refreshing && (
        <div className="refresh-overlay">
          <div className="spinner-border text-white" role="status">
            <span className="visually-hidden">Refreshing...</span>
          </div>
        </div>
      )}

      <div className="container-fluid">
        {/* Header Section */}
        <div className="home-header">
          <div className="header-left">
            <h2 className="greeting">
              Hello, {user?.first_name || 'User'}! 👋
            </h2>
            <p className="sub-greeting">Find your favorite venue</p>
          </div>

          <div className="header-right">
            {/* Profile Button */}
            <button
              className="btn btn-icon"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              👤
            </button>

            {/* More Menu */}
            <div className="more-menu-container">
              <button
                className="btn btn-icon"
                onClick={handleMoreMenuPress}
                title="More options"
              >
                ⋮
              </button>

              {showMoreMenu && (
                <div className="dropdown-menu-custom show">
                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleMenuOption('Settings')}
                  >
                    <span>⚙️</span> Settings
                  </button>
                  <button
                    className="dropdown-menu-item"
                    onClick={() => handleMenuOption('Bookings')}
                  >
                    <span>📅</span> My Bookings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-menu-item danger"
                    onClick={() => handleMenuOption('Logout')}
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search venues, sports, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="categories-section">
            <div className="categories-scroll">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-chip ${
                    selectedCategory === category.id ? 'active' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <span className="category-icon">⚽</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="section-header">
          <h5 className="section-title">
            {selectedCategory
              ? `${categories.find((c) => c.id === selectedCategory)?.name} Venues`
              : 'Available Venues'}
          </h5>
          <span className="venue-count">
            {filteredVenues.length}{' '}
            {filteredVenues.length === 1 ? 'venue' : 'venues'}
          </span>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <div className="row g-4 mb-4">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="col-12 col-md-6 col-lg-4">
                <div className="venue-card-enhanced">
                  {/* Image Container with Carousel */}
                  <div className="venue-image-container position-relative">
                    {venue.images && venue.images.length > 0 ? (
                      <>
                        <img
                          src={
                            venue.images[imageCarousel[venue.id] || 0]?.image_url ||
                            venue.images[imageCarousel[venue.id] || 0]?.url ||
                            (typeof venue.images[imageCarousel[venue.id] || 0] === 'string' 
                              ? venue.images[imageCarousel[venue.id] || 0]
                              : 'https://via.placeholder.com/300x200?text=No+Image')
                          }
                          alt={venue.name}
                          className="venue-image"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/venue-details/${venue.id}`)}
                          onError={(e) => {
                            console.warn(`Image failed to load for venue ${venue.id}`);
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />

                        {/* Image Navigation Arrows - Only show if multiple images */}
                        {venue.images.length > 1 && (
                          <>
                            <button
                              className="carousel-nav-btn prev"
                              onClick={(e) => {
                                e.preventDefault();
                                prevImage(venue.id, venue.images.length);
                              }}
                              title="Previous image"
                            >
                              ❮
                            </button>
                            <button
                              className="carousel-nav-btn next"
                              onClick={(e) => {
                                e.preventDefault();
                                nextImage(venue.id, venue.images.length);
                              }}
                              title="Next image"
                            >
                              ❯
                            </button>

                            {/* Image Indicators/Dots */}
                            <div className="image-indicators">
                              {venue.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  className={`indicator-dot ${
                                    (imageCarousel[venue.id] || 0) === idx
                                      ? 'active'
                                      : ''
                                  }`}
                                  onClick={() => goToImage(venue.id, idx)}
                                  title={`Image ${idx + 1}`}
                                ></button>
                              ))}
                            </div>

                            {/* Image Counter */}
                            <div className="image-counter">
                              {(imageCarousel[venue.id] || 0) + 1} / {venue.images.length}
                            </div>
                          </>
                        )}

                        {venue.approval_status === 'PENDING' && (
                          <span className="pending-badge">Pending</span>
                        )}
                      </>
                    ) : (
                      <>
                        <img
                          src="https://via.placeholder.com/300x200?text=No+Image"
                          alt={venue.name}
                          className="venue-image"
                        />
                        {venue.approval_status === 'PENDING' && (
                          <span className="pending-badge">Pending</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Venue Info */}
                  <div className="venue-card-body">
                    <h6 className="venue-name">{venue.name}</h6>
                    <p className="sport-type">
                      {venue.sport_name || 'Sports Venue'}
                    </p>

                    {/* Location */}
                    <div className="location-row">
                      <span className="location-icon">📍</span>
                      <span className="location-text">
                        {venue.city}
                        {venue.address && ` • ${venue.address}`}
                      </span>
                    </div>

                    {/* Price and Vendor */}
                    <div className="price-row">
                      <span className="price-text">₹{venue.price_per_hour}/hr</span>
                      <span className="vendor-text">by {venue.vendor_name}</span>
                    </div>

                    {/* Amenities */}
                    {venue.amenities && Object.keys(venue.amenities).length > 0 && (
                      <div className="amenities-container">
                        {Object.entries(venue.amenities)
                          .filter(([key, value]) => value === true)
                          .slice(0, 3)
                          .map(([key], idx) => (
                            <span key={idx} className="amenity-tag">
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="venue-card-actions">
                      <button
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                        onClick={() => handleViewDetails(venue.id)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-grow-1 ms-2"
                        onClick={() => handleBookNow(venue)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default HomePage;
