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

const ManagePendingVenues = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPendingVenues();
    }, [])
  );

  const loadPendingVenues = async () => {
    setLoading(true);
    try {
      const result = await adminService.getPendingVenues();
      if (result.success) {
        setVenues(result.data);
      } else {
        Alert.alert('Error', 'Failed to load pending venues');
      }
    } catch (error) {
      console.error('Error loading pending venues:', error);
      Alert.alert('Error', 'Failed to load pending venues');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingVenues();
    setRefreshing(false);
  };

  const approveVenue = async (venueId, venueName) => {
    Alert.alert('Approve Venue', `Approve "${venueName}"?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            const result = await adminService.approveVenue(venueId);
            if (result.success) {
              Alert.alert('Success', 'Venue approved!');
              loadPendingVenues();
            } else {
              Alert.alert('Error', 'Failed to approve venue');
            }
          } catch (error) {
            console.error('Error approving venue:', error);
            Alert.alert('Error', 'Failed to approve venue');
          }
        },
      },
    ]);
  };

  const rejectVenue = async (venueId, venueName) => {
    Alert.alert('Reject Venue', `Reject "${venueName}"?`, [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Reject',
        onPress: async () => {
          try {
            const result = await adminService.rejectVenue(venueId);
            if (result.success) {
              Alert.alert('Success', 'Venue rejected!');
              loadPendingVenues();
            } else {
              Alert.alert('Error', 'Failed to reject venue');
            }
          } catch (error) {
            console.error('Error rejecting venue:', error);
            Alert.alert('Error', 'Failed to reject venue');
          }
        },
      },
    ]);
  };

  const VenueCard = ({ venue }) => (
    <View style={styles.venueCard}>
      {/* Venue Header */}
      <View style={styles.venueHeader}>
        <View style={styles.venueIcon}>
          <Ionicons name="storefront" size={32} color="#FF6B6B" />
        </View>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <Text style={styles.venueSubtitle}>{venue.sport_name}</Text>
        </View>
      </View>

      {/* Vendor Info */}
      <View style={styles.vendorSection}>
        <Text style={styles.sectionLabel}>Vendor Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>
            {venue.vendor_name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={styles.infoText}>{venue.vendor_email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#666" />
          <Text style={styles.infoText}>{venue.vendor_phone}</Text>
        </View>
      </View>

      {/* Venue Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionLabel}>Venue Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{venue.city}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={[styles.detailValue, { flex: 1 }]}>{venue.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price/Hour:</Text>
          <Text style={styles.detailValue}>₹{venue.price_per_hour}</Text>
        </View>

        {venue.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descriptionText}>{venue.description}</Text>
          </View>
        )}
      </View>

      {/* Amenities */}
      {venue.amenities && Object.keys(venue.amenities).length > 0 && (
        <View style={styles.amenitiesSection}>
          <Text style={styles.sectionLabel}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {Object.entries(venue.amenities).map(([key, value]) => (
              <View
                key={key}
                style={[
                  styles.amenityBadge,
                  { opacity: value ? 1 : 0.5 },
                ]}
              >
                <Ionicons
                  name={value ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={value ? '#4CAF50' : '#CCC'}
                />
                <Text style={styles.amenityLabel}>
                  {key.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Submission Date */}
      <Text style={styles.submissionDate}>
        Submitted on {new Date(venue.created_at).toLocaleDateString()}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => rejectVenue(venue.id, venue.name)}
        >
          <Ionicons name="close-circle" size={18} color="#FFF" />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => approveVenue(venue.id, venue.name)}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFF" />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pending Venues</Text>
          <Text style={styles.headerCount}>{venues.length} awaiting approval</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Venues List */}
      <FlatList
        data={venues}
        renderItem={({ item }) => <VenueCard venue={item} />}
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
            <Ionicons name="checkmark-done-circle" size={48} color="#4CAF50" />
            <Text style={styles.emptyText}>No pending venues</Text>
            <Text style={styles.emptySubtext}>All venues have been reviewed!</Text>
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
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerCount: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginTop: 2,
  },
  placeholder: {
    width: 24,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  venueCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  venueIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  venueSubtitle: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  vendorSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  descriptionBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  amenitiesSection: {
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  submissionDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F44336',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
});

export default ManagePendingVenues;
