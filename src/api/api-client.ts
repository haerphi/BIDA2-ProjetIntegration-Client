import axios from 'axios';
import { store } from '../store/store';

// Get base URL from env if available, otherwise fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure interceptors if needed (e.g. for injecting JWT tokens)
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Globally handle errors here (e.g. 401 Unauthorized)
    return Promise.reject(error);
  },
);

export default apiClient;
