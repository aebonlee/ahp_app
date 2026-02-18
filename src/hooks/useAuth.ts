/**
 * useAuth.ts - 인증 관련 커스텀 Hook
 *
 * Phase 1c 분리 대상 (CLAUDE.md 참조)
 * - 로그인, 로그아웃, 소셜 인증, 세션 관리
 * - App.tsx에서 인증 로직을 추출하여 재사용 가능한 Hook으로 제공
 *
 * @담당 Claude Sonnet 4.6 (구현)
 */

import { useState, useCallback } from 'react';
import authService from '../services/authService';
import sessionService from '../services/sessionService';
import type { User } from '../types';

interface UseAuthOptions {
  onLoginSuccess?: (user: User) => void;
  onLogoutSuccess?: () => void;
}

interface UseAuthReturn {
  user: User | null;
  loginLoading: boolean;
  loginError: string;
  registerMode: 'service' | 'admin' | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoginError: (error: string) => void;
  setRegisterMode: (mode: 'service' | 'admin' | null) => void;
  handleLogin: (username: string, password: string, role?: string) => Promise<void>;
  handleRegister: (data: RegisterData) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleGoogleAuth: () => Promise<void>;
  handleKakaoAuth: () => Promise<void>;
  handleNaverAuth: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone?: string;
  organization?: string;
  role?: string;
}

/**
 * localStorage에서 초기 사용자 정보를 복원하는 헬퍼
 */
function getInitialUser(): User | null {
  const storedUser = localStorage.getItem('ahp_user');
  if (!storedUser) return null;
  try {
    const parsedUser = JSON.parse(storedUser);
    // admin@ahp.com은 무조건 슈퍼 관리자로 처리
    if (
      parsedUser.email === 'admin@ahp.com' ||
      parsedUser.email?.toLowerCase() === 'admin@ahp.com'
    ) {
      parsedUser.role = 'super_admin';
      localStorage.setItem('ahp_user', JSON.stringify(parsedUser));
    }
    return parsedUser;
  } catch {
    localStorage.removeItem('ahp_user');
    return null;
  }
}

/**
 * useAuth - 인증 상태와 핸들러를 제공하는 커스텀 Hook
 *
 * @example
 * const { user, handleLogin, handleLogout } = useAuth({
 *   onLoginSuccess: (user) => setActiveTab('personal-service'),
 *   onLogoutSuccess: () => setActiveTab('home'),
 * });
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { onLoginSuccess, onLogoutSuccess } = options;

  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMode, setRegisterMode] = useState<'service' | 'admin' | null>(null);

  const handleLogin = useCallback(
    async (username: string, password: string, _role?: string) => {
      setLoginLoading(true);
      setLoginError('');
      try {
        const result = await authService.login(username, password);

        // admin@ahp.com은 슈퍼 관리자로 처리
        let finalUser = { ...result.user };
        if (result.user.email === 'admin@ahp.com') {
          finalUser.role = 'super_admin';
        }

        setUser(finalUser);
        localStorage.setItem('ahp_user', JSON.stringify(finalUser));
        sessionService.startSession();

        onLoginSuccess?.(finalUser);
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
      } finally {
        setLoginLoading(false);
      }
    },
    [onLoginSuccess]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      setLoginLoading(true);
      setLoginError('');
      try {
        const result = await authService.register(data);
        setUser(result.user);
        sessionService.startSession();
        onLoginSuccess?.(result.user);
      } catch (error: any) {
        setLoginError(error.message || '회원가입 중 오류가 발생했습니다.');
      } finally {
        setLoginLoading(false);
      }
    },
    [onLoginSuccess]
  );

  const handleLogout = useCallback(async () => {
    await sessionService.logout();
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    localStorage.removeItem('ahp_user');
    localStorage.removeItem('ahp_temp_role');

    setUser(null);
    setLoginError('');
    setRegisterMode(null);

    onLogoutSuccess?.();
  }, [onLogoutSuccess]);

  const handleGoogleAuth = useCallback(async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.googleLogin();
    } catch (error: any) {
      setLoginError(error.message || 'Google 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  }, []);

  const handleKakaoAuth = useCallback(async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.kakaoLogin();
    } catch (error: any) {
      setLoginError(error.message || 'Kakao 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  }, []);

  const handleNaverAuth = useCallback(async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.naverLogin();
    } catch (error: any) {
      setLoginError(error.message || 'Naver 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  }, []);

  return {
    user,
    loginLoading,
    loginError,
    registerMode,
    setUser,
    setLoginError,
    setRegisterMode,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGoogleAuth,
    handleKakaoAuth,
    handleNaverAuth,
  };
}

export default useAuth;
