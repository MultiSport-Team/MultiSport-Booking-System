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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminService from '../../services/adminService';

const ManageUsers = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAllUsers();
      if (result.success) {
        setUsers(result.data);
        applyFilters(result.data, searchText, filterRole);
      } else {
        Alert.alert('Error', 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const applyFilters = (userList, search, role) => {
    let filtered = userList;

    // Filter by role
    if (role !== 'ALL') {
      filtered = filtered.filter((u) => u.role === role);
    }

    // Filter by search
    if (search.trim()) {
      filtered = filtered.filter((u) =>
        u.first_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    applyFilters(users, text, filterRole);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    applyFilters(users, searchText, role);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    Alert.alert(
      'Confirm',
      currentStatus ? 'Deactivate this user?' : 'Activate this user?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const result = await adminService.updateUserStatus(userId, !currentStatus);
              if (result.success) {
                Alert.alert('Success', result.data.message || 'Status updated');
                loadUsers();
              } else {
                Alert.alert('Error', 'Failed to update user status');
              }
            } catch (error) {
              console.error('Error updating user:', error);
              Alert.alert('Error', 'Failed to update user status');
            }
          },
        },
      ]
    );
  };

  const UserCard = ({ user }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: user.role === 'VENDOR' ? '#2196F3' : '#4CAF50' }]}>
          <Text style={styles.avatarText}>
            {user.first_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'VENDOR' ? '#BBE5FF' : '#C8E6C9' }]}>
          <Text style={[styles.roleBadgeText, { color: user.role === 'VENDOR' ? '#1976D2' : '#388E3C' }]}>
            {user.role}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#999" />
          <Text style={styles.detailText}>{user.phone || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle" size={16} color={user.is_active ? '#4CAF50' : '#F44336'} />
          <Text style={[styles.detailText, { color: user.is_active ? '#4CAF50' : '#F44336' }]}>
            {user.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.statusBtn, { backgroundColor: user.is_active ? '#FFE0E0' : '#E0F2F1' }]}
        onPress={() => toggleUserStatus(user.id, user.is_active)}
      >
        <Ionicons
          name={user.is_active ? 'close-circle' : 'checkmark-circle'}
          size={18}
          color={user.is_active ? '#F44336' : '#4CAF50'}
        />
        <Text style={[styles.statusBtnText, { color: user.is_active ? '#F44336' : '#4CAF50' }]}>
          {user.is_active ? 'Deactivate' : 'Activate'}
        </Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilter}>
          {['ALL', 'USER', 'VENDOR', 'ADMIN'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterBtn,
                filterRole === role && styles.filterBtnActive,
              ]}
              onPress={() => handleRoleFilter(role)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filterRole === role && styles.filterBtnTextActive,
                ]}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => <UserCard user={item} />}
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
            <Ionicons name="people-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No users found</Text>
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
  filterSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1A1A1A',
  },
  roleFilter: {
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  statusBtnText: {
    fontSize: 12,
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

export default ManageUsers;
