import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';

const VendorDashboard = ({ navigation }) => {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setVendorData(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await authService.logout();
          navigation.replace('SignIn');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {vendorData?.first_name} {vendorData?.last_name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="storefront" size={32} color="#FF6B6B" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Venues</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color="#4CAF50" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={32} color="#2196F3" />
          <Text style={styles.statValue}>₹0</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Vendor Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Vendor Tasks</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ManageVenues')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="storefront" size={28} color="#FF6B6B" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Venues</Text>
            <Text style={styles.actionDescription}>Add and update your venues</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('VendorBookings')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="calendar" size={28} color="#4CAF50" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Bookings</Text>
            <Text style={styles.actionDescription}>View and manage bookings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('VendorPayments')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="cash" size={28} color="#2196F3" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Payments</Text>
            <Text style={styles.actionDescription}>View your earnings and payments</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="settings" size={28} color="#FF9800" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDescription}>Manage your profile and preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  logoutBtn: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#999',
  },
});

export default VendorDashboard;
