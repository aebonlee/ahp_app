// Payment System Types
// Based on Opus 4.1 Design

export enum PricingTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

export interface PlanFeatures {
  // 프로젝트 관련
  maxProjects: number | 'unlimited';
  maxCriteriaPerProject: number | 'unlimited';
  maxAlternativesPerProject: number | 'unlimited';
  maxEvaluatorsPerProject: number | 'unlimited';
  
  // 기능 관련
  basicAnalysis: boolean;
  sensitivityAnalysis: boolean;
  monteCarloSimulation: boolean;
  whatIfScenarios: boolean;
  advancedReporting: boolean;
  apiAccess: boolean;
  
  // 협업 기능
  teamCollaboration: boolean;
  roleBasedAccess: boolean;
  auditLog: boolean;
  
  // 지원
  emailSupport: boolean;
  prioritySupport: boolean;
  dedicatedAccountManager: boolean;
  sla: string | null;
}

export interface PlanLimits {
  monthlyApiCalls: number | 'unlimited';
  dataRetentionDays: number | 'unlimited';
  storageGB: number | 'unlimited';
  exportFormats: string[];
  concurrentEvaluations: number | 'unlimited';
}

export interface PricingPlan {
  id: string;
  tier: PricingTier;
  name: string;
  description: string;
  pricing: {
    monthly: number;
    annual: number;
    currency: 'USD' | 'KRW' | 'EUR';
  };
  features: PlanFeatures;
  limits: PlanLimits;
  addOns: string[];
  popular?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  pricing: {
    monthly?: number;
    annual?: number;
    oneTime?: number;
  };
  type: 'recurring' | 'one-time' | 'usage-based';
  limits?: Record<string, any>;
}

export interface Subscription {
  id: string;
  userId: string;
  organizationId?: string;
  planId: string;
  tier: PricingTier;
  status: SubscriptionStatus;
  
  // 결제 제공업체 정보
  paymentProvider: 'stripe' | 'paypal';
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  
  // 구독 기간
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  endedAt?: string;
  
  // 가격 정보
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  discountPercentage: number;
  
  // 메타데이터
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  subscriptionId?: string;
  userId: string;
  
  // 결제 정보
  paymentType: 'subscription' | 'addon' | 'one-time';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partial_refund';
  
  // 결제 게이트웨이 정보
  provider: string;
  providerPaymentId?: string;
  providerPaymentMethodId?: string;
  providerInvoiceId?: string;
  
  // 청구 정보
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  description?: string;
  
  // 환불 정보
  refundedAmount: number;
  refundReason?: string;
  refundedAt?: string;
  
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  userId: string;
  organizationId?: string;
  
  // 인보이스 정보
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  
  // 금액 정보
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  
  // 청구지 정보
  billingAddress?: Record<string, any>;
  taxId?: string;
  
  // PDF 링크
  pdfUrl?: string;
  
  // 결제 정보
  paymentId?: string;
  providerInvoiceId?: string;
  
  items: InvoiceItem[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  type: 'subscription' | 'addon' | 'usage' | 'discount' | 'tax';
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface UsageTracking {
  id: string;
  subscriptionId: string;
  userId: string;
  usageType: 'api_calls' | 'storage_gb' | 'projects' | 'evaluators' | 'exports';
  quantity: number;
  unit: string;
  timestamp: string;
  billed: boolean;
  billedAt?: string;
  invoiceItemId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency?: string;
  applicableTiers: PricingTier[];
  minimumAmount?: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  active: boolean;
}

// API Response Types
export interface SubscriptionResult {
  success: boolean;
  subscription?: Subscription;
  message: string;
  clientSecret?: string; // For Stripe payment confirmation
}

export interface SubscriptionUpgradeResult {
  success: boolean;
  previousTier: PricingTier;
  newTier: PricingTier;
  prorationAmount: number;
  effectiveDate: Date;
}

export interface SubscriptionDowngradeResult {
  success: boolean;
  currentTier?: PricingTier;
  scheduledTier?: PricingTier;
  effectiveDate?: Date;
  message: string;
  incompatibleFeatures?: string[];
}

export interface PaymentMethodInfo {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    address?: Record<string, any>;
  };
}

export interface UsageReport {
  currentUsage: Record<string, number>;
  limits: Record<string, number | 'unlimited'>;
  percentages: Record<string, number>;
  period: {
    start: string;
    end: string;
  };
}

// Component Props Types
export interface PricingTableProps {
  plans?: PricingPlan[];
  currentTier?: PricingTier;
  onSelectPlan: (tier: PricingTier, billingCycle: BillingCycle) => void;
  showAnnualDiscount?: boolean;
}

export interface SubscriptionManagementProps {
  subscription: Subscription;
  paymentMethod?: PaymentMethodInfo;
  onUpgrade: (tier: PricingTier) => void;
  onDowngrade: (tier: PricingTier) => void;
  onCancel: (reason?: string) => void;
  onUpdatePaymentMethod: () => void;
}

export interface BillingHistoryProps {
  invoices: Invoice[];
  payments: PaymentHistory[];
  onDownloadInvoice: (invoiceId: string) => void;
}

export interface UsageDashboardProps {
  usageReport: UsageReport;
  subscription: Subscription;
  onUpgrade?: () => void;
}

// Form Types
export interface CheckoutFormData {
  planTier: PricingTier;
  billingCycle: BillingCycle;
  paymentMethodId?: string;
  couponCode?: string;
  addOns?: string[];
  billingAddress: {
    name: string;
    email: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PaymentMethodFormData {
  type: 'card' | 'paypal';
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}