import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import venueService from '../../services/venueService';
import authService from '../../services/authService';

const Home = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceTimer = useRef(null);

  // Fetch user data
  useEffect(() => {
  const loadUser = async () => {
    const user = await authService.getCurrentUser();
    setUserData(user);
  };
  loadUser();
}, []);

  // Fetch venues and categories on mount
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
    await Promise.all([
      fetchVenues(),
      fetchCategories(),
    ]);
    setLoading(false);
  };

  const fetchVenues = async () => {
    try {
      const result = await venueService.getAllVenues();
      
      if (result.success) {
        setVenues(result.data);
        setFilteredVenues(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      Alert.alert('Error', 'Failed to load venues');
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await venueService.getSportsCategories();
      
      if (result.success) {
        setCategories(result.data);
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
        setFilteredVenues(result.data);
      } else {
        // Fallback to client-side filtering if API search fails
        let filtered = [...venues];
        
        if (searchQuery.trim()) {
          filtered = filtered.filter(venue =>
            venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.sport_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (selectedCategory) {
          filtered = filtered.filter(venue => 
            venue.sport_category_id === selectedCategory
          );
        }

        setFilteredVenues(filtered);
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      // Fallback to client-side filtering
      let filtered = [...venues];
      
      if (searchQuery.trim()) {
        filtered = filtered.filter(venue =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.sport_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedCategory) {
        filtered = filtered.filter(venue => 
          venue.sport_category_id === selectedCategory
        );
      }

      setFilteredVenues(filtered);
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  }, []);

  const handleMoreMenuPress = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMenuOption = (option) => {
    setShowMoreMenu(false);
    
    if (option === 'Settings') {
      navigation.navigate('Settings');
    } else if (option === 'Bookings') {
      navigation.navigate('MyBooking');
    } else if (option === 'Logout') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            onPress: async () => {
              await authService.logout();
              navigation.replace('SignIn');
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const renderCategoryChip = ({ item }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isSelected && styles.categoryChipActive
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : item.id)}
      >
        {item.icon_url ? (
          <Image source={{ uri: item.icon_url }} style={styles.categoryIcon} />
        ) : (
          <Ionicons 
            name="football-outline" 
            size={16} 
            color={isSelected ? '#FFF' : '#666'} 
          />
        )}
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextActive
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderVenueCard = ({ item }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => navigation.navigate('VenueDetails', { venueId: item.id })}
    >
      {/* Venue Image */}
      <Image
        source={{ 
          uri: item.images?.[0]?.image_url || 'https://via.placeholder.com/300x200?text=No+Image' 
        }}
        style={styles.venueImage}
      />

      {/* Approval Status Badge (if pending) */}
      {item.approval_status === 'PENDING' && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      )}

      {/* Venue Info */}
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.name}</Text>
        <Text style={styles.sportType}>{item.sport_name}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#FF6B6B" />
          <Text style={styles.locationText}>
            {item.city} • {item.address}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>₹{item.price_per_hour}/hour</Text>
          <Text style={styles.vendorText}>by {item.vendor_name}</Text>
        </View>

        {/* Amenities */}
        {item.amenities && (
          <View style={styles.amenitiesContainer}>
            {Object.entries(item.amenities)
              .filter(([key, value]) => value === true)
              .slice(0, 3)
              .map(([key], idx) => (
                <View key={idx} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </View>
              ))
            }
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookNow', { venue: item })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (searchLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.emptyText}>Searching venues...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>No venues found</Text>
        <Text style={styles.emptySubText}>
          {searchQuery ? 'Try a different search' : 'No venues available'}
        </Text>
        {(searchQuery || selectedCategory) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading venues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hello, {userData?.first_name || 'User'}! 👋
          </Text>
          <Text style={styles.subGreeting}>Find your favorite venue</Text>
        </View>

        {/* Profile & More Actions */}
        <View style={styles.headerRight}>
          {/* Profile Button */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="person" size={20} color="#FF6B6B" />
          </TouchableOpacity>

          {/* More Actions Button */}
          <View style={styles.moreMenuContainer}>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMoreMenuPress}
            >
              <MaterialIcons name="more-vert" size={24} color="#1A1A1A" />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption('Settings')}
                >
                  <Ionicons name="settings-outline" size={18} color="#1A1A1A" />
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption('Bookings')}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#1A1A1A" />
                  <Text style={styles.menuText}>My Bookings</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption('Logout')}
                >
                  <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
                  <Text style={[styles.menuText, { color: '#FF6B6B' }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues, sports, or cities..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <FlatList
            horizontal
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
      )}

      {/* Venues List */}
      <ScrollView
        style={styles.venuesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.venuesListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} Venues`
              : 'Available Venues'
            }
          </Text>
          <Text style={styles.venueCount}>
            {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
          </Text>
        </View>

        {filteredVenues.length > 0 ? (
          <FlatList
            data={filteredVenues}
            renderItem={renderVenueCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  moreMenuContainer: {
    position: 'relative',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  categoriesSection: {
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  venuesList: {
    flex: 1,
  },
  venuesListContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  venueCount: {
    fontSize: 14,
    color: '#666',
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  pendingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sportType: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  vendorText: {
    fontSize: 12,
    color: '#999',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Home;