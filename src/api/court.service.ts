import type { Court, CourtCreateData, Reservation } from '../interfaces/court.interface';
import apiClient from './api-client';

export const courtService = {
  create: async (data: CourtCreateData): Promise<Court> => {
    const response = await apiClient.post<Court>('/courts/', data);
    return response.data;
  },

  getAll: async (): Promise<Court[]> => {
    const response = await apiClient.get<Court[]>('/courts/all/');
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
};
