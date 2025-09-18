// =============================================================================
// AHP Enterprise Platform - Authentication Store (3차 개발)
// =============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, AuthToken, LoginCredentials, RegisterData, APIResponse } from '@/types';
import axios from 'axios';

// API 기본 설정
const API_BASE = process.env.REACT_APP_API_URL || 'https://ahp-app-vuzk.onrender.com/api/v1';

interface AuthState {
  // State
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  checkSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  
  // Internal actions
  setToken: (token: AuthToken) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login
        login: async (credentials: LoginCredentials): Promise<boolean> => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await axios.post(`${API_BASE}/accounts/web/login/`, credentials);
            
            if (response.data.success && response.data.data) {
              const { user, access, refresh } = response.data.data;
              
              const token: AuthToken = {
                access,
                refresh,
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1시간
              };
              
              // 토큰을 localStorage에 저장 (API 인터셉터에서 사용)
              localStorage.setItem('authToken', access);
              localStorage.setItem('refreshToken', refresh);
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              
              return true;
            }
            
            throw new Error(response.data.message || '로그인에 실패했습니다.');
            
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
            });
            return false;
          }
        },

        // Register
        register: async (data: RegisterData): Promise<boolean> => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await axios.post(`${API_BASE}/accounts/web/register/`, data);
            
            if (response.data.success) {
              set({
                isLoading: false,
                error: null,
              });
              return true;
            }
            
            throw new Error(response.data.message || '회원가입에 실패했습니다.');
            
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || '회원가입에 실패했습니다.';
            set({
              error: errorMessage,
              isLoading: false,
            });
            return false;
          }
        },

        // Logout
        logout: () => {
          // 서버에 로그아웃 요청 (백그라운드에서)
          axios.post(`${API_BASE}/accounts/web/logout/`).catch(() => {
            // 로그아웃 실패해도 로컬 상태는 클리어
          });
          
          // 로컬 스토리지 클리어
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          
          // 상태 클리어
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },

        // Token Refresh
        refreshToken: async (): Promise<boolean> => {
          const { token } = get();
          
          if (!token?.refresh) {
            return false;
          }
          
          try {
            const response = await axios.post(`${API_BASE}/auth/refresh/`, {
              refresh: token.refresh,
            });
            
            if (response.data.access) {
              const newToken: AuthToken = {
                ...token,
                access: response.data.access,
                expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
              };
              
              localStorage.setItem('authToken', response.data.access);
              
              set({ token: newToken });
              return true;
            }
            
            return false;
            
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().logout();
            return false;
          }
        },

        // Check Session
        checkSession: async () => {
          const token = localStorage.getItem('authToken');
          
          if (!token) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
          
          set({ isLoading: true });
          
          try {
            const response = await axios.get(`${API_BASE}/accounts/web/profile/`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success && response.data.data) {
              const storedRefreshToken = localStorage.getItem('refreshToken');
              
              set({
                user: response.data.data,
                token: {
                  access: token,
                  refresh: storedRefreshToken || '',
                  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              get().logout();
            }
            
          } catch (error: any) {
            console.error('Session check failed:', error);
            
            // 401 에러면 토큰 만료, 로그아웃 처리
            if (error.response?.status === 401) {
              get().logout();
            }
            
            set({
              isLoading: false,
              isAuthenticated: false,
            });
          }
        },

        // Update User
        updateUser: (userData: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({
              user: { ...user, ...userData }
            });
          }
        },

        // Clear Error
        clearError: () => set({ error: null }),

        // Set Token (internal)
        setToken: (token: AuthToken) => {
          localStorage.setItem('authToken', token.access);
          localStorage.setItem('refreshToken', token.refresh);
          set({ token });
        },

        // Clear Auth (internal)
        clearAuth: () => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },
      }),
      {
        name: 'ahp-auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

export default useAuthStore;