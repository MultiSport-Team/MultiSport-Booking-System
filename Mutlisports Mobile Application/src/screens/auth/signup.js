import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';

const SignUp = ({ navigation }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER', // Default role
    adminCode: '', // For admin registration
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Admin code validation
    if (formData.role === 'ADMIN') {
      if (!formData.adminCode.trim()) {
        newErrors.adminCode = 'Admin code is required';
      } else if (formData.adminCode !== 'MULTISPORT2026') {
        newErrors.adminCode = 'Invalid admin code';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user types
    setErrors({ ...errors, [field]: null });
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare data for API (exclude confirmPassword and adminCode)
      const { confirmPassword, adminCode, ...registrationData } = formData;
      
      // Call backend API
      const result = await authService.register(registrationData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please sign in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('SignIn')
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again');

        setLoading(false);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join MultiSports today!</Text>

        <View style={styles.inputContainer}>
          {/* First Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>First Name</Text>
            <View style={[styles.inputBox, errors.first_name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={formData.first_name}
                onChangeText={(text) => handleInputChange('first_name', text)}
                editable={!loading}
              />
            </View>
            {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Last Name</Text>
            <View style={[styles.inputBox, errors.last_name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={formData.last_name}
                onChangeText={(text) => handleInputChange('last_name', text)}
                editable={!loading}
              />
            </View>
            {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputBox, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Mobile Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputBox, errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Account Type Selection */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'USER' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'USER')}
                disabled={loading}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={formData.role === 'USER' ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.roleText,
                  formData.role === 'USER' && styles.roleTextActive
                ]}>User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'VENDOR' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'VENDOR')}
                disabled={loading}
              >
                <Ionicons 
                  name="business" 
                  size={20} 
                  color={formData.role === 'VENDOR' ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.roleText,
                  formData.role === 'VENDOR' && styles.roleTextActive
                ]}>Vendor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'ADMIN' && styles.roleButtonActive
                ]}
                onPress={() => handleInputChange('role', 'ADMIN')}
                disabled={loading}
              >
                <Ionicons 
                  name="shield-checkmark" 
                  size={20} 
                  color={formData.role === 'ADMIN' ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.roleText,
                  formData.role === 'ADMIN' && styles.roleTextActive
                ]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Admin Code (shown only when ADMIN is selected) */}
          {formData.role === 'ADMIN' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Admin Code *</Text>
              <View style={[styles.inputBox, errors.adminCode && styles.inputError]}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter admin registration code"
                  value={formData.adminCode}
                  onChangeText={(text) => handleInputChange('adminCode', text)}
                  editable={!loading}
                  secureTextEntry
                />
              </View>
              {errors.adminCode && <Text style={styles.errorText}>{errors.adminCode}</Text>}
              <Text style={styles.helperText}>Contact system administrator for admin code</Text>
            </View>
          )}

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputBox, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 8 characters)"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputBox, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 6,
    fontStyle: 'italic',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleTextActive: {
    color: '#FFF',
  },
  signUpButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
  },
  signInLink: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignUp;