import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Settings = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  const [nameErrors, setNameErrors] = useState({});
  const [emailErrors, setEmailErrors] = useState({});
  const [phoneErrors, setPhoneErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const result = await userService.getProfile();
      
      if (result.success) {
        const profile = result.data;
        setUserData(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateName = (first, last) => {
    const errors = {};
    if (!first.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!last.trim()) {
      errors.lastName = 'Last name is required';
    }
    return errors;
  };

  const validateEmail = (emailValue) => {
    const errors = {};
    if (!emailValue.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      errors.email = 'Please enter a valid email';
    }
    return errors;
  };

  const validatePhone = (phoneValue) => {
    const errors = {};
    if (!phoneValue.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phoneValue.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    return errors;
  };

  const handleNameChange = async () => {
    const errors = validateName(newFirstName, newLastName);
    if (Object.keys(errors).length > 0) {
      setNameErrors(errors);
      return;
    }

    setUpdating(true);
    try {
      const result = await userService.updateProfile({
        first_name: newFirstName,
        last_name: newLastName,
      });

      if (result.success) {
        setFirstName(newFirstName);
        setLastName(newLastName);
        setShowNameModal(false);
        setNameErrors({});
        Alert.alert('Success', 'Name updated successfully!');
        
        // Update local user data
        const user = authService.getCurrentUser();
        const updatedUser = { ...user, first_name: newFirstName, last_name: newLastName };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setUpdating(false);
    }
  };

  const handlePhoneChange = async () => {
    const errors = validatePhone(newPhone);
    if (Object.keys(errors).length > 0) {
      setPhoneErrors(errors);
      return;
    }

    setUpdating(true);
    try {
      const result = await userService.updateProfile({
        phone: newPhone.replace(/\D/g, ''),
      });

      if (result.success) {
        setPhone(newPhone);
        setShowPhoneModal(false);
        setPhoneErrors({});
        Alert.alert('Success', 'Phone number updated successfully!');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update phone number');
    } finally {
      setUpdating(false);
    }
  };

  const handleNameModalOpen = () => {
    setNewFirstName(firstName);
    setNewLastName(lastName);
    setNameErrors({});
    setShowNameModal(true);
  };

  const handleEmailModalOpen = () => {
    Alert.alert(
      'Email Change',
      'Email cannot be changed. Please contact support for assistance.',
      [{ text: 'OK' }]
    );
  };

  const handlePhoneModalOpen = () => {
    setNewPhone(phone);
    setPhoneErrors({});
    setShowPhoneModal(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('SignIn');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FF6B6B" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{firstName} {lastName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData?.role || 'USER'}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          {/* Name Setting */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handleNameModalOpen}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Full Name</Text>
                <Text style={styles.settingValue}>{firstName} {lastName}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          {/* Email Setting */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handleEmailModalOpen}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Address</Text>
                <Text style={styles.settingValue} numberOfLines={1}>{email}</Text>
              </View>
            </View>
            <Ionicons name="lock-closed" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* Phone Number Setting */}
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handlePhoneModalOpen}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Phone Number</Text>
                <Text style={styles.settingValue}>{phone}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Other Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>

          {/* My Bookings */}
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('MyBooking')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="bookmark-outline" size={24} color="#9C27B0" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>My Bookings</Text>
                <Text style={styles.settingValue}>View all bookings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#00BCD4" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.settingValue}>MultiSports v1.0.0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            style={[styles.settingCard, styles.logoutCard]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={24} color="#F44336" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.logoutText]}>Logout</Text>
                <Text style={styles.settingValue}>Sign out of your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Name Change Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNameModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Name</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>First Name</Text>
              <View style={[styles.modalInput, nameErrors.firstName && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  value={newFirstName}
                  onChangeText={setNewFirstName}
                />
              </View>
              {nameErrors.firstName && (
                <Text style={styles.errorText}>{nameErrors.firstName}</Text>
              )}

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>Last Name</Text>
              <View style={[styles.modalInput, nameErrors.lastName && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  value={newLastName}
                  onChangeText={setNewLastName}
                />
              </View>
              {nameErrors.lastName && (
                <Text style={styles.errorText}>{nameErrors.lastName}</Text>
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowNameModal(false)}
                  disabled={updating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, updating && styles.updateButtonDisabled]}
                  onPress={handleNameChange}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.updateButtonText}>Update Name</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Phone Change Modal */}
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Phone Number</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Enter New Phone Number</Text>
              <View style={[styles.modalInput, phoneErrors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="10-digit phone number"
                  placeholderTextColor="#999"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {phoneErrors.phone && (
                <Text style={styles.errorText}>{phoneErrors.phone}</Text>
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPhoneModal(false)}
                  disabled={updating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, updating && styles.updateButtonDisabled]}
                  onPress={handlePhoneChange}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.updateButtonText}>Update Number</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
    marginLeft: 4,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 12,
    color: '#999',
  },
  logoutCard: {
    marginTop: 12,
    borderColor: '#FFE5E5',
  },
  logoutIconContainer: {
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#F44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 10,
    fontSize: 16,
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 12,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Settings;