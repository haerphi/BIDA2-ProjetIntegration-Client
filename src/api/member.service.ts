import type { Member, MemberListQueryParams } from '../interfaces/member.interface';
import apiClient from './api-client';

export const memberService = {
  getAll: async (params: MemberListQueryParams = {}): Promise<Member[]> => {
    const response = await apiClient.get<Member[]>('/members/', { params });
    return response.data;
  },
};
