import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../utils/config';

// Helper to safely get initial state from sessionStorage (tab-specific)
const getInitialAuthState = () => {
  try {
    const token = sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const userDataStr = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    const userRole = sessionStorage.getItem(STORAGE_KEYS.USER_ROLE);
    
    if (token && userDataStr) {
      const user = JSON.parse(userDataStr);
      return {
        isAuthenticated: true,
        user: user,
        userRole: user.role || userRole || null,
        token: token,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Error reading auth state from sessionStorage:', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    userRole: null,
    token: null,
    loading: false,
    error: null,
  };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Register
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Login
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.userRole = user.role;
      state.loading = false;
      state.error = null;

      // Save to sessionStorage (tab-specific, not shared across tabs)
      sessionStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userRole = null;
      state.loading = false;
      state.error = null;

      // Clear sessionStorage (tab-specific)
      sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    },

    // Update profile
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      state.loading = false;
      state.error = null;
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
    },
    updateProfileFailure: (state, action) => {
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
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
