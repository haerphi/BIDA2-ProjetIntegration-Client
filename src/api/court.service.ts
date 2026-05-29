import type { Court, CourtCreateData, Reservation } from '../interfaces/court.interface';
import apiClient from './api-client';
import { store } from '../store/store';
import { setCourts } from '../store/slices/court.slice';

export const courtService = {
  create: async (data: CourtCreateData): Promise<Court> => {
    const response = await apiClient.post<Court>('/courts/', data);
    try {
      const courtsResponse = await apiClient.get<Court[]>('/courts/all/');
      store.dispatch(setCourts(courtsResponse.data));
    } catch (err) {
      console.error('Failed to refresh court list in store after creation', err);
    }
    return response.data;
  },

  getAll: async (): Promise<Court[]> => {
    const state = store.getState();
    if (state.court.courts.length > 0) {
      return state.court.courts;
    }

    const response = await apiClient.get<Court[]>('/courts/all/');
    store.dispatch(setCourts(response.data));
    return response.data;
  },

  getReservationForCourt: async (courtId: number, date?: string): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`courts/${courtId}/reservations/`, {
      params: {
        date,
      },
    });
    return response.data;
  },

  book: async (
    courtId: number,
    data: {
      type: string;
      members: number[];
      date_time: string;
      duration: number;
    }
  ): Promise<any> => {
    const response = await apiClient.post<any>(`/courts/${courtId}/reservations/`, data);
    return response.data;
  },
};
