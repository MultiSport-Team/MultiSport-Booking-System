import api from './api';

const bookingService = {
  // Get available slots for a venue (Public)
  getAvailableSlots: async (venueId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await api.get(`/booking/venue/${venueId}?${queryParams.toString()}`);
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

  // Create booking (User - requires auth)
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

  // Get user's bookings (User - requires auth)
  getUserBookings: async (status = null) => {
    try {
      const url = status ? `/booking?status=${status}` : '/booking';
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

  // Get single booking details (User - requires auth)
  getBookingById: async (bookingId) => {
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

  // Cancel booking (User - requires auth)
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

  // Update payment status (User - requires auth)
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

  // VENDOR ROUTES

  // Create slots (Vendor - requires auth)
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

  // Delete slot (Vendor - requires auth)
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

  // Get vendor's slots (Vendor - requires auth)
  getVendorSlots: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.venue_id) queryParams.append('venue_id', params.venue_id);
      if (params.date) queryParams.append('date', params.date);

      const response = await api.get(`/booking/vendor/slots?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch vendor slots',
      };
    }
  },

  // Get vendor's bookings (Vendor - requires auth)
  getVendorBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.venue_id) queryParams.append('venue_id', params.venue_id);

      const response = await api.get(`/booking/vendor/bookings?${queryParams.toString()}`);
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

  // Confirm booking (Vendor - requires auth)
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