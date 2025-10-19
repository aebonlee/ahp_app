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
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ahp-django-backend.onrender.com';

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

  /**
   * 사용자 유형 결정 로직
   */
  private determineUserType(userData: any, username: string): UserType {
    // Django 관리자 권한 확인
    if (userData.is_superuser || userData.is_staff) {
      return 'admin';
    }
    
    // 백엔드 실제 계정별 유형 지정
    const adminUsernames = ['admin', 'admin@ahp-platform.com', 'aebon_new', 'aebon', 'testadmin', 'system_admin'];
    const evaluatorUsernames = ['evaluator01', 'evaluator02', 'evaluator03'];
    
    if (adminUsernames.includes(username.toLowerCase())) {
      return 'admin';
    }
    
    if (evaluatorUsernames.includes(username.toLowerCase())) {
      return 'evaluator';
    }
    
    // 기본값은 개인서비스 사용자
    return 'personal_service_user';
  }

  // ============================================================================
  // 인증 관련 메서드
  // ============================================================================

  /**
   * 통합 로그인 - Django JWT 인증
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: Login failed`
        };
      }

      const data = await response.json();
      
      // JWT 토큰이 있는 경우 처리
      if (data.access) {
        // 사용자 정보 가져오기 시도
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/user/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access}`
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // 사용자 데이터를 우리 타입 시스템에 맞게 변환
            this.currentUser = {
              id: userData.id || userData.user_id || 1,
              username: userData.username || username,
              email: userData.email || '',
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              user_type: this.determineUserType(userData, username),
              is_active: userData.is_active !== false,
              date_joined: userData.date_joined || new Date().toISOString(),
              last_login: userData.last_login || new Date().toISOString()
            };

            return {
              success: true,
              user: this.currentUser,
              token: data.access
            };
          }
        } catch (error) {
          console.warn('Failed to fetch user info, creating basic user from login data:', error);
        }
        
        // 사용자 정보를 가져올 수 없는 경우 로그인 데이터로 기본 사용자 생성
        this.currentUser = {
          id: data.user_id || 1,
          username: data.username || username,
          email: data.email || username.includes('@') ? username : '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          user_type: this.determineUserType(data, username),
          is_active: true,
          date_joined: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        return {
          success: true,
          user: this.currentUser,
          token: data.access
        };
      }

      return {
        success: false,
        error: 'Login successful but failed to get user information'
      };
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
      // Django JWT 백엔드의 경우 클라이언트 측에서 토큰만 제거하면 됨
      // 하지만 혹시 로그아웃 엔드포인트가 있다면 호출
      await fetch(`${API_BASE_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // 로그아웃 엔드포인트가 없어도 에러 무시
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
   * 인증 상태 확인 - Django 백엔드에서 사용자 정보 확인
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // 사용자 데이터를 우리 타입 시스템에 맞게 변환
        this.currentUser = {
          id: userData.id || userData.user_id || 1,
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          user_type: this.determineUserType(userData, userData.username || ''),
          is_active: userData.is_active !== false,
          date_joined: userData.date_joined || new Date().toISOString(),
          last_login: userData.last_login || new Date().toISOString()
        };
        
        return true;
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
   * 관리자 계정 신청 - Django 백엔드 회원가입 사용
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
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: Registration failed`
        };
      }

      const result = await response.json();

      // 회원가입 성공 시 자동 로그인 시도
      if (result.access || result.success !== false) {
        const loginResult = await this.login(data.username, data.password);
        if (loginResult.success) {
          return {
            success: true,
            user: loginResult.user,
            message: '관리자 계정이 생성되어 자동 로그인되었습니다.'
          };
        }
      }

      return {
        success: true,
        message: '계정이 생성되었습니다. 로그인해주세요.',
        requires_approval: false
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
   * 개인서비스 이용자 가입 - Django 백엔드 회원가입 사용
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
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: Registration failed`
        };
      }

      const result = await response.json();

      // 회원가입 성공 시 자동 로그인 시도
      if (result.access || result.success !== false) {
        const loginResult = await this.login(data.username, data.password);
        if (loginResult.success) {
          return {
            success: true,
            user: loginResult.user,
            message: data.trial_request 
              ? '14일 무료 체험이 시작되었습니다!'
              : '개인서비스 이용자 가입이 완료되어 자동 로그인되었습니다.'
          };
        }
      }

      return {
        success: true,
        message: '계정이 생성되었습니다. 로그인해주세요.'
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
   * 평가자 가입 - Django 백엔드 회원가입 사용
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
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: Registration failed`
        };
      }

      const result = await response.json();

      // 회원가입 성공 시 자동 로그인 시도
      if (result.access || result.success !== false) {
        const loginResult = await this.login(data.username, data.password);
        if (loginResult.success) {
          return {
            success: true,
            user: loginResult.user,
            message: '평가자 가입이 완료되어 자동 로그인되었습니다. 할당된 프로젝트를 확인해보세요.'
          };
        }
      }

      return {
        success: true,
        message: '계정이 생성되었습니다. 로그인해주세요.'
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
   * 슈퍼 관리자 권한 확인 (Django is_superuser 또는 aebon 계정)
   */
  isSuperAdmin(): boolean {
    if (!this.currentUser) {
      return false;
    }
    
    // Django의 is_superuser 또는 aebon 계정인 경우
    const djangoUser = this.currentUser as any;
    return djangoUser.is_superuser === true || 
           djangoUser.is_staff === true ||
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
        return '/personal'; // 관리자도 개인서비스 대시보드 사용
      case 'personal_service_user':
        return '/personal';
      case 'evaluator':
        return '/evaluator';
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
    
    // 관리자는 이제 개인서비스 대시보드를 사용하므로 /admin 라우트는 제거됨
    
    // 개인서비스 라우트 (관리자도 접근 가능)
    if (route.startsWith('/personal/')) {
      return userType === 'personal_service_user' || userType === 'admin';
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