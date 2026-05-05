import dayjs from 'dayjs';
import type { ResponseList } from '../interfaces/api.interface';
import type { ContributionList, ContributionListQueryParams } from '../interfaces/contribution.interface';
import { delay } from '../utils/delay.utils';
import apiClient from './api-client';

export interface ContributionAmount {
  amount: number;
}

export interface CheckoutSession {
  checkout_url: string;
}

export interface ContributionStatus {
  has_paid: boolean;
}

export const contributionService = {
  getAmount: async (): Promise<ContributionAmount> => {
    const response = await apiClient.get<ContributionAmount>('/contributions/amount');
    return response.data;
  },
  pay: async (): Promise<void> => {
    const response = await apiClient.post<CheckoutSession>('/contributions/create-checkout-session');
    window.location.href = response.data.checkout_url;
  },
  status: async (): Promise<ContributionStatus> => {
    const response = await apiClient.get<ContributionStatus>('/contributions/status');
    await delay(2000);
    return response.data;
  },
  list: async (params: ContributionListQueryParams): Promise<ResponseList<ContributionList>> => {
    const response = await apiClient.get<ResponseList<ContributionList>>('/contributions/history', {
      params,
    });

    response.data.data.forEach((contribution) => {
      contribution.created_at = dayjs(contribution.created_at);
      contribution.updated_at = dayjs(contribution.updated_at);
    });
    return response.data;
  },
};
