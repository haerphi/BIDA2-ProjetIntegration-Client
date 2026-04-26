import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import type { Token } from '../../interfaces/api.interface';

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  tokenPayload: Token | null;
}

export const parseJwt = (token: string | null): Token | null => {
  if (!token) return null;
  try {
    return jwtDecode<Token>(token);
  } catch (error) {
    return null;
  }
};

const initialToken = localStorage.getItem('token');

const initialState: AuthState = {
  token: initialToken,
  refreshToken: initialToken,
  isAuthenticated: !!initialToken,
  tokenPayload: parseJwt(initialToken),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.tokenPayload = parseJwt(action.payload.token);
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.tokenPayload = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
