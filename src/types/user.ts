export interface Users {
  id: number;
  username: string;
  email: string;
  name: string;
  family_name: string;
  phone_number: string | null;
  created_at: string;
  profilePicture: string | null;
  roles: Role[];
  is_active?: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  family_name: string;
  phone_number?: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  name?: string;
  family_name?: string;
  phone_number?: string;
  profilePicture?: string;
  password?: string;
  is_active?: boolean;
  roles?: number[];
}