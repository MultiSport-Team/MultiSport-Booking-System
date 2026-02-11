import api from './api';
import { ENDPOINTS } from '../utils/config';

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

      const response = await api.get(`${ENDPOINTS.GET_ALL_VENUES}?${params.toString()}`);
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
      const url = ENDPOINTS.GET_VENUE_BY_ID.replace(':id', id);
      const response = await api.get(url);
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
      const response = await api.get(ENDPOINTS.GET_CATEGORIES);
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
      const url = ENDPOINTS.GET_VENUE_REVIEWS.replace(':id', venueId);
      const response = await api.get(url);
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
      const url = ENDPOINTS.POST_REVIEW.replace(':id', venueId);
      const response = await api.post(url, reviewData);
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
      const response = await api.post(ENDPOINTS.CREATE_VENUE, venueData);
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
      const url = ENDPOINTS.UPDATE_VENUE.replace(':id', venueId);
      const response = await api.put(url, venueData);
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
      const url = ENDPOINTS.DELETE_VENUE.replace(':id', venueId);
      const response = await api.delete(url);
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
      const url = ENDPOINTS.ADD_VENUE_IMAGE.replace(':id', venueId);
      const response = await api.post(url, imageData);
      console.log(`Image upload API response for venue ${venueId}:`, response);
      
      // Check if response indicates success
      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          data: response.data.data || response.data,
        };
      }
      
      return {
        success: false,
        message: 'Failed to add image - server returned unexpected status',
      };
    } catch (error) {
      console.error(`Error uploading image for venue ${venueId}:`, error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to add image',
      };
    }
  },

  // Get vendor's venues (Vendor - requires auth)
  getVendorVenues: async () => {
    try {
      const response = await api.get(ENDPOINTS.GET_VENDOR_VENUES);
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
      const response = await api.post(ENDPOINTS.ADD_CATEGORY, categoryData);
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
      const response = await api.get(ENDPOINTS.GET_PENDING_VENUES);
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

  // Get venue images (Public) - GET from images endpoint
  getVenueImages: async (venueId) => {
    try {
      const url = ENDPOINTS.ADD_VENUE_IMAGE.replace(':id', venueId);
      const response = await api.get(url);
      console.log(`API Response for venue ${venueId} images:`, response);
      
      // Handle different response structures
      let images = [];
      if (response.data.data) {
        images = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (response.data && Array.isArray(response.data)) {
        images = response.data;
      } else if (response.data) {
        images = [response.data];
      }
      
      // Import API_BASE_URL to construct full URLs
      const { API_BASE_URL } = await import('../utils/config');
      
      // Ensure each image has image_url property and construct full URL
      images = images.map(img => {
        if (typeof img === 'string') {
          const imageUrl = img.startsWith('http') ? img : `${API_BASE_URL}${img}`;
          return { image_url: imageUrl };
        }
        
        let imageUrl = img.image_url || img.url || img.path || img.image || '';
        // Prepend API_BASE_URL if it's a relative path
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${API_BASE_URL}${imageUrl}`;
        }
        
        return {
          ...img,
          image_url: imageUrl,
        };
      });
      
      return {
        success: true,
        data: images,
      };
    } catch (error) {
      console.error(`Error fetching images for venue ${venueId}:`, error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch images',
        data: [],
      };
    }
  },

  // Approve/Reject venue (Admin - requires auth)
  updateVenueApproval: async (venueId, approvalStatus) => {
    try {
      const url = ENDPOINTS.UPDATE_VENUE_APPROVAL.replace(':id', venueId);
      const response = await api.put(url, { approval_status: approvalStatus });
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
