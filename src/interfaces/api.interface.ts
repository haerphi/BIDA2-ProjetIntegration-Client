import type { JwtPayload } from 'jwt-decode';
import type { UserGroupEnum } from '../enums/user-groupe.enum';

export interface Token extends JwtPayload {
  token_type: 'access' | 'refresh';
  user_id: string;
  affiliation_number: string;
  contribution_paid: boolean;
  groups: UserGroupEnum[];
}

export interface ResponseList<T> {
  data: T[];
  limit: number;
  total: number;
  page: number;
  total_pages: number;
}
