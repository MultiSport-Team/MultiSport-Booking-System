import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userProfile: null,
  favorites: [],
  vendorProfile: null,
  vendorVenues: [],
  adminStats: null,
  allUsers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Get profile
    getProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getProfileSuccess: (state, action) => {
      state.userProfile = action.payload;
      state.loading = false;
      state.error = null;
    },
    getProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update profile
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.userProfile = { ...state.userProfile, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get favorites
    getFavoritesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getFavoritesSuccess: (state, action) => {
      state.favorites = action.payload;
      state.loading = false;
      state.error = null;
    },
    getFavoritesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Add favorite
    addFavoriteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addFavoriteSuccess: (state, action) => {
      state.favorites.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    addFavoriteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Remove favorite
    removeFavoriteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeFavoriteSuccess: (state, action) => {
      state.favorites = state.favorites.filter((f) => f.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
    removeFavoriteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Vendor profile
    getVendorProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVendorProfileSuccess: (state, action) => {
      state.vendorProfile = action.payload;
      state.loading = false;
      state.error = null;
    },
    getVendorProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get vendor venues
    getVendorVenuesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVendorVenuesSuccess: (state, action) => {
      state.vendorVenues = action.payload;
      state.loading = false;
      state.error = null;
    },
    getVendorVenuesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get all users (admin)
    getAllUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllUsersSuccess: (state, action) => {
      state.allUsers = action.payload;
      state.loading = false;
      state.error = null;
    },
    getAllUsersFailure: (state, action) => {
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
  getProfileStart,
  getProfileSuccess,
  getProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  getFavoritesStart,
  getFavoritesSuccess,
  getFavoritesFailure,
  addFavoriteStart,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
  removeFavoriteFailure,
  getVendorProfileStart,
  getVendorProfileSuccess,
  getVendorProfileFailure,
  getVendorVenuesStart,
  getVendorVenuesSuccess,
  getVendorVenuesFailure,
  getAllUsersStart,
  getAllUsersSuccess,
  getAllUsersFailure,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
