import api from './api';
import { ENDPOINTS } from '../utils/config';

const adminService = {
  // Get admin statistics
  getAdminStats: async () => {
    try {
      const response = await api.get(ENDPOINTS.ADMIN_STATS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch stats' };
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get(ENDPOINTS.GET_ALL_USERS);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch users' };
    }
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    try {
      const url = ENDPOINTS.UPDATE_USER_STATUS.replace(':id', userId);
      const response = await api.put(url, { is_active: isActive });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to update status' };
    }
  },

  // Get pending venues for approval
  getPendingVenues: async () => {
    try {
      const response = await api.get(ENDPOINTS.GET_PENDING_VENUES);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch venues' };
    }
  },

  // Approve or reject venue
  updateVenueApproval: async (venueId, approvalStatus) => {
    try {
      const url = ENDPOINTS.UPDATE_VENUE_APPROVAL.replace(':id', venueId);
      const response = await api.put(url, { approval_status: approvalStatus });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to update approval' };
    }
  },

  // Get all bookings (with filters)
  getAllBookings: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.ADMIN_BOOKINGS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch bookings' };
    }
  },

  // Get admin bookings (alias for getAllBookings)
  getAdminBookings: async (filters = {}) => {
    try {
      const response = await api.get(ENDPOINTS.ADMIN_BOOKINGS, { params: filters });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch bookings' };
    }
  },

  // Add sport category
  addSportsCategory: async (categoryData) => {
    try {
      // Handle both string (category name) and object inputs
      const payload = typeof categoryData === 'string' ? { name: categoryData } : categoryData;
      const response = await api.post(ENDPOINTS.ADD_CATEGORY, payload);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to add category' };
    }
  },

  // Get all categories
  getSportsCategories: async () => {
    try {
      const response = await api.get(ENDPOINTS.GET_CATEGORIES);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Failed to fetch categories' };
    }
  },
};

export default adminService;
