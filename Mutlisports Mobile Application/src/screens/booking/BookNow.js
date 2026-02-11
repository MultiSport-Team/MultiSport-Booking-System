import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import bookingVenue from '../../services/bookingVenue';
import venueService from '../../services/venueService';

const BookNow = ({ navigation, route }) => {
  const venueParam = route?.params?.venue;
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('card');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: 'qr-code-2',
      description: 'Google Pay, PhonePe, PayTM',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: 'account-balance-wallet',
      description: 'PayPal, Apple Pay',
    },
    {
      id: 'bank',
      name: 'Net Banking',
      icon: 'account-balance',
      description: 'Direct bank transfer',
    },
  ];

  // Fetch venue details on mount
  useEffect(() => {
    if (venueParam?.id) {
      fetchVenueDetails();
    } else {
      Alert.alert('Error', 'Venue information not found');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Home');
      }
    }
  }, []);

  // Fetch slots when date changes
  useEffect(() => {
    if (venue) {
      fetchAvailableSlots();
    }
  }, [selectedDate, venue]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      const result = await venueService.getVenueById(venueParam.id);
      
      if (result.success) {
        setVenue(result.data);
      } else {
        Alert.alert('Error', result.message);
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
      Alert.alert('Error', 'Failed to load venue details');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Home');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(null); // Clear selected slot when date changes
      
      const dateString = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const result = await bookingVenue.getAvailableSlots(venue.id, {
        date: dateString,
      });
      
      if (result.success) {
        setTimeSlots(result.data);
      } else {
        setTimeSlots([]);
        Alert.alert('Info', 'No slots available for this date');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setTimeSlots([]);
      Alert.alert('Error', 'Failed to load available slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatSlotTime = (startTime, endTime) => {
    // Convert 24-hour format to 12-hour format with AM/PM
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please select date and time slot');
      return;
    }

    try {
      setLoading(true);
      
      // Generate unique idempotency key
      const idempotencyKey = `booking-${venue.id}-${selectedSlot.id}-${Date.now()}`;
      
      const result = await bookingVenue.createBooking({
        venue_id: venue.id,
        slot_id: selectedSlot.id,
        idempotency_key: idempotencyKey,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          `Booking created successfully!\nBooking Number: ${result.data.booking_number}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Payment', {
                  bookingId: result.data.booking_id,
                  bookingNumber: result.data.booking_number,
                  amount: result.data.amount,
                  venueName: venue.name,
                  slotTime: formatSlotTime(selectedSlot.start_time, selectedSlot.end_time),
                  date: selectedDate.toLocaleDateString(),
                  paymentMethod: selectedPayment,
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Booking Failed', result.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !venue) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      {/* Header */}
      <View style={styles.header}>
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
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Now</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Venue Card */}
        <View style={styles.venueCard}>
          <Image 
            source={{ 
              uri: venue.images?.[0]?.image_url || 'https://via.placeholder.com/300x200?text=Venue' 
            }} 
            style={styles.venueImage} 
          />
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.sportType}>{venue.sport_name}</Text>
            <View style={styles.venueDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color="#FF6B6B" />
                <Text style={styles.detailText}>{venue.city}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{venue.address}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.detailText}>
                  by {venue.vendor_name} {venue.vendor_last_name}
                </Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price per hour:</Text>
              <Text style={styles.priceValue}>₹{venue.price_per_hour}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color="#FF6B6B" />
            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>Selected Date</Text>
              <Text style={styles.dateValue}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Slot Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            {slotsLoading && (
              <ActivityIndicator size="small" color="#FF6B6B" />
            )}
          </View>

          {slotsLoading ? (
            <View style={styles.slotsLoadingContainer}>
              <Text style={styles.loadingSlotText}>Loading slots...</Text>
            </View>
          ) : timeSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {timeSlots.map((slot) => {
                const isAvailable = slot.is_available === 1 && slot.status === 'AVAILABLE';
                const isSelected = selectedSlot?.id === slot.id;
                
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      !isAvailable && styles.slotButtonDisabled,
                      isSelected && styles.slotButtonSelected,
                    ]}
                    onPress={() => isAvailable && setSelectedSlot(slot)}
                    disabled={!isAvailable}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !isAvailable && styles.slotTextDisabled,
                        isSelected && styles.slotTextSelected,
                      ]}
                    >
                      {formatSlotTime(slot.start_time, slot.end_time)}
                    </Text>
                    {!isAvailable && (
                      <Text style={styles.unavailableText}>Booked</Text>
                    )}
                    {isAvailable && slot.final_price && (
                      <Text style={[
                        styles.slotPriceText,
                        isSelected && styles.slotPriceTextSelected
                      ]}>
                        ₹{slot.final_price}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.noSlotsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#CCC" />
              <Text style={styles.noSlotsText}>No slots available</Text>
              <Text style={styles.noSlotsSubText}>Please select another date</Text>
            </View>
          )}
        </View>

        {/* Selected Slot Info */}
        {selectedSlot && (
          <View style={styles.selectedSlotInfo}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <View style={styles.slotInfoContent}>
              <Text style={styles.slotInfoTitle}>Selected Slot</Text>
              <Text style={styles.slotInfoValue}>
                {formatSlotTime(selectedSlot.start_time, selectedSlot.end_time)}
              </Text>
            </View>
            <Text style={styles.slotInfoPrice}>₹{selectedSlot.final_price}</Text>
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentLeft}>
                <MaterialIcons
                  name={method.icon}
                  size={24}
                  color={selectedPayment === method.id ? '#FF6B6B' : '#999'}
                />
                <View style={styles.paymentInfo}>
                  <Text
                    style={[
                      styles.paymentName,
                      selectedPayment === method.id && styles.paymentNameActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                  <Text style={styles.paymentDesc}>{method.description}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonActive,
                ]}
              >
                {selectedPayment === method.id && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        {selectedSlot && (
          <View style={styles.priceSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Venue Price</Text>
              <Text style={styles.summaryValue}>₹{selectedSlot.final_price}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>1 hour</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate.toLocaleDateString('en-IN')}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{selectedSlot.final_price}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedSlot || loading) && styles.bookButtonDisabled,
          ]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedSlot || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.bookButtonText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0',
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
    marginBottom: 12,
  },
  venueDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  slotsLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingSlotText: {
    fontSize: 14,
    color: '#999',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  slotButtonDisabled: {
    borderColor: '#F0F0F0',
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextDisabled: {
    color: '#999',
  },
  slotPriceText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 4,
    fontWeight: '700',
  },
  slotPriceTextSelected: {
    color: '#FFFFFF',
  },
  unavailableText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  noSlotsSubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  selectedSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  slotInfoContent: {
    flex: 1,
  },
  slotInfoTitle: {
    fontSize: 12,
    color: '#999',
  },
  slotInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  slotInfoPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  paymentCardActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  paymentNameActive: {
    color: '#FF6B6B',
  },
  paymentDesc: {
    fontSize: 11,
    color: '#999',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  priceSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BookNow;