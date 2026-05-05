import type { Dayjs } from 'dayjs';

export interface ContributionList {
  id: number;
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  amount: number;
  status: string;
  created_at: Dayjs;
  updated_at: Dayjs;
}

export interface ContributionListQueryParams {
  first_name?: string;
  last_name?: string;
  email?: string;
  year?: string;
  status?: string;
  page?: number;
  limit?: number;
}
