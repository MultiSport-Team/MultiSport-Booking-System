import api from './api';

const venueService = {
  // Get all approved venues (Public)
  getAllVenues: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.sport_category_id) params.append('sport_category_id', filters.sport_category_id);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/venue?${params.toString()}`);
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

  // Get venue details by ID (Public)
  getVenueById: async (id) => {
    try {
      const response = await api.get(`/venue/details/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch venue details',
      };
    }
  },

  // Get all sports categories (Public)
  getSportsCategories: async () => {
    try {
      const response = await api.get('/venue/categories');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch categories',
      };
    }
  },
// Get all sports categories (Alias for backward compatibility)
  getCategories: async () => {
    try {
      const response = await api.get('/venue/categories');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch categories',
      };
    }
  },
  // Get reviews for a venue (Public)
  getVenueReviews: async (venueId) => {
    try {
      const response = await api.get(`/venue/${venueId}/reviews`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch reviews',
      };
    }
  },

  // Post review (User - requires auth)
  postReview: async (venueId, reviewData) => {
    try {
      const response = await api.post(`/venue/${venueId}/reviews`, reviewData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to post review',
      };
    }
  },

  // VENDOR ROUTES

  // Create venue (Vendor - requires auth)
  createVenue: async (venueData) => {
    try {
      const response = await api.post('/venue', venueData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create venue',
      };
    }
  },

  // Update venue (Vendor - requires auth)
  updateVenue: async (venueId, venueData) => {
    try {
      const response = await api.put(`/venue/${venueId}`, venueData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update venue',
      };
    }
  },

  // Delete venue (Vendor - requires auth)
  deleteVenue: async (venueId) => {
    try {
      const response = await api.delete(`/venue/${venueId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to delete venue',
      };
    }
  },

  // Add venue images (Vendor - requires auth)
  addVenueImage: async (venueId, imageData) => {
    try {
      const response = await api.post(`/venue/${venueId}/images`, imageData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to add image',
      };
    }
  },

  // Get vendor's venues (Vendor - requires auth)
  getVendorVenues: async () => {
    try {
      const response = await api.get('/venue/vendor/venues');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch vendor venues',
      };
    }
  },

  // ADMIN ROUTES

  // Add sports category (Admin - requires auth)
  addSportsCategory: async (categoryData) => {
    try {
      const response = await api.post('/venue/categories', categoryData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to add category',
      };
    }
  },

  // Get pending venues (Admin - requires auth)
  getPendingVenues: async () => {
    try {
      const response = await api.get('/venue/admin/pending');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch pending venues',
      };
    }
  },

  // Approve/Reject venue (Admin - requires auth)
  updateVenueApproval: async (venueId, approvalStatus) => {
    try {
      const response = await api.put(`/venue/${venueId}/approval`, {
        approval_status: approvalStatus, // "APPROVED" or "REJECTED"
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update approval status',
      };
    }
  },
};

export default venueService;