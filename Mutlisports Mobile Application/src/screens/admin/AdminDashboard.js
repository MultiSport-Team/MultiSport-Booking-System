import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminService from '../../services/adminService';

const AdminDashboard = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAdminStats();
      if (result.success) {
        setStats(result.data);
      } else {
        Alert.alert('Error', 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              navigation.replace('SignIn');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const QuickActionButton = ({ icon, label, onPress, color = '#FF6B6B' }) => (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: `${color}20`, borderColor: color }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6B6B']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, Admin!</Text>
          <Text style={styles.subtitle}>MultiSport Management System</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>

        <StatCard
          icon="people"
          label="Total Users"
          value={stats?.total_users || 0}
          color="#4CAF50"
          onPress={() => navigation.navigate('ManageUsers')}
        />

        <StatCard
          icon="storefront"
          label="Total Vendors"
          value={stats?.total_vendors || 0}
          color="#2196F3"
          onPress={() => navigation.navigate('ManageUsers')}
        />

        <StatCard
          icon="building"
          label="Total Venues"
          value={stats?.total_venues || 0}
          color="#FF9800"
        />

        <StatCard
          icon="alert-circle"
          label="Pending Venues"
          value={stats?.pending_venues || 0}
          color="#F44336"
          onPress={() => navigation.navigate('ManagePendingVenues')}
        />

        <StatCard
          icon="calendar"
          label="Total Bookings"
          value={stats?.total_bookings || 0}
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminBookings')}
        />

        <StatCard
          icon="cash"
          label="Total Revenue"
          value={`₹${stats?.total_revenue || 0}`}
          color="#1976D2"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <QuickActionButton
            icon="people-outline"
            label="Manage Users"
            color="#4CAF50"
            onPress={() => navigation.navigate('ManageUsers')}
          />
          <QuickActionButton
            icon="alert-outline"
            label="Pending Venues"
            color="#F44336"
            onPress={() => navigation.navigate('ManagePendingVenues')}
          />
          <QuickActionButton
            icon="calendar-outline"
            label="All Bookings"
            color="#9C27B0"
            onPress={() => navigation.navigate('AdminBookings')}
          />
          <QuickActionButton
            icon="add-circle-outline"
            label="Add Category"
            color="#2196F3"
            onPress={() => navigation.navigate('AdminCategories')}
          />
        </View>
      </View>

      {/* Pending Venues Alert */}
      {stats?.pending_venues > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => navigation.navigate('ManagePendingVenues')}
        >
          <Ionicons name="warning" size={24} color="#FFF" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {stats.pending_venues} venue(s) awaiting approval
            </Text>
            <Text style={styles.alertSubtitle}>Tap to review</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      <View style={styles.footer} />
    </ScrollView>
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
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  logoutBtn: {
    padding: 10,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  actionsSection: {
    padding: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  alertBanner: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertSubtitle: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  footer: {
    height: 20,
  },
});

export default AdminDashboard;
