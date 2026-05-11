import type { ResponseList } from '../interfaces/api.interface';
import type { Member, MemberCreateData, MemberListQueryParams, MemberUpdateData } from '../interfaces/member.interface';
import apiClient from './api-client';

export const memberService = {
  getAll: async (params: MemberListQueryParams = {}): Promise<ResponseList<Member>> => {
    const response = await apiClient.get<ResponseList<Member>>('/members/', { params });
    return response.data;
  },

  create: async (data: MemberCreateData): Promise<Member> => {
    const response = await apiClient.post<Member>('/members/', data);
    return response.data;
  },

  getProfile: async (id: number | string = 'me'): Promise<Member> => {
    const response = await apiClient.get<Member>(`/members/${id}/`);
    return response.data;
  },

  update: async (id: number | string, data: Partial<MemberUpdateData>): Promise<Member> => {
    const response = await apiClient.patch<Member>(`/members/${id}/`, data);
    return response.data;
  },

  updateRole: async (id: number | string, role: string): Promise<void> => {
    await apiClient.patch(`/members/${id}/role/`, { role });
  },

  getRoles: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/members/roles/');
    return response.data;
  },
};
