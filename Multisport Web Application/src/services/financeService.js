import api from './api';
import { ENDPOINTS } from '../utils/config';

const financeService = {
  // Get vendor bookings (for payment tracking)
  getVendorBookings: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.GET_VENDOR_BOOKINGS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch bookings' };
    }
  },

  // Get admin statistics
  getAdminStats: async () => {
    try {
      const response = await api.get(ENDPOINTS.ADMIN_STATS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch stats' };
    }
  },

  // Update payment status
  updatePaymentStatus: async (bookingId, paymentData) => {
    try {
      const url = ENDPOINTS.UPDATE_PAYMENT_STATUS.replace(':id', bookingId);
      const response = await api.put(url, paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to update payment' };
    }
  },
};

export default financeService;
