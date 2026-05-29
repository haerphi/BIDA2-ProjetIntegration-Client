import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Court } from '../../interfaces/court.interface';
import type { RootState } from '../store';

export interface CourtState {
  courts: Court[];
}

const initialState: CourtState = {
  courts: [],
};

export const courtSlice = createSlice({
  name: 'court',
  initialState,
  reducers: {
    setCourts: (state, action: PayloadAction<Court[]>) => {
      state.courts = action.payload;
    },
    clearCourts: (state) => {
      state.courts = [];
    },
  },
});

export const { setCourts, clearCourts } = courtSlice.actions;

export const selectCourts = (state: RootState) => state.court.courts;

export default courtSlice.reducer;
