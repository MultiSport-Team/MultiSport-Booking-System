import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import store from './store';
import { loginSuccess } from './store/authSlice';
import { STORAGE_KEYS } from './utils/config';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { USER_ROLES } from './utils/config';

// Auth Pages
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import AdminSignupPage from './pages/auth/AdminSignupPage';

// User Pages
import HomePage from './pages/user/HomePage';
import VenueDetailsPage from './pages/user/VenueDetailsPage';
import BookingPage from './pages/user/BookingPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import PaymentPage from './pages/user/PaymentPage';
import SettingsPage from './pages/user/SettingsPage';

// Vendor Pages
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import ManageVenuesPage from './pages/vendor/ManageVenuesPage';
import AddVenuePage from './pages/vendor/AddVenuePage';
import EditVenuePage from './pages/vendor/EditVenuePage';
import ManageSlotsPage from './pages/vendor/ManageSlotsPage';
import VendorBookingsPage from './pages/vendor/VendorBookingsPage';
import VendorPaymentsPage from './pages/vendor/VendorPaymentsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManagePendingVenuesPage from './pages/admin/ManagePendingVenuesPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';

import './App.css';

// App Content Component - Uses Redux hooks
function AppContent() {
  const dispatch = useDispatch();

  // Restore auth state from sessionStorage on app load
  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const userDataStr = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        dispatch(loginSuccess({ user: userData, token }));
      } catch (error) {
        console.error('Error restoring auth state:', error);
        sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      }
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Home Route - Redirect to role selection or auth */}
        <Route path="/" element={<RoleSelectionPage />} />
        
        {/* Auth Routes - Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup/admin" element={<AdminSignupPage />} />

        {/* User Routes - Protected */}
        <Route
          path="/home"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue-details/:id"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <VenueDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue/:id"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <VenueDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:venueId"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.USER}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Vendor Routes - Protected */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <VendorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/venues"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <ManageVenuesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/add-venue"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <AddVenuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/edit-venue/:id"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <EditVenuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/slots"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <ManageSlotsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/bookings"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <VendorBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/payments"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.VENDOR}>
              <VendorPaymentsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending-venues"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <ManagePendingVenuesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <ManageBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <ManageCategoriesPage />
            </ProtectedRoute>
          }
        />

        {/* Settings - Common for all authenticated users */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
