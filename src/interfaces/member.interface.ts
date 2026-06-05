export interface Category {
  id: number;
  name: string;
  min_age: number | null;
  max_age: number | null;
  gender: string | null;
}

export interface Member {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  birth_date: string;
  gender: string;
  affiliation_number: string;
  ranking: string;
  is_active: boolean;
  role: string;
  contribution_paid: boolean;
  categories?: string[];
  created_at: string;
}

export interface MemberListQueryParams {
  affiliation_number?: string;

  /** Format attendu : "YYYY-MM-DD" */
  birth_date?: string;

  country?: string;
  email?: string;
  first_name?: string;

  /** Valeurs limitées par l'énumération de l'API */
  gender?: 'male' | 'female' | 'other';

  is_active?: boolean;
  last_name?: string;

  phone?: string;
  postal_code?: string;
  ranking?: string;
  search?: string;
  category?: string;
}


export interface MemberCreateData {
  firstname: string;
  lastname: string;
  email: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  birth_date: string;
  gender: string;
  affiliation_number: string;
  ranking: string;
  is_active: boolean;
  role: string;
  password?: string;
}

export interface MemberUpdateData {
  firstname: string;
  lastname: string;
  email: string; // TODO enable only for admin (in front and back)
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  birth_date: string;
  gender: string;
  affiliation_number: string; // TODO enable only for admin (in front and back)
  ranking: string;
  is_active: boolean; // TODO enable only for admin (in front and back)
  role: string; // TODO enable only for admin (in front and back)
}
