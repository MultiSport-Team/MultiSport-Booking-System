import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/config';
import { useNavigate } from 'react-router-dom';

let api = null;

// Create axios instance
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Request interceptor to add token to headers
  instance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
        // Redirect to login will be handled by ProtectedRoute component
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Get API instance
export const getApi = () => {
  if (!api) {
    api = createApiInstance();
  }
  return api;
};

export default getApi();
