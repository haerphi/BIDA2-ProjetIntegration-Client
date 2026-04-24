import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null; // Can be typed later based on user structure
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  user: null, // Typically you might also store user details in localStorage or fetch them on app load
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: any }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
