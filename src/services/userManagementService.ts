/**
 * 사용자 관리 서비스 - Django 백엔드 연동
 * 3가지 회원 유형별 가입, 로그인, 권한 관리
 */

import { 
  BaseUser, 
  AdminUser, 
  PersonalServiceUser, 
  EvaluatorUser, 
  UserType,
  AdminRegistrationData,
  ServiceRegistrationData,
  EvaluatorRegistrationData,
  isAdminUser,
  isPersonalServiceUser,
  isEvaluatorUser
} from '../types/userTypes';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ahp-django-backend-new.onrender.com';

interface AuthResponse {
  success: boolean;
  user?: BaseUser;
  token?: string;
  error?: string;
  message?: string;
}

interface RegistrationResponse {
  success: boolean;
  user?: BaseUser;
  message?: string;
  error?: string;
  requires_approval?: boolean;
}

class UserManagementService {
  private currentUser: BaseUser | null = null;

  constructor() {
    // Django 세션 기반 인증만 사용 - 클라이언트 저장소 사용 안 함
    this.currentUser = null;
  }

  // ============================================================================
  // 인증 관련 메서드
  // ============================================================================

  /**
   * 통합 로그인 - Django 세션 기반 인증
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        credentials: 'include', // Django 세션 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.currentUser = data.user;
        
        return {
          success: true,
          user: this.currentUser || undefined
        };
      } else {
        return {
          success: false,
          error: data.error || '로그인에 실패했습니다.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include', // Django 세션 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
    }
  }

  /**
   * 현재 사용자 정보 반환
   */
  getCurrentUser(): BaseUser | null {
    return this.currentUser;
  }

  /**
   * 인증 상태 확인 - Django 세션으로부터 확인
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.currentUser = data.user;
          return true;
        }
      }
      
      this.currentUser = null;
      return false;
    } catch (error) {
      console.error('Authentication check error:', error);
      this.currentUser = null;
      return false;
    }
  }

  /**
   * 동기 인증 상태 확인 (현재 메모리 상태만)
   */
  isCurrentlyAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ============================================================================
  // 회원가입 관련 메서드
  // ============================================================================

