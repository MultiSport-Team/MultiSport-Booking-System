import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch profile',
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update profile',
      };
    }
  },

  // Get user's favorite venues
  getFavorites: async () => {
    try {
      const response = await api.get('/user/favorites');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch favorites',
      };
    }
  },

  // Add venue to favorites
  addFavorite: async (venueId) => {
    try {
      const response = await api.post('/user/favorites', { venue_id: venueId });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to add favorite',
      };
    }
  },

  // Remove venue from favorites
  removeFavorite: async (venueId) => {
    try {
      const response = await api.delete(`/user/favorites/${venueId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to remove favorite',
      };
    }
  },

  // Check if venue is favorited
  checkFavorite: async (venueId) => {
    try {
      const response = await api.get(`/user/favorites/check/${venueId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to check favorite',
      };
    }
  },

  // VENDOR ROUTES

  // Create/Update vendor profile
  createVendorProfile: async (profileData) => {
    try {
      const response = await api.post('/user/vendor-profile', profileData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create vendor profile',
      };
    }
  },

  // Get vendor profile
  getVendorProfile: async () => {
    try {
      const response = await api.get('/user/vendor-profile');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch vendor profile',
      };
    }
  },

  // Get vendor's venues
  getVendorVenues: async () => {
    try {
      const response = await api.get('/user/vendor/venues');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch venues',
      };
    }
  },

  // ADMIN ROUTES

  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/user');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch users',
      };
    }
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/user/${userId}/status`, {
        is_active: isActive,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update user status',
      };
    }
  },

  // Get admin statistics
  getAdminStats: async () => {
    try {
      const response = await api.get('/user/admin/stats');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch admin stats',
      };
    }
  },

  // Get admin bookings with optional filters
  getAdminBookings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      if (filters.venue_id) {
        queryParams.append('venue_id', filters.venue_id);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/user/admin/bookings?${queryString}` : '/user/admin/bookings';
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch bookings',
      };
    }
  },
};

export default userService;