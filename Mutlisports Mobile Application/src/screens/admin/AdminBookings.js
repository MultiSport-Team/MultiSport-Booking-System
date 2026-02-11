import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminService from '../../services/adminService';

const AdminBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      const filters = filterStatus !== 'ALL' ? { status: filterStatus } : {};
      const result = await adminService.getAdminBookings(filters);
      if (result.success) {
        setBookings(result.data);
        applyFilters(result.data, filterStatus);
      } else {
        Alert.alert('Error', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const applyFilters = (bookingList, status) => {
    if (status === 'ALL') {
      setFilteredBookings(bookingList);
    } else {
      setFilteredBookings(bookingList.filter((b) => b.status === status));
    }
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    applyFilters(bookings, status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#4CAF50';
      case 'PENDING':
        return '#FFA500';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const BookingCard = ({ booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.bookingNumber}>{booking.booking_number}</Text>
          <Text style={styles.venueName}>{booking.venue_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailBox}>
            <Ionicons name="calendar" size={16} color="#FF6B6B" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{booking.slot_date}</Text>
          </View>
          <View style={styles.detailBox}>
            <Ionicons name="time" size={16} color="#2196F3" />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {booking.start_time} - {booking.end_time}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.userInfoRow}>
          <View style={styles.userCol}>
            <Text style={styles.infoLabel}>User</Text>
            <Text style={styles.infoValue}>{booking.user_name}</Text>
            <Text style={styles.infoSubtext}>{booking.user_email}</Text>
          </View>
          <View style={styles.userCol}>
            <Text style={styles.infoLabel}>Vendor</Text>
            <Text style={styles.infoValue}>{booking.vendor_name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>₹{booking.total_amount}</Text>
        </View>
        <View style={[styles.paymentBadge, { backgroundColor: booking.payment_status === 'PAID' ? '#E8F5E9' : '#FFF3E0' }]}>
          <Text style={[styles.paymentText, { color: booking.payment_status === 'PAID' ? '#4CAF50' : '#FF9800' }]}>
            {booking.payment_status || 'PENDING'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              filterStatus === status && styles.filterBtnActive,
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filterStatus === status && styles.filterBtnTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
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
    backgroundColor: '#F5F5F5',
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
  filterContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#FF6B6B',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingNumber: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  userCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 10,
    color: '#999',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default AdminBookings;
