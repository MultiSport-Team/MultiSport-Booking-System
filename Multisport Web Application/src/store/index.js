import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import venueReducer from './venueSlice';
import bookingReducer from './bookingSlice';
import userReducer from './userSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venue: venueReducer,
    booking: bookingReducer,
    user: userReducer,
    admin: adminReducer,
  },
});

export default store;
