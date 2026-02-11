import api from './api';
import { ENDPOINTS } from '../utils/config';

const couponService = {
  // Validate coupon code
  validateCoupon: async (couponCode, amount = null) => {
    try {
      const params = { code: couponCode };
      if (amount) {
        params.amount = amount;
      }

      const response = await api.post('/coupons/validate', params);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Invalid coupon code',
      };
    }
  },

  // Get available coupons for user
  getAvailableCoupons: async (filters = {}) => {
    try {
      const response = await api.get('/coupons', { params: filters });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch coupons',
      };
    }
  },

  // Apply coupon to booking
  applyCouponToBooking: async (bookingId, couponCode) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/coupon`, {
        coupon_code: couponCode,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to apply coupon',
      };
    }
  },
};

export default couponService;
