/**
 * 인증 서비스 - 프론트엔드 전용 모드
 * 백엔드/DB 없이 로컬에서 동작하는 인증 시스템
 * 어떤 이메일/비밀번호를 입력해도 관리자로 로그인됩니다.
 */

import { SUPER_ADMIN_EMAIL } from '../config/api';
import type { User, AuthTokens, LoginResponse } from '../types';

class AuthService {
  private authenticated: boolean = false;

  constructor() {
    // sessionStorage에서 인증 상태 복원
    const storedUser = sessionStorage.getItem('ahp_authenticated');
    this.authenticated = storedUser === 'true';
  }

  /**
   * 토큰 정리 (프론트엔드 전용)
   */
  clearTokens(): void {
    this.authenticated = false;
    sessionStorage.removeItem('ahp_authenticated');
    sessionStorage.removeItem('ahp_access_token');
    sessionStorage.removeItem('ahp_refresh_token');
    localStorage.removeItem('ahp_access_token');
    localStorage.removeItem('ahp_refresh_token');
  }

  /**
   * 프론트엔드 전용 로그인 - 어떤 입력이든 관리자로 로그인
   */
  async login(usernameOrEmail: string, _password: string): Promise<LoginResponse> {
    const email = usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@ahp.com`;
    const username = usernameOrEmail.includes('@') ? usernameOrEmail.split('@')[0] : usernameOrEmail;

    const user: User = {
      id: 1,
      username: username,
      email: email,
      first_name: username,
      last_name: 'Admin',
      role: 'super_admin',
      is_verified: true,
      can_create_projects: true,
      max_projects: 999,
      created_at: new Date().toISOString(),
    };

    // SUPER_ADMIN_EMAIL과 일치하면 super_admin, 아니면 service_admin
    if (email === SUPER_ADMIN_EMAIL) {
      user.role = 'super_admin';
    } else {
      user.role = 'super_admin'; // 모든 사용자를 관리자로 처리
    }

    const tokens: AuthTokens = {
      access: 'frontend-only-token',
      refresh: 'frontend-only-refresh',
    };

    this.authenticated = true;
    sessionStorage.setItem('ahp_authenticated', 'true');

    return { user, tokens };
  }

  /**
   * 프론트엔드 전용 회원가입 - 로그인과 동일하게 처리
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone?: string;
    organization?: string;
    role?: string;
  }): Promise<LoginResponse> {
    return this.login(userData.email, userData.password);
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    this.clearTokens();
    return { success: true };
  }

  /**
   * 현재 사용자 정보 조회 (프론트엔드 전용)
   */
  async getCurrentUser(): Promise<User> {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }

    return {
      id: 1,
      username: 'admin',
      email: SUPER_ADMIN_EMAIL,
      first_name: 'Admin',
      last_name: 'User',
      role: 'super_admin',
      is_verified: true,
      can_create_projects: true,
      max_projects: 999,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * 액세스 토큰 새로고침 (프론트엔드 전용 - 항상 성공)
   */
  async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  /**
   * 현재 액세스 토큰 반환
   */
  getAccessToken(): string | null {
    return this.authenticated ? 'frontend-only-token' : null;
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    return this.authenticated;
  }

  /**
   * 소셜 로그인 - Google (프론트엔드 전용 - 비활성)
   */
  async googleLogin(): Promise<void> {
    // 백엔드 없이 소셜 로그인 불가
  }

  /**
   * 소셜 로그인 - Kakao (프론트엔드 전용 - 비활성)
   */
  async kakaoLogin(): Promise<void> {
    // 백엔드 없이 소셜 로그인 불가
  }

  /**
   * 소셜 로그인 - Naver (프론트엔드 전용 - 비활성)
   */
  async naverLogin(): Promise<void> {
    // 백엔드 없이 소셜 로그인 불가
  }

  /**
   * 소셜 로그인 콜백 처리 (프론트엔드 전용 - 비활성)
   */
  async handleSocialCallback(_provider: string, _code: string, _state?: string): Promise<LoginResponse> {
    throw new Error('Social login not available in frontend-only mode');
  }

  /**
   * 인증된 API 요청을 위한 헬퍼 (프론트엔드 전용)
   */
  async authenticatedRequest<T>(
    _endpoint: string,
    _options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }
    return { success: false, error: 'Backend not available in frontend-only mode' };
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;

// 타입 내보내기
export type { User, AuthTokens };
