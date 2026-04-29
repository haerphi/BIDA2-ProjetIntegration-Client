import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logout } from '../store/slices/auth.slice';

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
      console.log(config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Globally handle errors here (e.g. 401 Unauthorized)
    if (error.response?.data?.messages?.[0]?.message === 'Token is expired' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh || refreshToken;

        store.dispatch(
          setCredentials({
            token: newAccessToken,
            refreshToken: newRefreshToken,
          }),
        );

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
