import type { UserPermissions } from '../types/permissions';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  permissions: UserPermissions;
}

export interface User {
  id: string;
  username: string;
}
