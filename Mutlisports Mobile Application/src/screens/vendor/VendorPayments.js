import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import bookingService from '../../services/bookingService';

const VendorPayments = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
    }, [])
  );

  const loadPayments = async () => {
    setLoading(true);
    try {
      const result = await bookingService.getVendorBookings({ status: 'CONFIRMED' });
      if (result.success) {
        const confirmeds = result.data || [];
        setBookings(confirmeds);
        calculateEarnings(confirmeds);
      } else {
        Alert.alert('Error', result.message || 'Failed to load payments');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEarnings = (confirmedBookings) => {
    let total = 0;
    let thisMonth = 0;
    let pending = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    confirmedBookings.forEach((booking) => {
      const amount = parseFloat(booking.total_amount) || 0;
      total += amount;

      // Check if booking is from this month
      if (booking.created_at) {
        const bookingDate = new Date(booking.created_at);
        if (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        ) {
          thisMonth += amount;
        }
      }

      // Check payment status
      if (booking.payment_status === 'PENDING') {
        pending += amount;
      }
    });

    setTotalEarnings(total);
    setThisMonthEarnings(thisMonth);
    setPendingAmount(pending);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const renderPaymentCard = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentVenue}>{item.venue_name}</Text>
          <Text style={styles.paymentDate}>{item.slot_date}</Text>
          <Text style={styles.paymentBooking}>#{item.booking_number}</Text>
        </View>
        <Text style={styles.paymentAmount}>₹{item.total_amount}</Text>
      </View>
      <View style={styles.paymentStatus}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment Status:</Text>
          <View style={[
            styles.statusBadge,
            item.payment_status === 'PAID' ? styles.statusPaid : styles.statusPending,
          ]}>
            <Text style={styles.statusText}>{item.payment_status}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Booking Status:</Text>
          <View style={[styles.statusBadge, styles.statusConfirmed]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace('VendorDashboard');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsMain}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>₹{totalEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.earningsStats}>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
              <Text style={styles.statValue}>₹{thisMonthEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={20} color="#FFF" />
              <Text style={styles.statValue}>₹{pendingAmount.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Payment Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <Text style={styles.transactionCount}>{bookings.length} transactions</Text>
          </View>

          {bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No payment transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Complete bookings will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookings}
              renderItem={renderPaymentCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  earningsCard: {
    backgroundColor: '#FF6B6B',
    margin: 16,
    marginBottom: 8,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsMain: {
    marginBottom: 24,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  transactionCount: {
    fontSize: 13,
    color: '#999',
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 4,
  },
  listContainer: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentVenue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  paymentBooking: {
    fontSize: 11,
    color: '#BBB',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentStatus: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#D4EDDA',
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusConfirmed: {
    backgroundColor: '#D1ECF1',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
});

export default VendorPayments;
