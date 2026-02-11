import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import bookingService from '../../services/bookingService';

const VendorBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const result = await bookingService.getVendorBookings(filters);
      if (result.success) {
        setBookings(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleConfirmBooking = (bookingId) => {
    Alert.alert('Confirm Booking', 'Are you sure you want to confirm this booking?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const result = await bookingService.confirmBooking(bookingId);
            if (result.success) {
              Alert.alert('Success', 'Booking confirmed successfully');
              loadBookings();
            } else {
              Alert.alert('Error', result.message || 'Failed to confirm booking');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to confirm booking');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#4CAF50';
      case 'PENDING':
        return '#FFA500';
      case 'CANCELLED':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  const renderBookingCard = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.venueName}>{item.venue_name}</Text>
          <Text style={styles.bookingNumber}>#{item.booking_number}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>{item.first_name} {item.last_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={[styles.detailText, { flex: 1 }]}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.slot_date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>{item.start_time} - {item.end_time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#4CAF50" />
          <Text style={[styles.detailText, { fontWeight: '600', color: '#4CAF50' }]}>₹{item.total_amount}</Text>
        </View>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => handleConfirmBooking(item.id)}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
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
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              statusFilter === status && styles.filterBtnActive,
            ]}
            onPress={() => {
              setStatusFilter(status);
              loadBookings();
            }}
          >
            <Text
              style={[
                styles.filterBtnText,
                statusFilter === status && styles.filterBtnTextActive,
              ]}
            >
              {status === 'all' ? 'All' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={64} color="#DDD" />
          <Text style={styles.emptyText}>No bookings yet</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
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
  filterContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bookingInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bookingNumber: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default VendorBookings;