  /**
   * 관리자 계정 신청
   */
  async registerAdmin(
    data: AdminRegistrationData & {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/admin/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type: 'admin',
          basic_info: {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
          },
          admin_data: {
            requested_role: data.requested_role,
            organization: data.organization,
            purpose: data.purpose,
            reference_contact: data.reference_contact,
            special_permissions_requested: data.special_permissions_requested,
          }
        }),
      });

      const result = await response.json();

      return {
        success: result.success,
        user: result.user,
        message: result.message || '관리자 계정 신청이 완료되었습니다. 승인을 기다려주세요.',
        error: result.error,
        requires_approval: true
      };
    } catch (error) {
      console.error('Admin registration error:', error);
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 개인서비스 이용자 가입
   */
  async registerPersonalServiceUser(
    data: ServiceRegistrationData & {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/personal/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type: 'personal_service_user',
          basic_info: {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
          },
          service_data: {
            organization: data.organization,
            expected_usage: data.expected_usage,
            trial_request: data.trial_request,
            preferred_tier: data.preferred_tier,
            payment_ready: data.payment_ready,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 가입 성공 시 자동 로그인
        const loginResult = await this.login(data.username, data.password);
        if (loginResult.success) {
          return {
            success: true,
            user: loginResult.user,
            message: data.trial_request 
              ? '14일 무료 체험이 시작되었습니다!'
              : '개인서비스 이용자 가입이 완료되었습니다.'
          };
        }
      }

      return {
        success: result.success,
        user: result.user,
        message: result.message,
        error: result.error
      };
    } catch (error) {
      console.error('Personal service registration error:', error);
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 평가자 가입
   */
  async registerEvaluator(
    data: EvaluatorRegistrationData & {
      username: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }
  ): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/evaluator/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_type: 'evaluator',
          basic_info: {
            username: data.username,
            email: data.email,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
          },
          evaluator_data: {
            invitation_code: data.invitation_code,
            access_key: data.access_key,
            project_id: data.project_id,
            invited_by: data.invited_by,
            profile_info: data.profile_info,
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 가입 성공 시 자동 로그인
        const loginResult = await this.login(data.username, data.password);
        if (loginResult.success) {
          return {
            success: true,
            user: loginResult.user,
            message: '평가자 가입이 완료되었습니다. 할당된 프로젝트를 확인해보세요.'
          };
        }
      }

      return {
        success: result.success,
        user: result.user,
        message: result.message,
        error: result.error
      };
    } catch (error) {
      console.error('Evaluator registration error:', error);
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.'
      };
    }
  }

  // ============================================================================
  // 권한 검사 메서드
  // ============================================================================

  /**
   * 사용자 유형 확인
   */
  getUserType(): UserType | null {
    return this.currentUser?.user_type || null;
  }

  /**
   * 관리자 권한 확인
   */
  isAdmin(): boolean {
    return this.currentUser?.user_type === 'admin';
  }

  /**
   * 슈퍼 관리자 권한 확인 (AEBON 전용)
   */
  isSuperAdmin(): boolean {
    if (!this.currentUser || !isAdminUser(this.currentUser)) {
      return false;
    }
    return this.currentUser.admin_role === 'super_admin' || 
           this.currentUser.username?.toLowerCase() === 'aebon';
  }

  /**
   * AEBON 계정 확인
   */
  isAebonUser(): boolean {
    return this.currentUser?.username?.toLowerCase() === 'aebon';
  }

  /**
   * 개인서비스 이용자 확인
   */
  isPersonalServiceUser(): boolean {
    return this.currentUser?.user_type === 'personal_service_user';
  }

  /**
   * 평가자 확인
   */
  isEvaluator(): boolean {
    return this.currentUser?.user_type === 'evaluator';
  }

  /**
   * 활성 구독 확인
   */
  hasActiveSubscription(): boolean {
    if (!this.currentUser || !isPersonalServiceUser(this.currentUser)) {
      return false;
    }
    return this.currentUser.subscription.status === 'active' || 
           this.currentUser.subscription.status === 'trial';
  }

  /**
   * 특정 권한 확인
   */
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    // AEBON은 모든 권한
    if (this.isAebonUser()) return true;
    
    // 관리자 권한 확인
    if (isAdminUser(this.currentUser)) {
      return this.currentUser.permissions.some(p => p.codename === permission);
    }
    
    return false;
  }

  // ============================================================================
  // 라우팅 헬퍼 메서드
  // ============================================================================

  /**
   * 사용자 유형별 기본 대시보드 경로 반환
   */
  getDefaultDashboardPath(): string {
    if (!this.currentUser) return '/login';
    
    switch (this.currentUser.user_type) {
      case 'admin':
        return this.isAebonUser() ? '/admin/super' : '/admin/dashboard';
      case 'personal_service_user':
        return '/personal/dashboard';
      case 'evaluator':
        return '/evaluator/dashboard';
      default:
        return '/';
    }
  }

  /**
   * 접근 가능한 라우트 확인
   */
  canAccessRoute(route: string): boolean {
    if (!this.currentUser) return false;
    
    const userType = this.currentUser.user_type;
    
    // 공통 라우트
    const commonRoutes = ['/profile', '/settings', '/help'];
    if (commonRoutes.some(r => route.startsWith(r))) return true;
    
    // 관리자 라우트
    if (route.startsWith('/admin/')) {
      return userType === 'admin';
    }
    
    // 개인서비스 라우트
    if (route.startsWith('/personal/')) {
      return userType === 'personal_service_user';
    }
    
    // 평가자 라우트
    if (route.startsWith('/evaluator/')) {
      return userType === 'evaluator';
    }
    
    // 기본 라우트들
    const publicRoutes = ['/', '/about', '/contact', '/pricing'];
    return publicRoutes.includes(route);
  }

  // ============================================================================
  // 사용자 정보 업데이트
  // ============================================================================

  /**
   * 사용자 정보 업데이트
   */
  async updateProfile(updates: Partial<BaseUser>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success && result.user) {
        this.currentUser = result.user;
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: '프로필 업데이트에 실패했습니다.' };
    }
  }

  // ============================================================================
  // 테스트 계정 생성 (개발용)
  // ============================================================================

  /**
   * 테스트 계정 생성
   */
  async createTestAccounts(): Promise<void> {
    const testAccounts = [
      // AEBON 슈퍼 관리자
      {
        username: 'aebon',
        email: 'aebon@ahp-system.com',
        password: 'AebonAdmin2024!',
        first_name: 'Aebon',
        last_name: 'Super',
        user_type: 'admin',
        admin_role: 'super_admin'
      },
      // 시스템 관리자
      {
        username: 'system_admin',
        email: 'admin@ahp-system.com',
        password: 'SystemAdmin2024!',
        first_name: '시스템',
        last_name: '관리자',
        user_type: 'admin',
        admin_role: 'system_admin'
      },
      // 개인서비스 이용자
      {
        username: 'business_user',
        email: 'business@company.com',
        password: 'BusinessUser2024!',
        first_name: '비즈니스',
        last_name: '사용자',
        user_type: 'personal_service_user',
        service_tier: 'professional'
      },
      // 평가자
      {
        username: 'evaluator01',
        email: 'evaluator@email.com',
        password: 'Evaluator2024!',
        first_name: '평가자',
        last_name: '김',
        user_type: 'evaluator'
      }
    ];

    for (const account of testAccounts) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dev/create-test-user/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account),
        });
        
        if (response.ok) {
          console.log(`✅ Created test account: ${account.username}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create ${account.username}:`, error);
      }
    }
  }
}

// 싱글톤 인스턴스 생성
export const userManagementService = new UserManagementService();
export default userManagementService;