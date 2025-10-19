// Subscription and Payment Service
import { 
  SubscriptionPlan, 
  UserSubscription, 
  SubscriptionUsage, 
  PaymentRequest, 
  PaymentResponse,
  SubscriptionResponse,
  ExtendedUser,
  ProjectLimits,
  UsageAlert
} from '../types/subscription';

class SubscriptionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://ahp-forpaper.onrender.com';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // 구독 플랜 관련
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return this.request<SubscriptionPlan[]>('/api/subscription/plans');
  }

  async getPlanDetails(planId: string): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(`/api/subscription/plans/${planId}`);
  }

  // 사용자 구독 관리
  async getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      return await this.request<UserSubscription>(`/api/subscription/user/${userId}`);
    } catch (error) {
      // 구독이 없는 경우 null 반환
      return null;
    }
  }

  async subscribeToPlan(request: PaymentRequest): Promise<PaymentResponse> {
    return this.request<PaymentResponse>('/api/subscription/subscribe', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>(`/api/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  async renewSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>(`/api/subscription/${subscriptionId}/renew`, {
      method: 'POST',
    });
  }

  // 사용량 관리
  async getUsage(userId: string): Promise<SubscriptionUsage> {
    return this.request<SubscriptionUsage>(`/api/subscription/usage/${userId}`);
  }

  async updateUsage(userId: string, resource: string, increment: number): Promise<void> {
    await this.request('/api/subscription/usage/update', {
      method: 'POST',
      body: JSON.stringify({ userId, resource, increment }),
    });
  }

  async checkLimits(userId: string, resource: string, required: number = 1): Promise<boolean> {
    const response = await this.request<{ allowed: boolean; remaining: number }>('/api/subscription/check-limits', {
      method: 'POST',
      body: JSON.stringify({ userId, resource, required }),
    });
    return response.allowed;
  }

  async getProjectLimits(userId: string, projectId?: string): Promise<ProjectLimits> {
    const params = projectId ? `?projectId=${projectId}` : '';
    return this.request<ProjectLimits>(`/api/subscription/project-limits/${userId}${params}`);
  }

  // 개인 관리자 관리 (총괄 관리자용)
  async createPersonalAdmin(adminData: {
    email: string;
    firstName: string;
    lastName: string;
    maxProjects: number;
  }): Promise<ExtendedUser> {
    return this.request<ExtendedUser>('/api/users/personal-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async getPersonalAdmins(superAdminId: string): Promise<ExtendedUser[]> {
    return this.request<ExtendedUser[]>(`/api/users/personal-admins/${superAdminId}`);
  }

  async updatePersonalAdminLimits(adminId: string, limits: Partial<ProjectLimits>): Promise<void> {
    await this.request(`/api/users/personal-admin/${adminId}/limits`, {
      method: 'PUT',
      body: JSON.stringify(limits),
    });
  }

  async deactivatePersonalAdmin(adminId: string): Promise<void> {
    await this.request(`/api/users/personal-admin/${adminId}/deactivate`, {
      method: 'POST',
    });
  }

  // 알림 및 경고
  async getUsageAlerts(userId: string): Promise<UsageAlert[]> {
    return this.request<UsageAlert[]>(`/api/subscription/alerts/${userId}`);
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await this.request(`/api/subscription/alerts/${alertId}/read`, {
      method: 'POST',
    });
  }

  // 결제 이력
  async getPaymentHistory(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/subscription/payments/${userId}`);
  }

  // 결제 방법 관리
  async updatePaymentMethod(subscriptionId: string, paymentMethodData: any): Promise<void> {
    await this.request(`/api/subscription/${subscriptionId}/payment-method`, {
      method: 'PUT',
      body: JSON.stringify(paymentMethodData),
    });
  }

  // 쿠폰 및 할인
  async validateCoupon(couponCode: string, planId: string): Promise<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    message: string;
  }> {
    return this.request('/api/subscription/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode, planId }),
    });
  }

  // 관리자 전용 기능
  async getAllSubscriptions(): Promise<UserSubscription[]> {
    return this.request<UserSubscription[]>('/api/admin/subscriptions');
  }

  async getSubscriptionStats(): Promise<{
    totalActiveSubscriptions: number;
    totalRevenue: number;
    planDistribution: { [planId: string]: number };
    monthlyGrowth: number;
  }> {
    return this.request('/api/admin/subscription-stats');
  }

  async createCustomPlan(planData: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(planId: string, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return this.request<SubscriptionPlan>(`/api/admin/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  // 미리 정의된 구독 플랜 (기본값)
  getDefaultPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: '기본 플랜',
        description: '개인 사용자 및 소규모 팀을 위한 기본 기능',
        price: 29000,
        currency: 'KRW',
        duration: 1,
        features: [
          { id: 'personal_admins', name: '개인 관리자', description: '개인 관리자 5명까지', included: true, limit: 5 },
          { id: 'projects', name: '프로젝트', description: '관리자당 프로젝트 3개', included: true, limit: 3 },
          { id: 'surveys', name: '설문 조사', description: '프로젝트당 50개 설문', included: true, limit: 50 },
          { id: 'basic_support', name: '기본 지원', description: '이메일 지원', included: true },
        ],
        limits: {
          maxPersonalAdmins: 5,
          maxProjectsPerAdmin: 3,
          maxSurveysPerProject: 50,
          maxEvaluatorsPerProject: 10,
          maxCriteriaPerProject: 15,
          maxAlternativesPerProject: 10,
          storageLimit: 1,
          supportLevel: 'basic',
          advancedFeatures: false
        },
        isActive: true
      },
      {
        id: 'professional',
        name: '프로페셔널 플랜',
        description: '중간 규모 조직을 위한 고급 기능',
        price: 89000,
        currency: 'KRW',
        duration: 1,
        features: [
          { id: 'personal_admins', name: '개인 관리자', description: '개인 관리자 20명까지', included: true, limit: 20 },
          { id: 'projects', name: '프로젝트', description: '관리자당 프로젝트 10개', included: true, limit: 10 },
          { id: 'surveys', name: '설문 조사', description: '프로젝트당 200개 설문', included: true, limit: 200 },
          { id: 'advanced_features', name: '고급 기능', description: 'Group AHP, 고급 분석', included: true },
          { id: 'priority_support', name: '우선 지원', description: '전화 및 이메일 지원', included: true },
        ],
        limits: {
          maxPersonalAdmins: 20,
          maxProjectsPerAdmin: 10,
          maxSurveysPerProject: 200,
          maxEvaluatorsPerProject: 50,
          maxCriteriaPerProject: 30,
          maxAlternativesPerProject: 20,
          storageLimit: 10,
          supportLevel: 'premium',
          advancedFeatures: true
        },
        isActive: true,
        isPopular: true
      },
      {
        id: 'enterprise',
        name: '엔터프라이즈 플랜',
        description: '대규모 조직을 위한 무제한 기능',
        price: 299000,
        currency: 'KRW',
        duration: 1,
        features: [
          { id: 'unlimited_admins', name: '무제한 관리자', description: '개인 관리자 무제한', included: true },
          { id: 'unlimited_projects', name: '무제한 프로젝트', description: '프로젝트 생성 무제한', included: true },
          { id: 'unlimited_surveys', name: '무제한 설문', description: '설문 조사 무제한', included: true },
          { id: 'all_features', name: '모든 고급 기능', description: '모든 분석 도구 및 기능', included: true },
          { id: 'dedicated_support', name: '전담 지원', description: '전담 계정 매니저', included: true },
          { id: 'custom_integration', name: '맞춤 통합', description: 'API 및 맞춤 통합', included: true },
        ],
        limits: {
          maxPersonalAdmins: -1, // unlimited
          maxProjectsPerAdmin: -1, // unlimited
          maxSurveysPerProject: -1, // unlimited
          maxEvaluatorsPerProject: -1, // unlimited
          maxCriteriaPerProject: -1, // unlimited
          maxAlternativesPerProject: -1, // unlimited
          storageLimit: -1, // unlimited
          supportLevel: 'enterprise',
          advancedFeatures: true
        },
        isActive: true
      }
    ];
  }
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;