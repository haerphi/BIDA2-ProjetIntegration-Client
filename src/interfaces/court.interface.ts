import type { Member } from './member.interface';

export interface Court {
  id: number;
  name: string;
}

export interface CourtCreateData {
  name: string;
}

export interface Reservation {
  id: number;
  court: number;
  date_time: string;
  duration: number;
  creator: Member;
}
