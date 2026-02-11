import api from './api';

const financeService = {
  // Get vendor bookings (for payment tracking)
  getVendorBookings: async (filters = {}) => {
    try {
      const response = await api.get('/booking/vendor/bookings', { params: filters });
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
        message: error.response?.data?.error || 'Failed to fetch stats',
      };
    }
  },
};

export default financeService;
