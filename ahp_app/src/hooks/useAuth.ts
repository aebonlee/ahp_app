import { useState, useEffect } from 'react';
import authService from '../services/authService';
import type { User, UserRole } from '../types';

function getInitialUser(): User | null {
  const storedUser = localStorage.getItem('ahp_user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('ahp_user');
    }
  }
  return null;
}

interface UseAuthReturn {
  user: User | null;
  loginLoading: boolean;
  loginError: string;
  registerMode: 'service' | 'admin' | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoginError: React.Dispatch<React.SetStateAction<string>>;
  setRegisterMode: React.Dispatch<React.SetStateAction<'service' | 'admin' | null>>;
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

export function useAuth(
  onLoginSuccess?: (user: User, targetTab: string) => void,
  onLogout?: () => void,
  fetchProjects?: () => Promise<void>,
): UseAuthReturn {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMode, setRegisterMode] = useState<'service' | 'admin' | null>(null);

  // 임시 역할 체크 (프론트엔드 전용)
  useEffect(() => {
    const tempRole = localStorage.getItem('ahp_temp_role');
    if (tempRole && user && user.role === 'super_admin') {
      setUser(prevUser => prevUser ? { ...prevUser, role: tempRole as UserRole } : null);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegister = async (data: RegisterData) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      // 프론트엔드 전용 모드: 회원가입도 바로 관리자 로그인 처리
      const result = await authService.register(data);
      const finalUser = { ...result.user, role: 'super_admin' as const };

      setUser(finalUser);
      localStorage.setItem('ahp_user', JSON.stringify(finalUser));

      onLoginSuccess?.(finalUser, 'personal-service');
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string, _role?: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      // 프론트엔드 전용 모드: 어떤 입력이든 로그인 성공
      const result = await authService.login(username, password);

      const finalUser = { ...result.user, role: 'super_admin' as const };

      setUser(finalUser);
      localStorage.setItem('ahp_user', JSON.stringify(finalUser));

      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');

      let targetTab = '';
      if (tabParam && ['personal-service', 'my-projects', 'model-builder', 'evaluator-management', 'results-analysis'].includes(tabParam)) {
        targetTab = tabParam;
      } else {
        targetTab = 'personal-service';
      }

      onLoginSuccess?.(finalUser, targetTab);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    authService.clearTokens();

    localStorage.removeItem('ahp_user');
    localStorage.removeItem('ahp_temp_role');

    setUser(null);
    setLoginError('');
    setRegisterMode(null);

    if (onLogout) onLogout();
  };

  const handleGoogleAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.googleLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Google 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleKakaoAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.kakaoLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Kakao 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleNaverAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.naverLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Naver 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

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

