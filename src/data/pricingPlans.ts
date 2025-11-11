// Pricing Plans Data
// Based on Opus 4.1 Payment System Design

import { PricingTier, PricingPlan, AddOn, PlanFeatures } from '../types/payment';

export const PRICING_PLANS: Record<PricingTier, PricingPlan> = {
  [PricingTier.FREE]: {
    id: 'plan_free',
    tier: PricingTier.FREE,
    name: 'Free',
    description: '개인 사용자를 위한 무료 플랜',
    pricing: {
      monthly: 0,
      annual: 0,
      currency: 'USD'
    },
    features: {
      maxProjects: 3,
      maxCriteriaPerProject: 10,
      maxAlternativesPerProject: 10,
      maxEvaluatorsPerProject: 5,
      basicAnalysis: true,
      sensitivityAnalysis: false,
      monteCarloSimulation: false,
      whatIfScenarios: false,
      advancedReporting: false,
      apiAccess: false,
      teamCollaboration: false,
      roleBasedAccess: false,
      auditLog: false,
      emailSupport: true,
      prioritySupport: false,
      dedicatedAccountManager: false,
      sla: null
    },
    limits: {
      monthlyApiCalls: 0,
      dataRetentionDays: 30,
      storageGB: 0.5,
      exportFormats: ['PDF'],
      concurrentEvaluations: 1
    },
    addOns: []
  },
  
  [PricingTier.STARTER]: {
    id: 'plan_starter',
    tier: PricingTier.STARTER,
    name: 'Starter',
    description: '소규모 팀을 위한 스타터 플랜',
    pricing: {
      monthly: 29,
      annual: 290, // 17% 할인
      currency: 'USD'
    },
    features: {
      maxProjects: 20,
      maxCriteriaPerProject: 50,
      maxAlternativesPerProject: 50,
      maxEvaluatorsPerProject: 20,
      basicAnalysis: true,
      sensitivityAnalysis: true,
      monteCarloSimulation: false,
      whatIfScenarios: true,
      advancedReporting: true,
      apiAccess: false,
      teamCollaboration: true,
      roleBasedAccess: true,
      auditLog: false,
      emailSupport: true,
      prioritySupport: false,
      dedicatedAccountManager: false,
      sla: null
    },
    limits: {
      monthlyApiCalls: 1000,
      dataRetentionDays: 90,
      storageGB: 5,
      exportFormats: ['PDF', 'Excel', 'CSV'],
      concurrentEvaluations: 5
    },
    addOns: ['EXTRA_STORAGE', 'EXTRA_EVALUATORS'],
    popular: true
  },
  
  [PricingTier.PROFESSIONAL]: {
    id: 'plan_professional',
    tier: PricingTier.PROFESSIONAL,
    name: 'Professional',
    description: '전문가와 중견 기업을 위한 프로페셔널 플랜',
    pricing: {
      monthly: 99,
      annual: 990, // 17% 할인
      currency: 'USD'
    },
    features: {
      maxProjects: 100,
      maxCriteriaPerProject: 'unlimited',
      maxAlternativesPerProject: 'unlimited',
      maxEvaluatorsPerProject: 100,
      basicAnalysis: true,
      sensitivityAnalysis: true,
      monteCarloSimulation: true,
      whatIfScenarios: true,
      advancedReporting: true,
      apiAccess: true,
      teamCollaboration: true,
      roleBasedAccess: true,
      auditLog: true,
      emailSupport: true,
      prioritySupport: true,
      dedicatedAccountManager: false,
      sla: '99.5%'
    },
    limits: {
      monthlyApiCalls: 10000,
      dataRetentionDays: 365,
      storageGB: 50,
      exportFormats: ['PDF', 'Excel', 'CSV', 'PowerPoint', 'JSON'],
      concurrentEvaluations: 20
    },
    addOns: ['EXTRA_STORAGE', 'EXTRA_API_CALLS', 'WHITE_LABEL']
  },
  
  [PricingTier.ENTERPRISE]: {
    id: 'plan_enterprise',
    tier: PricingTier.ENTERPRISE,
    name: 'Enterprise',
    description: '대기업을 위한 엔터프라이즈 플랜',
    pricing: {
      monthly: 499,
      annual: 4990, // 17% 할인
      currency: 'USD'
    },
    features: {
      maxProjects: 'unlimited',
      maxCriteriaPerProject: 'unlimited',
      maxAlternativesPerProject: 'unlimited',
      maxEvaluatorsPerProject: 'unlimited',
      basicAnalysis: true,
      sensitivityAnalysis: true,
      monteCarloSimulation: true,
      whatIfScenarios: true,
      advancedReporting: true,
      apiAccess: true,
      teamCollaboration: true,
      roleBasedAccess: true,
      auditLog: true,
      emailSupport: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      sla: '99.9%'
    },
    limits: {
      monthlyApiCalls: 'unlimited',
      dataRetentionDays: 'unlimited',
      storageGB: 500,
      exportFormats: ['PDF', 'Excel', 'CSV', 'PowerPoint', 'JSON', 'XML'],
      concurrentEvaluations: 'unlimited'
    },
    addOns: ['SSO', 'CUSTOM_INTEGRATION', 'ON_PREMISE_OPTION']
  },
  
  [PricingTier.CUSTOM]: {
    id: 'plan_custom',
    tier: PricingTier.CUSTOM,
    name: 'Custom',
    description: '맞춤형 엔터프라이즈 솔루션',
    pricing: {
      monthly: -1, // 협의
      annual: -1, // 협의
      currency: 'USD'
    },
    features: {
      maxProjects: 'unlimited',
      maxCriteriaPerProject: 'unlimited',
      maxAlternativesPerProject: 'unlimited',
      maxEvaluatorsPerProject: 'unlimited',
      basicAnalysis: true,
      sensitivityAnalysis: true,
      monteCarloSimulation: true,
      whatIfScenarios: true,
      advancedReporting: true,
      apiAccess: true,
      teamCollaboration: true,
      roleBasedAccess: true,
      auditLog: true,
      emailSupport: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      sla: 'custom'
    },
    limits: {
      monthlyApiCalls: 'unlimited',
      dataRetentionDays: 'unlimited',
      storageGB: 'unlimited',
      exportFormats: ['ALL'],
      concurrentEvaluations: 'unlimited'
    },
    addOns: ['ALL']
  }
};

