import axios from 'axios';

const API_BASE_URL = 'https://caraon-backend-v2-4c5n4x5l7a-uc.a.run.app/api/v1';
const TOKEN_KEY = 'caraon-token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // Check if window is defined to ensure this runs only on the client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
