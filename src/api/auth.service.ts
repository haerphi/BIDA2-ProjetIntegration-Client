import apiClient from "./api-client";

export interface LoginRequest {
  affiliation_number: string;
  password?: string;
}

export interface LoginResponse {
  // Define expected response structure here
  token?: string;
  user?: any;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // You may need to adapt the endpoint path to match your Django server login route
    const response = await apiClient.post<LoginResponse>(
      "/token/",
      credentials,
    );
    return response.data;
  },
};
