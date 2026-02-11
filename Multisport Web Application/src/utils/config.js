// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export const ENDPOINTS = {
  // Auth
  REGISTER: '/user/register',
  LOGIN: '/user/login',
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',

  // User Services
  GET_ALL_USERS: '/user',
  UPDATE_USER_STATUS: '/user/:id/status',
  ADMIN_STATS: '/user/admin/stats',
  ADMIN_BOOKINGS: '/user/admin/bookings',
  VENDOR_PROFILE: '/user/vendor-profile',
  GET_VENDOR_PROFILE: '/user/vendor-profile',
  VENDOR_VENUES: '/user/vendor/venues',
  FAVORITES: '/user/favorites',
  FAVORITES_CHECK: '/user/favorites/check/:venueId',

  // Venues
  GET_ALL_VENUES: '/venue',
  GET_VENUE_BY_ID: '/venue/details/:id',
  CREATE_VENUE: '/venue',
  UPDATE_VENUE: '/venue/:id',
  DELETE_VENUE: '/venue/:id',
  ADD_VENUE_IMAGE: '/venue/:id/images',
  GET_VENUE_REVIEWS: '/venue/:id/reviews',
  POST_REVIEW: '/venue/:id/reviews',
  GET_CATEGORIES: '/venue/categories',
  ADD_CATEGORY: '/venue/categories',
  GET_VENDOR_VENUES: '/venue/vendor/venues',
  GET_PENDING_VENUES: '/venue/admin/pending',
  UPDATE_VENUE_APPROVAL: '/venue/:id/approval',

  // Bookings
  CREATE_BOOKING: '/booking',
  GET_USER_BOOKINGS: '/booking',
  GET_BOOKING_DETAILS: '/booking/:id',
  CANCEL_BOOKING: '/booking/:id',
  UPDATE_PAYMENT_STATUS: '/booking/:id/payment',
  GET_AVAILABLE_SLOTS: '/booking/venue/:venueId',
  GET_VENDOR_BOOKINGS: '/booking/vendor/bookings',
  CONFIRM_BOOKING: '/booking/:id/confirm',

  // Slots
  CREATE_SLOTS: '/booking/slots',
  GET_VENDOR_SLOTS: '/booking/vendor/slots',
  DELETE_SLOT: '/booking/slots/:id',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  FAVORITES: 'favorites',
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Venue Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const config = {
  BASE_URL: "http://localhost:3000"
};

export default config;
