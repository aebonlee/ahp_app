// Subscription and Payment System Types

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in months
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  isActive: boolean;
  isPopular?: boolean;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number; // null = unlimited
}

export interface SubscriptionLimits {
  maxPersonalAdmins: number; // 개인 관리자 가입 처리 가능 수
  maxProjectsPerAdmin: number; // 개인 관리자당 프로젝트 생성 가능 수
  maxSurveysPerProject: number; // 프로젝트당 설문 가능 수 (기본 50개)
  maxEvaluatorsPerProject: number; // 프로젝트당 평가자 수
  maxCriteriaPerProject: number; // 프로젝트당 기준 수
  maxAlternativesPerProject: number; // 프로젝트당 대안 수
  storageLimit: number; // GB
  supportLevel: 'basic' | 'premium' | 'enterprise';
  advancedFeatures: boolean; // Group AHP, 고급 분석 등
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  currentUsage: SubscriptionUsage;
  paymentHistory: PaymentRecord[];
}

export interface SubscriptionUsage {
  personalAdminsCount: number;
  totalProjectsCount: number;
  totalSurveysCount: number;
  storageUsed: number; // GB
  lastUpdated: string;
}

export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'other';
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
  refundReason?: string;
}

// 결제 방법 관리
export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_transfer';
  isDefault: boolean;
  isActive: boolean;
  cardInfo?: {
    lastFourDigits: string;
    expiryMonth: number;
    expiryYear: number;
    cardBrand: string; // 'visa', 'mastercard', 'amex' 등
    holderName: string;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string; // 마스킹된 계좌번호
    accountHolder: string;
    bankCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 결제 설정
export interface PaymentSettings {
  userId: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  billingCycle: 'monthly' | 'yearly';
  invoiceEmail: string;
  taxId?: string;
  companyName?: string;
  billingAddress: {
    country: string;
    state?: string;
    city: string;
    address: string;
    postalCode: string;
  };
}

// 구독 한도 커스터마이징
export interface CustomSubscriptionLimits {
  id: string;
  userId: string;
  subscriptionId: string;
  maxProjects: number;
  maxEvaluatorsPerProject: number;
  maxSurveysPerProject: number;
  maxCriteriaPerProject: number;
  maxAlternativesPerProject: number;
  storageLimit: number; // GB
  isCustomized: boolean;
  updatedBy: string; // 관리자 ID
  updatedAt: string;
  reason?: string; // 변경 사유
}

// 사용자 계층 시스템
export interface UserRole {
  id: string;
  name: string;
  level: number;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string; // 'projects', 'users', 'settings', etc.
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

// 확장된 사용자 타입
export interface ExtendedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
  subscription?: UserSubscription;
  parentAdminId?: string; // 개인 관리자의 경우 총괄 관리자 ID
  createdBy?: string; // 누가 생성했는지
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// 프로젝트 제한 사항
export interface ProjectLimits {
  maxEvaluators: number;
  maxSurveys: number;
  maxCriteria: number;
  maxAlternatives: number;
  remainingEvaluators: number;
  remainingSurveys: number;
  remainingCriteria: number;
  remainingAlternatives: number;
}

// 결제 관련 컨텍스트
export interface PaymentContextType {
  currentPlan?: SubscriptionPlan;
  subscription?: UserSubscription;
  usage?: SubscriptionUsage;
  limits?: ProjectLimits;
  availablePlans: SubscriptionPlan[];
  
  // Actions
  subscribeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updatePaymentMethod: (method: any) => Promise<void>;
  getUsage: () => Promise<SubscriptionUsage>;
  checkLimits: (resource: string, required: number) => boolean;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

// API 응답 타입
export interface SubscriptionResponse {
  success: boolean;
  data?: UserSubscription;
  error?: string;
  message?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
  message?: string;
}

// 결제 요청 타입
export interface PaymentRequest {
  planId: string;
  paymentMethod: string;
  billingAddress?: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  couponCode?: string;
}

// 사용량 알림 타입
export interface UsageAlert {
  id: string;
  type: 'warning' | 'limit_reached' | 'upgrade_needed';
  resource: string;
  currentUsage: number;
  limit: number;
  message: string;
  actionRequired: boolean;
  createdAt: string;
}