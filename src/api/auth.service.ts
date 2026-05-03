import { store } from '../store/store';
import { logout, setCredentials } from '../store/slices/auth.slice';
import apiClient from './api-client';

export interface LoginRequest {
  affiliation_number: string;
  password?: string;
}

export interface LoginResponse {
  access: string;
  refresh?: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/token/', credentials);
    store.dispatch(setCredentials({ token: response.data.access }));
    return response.data;
  },
  loginGoogle: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/token/google/', { token });
    store.dispatch(setCredentials({ token: response.data.access }));
    return response.data;
  },
  logout: async (): Promise<void> => {
    store.dispatch(logout());
    await apiClient.post('/token/logout/', {});
  },
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/token/refresh/', {}, { withCredentials: true });
    store.dispatch(setCredentials({ token: response.data.access }));
    return response.data;
  },
};
