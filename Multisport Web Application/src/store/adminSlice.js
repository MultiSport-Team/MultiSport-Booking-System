import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  pendingVenues: [],
  allBookings: [],
  categories: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Get stats
    getStatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getStatsSuccess: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    getStatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get pending venues
    getPendingVenuesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getPendingVenuesSuccess: (state, action) => {
      state.pendingVenues = action.payload;
      state.loading = false;
      state.error = null;
    },
    getPendingVenuesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get all bookings
    getAllBookingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllBookingsSuccess: (state, action) => {
      state.allBookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    getAllBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update venue approval
    updateVenueApprovalStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVenueApprovalSuccess: (state, action) => {
      const index = state.pendingVenues.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.pendingVenues.splice(index, 1);
      }
      state.loading = false;
      state.error = null;
    },
    updateVenueApprovalFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get categories
    getCategoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getCategoriesSuccess: (state, action) => {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    getCategoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add category
    addCategoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addCategorySuccess: (state, action) => {
      state.categories.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    addCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  getStatsStart,
  getStatsSuccess,
  getStatsFailure,
  getPendingVenuesStart,
  getPendingVenuesSuccess,
  getPendingVenuesFailure,
  getAllBookingsStart,
  getAllBookingsSuccess,
  getAllBookingsFailure,
  updateVenueApprovalStart,
  updateVenueApprovalSuccess,
  updateVenueApprovalFailure,
  getCategoriesStart,
  getCategoriesSuccess,
  getCategoriesFailure,
  addCategoryStart,
  addCategorySuccess,
  addCategoryFailure,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;
