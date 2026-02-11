import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import venueService from '../../services/venueService';
import bookingVenue from '../../services/bookingVenue';

export default function VenueDetails({ route, navigation }) {
  const { venueId } = route.params;
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchVenueDetails();
  }, []);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      const result = await venueService.getVenueById(venueId);
      if (result.success) {
        setVenue(result.data);
        // Get available slots for this venue
        const today = new Date().toISOString().split('T')[0];
        const slotsResult = await bookingVenue.getAvailableSlots(venueId, today);
        if (slotsResult.success) {
          setAvailableSlots(slotsResult.data || []);
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to load venue details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
      Alert.alert('Error', 'Failed to load venue details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!selectedSlot) {
      Alert.alert('Select a Slot', 'Please select a time slot to proceed');
      return;
    }
    navigation.navigate('BookNow', {
      venueId: venueId,
      venueName: venue.name,
      slot: selectedSlot,
      price: venue.price_per_hour,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Venue not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace('Home');
            }
          }}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace('Home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Venue Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Venue Image */}
      {venue.image_url && (
        <Image
          source={{ uri: venue.image_url }}
          style={styles.venueImage}
        />
      )}

      {/* Venue Info */}
      <View style={styles.content}>
        {/* Name and Rating */}
        <View style={styles.nameSection}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>
              {venue.rating ? venue.rating.toFixed(1) : 'N/A'} ({venue.reviews_count || 0} reviews)
            </Text>
          </View>
        </View>

        {/* Price and Category */}
        <View style={styles.priceSection}>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Price per Hour</Text>
            <Text style={styles.price}>₹{venue.price_per_hour}</Text>
          </View>
          {venue.sport_category_name && (
            <View style={styles.categoryBox}>
              <Text style={styles.categoryLabel}>Sport</Text>
              <Text style={styles.categoryName}>{venue.sport_category_name}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <Ionicons name="location" size={20} color="#FF6B6B" />
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationText}>{venue.address}</Text>
            {venue.city && <Text style={styles.cityText}>{venue.city}</Text>}
          </View>
        </View>

        {/* Description */}
        {venue.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{venue.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {venue.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Vendor Info */}
        {venue.vendor_name && (
          <View style={styles.vendorSection}>
            <Text style={styles.sectionTitle}>Vendor Information</Text>
            <View style={styles.vendorCard}>
              <Text style={styles.vendorName}>{venue.vendor_name}</Text>
              {venue.vendor_contact && (
                <Text style={styles.vendorContact}>📞 {venue.vendor_contact}</Text>
              )}
            </View>
          </View>
        )}

        {/* Available Slots */}
        {availableSlots.length > 0 && (
          <View style={styles.slotsSection}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <FlatList
              data={availableSlots}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.slotItem,
                    selectedSlot?.id === item.id && styles.slotItemSelected,
                  ]}
                  onPress={() => setSelectedSlot(item)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot?.id === item.id && styles.slotTextSelected,
                    ]}
                  >
                    {item.start_time} - {item.end_time}
                  </Text>
                  <Text
                    style={[
                      styles.slotStatus,
                      selectedSlot?.id === item.id && styles.slotStatusSelected,
                    ]}
                  >
                    {item.available ? 'Available' : 'Booked'}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.slotRow}
            />
          </View>
        )}

        {/* Book Now Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
          disabled={!selectedSlot}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 30,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backIcon: {
    padding: 8,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  venueImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 16,
  },
  nameSection: {
    marginBottom: 20,
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  categoryBox: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationSection: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationContent: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 12,
    color: '#666',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  amenitiesSection: {
    marginBottom: 20,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  vendorSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  vendorCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vendorContact: {
    fontSize: 12,
    color: '#666',
  },
  slotsSection: {
    marginBottom: 20,
  },
  slotRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotItem: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  slotItemSelected: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  slotTextSelected: {
    color: '#FF6B6B',
  },
  slotStatus: {
    fontSize: 11,
    color: '#888',
  },
  slotStatusSelected: {
    color: '#FF6B6B',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
