import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  venues: [],
  currentVenue: null,
  categories: [],
  filters: {
    city: '',
    sport_category_id: null,
    min_price: 0,
    max_price: 10000,
    search: '',
  },
  loading: false,
  error: null,
};

const venueSlice = createSlice({
  name: 'venue',
  initialState,
  reducers: {
    // Get all venues
    getVenuesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVenuesSuccess: (state, action) => {
      state.venues = action.payload;
      state.loading = false;
      state.error = null;
    },
    getVenuesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get venue by ID
    getVenueStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVenueSuccess: (state, action) => {
      state.currentVenue = action.payload;
      state.loading = false;
      state.error = null;
    },
    getVenueFailure: (state, action) => {
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

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  getVenuesStart,
  getVenuesSuccess,
  getVenuesFailure,
  getVenueStart,
  getVenueSuccess,
  getVenueFailure,
  getCategoriesStart,
  getCategoriesSuccess,
  getCategoriesFailure,
  setFilters,
  clearFilters,
  clearError,
} = venueSlice.actions;

export default venueSlice.reducer;
