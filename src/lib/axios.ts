import axios from 'axios';

const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Ensure we don't accidentally include trailing /api twice
const API_BASE_URL = raw.replace(/\/api\/?$/i, '');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage for all requests
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('fb_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // noop
  }
  return config;
});

export default axiosInstance;
