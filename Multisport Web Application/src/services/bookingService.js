import api from './api';
import { ENDPOINTS } from '../utils/config';

const bookingService = {
  // Slot Management (Vendor)
  createSlots: async (slotData) => {
    try {
      const response = await api.post(ENDPOINTS.CREATE_SLOTS, slotData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to create slots' };
    }
  },

  getVendorSlots: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.GET_VENDOR_SLOTS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch slots' };
    }
  },

  deleteSlot: async (slotId) => {
    try {
      const url = ENDPOINTS.DELETE_SLOT.replace(':id', slotId);
      const response = await api.delete(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to delete slot' };
    }
  },

  getAvailableSlots: async (venueId, filters = {}) => {
    try {
      const url = ENDPOINTS.GET_AVAILABLE_SLOTS.replace(':venueId', venueId);
      const response = await api.get(url, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch slots' };
    }
  },

  // Booking Management (User)
  createBooking: async (bookingData) => {
    try {
      const response = await api.post(ENDPOINTS.CREATE_BOOKING, bookingData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to create booking' };
    }
  },

  getUserBookings: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.GET_USER_BOOKINGS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch bookings' };
    }
  },

  getBookingDetails: async (bookingId) => {
    try {
      const url = ENDPOINTS.GET_BOOKING_DETAILS.replace(':id', bookingId);
      const response = await api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch details' };
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const url = ENDPOINTS.CANCEL_BOOKING.replace(':id', bookingId);
      const response = await api.delete(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to cancel' };
    }
  },

  updatePaymentStatus: async (bookingId, paymentData) => {
    try {
      const url = ENDPOINTS.UPDATE_PAYMENT_STATUS.replace(':id', bookingId);
      const response = await api.put(url, paymentData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to update payment' };
    }
  },

  // Booking Management (Vendor)
  getVendorBookings: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.GET_VENDOR_BOOKINGS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch bookings' };
    }
  },

  confirmBooking: async (bookingId) => {
    try {
      const url = ENDPOINTS.CONFIRM_BOOKING.replace(':id', bookingId);
      const response = await api.put(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to confirm' };
    }
  },
};

export default bookingService;