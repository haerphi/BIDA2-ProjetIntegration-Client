import type { JwtPayload } from 'jwt-decode';

export interface Token extends JwtPayload {
  token_type: 'access' | 'refresh';
  user_id: string;
  affiliation_number: string;
  contribution_paid: boolean;
  groups: string[];
}
