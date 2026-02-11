import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Register User
  register: async (userData) => {
    try {
      const response = await api.post('/user/register', userData);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  },

  // Login User
  login: async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });
      
      if (response.data.data) {
        const { token, ...userData } = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        return {
          success: true,
          data: response.data.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};

export default authService;