export type UserRole = 'super_admin' | 'accountant' | 'clerk' | 'auditor' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}