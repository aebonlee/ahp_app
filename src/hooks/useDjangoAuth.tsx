/**
 * Django Authentication Hook
 * Manages user authentication with Django backend
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import djangoApiService from '../services/djangoApiService';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  organization?: string;
  department?: string;
  position?: string;
  isEvaluator: boolean;
  isProjectManager: boolean;
  isAdmin: boolean;
  language: string;
  lastActivity?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const DjangoAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 저장된 사용자 정보 확인
    const initAuth = async () => {
      try {
        const savedUser = djangoApiService.getCurrentUser();
        if (savedUser && djangoApiService.isAuthenticated()) {
          // 토큰이 유효한지 서버에 확인
          const response = await djangoApiService.getUserProfile();
          if (response.success) {
            setUser(response.user);
          } else {
            // 토큰 무효 시 로그아웃
            djangoApiService.clearTokens();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        djangoApiService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await djangoApiService.login(username, password);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || '로그인에 실패했습니다.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await djangoApiService.register(userData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || '회원가입에 실패했습니다.' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: '회원가입 중 오류가 발생했습니다.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await djangoApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await djangoApiService.updateProfile(profileData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || '프로필 업데이트에 실패했습니다.' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: '프로필 업데이트 중 오류가 발생했습니다.' };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useDjangoAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useDjangoAuth must be used within a DjangoAuthProvider');
  }
  return context;
};

export default useDjangoAuth;