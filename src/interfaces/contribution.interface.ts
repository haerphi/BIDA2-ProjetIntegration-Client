import type { Dayjs } from 'dayjs';
import type { ContributionStatusEnum } from '../enums/contribution.enum';

export interface ContributionList {
  id: number;
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  amount: number;
  status: ContributionStatusEnum;
  created_at: Dayjs;
  updated_at: Dayjs;
}

export interface ContributionListQueryParams {
  first_name?: string;
  last_name?: string;
  email?: string;
  year?: string;
  status?: ContributionStatusEnum;
  page?: number;
  limit?: number;
}

export interface MemberContributionListQueryParams {
  year?: string;
  status?: ContributionStatusEnum;
  page?: number;
  limit?: number;
}
