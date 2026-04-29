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
    const response = await apiClient.get<ContributionAmount>('/contributions/amount/');
    return response.data;
  },
  pay: async (): Promise<void> => {
    const response = await apiClient.post<CheckoutSession>('/contributions/create-checkout-session/');
    window.location.href = response.data.checkout_url;
  },
  status: async (): Promise<ContributionStatus> => {
    const response = await apiClient.get<ContributionStatus>('/contributions/status/');
    await delay(2000);
    return response.data;
  },
};
