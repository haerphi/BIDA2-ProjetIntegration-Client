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
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/token/logout/', {}, { withCredentials: true });
  },
};
