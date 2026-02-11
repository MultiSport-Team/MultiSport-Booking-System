import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import venueService from '../../services/venueService';
import bookingService from '../../services/bookingService'; // Import bookingService
import Slots from '../../components/Slots'; // Import Slots component
import './UserPages.css';

const VenueDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [venueImages, setVenueImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadVenueDetails();
  }, [id]);

  useEffect(() => {
    if (venue) {
      fetchAvailableSlots();
    }
  }, [selectedDate, venue]);

  const loadVenueDetails = async () => {
    try {
      const result = await venueService.getVenueById(id);
      if (result.success) {
        setVenue(result.data);
        
        // Fetch venue images
        const imagesResult = await venueService.getVenueImages(id);
        if (imagesResult.success && Array.isArray(imagesResult.data)) {
          setVenueImages(imagesResult.data);
        } else {
          // Fallback to venue.image_url if it exists
          if (result.data.image_url) {
            setVenueImages([{ image_url: result.data.image_url }]);
          }
        }
      } else {
        toast.error(result.message || 'Failed to load venue');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(null); // Clear selected slot when date changes
      const result = await bookingService.getAvailableSlots(id, { date: selectedDate });
      if (result.success) {
        setAvailableSlots(result.data || []);
      } else {
        toast.info(result.message || 'No slots available for this date');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot to proceed.');
      return;
    }
    navigate(`/booking/${id}`, { state: { venue: venue, selectedSlot: selectedSlot } });
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venueImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venueImages.length) % venueImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container py-5 text-center">
        <p>Venue not found</p>
      </div>
    );
  }

  return (
    <div className="venue-details-page">
      <div className="container">
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/home')}
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>

        <div className="venue-images">
          <img
            src={
              venueImages.length > 0
                ? venueImages[currentImageIndex]?.image_url || venueImages[currentImageIndex]
                : venue.image_url || 'https://via.placeholder.com/800x400'
            }
            alt={venue.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400';
            }}
          />
          
          {/* Image Navigation - only show if multiple images */}
          {venueImages.length > 1 && (
            <>
              <button 
                className="carousel-nav-btn prev" 
                onClick={prevImage}
                title="Previous image"
              >
                ❮
              </button>
              <button 
                className="carousel-nav-btn next" 
                onClick={nextImage}
                title="Next image"
              >
                ❯
              </button>
              
              {/* Image Indicators */}
              <div className="image-indicators" style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
                {venueImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`indicator-dot ${currentImageIndex === idx ? 'active' : ''}`}
                    onClick={() => goToImage(idx)}
                    style={{
                      width: currentImageIndex === idx ? '10px' : '8px',
                      height: currentImageIndex === idx ? '10px' : '8px',
                      borderRadius: '50%',
                      background: currentImageIndex === idx ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  ></button>
                ))}
              </div>
              
              {/* Image Counter */}
              <div className="image-counter" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0, 0, 0, 0.6)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', zIndex: 10 }}>
                {currentImageIndex + 1} / {venueImages.length}
              </div>
            </>
          )}
        </div>

        <div className="venue-details-info">
          <h2>{venue.name}</h2>
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">{venue.city}, {venue.state}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Address:</span>
            <span className="info-value">{venue.address}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Price:</span>
            <span className="info-value">₹{venue.price_per_hour} per hour</span>
          </div>
          <div className="info-item">
            <span className="info-label">Sport:</span>
            <span className="info-value">{venue.sport_category_name || 'Sports'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Description:</span>
            <span className="info-value">{venue.description}</span>
          </div>

          <div className="mb-3">
            <label htmlFor="bookingDate" className="form-label">Select Date</label>
            <input
              type="date"
              id="bookingDate"
              className="form-control"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]} // Only allow future dates
            />
          </div>

          {slotsLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Slots...</span>
              </div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="slots-selection-section mt-4">
              <h3>Available Slots</h3>
              <Slots
                slots={availableSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
              />
            </div>
          ) : (
            <p className="text-center text-muted mt-4">No slots available for the selected date.</p>
          )}

          <button
            className="btn btn-primary mt-4"
            onClick={handleBookNow}
            disabled={!selectedSlot || slotsLoading}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailsPage;
