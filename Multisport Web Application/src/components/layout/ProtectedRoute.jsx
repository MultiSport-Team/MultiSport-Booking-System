import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { USER_ROLES, STORAGE_KEYS } from '../../utils/config';
import { loginSuccess, logout } from '../../store/authSlice';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRole, setCurrentRole] = useState(userRole);

  // On mount, ensure auth state is properly restored from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const userDataStr = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const userRoleFromStorage = userData.role;
        
        // Update current role from sessionStorage
        setCurrentRole(userRoleFromStorage);
        
        // If Redux auth doesn't match storage, sync it
        if (!isAuthenticated || userRole !== userRoleFromStorage) {
          dispatch(loginSuccess({ user: userData, token }));
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
        dispatch(logout());
      }
    } else {
      // No auth data in storage
      dispatch(logout());
      setCurrentRole(null);
    }
    
    setIsInitialized(true);
  }, [dispatch, isAuthenticated, userRole]);

  // Wait for initialization before rendering
  if (!isInitialized) {
    return null;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !currentRole) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (requiredRole && currentRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (currentRole === USER_ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentRole === USER_ROLES.VENDOR) {
      return <Navigate to="/vendor/dashboard" replace />;
    } else if (currentRole === USER_ROLES.USER) {
      return <Navigate to="/home" replace />;
    } else {
      // No valid role, redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
