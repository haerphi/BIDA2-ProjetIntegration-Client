import type { ResponseList } from '../interfaces/api.interface';
import type { Member, MemberListQueryParams } from '../interfaces/member.interface';
import apiClient from './api-client';

export const memberService = {
  getAll: async (params: MemberListQueryParams = {}): Promise<ResponseList<Member>> => {
    const response = await apiClient.get<ResponseList<Member>>('/members/', { params });
    return response.data;
  },
};
