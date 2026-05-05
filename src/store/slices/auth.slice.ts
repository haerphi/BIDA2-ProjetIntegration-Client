import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import type { Token } from '../../interfaces/api.interface';
import type { RootState } from '../store';
import { UserGroup } from '../../enums/user-groupe.enum';

export interface AuthState {
  token: string | null;
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
  isAuthenticated: !!initialToken,
  tokenPayload: parseJwt(initialToken),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.tokenPayload = parseJwt(action.payload.token);
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.tokenPayload = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectIsMember = (state: RootState) => state.auth.tokenPayload?.contribution_paid ?? false;

export const selectIsAdmin = (state: RootState) => state.auth.tokenPayload?.groups.includes(UserGroup.ADMIN) ?? false;

export const selectGroups = (state: RootState) => state.auth.tokenPayload?.groups ?? [];

export default authSlice.reducer;
