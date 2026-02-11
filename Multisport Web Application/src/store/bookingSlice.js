import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Get bookings
    getBookingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBookingsSuccess: (state, action) => {
      state.bookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    getBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get booking details
    getBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBookingSuccess: (state, action) => {
      state.currentBooking = action.payload;
      state.loading = false;
      state.error = null;
    },
    getBookingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create booking
    createBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBookingSuccess: (state, action) => {
      state.bookings.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createBookingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Cancel booking
    cancelBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelBookingSuccess: (state, action) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload);
      if (index !== -1) {
        state.bookings[index].status = 'CANCELLED';
      }
      state.loading = false;
      state.error = null;
    },
    cancelBookingFailure: (state, action) => {
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
  getBookingsStart,
  getBookingsSuccess,
  getBookingsFailure,
  getBookingStart,
  getBookingSuccess,
  getBookingFailure,
  createBookingStart,
  createBookingSuccess,
  createBookingFailure,
  cancelBookingStart,
  cancelBookingSuccess,
  cancelBookingFailure,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
