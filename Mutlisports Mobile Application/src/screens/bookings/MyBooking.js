import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import bookingVenue from '../../services/bookingVenue';

import { useFocusEffect } from '@react-navigation/native';

const MyBooking = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  // Fetch bookings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async (status = null) => {
    try {
      setLoading(true);
     const result = await bookingVenue.getUserBookings(status);

      
      if (result.success) {
        setBookings(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const statusFilter = activeTab === 'All' ? null : activeTab.toUpperCase();
    await fetchBookings(statusFilter);
    setRefreshing(false);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const statusFilter = tab === 'All' ? null : tab.toUpperCase();
    fetchBookings(statusFilter);
  };

  const handleCancelBooking = (bookingId, bookingNumber) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel booking ${bookingNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await bookingVenue.cancelBooking(bookingId);
              
              if (result.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                fetchBookings(); // Refresh the list
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (bookingId) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'CANCELLED':
        return '#F44336';
      default:
        return '#FF6B6B';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'alert-circle';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PENDING':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return 'Paid';
      case 'PENDING':
        return 'Payment Pending';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return paymentStatus;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => handleViewDetails(item.id)}
      activeOpacity={0.7}
    >
      {/* Booking Header with Status */}
      <View style={styles.bookingHeader}>
        <View style={styles.bookingHeaderLeft}>
          <Image 
            source={{ 
              uri: item.venue_image || 'https://via.placeholder.com/300x200?text=Venue' 
            }} 
            style={styles.bookingImage} 
          />
          <View style={styles.bookingTitleContainer}>
            <Text style={styles.venueName}>{item.venue_name}</Text>
            <Text style={styles.sportType}>{item.sport_name}</Text>
            <Text style={styles.bookingNumber}>#{item.booking_number}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={16}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.slot_date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#FF6B6B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.city}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {getPaymentStatusLabel(item.payment_status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Footer */}
      <View style={styles.bookingFooter}>
        <Text style={styles.amountText}>₹{item.total_amount}</Text>
        <View style={styles.actionButtons}>
          {item.status === 'CONFIRMED' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id, item.booking_number)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === 'PENDING' && item.payment_status === 'PENDING' && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => navigation.navigate('Payment', {
                bookingId: item.id,
                bookingNumber: item.booking_number,
                amount: item.total_amount,
                venueName: item.venue_name,
              })}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'All') return true;
    return booking.status === activeTab.toUpperCase();
  });

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && bookings.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{filteredBookings.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List or Empty State */}
      {filteredBookings.length > 0 ? (
        <ScrollView
          style={styles.bookingsList}
          contentContainerStyle={styles.bookingsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6B6B']}
              tintColor="#FF6B6B"
            />
          }
        >
          <Text style={styles.resultCount}>
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </Text>
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={64} color="#DDD" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'All' ? 'No Bookings Yet' : `No ${activeTab} Bookings`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'All' 
              ? 'Start booking your favorite venues today!'
              : `You don't have any ${activeTab.toLowerCase()} bookings.`
            }
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreButtonText}>Explore Venues</Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bookingsList: {
    flex: 1,
  },
  bookingsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 12,
  },
  bookingImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  bookingTitleContainer: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sportType: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 2,
  },
  bookingNumber: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookingDetails: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F9F9F9',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  exploreButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MyBooking;