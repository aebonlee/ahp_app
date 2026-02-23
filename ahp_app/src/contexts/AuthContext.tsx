import { createContext, useContext } from 'react';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginLoading: boolean;
  loginError: string;
  registerMode: 'service' | 'admin' | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoginError: React.Dispatch<React.SetStateAction<string>>;
  setRegisterMode: React.Dispatch<React.SetStateAction<'service' | 'admin' | null>>;
  handleLogin: (username: string, password: string, role?: string) => Promise<void>;
  handleRegister: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone?: string;
    organization?: string;
    role?: string;
  }) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleGoogleAuth: () => Promise<void>;
  handleKakaoAuth: () => Promise<void>;
  handleNaverAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}

/** Derived hook: get current user */
export function useCurrentUser(): User | null {
  return useAuthContext().user;
}

/** Derived hook: check if user is admin */
export function useIsAdmin(): boolean {
  const { user } = useAuthContext();
  return user?.role === 'super_admin' || user?.role === 'service_admin';
}
