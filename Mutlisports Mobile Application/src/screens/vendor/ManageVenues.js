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
import venueService from '../../services/venueService';

const ManageVenues = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadVenues();
    }, [])
  );

  const loadVenues = async () => {
    setLoading(true);
    try {
      const result = await venueService.getVendorVenues();
      if (result.success) {
        setVenues(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load venues');
      }
    } catch (error) {
      console.error('Error loading venues:', error);
      Alert.alert('Error', 'Failed to load venues');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVenues();
  };

  const handleDeleteVenue = (venueId, venueName) => {
    Alert.alert(
      'Delete Venue',
      `Are you sure you want to delete "${venueName}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const result = await venueService.deleteVenue(venueId);
              if (result.success) {
                Alert.alert('Success', 'Venue deleted successfully');
                loadVenues();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete venue');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete venue');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#4CAF50';
      case 'PENDING':
        return '#FFA500';
      case 'REJECTED':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  const renderVenueCard = ({ item }) => (
    <View style={styles.venueCard}>
      <View style={styles.venueHeader}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{item.name}</Text>
          <Text style={styles.venueCity}>{item.city}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.approval_status) }]}>
              <Text style={styles.statusText}>{item.approval_status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.venueDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={14} color="#666" />
          <Text style={styles.detailText}>₹{item.price_per_hour}/hour</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="information-circle" size={14} color="#666" />
          <Text style={styles.detailText}>{item.sport_name || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.venueActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('ManageSlots', { venueId: item.id, venueName: item.name })}
        >
          <Ionicons name="calendar" size={18} color="#2196F3" />
          <Text style={styles.actionBtnText}>Slots</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('EditVenue', { venue: item })}
        >
          <Ionicons name="pencil" size={18} color="#FF9800" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDeleteVenue(item.id, item.name)}
        >
          <Ionicons name="trash" size={18} color="#FF6B6B" />
          <Text style={styles.actionBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Manage Venues</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddVenue')}>
          <Ionicons name="add" size={28} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {venues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront" size={64} color="#DDD" />
          <Text style={styles.emptyText}>No venues yet</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddVenue')}
          >
            <Text style={styles.addBtnText}>Add Your First Venue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={venues}
          renderItem={renderVenueCard}
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
  addBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  venueCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  venueHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  venueCity: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  venueDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  venueActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});

export default ManageVenues;
