import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import courtReducer from './slices/court.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    court: courtReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, court: CourtState}
export type AppDispatch = typeof store.dispatch;