export const ADD_ONS: Record<string, AddOn> = {
  EXTRA_STORAGE: {
    id: 'addon_extra_storage',
    name: '추가 스토리지',
    description: '100GB 추가 스토리지',
    pricing: {
      monthly: 10,
      annual: 100
    },
    type: 'recurring',
    limits: { storageGB: 100 }
  },
  
  EXTRA_EVALUATORS: {
    id: 'addon_extra_evaluators',
    name: '추가 평가자',
    description: '프로젝트당 50명 추가 평가자',
    pricing: {
      monthly: 20,
      annual: 200
    },
    type: 'recurring',
    limits: { extraEvaluators: 50 }
  },
  
  EXTRA_API_CALLS: {
    id: 'addon_extra_api',
    name: 'API 호출 추가',
    description: '월 10,000회 추가 API 호출',
    pricing: {
      monthly: 50
    },
    type: 'usage-based',
    limits: { monthlyApiCalls: 10000 }
  },
  
  WHITE_LABEL: {
    id: 'addon_white_label',
    name: '화이트 라벨',
    description: '브랜딩 커스터마이징',
    pricing: {
      monthly: 100,
      oneTime: 500 // 초기 설정 비용
    },
    type: 'recurring'
  },
  
  SSO: {
    id: 'addon_sso',
    name: 'SSO 통합',
    description: 'SAML/OAuth SSO 통합',
    pricing: {
      monthly: 50,
      oneTime: 1000 // 초기 설정 비용
    },
    type: 'recurring'
  },
  
  CUSTOM_INTEGRATION: {
    id: 'addon_custom_integration',
    name: '커스텀 통합',
    description: '외부 시스템과의 커스텀 통합',
    pricing: {
      oneTime: 5000 // 협의 가능
    },
    type: 'one-time'
  },
  
  ON_PREMISE_OPTION: {
    id: 'addon_on_premise',
    name: '온프레미스 옵션',
    description: '자체 서버에 설치',
    pricing: {
      oneTime: 10000,
      monthly: 500 // 유지보수 비용
    },
    type: 'recurring'
  }
};

// Helper functions
export const getPlanByTier = (tier: PricingTier): PricingPlan => {
  return PRICING_PLANS[tier];
};

export const getMonthlyPrice = (tier: PricingTier): number => {
  return PRICING_PLANS[tier].pricing.monthly;
};

export const getAnnualPrice = (tier: PricingTier): number => {
  return PRICING_PLANS[tier].pricing.annual;
};

export const getAnnualDiscount = (tier: PricingTier): number => {
  const plan = PRICING_PLANS[tier];
  if (plan.pricing.monthly === 0 || plan.pricing.annual === 0) return 0;
  
  const monthlyTotal = plan.pricing.monthly * 12;
  return Math.round(((monthlyTotal - plan.pricing.annual) / monthlyTotal) * 100);
};

export const isFeatureIncluded = (tier: PricingTier, feature: keyof PlanFeatures): boolean => {
  return PRICING_PLANS[tier].features[feature] === true;
};

export const getTierLevel = (tier: PricingTier): number => {
  switch (tier) {
    case PricingTier.FREE: return 0;
    case PricingTier.STARTER: return 1;
    case PricingTier.PROFESSIONAL: return 2;
    case PricingTier.ENTERPRISE: return 3;
    case PricingTier.CUSTOM: return 4;
    default: return 0;
  }
};

export const canUpgradeTo = (currentTier: PricingTier, targetTier: PricingTier): boolean => {
  return getTierLevel(targetTier) > getTierLevel(currentTier);
};

export const canDowngradeTo = (currentTier: PricingTier, targetTier: PricingTier): boolean => {
  return getTierLevel(targetTier) < getTierLevel(currentTier);
};

export const formatLimitValue = (value: number | 'unlimited'): string => {
  if (value === 'unlimited') return '무제한';
  if (value === 0) return '없음';
  return value.toLocaleString();
};

export const formatPriceValue = (price: number, currency: string = 'USD'): string => {
  if (price === -1) return '문의';
  if (price === 0) return '무료';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });
  
  return formatter.format(price);
};