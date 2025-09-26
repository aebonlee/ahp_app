/**
 * 인증 서비스 - JWT 토큰 관리 및 자동 새로고침
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type { User, AuthTokens, LoginResponse } from '../types';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadTokensFromMemory();
    this.initTokenRefresh();
  }

  /**
   * 메모리에서 토큰 로드 (localStorage 금지에 따라 세션 기반)
   */
  private loadTokensFromMemory(): void {
    try {
      // 세션 스토리지에서 토큰 복원 (새로고침 대응)
      this.accessToken = sessionStorage.getItem('ahp_access_token');
      this.refreshToken = sessionStorage.getItem('ahp_refresh_token');
      
      if (this.accessToken && this.isTokenExpired(this.accessToken)) {
        this.accessToken = null;
        sessionStorage.removeItem('ahp_access_token');
      }
    } catch (error) {
      console.warn('Token loading failed:', error);
      this.clearTokens();
    }
  }

  /**
   * 토큰을 메모리 및 세션 스토리지에 저장
   */
  private saveTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    
    // 세션 스토리지에 저장 (페이지 새로고침 대응)
    sessionStorage.setItem('ahp_access_token', tokens.access);
    sessionStorage.setItem('ahp_refresh_token', tokens.refresh);
  }

  /**
   * 토큰 정리
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem('ahp_access_token');
    sessionStorage.removeItem('ahp_refresh_token');
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * JWT 토큰 만료 확인
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp <= currentTime;
    } catch {
      return true;
    }
  }

  /**
   * 토큰 만료 시간 계산 (초 단위)
   */
  private getTokenExpirationTime(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // 밀리초로 변환
    } catch {
      return Date.now();
    }
  }

  /**
   * API 요청 헬퍼
   */
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 오류 시 토큰 새로고침 시도
        if (response.status === 401 && this.refreshToken) {
          const refreshResult = await this.refreshAccessToken();
          if (refreshResult.success) {
            // 새 토큰으로 재시도
            headers.Authorization = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              credentials: 'include',
              ...options,
              headers,
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              return { success: true, data: retryData };
            }
          }
        }

        return { 
          success: false, 
          error: data.detail || data.error || `HTTP ${response.status}` 
        };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * 로그인
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const result = await this.apiRequest<{ tokens: AuthTokens; user: User }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );

    if (result.success && result.data) {
      const { tokens, user } = result.data;
      this.saveTokens(tokens);
      this.initTokenRefresh();
      return { user, tokens };
    }

    throw new Error(result.error || 'Login failed');
  }

  /**
   * 회원가입
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
    const result = await this.apiRequest<{ tokens: AuthTokens; user: User }>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (result.success && result.data) {
      const { tokens, user } = result.data;
      this.saveTokens(tokens);
      this.initTokenRefresh();
      return { user, tokens };
    }

    throw new Error(result.error || 'Registration failed');
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    if (this.refreshToken) {
      await this.apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    }

    this.clearTokens();
    return { success: true };
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('No access token');
    }

    const result = await this.apiRequest<User>(API_ENDPOINTS.AUTH.ME);
    
    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.error || 'Failed to fetch user info');
  }

  /**
   * 액세스 토큰 새로고침
   */
  async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    if (!this.refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        this.accessToken = data.access;
        sessionStorage.setItem('ahp_access_token', data.access);
        
        // 새 refresh 토큰이 있으면 업데이트
        if (data.refresh) {
          this.refreshToken = data.refresh;
          sessionStorage.setItem('ahp_refresh_token', data.refresh);
        }

        this.initTokenRefresh();
        return { success: true };
      }

      // 리프레시 토큰도 만료된 경우
      this.clearTokens();
      return { success: false, error: 'Refresh token expired' };
    } catch (error) {
      this.clearTokens();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  }

  /**
   * 자동 토큰 새로고침 설정
   */
  private initTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.accessToken) return;

    const expirationTime = this.getTokenExpirationTime(this.accessToken);
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // 만료 5분 전에 토큰 새로고침
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 30000); // 최소 30초

    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(async () => {
        const result = await this.refreshAccessToken();
        if (!result.success) {
          console.warn('Automatic token refresh failed:', result.error);
          // 리프레시 실패 시 로그아웃 이벤트 발생
          window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
        }
      }, refreshTime);
    }
  }

  /**
   * 현재 액세스 토큰 반환
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken && !this.isTokenExpired(this.accessToken));
  }

  /**
   * 인증된 API 요청을 위한 헬퍼
   */
  async authenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    return this.apiRequest<T>(endpoint, options);
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;

// 타입 내보내기
export type { User, AuthTokens };