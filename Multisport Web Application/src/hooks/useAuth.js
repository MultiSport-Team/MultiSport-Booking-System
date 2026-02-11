import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import api from '../services/api';
import { STORAGE_KEYS, ENDPOINTS } from '../utils/config';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
} from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, userRole, token, loading, error } = useSelector((state) => state.auth);

  const login = useCallback(
    async (email, password) => {
      dispatch(loginStart());
      try {
        const response = await api.post(ENDPOINTS.LOGIN, { email, password });
        const { data } = response.data;
        dispatch(loginSuccess({ user: data, token: data.token }));
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (userData) => {
      dispatch(registerStart());
      try {
        const response = await api.post(ENDPOINTS.REGISTER, userData);
        dispatch(registerSuccess());
        return { success: true, data: response.data.data };
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Registration failed';
        dispatch(registerFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    userRole,
    token,
    loading,
    error,
    login,
    register,
    logout,
  };
};
