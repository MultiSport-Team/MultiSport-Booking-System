import api from './api';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/config';

const authService = {
  // Register User
  register: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, userData);
      
      // Backend returns { status: 'success', data: {...} } or { status: 'error', error: '...' }
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Registration failed',
      };
    }
  },

  // Login User
  login: async (email, password) => {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, { email, password });
      
      // Backend returns { status: 'success', data: {..., token: '...'} }
      if (response.data.status === 'success' && response.data.data) {
        const userData = response.data.data;
        const token = userData.token;
        
        // Store token in sessionStorage for API interceptor (tab-specific)
        if (token) {
          sessionStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
          sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        }
        
        return {
          success: true,
          data: userData,
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Login failed';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE);
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Failed to fetch profile',
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch profile',
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(ENDPOINTS.UPDATE_PROFILE, profileData);
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.error || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update profile',
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return { success: true };
  },
};

export default authService;
