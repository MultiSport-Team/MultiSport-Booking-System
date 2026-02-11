import api from './api';

const bookingService = {
  // SLOT MANAGEMENT (VENDOR)

  // Create slots for a venue
  createSlots: async (slotData) => {
    try {
      const response = await api.post('/booking/slots', slotData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create slots',
      };
    }
  },

  // Get vendor's venue slots
  getVendorSlots: async (filters = {}) => {
    try {
      const response = await api.get('/booking/vendor/slots', { params: filters });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch slots',
      };
    }
  },

  // Delete a slot
  deleteSlot: async (slotId) => {
    try {
      const response = await api.delete(`/booking/slots/${slotId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to delete slot',
      };
    }
  },

  // Get available slots for a venue (public)
  getAvailableSlots: async (venueId, filters = {}) => {
    try {
      const response = await api.get(`/booking/venue/${venueId}`, { params: filters });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch available slots',
      };
    }
  },

  // BOOKING MANAGEMENT (USER)

  // Create booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/booking', bookingData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create booking',
      };
    }
  },

  // Get user's bookings
  getUserBookings: async (filters = {}) => {
    try {
      const response = await api.get('/booking', { params: filters });
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

  // Get single booking details
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/booking/${bookingId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch booking details',
      };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/booking/${bookingId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to cancel booking',
      };
    }
  },

  // Update payment status
  updatePaymentStatus: async (bookingId, paymentData) => {
    try {
      const response = await api.put(`/booking/${bookingId}/payment`, paymentData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update payment status',
      };
    }
  },

  // BOOKING MANAGEMENT (VENDOR)

  // Get vendor's bookings
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
        message: error.response?.data?.error || 'Failed to fetch vendor bookings',
      };
    }
  },

  // Confirm booking (vendor)
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.put(`/booking/${bookingId}/confirm`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to confirm booking',
      };
    }
  },
};

export default bookingService;
