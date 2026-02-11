import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//CHN-SVD-202
const API_BASE_URL = 'http://192.168.1.4:3000'; // ⚠️ Change this IP to your computer's IP!

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      // Optional: Navigate to login screen
      // navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;