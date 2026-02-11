import api from './api';

const adminService = {
  // ============ USER MANAGEMENT ============
  getAllUsers: async () => {
    try {
      const response = await api.get('/user');
      return {
        success: response.data.status === 'success',
        data: response.data.data,
        message: response.data.data?.message,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/user/${userId}/status`, {
        is_active: isActive ? 1 : 0,
      });
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ STATISTICS ============
  getAdminStats: async () => {
    try {
      const response = await api.get('/user/admin/stats');
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ VENUE MANAGEMENT ============
  getPendingVenues: async () => {
    try {
      const response = await api.get('/venue/admin/pending');
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error fetching pending venues:', error);
      return { success: false, error: error.message };
    }
  },

  approveVenue: async (venueId) => {
    try {
      const response = await api.put(`/venue/${venueId}/approval`, {
        approval_status: 'APPROVED',
      });
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error approving venue:', error);
      return { success: false, error: error.message };
    }
  },

  rejectVenue: async (venueId) => {
    try {
      const response = await api.put(`/venue/${venueId}/approval`, {
        approval_status: 'REJECTED',
      });
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error rejecting venue:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ BOOKING MANAGEMENT ============
  getAdminBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.venue_id) params.append('venue_id', filters.venue_id);

      const response = await api.get(`/user/admin/bookings?${params.toString()}`);
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ CATEGORIES ============
  addSportsCategory: async (name, iconUrl) => {
    try {
      const response = await api.post('/venue/categories', {
        name,
        icon_url: iconUrl,
      });
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error: error.message };
    }
  },

  getSportsCategories: async () => {
    try {
      const response = await api.get('/venue/categories');
      return {
        success: response.data.status === 'success',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: error.message };
    }
  },
};

export default adminService;
