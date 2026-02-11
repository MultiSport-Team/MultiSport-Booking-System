import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import bookingVenue from '../../services/bookingVenue';

const Payment = ({ navigation, route }) => {
  const { bookingId, bookingNumber, amount, venueName, slotTime, date, paymentMethod } = route?.params || {};
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('01');
  const [expiryYear, setExpiryYear] = useState(new Date().getFullYear().toString().slice(-2));
  const [cvv, setCvv] = useState('');
  const [coupon, setCoupon] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const [couponApplied, setCouponApplied] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const applyCoupon = () => {
    if (!coupon.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    if (coupon.toLowerCase() === 'sunbeam') {
      setDiscountedAmount(0);
      setCouponApplied(true);
      Alert.alert('Success', '🎉 Coupon applied! Your booking is free!');
    } else {
      Alert.alert('Invalid Coupon', 'The coupon code is not valid');
      setDiscountedAmount(amount);
      setCouponApplied(false);
    }
  };

  const handlePayment = async () => {
    // If coupon applied (free booking), skip card validation
    if (!couponApplied) {
      if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
        Alert.alert('Error', 'Please fill all card details');
        return;
      }

      // Validate card number - must be exactly 16 digits
      const cardDigits = cardNumber.replace(/\s/g, '');
      if (cardDigits.length !== 16) {
        Alert.alert('Error', 'Card number must be 16 digits');
        return;
      }
      
      if (cvv.length !== 3) {
        Alert.alert('Error', 'CVV must be 3 digits');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Only call payment API if booking ID exists
      if (!bookingId) {
        Alert.alert('Error', 'Invalid booking information');
        setIsProcessing(false);
        return;
      }

      // Call API to update payment status and confirm booking
      const paymentData = {
        payment_status: 'PAID',
        payment_reference: couponApplied ? `COUPON-SUNBEAM-${Date.now()}` : `CARD-${cardNumber.slice(-4)}-${Date.now()}`,
      };

      const result = await bookingVenue.updatePaymentStatus(bookingId, paymentData);

      if (result.success) {
        Alert.alert(
          'Payment Successful ✓',
          `Booking confirmed!\nBooking Number: ${bookingNumber}\nAmount: ₹${discountedAmount}`,
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MyBooking' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Error', result.message || 'Failed to process payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isProcessing}
      >
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Venue</Text>
            <Text style={styles.summaryValue}>{venueName || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{date || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time Slot</Text>
            <Text style={styles.summaryValue}>{slotTime || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: discountedAmount === 0 ? '#4CAF50' : '#FF6B6B' }]}>
              ₹{discountedAmount || 0}
            </Text>
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Coupon?</Text>
          <View style={styles.couponContainer}>
            <View style={styles.couponInputWrapper}>
              <Ionicons name="ticket" size={20} color="#666" />
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code (e.g., sunbeam)"
                placeholderTextColor="#999"
                value={coupon}
                onChangeText={setCoupon}
                editable={!couponApplied && !isProcessing}
                maxLength={20}
              />
              {couponApplied && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              )}
            </View>
            <TouchableOpacity
              style={[styles.applyCouponBtn, couponApplied && styles.applyCouponBtnDisabled]}
              onPress={applyCoupon}
              disabled={couponApplied || isProcessing}
            >
              <Text style={styles.applyCouponText}>
                {couponApplied ? 'Applied' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.couponHint}>💡 Try "sunbeam" for a free booking!</Text>
        </View>

        {/* Card Details - Only show if not free */}
        {discountedAmount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number (16 digits)</Text>
              <View style={styles.input}>
                <Ionicons name="card-outline" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  value={cardNumber}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\s/g, '');
                    if (/^\d*$/.test(cleaned) && cleaned.length <= 16) {
                      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={19}
                  editable={!isProcessing}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Holder Name</Text>
              <View style={styles.input}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  value={cardName}
                  onChangeText={setCardName}
                  editable={!isProcessing}
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isProcessing}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={[styles.textInput, { color: expiryMonth && expiryYear ? '#1A1A1A' : '#999' }]}>
                    {expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : 'Select MM/YY'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.input}>
                  <Ionicons name="shield-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    placeholderTextColor="#999"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                    editable={!isProcessing}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Free Booking Message */}
        {discountedAmount === 0 && couponApplied && (
          <View style={styles.freeBookingAlert}>
            <Ionicons name="gift" size={24} color="#4CAF50" />
            <Text style={styles.freeBookingText}>
              🎉 Your booking is FREE with this coupon!
            </Text>
          </View>
        )}

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              {discountedAmount === 0 ? 'Confirm Booking' : `Pay ₹${discountedAmount}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Expiry Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Month</Text>
                <FlatList
                  data={Array.from({ length: 12 }, (_, i) => ({
                    id: i,
                    value: String(i + 1).padStart(2, '0'),
                    label: String(i + 1).padStart(2, '0'),
                  }))}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        expiryMonth === item.value && styles.pickerItemSelected,
                      ]}
                      onPress={() => setExpiryMonth(item.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          expiryMonth === item.value && styles.pickerItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 250 }}
                />
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Year</Text>
                <FlatList
                  data={Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() + i).toString().slice(-2);
                    return {
                      id: i,
                      value: year,
                      label: year,
                    };
                  })}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        expiryYear === item.value && styles.pickerItemSelected,
                      ]}
                      onPress={() => setExpiryYear(item.value)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          expiryYear === item.value && styles.pickerItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 250 }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.datePickerButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 20,
  },
  pickerSection: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  picker: {
    height: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#FFE5E5',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  datePickerButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  datePickerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  couponInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  couponInput: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  applyCouponBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponBtnDisabled: {
    backgroundColor: '#ccc',
  },
  applyCouponText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  couponHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 10,
    fontSize: 16,
    color: '#1A1A1A',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  freeBookingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  freeBookingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  securityText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
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
  payButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Payment;
