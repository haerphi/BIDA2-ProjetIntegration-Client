import type { BookReservation, Court, CourtCreateData, Reservation } from '../interfaces/court.interface';
import apiClient from './api-client';
import { store } from '../store/store';
import { setCourts } from '../store/slices/court.slice';
import dayjs from 'dayjs';

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

  book: async (courtId: number, data: BookReservation): Promise<void> => {
    await apiClient.post<any>(`/courts/${courtId}/reservations/`, data);
  },

  checkEligibility: async (
    memberId: string,
    date_time: string,
  ): Promise<{ can_book: boolean; reason: string | null }> => {
    const response = await apiClient.get<{ can_book: boolean; reason: string | null }>(`/courts/check-eligibility/`, {
      params: {
        member_id: memberId,
        date_time,
      },
    });
    return response.data;
  },

  myWeeklyReservations: async (date?: string): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/courts/my-weekly-reservations/`, {
      params: {
        date: date || dayjs.utc().format('YYYY-MM-DD'),
      },
    });
    return response.data;
  },

  cancelReservation: async (courtId: number, reservationId: number): Promise<void> => {
    await apiClient.delete(`/courts/${courtId}/reservations/${reservationId}/`);
  },

  delete: async (courtId: number): Promise<void> => {
    await apiClient.delete(`/courts/${courtId}/`);
    try {
      const courtsResponse = await apiClient.get<Court[]>('/courts/all/');
      store.dispatch(setCourts(courtsResponse.data));
    } catch (err) {
      console.error('Failed to refresh court list in store after deletion', err);
    }
  },
};
