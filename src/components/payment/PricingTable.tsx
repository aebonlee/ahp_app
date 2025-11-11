// Pricing Table Component
// Displays available subscription plans with features comparison

import React, { useState } from 'react';
import { CheckIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import Button from '../common/Button';
import Card from '../common/Card';
import { PricingTier, BillingCycle, PricingTableProps } from '../../types/payment';
import { 
  PRICING_PLANS, 
  getAnnualDiscount, 
  formatPriceValue, 
  formatLimitValue 
} from '../../data/pricingPlans';

const PricingTable: React.FC<PricingTableProps> = ({
  plans: propPlans,
  currentTier,
  onSelectPlan,
  showAnnualDiscount = true
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  const plans = propPlans || Object.values(PRICING_PLANS).filter(plan => 
    plan.tier !== PricingTier.CUSTOM // Custom plans are handled separately
  );

  const getPrice = (tier: PricingTier) => {
    const plan = PRICING_PLANS[tier];
    return billingCycle === BillingCycle.ANNUAL ? plan.pricing.annual : plan.pricing.monthly;
  };

  const getDisplayPrice = (tier: PricingTier) => {
    const price = getPrice(tier);
    const plan = PRICING_PLANS[tier];
    
    if (price === 0) return '무료';
    if (price === -1) return '문의';
    
    const monthlyPrice = billingCycle === BillingCycle.ANNUAL ? price / 12 : price;
    return `$${Math.round(monthlyPrice)}`;
  };

  const formatFeatureValue = (value: any): string => {
    if (typeof value === 'boolean') return '';
    if (value === 'unlimited') return '무제한';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const isCurrentPlan = (tier: PricingTier) => currentTier === tier;
  
  const getButtonText = (tier: PricingTier) => {
    if (isCurrentPlan(tier)) return '현재 플랜';
    if (tier === PricingTier.FREE) return '무료로 시작하기';
    return '플랜 선택';
  };

  const getButtonVariant = (tier: PricingTier) => {
    if (isCurrentPlan(tier)) return 'secondary';
    if (tier === PricingTier.STARTER) return 'primary';
    return 'outline';
  };

  const featureCategories = [
    {
      name: '프로젝트 한계',
      features: [
        { key: 'maxProjects', name: '최대 프로젝트 수' },
        { key: 'maxCriteriaPerProject', name: '프로젝트당 기준 수' },
        { key: 'maxAlternativesPerProject', name: '프로젝트당 대안 수' },
        { key: 'maxEvaluatorsPerProject', name: '프로젝트당 평가자 수' }
      ]
    },
    {
      name: '분석 기능',
      features: [
        { key: 'basicAnalysis', name: '기본 분석' },
        { key: 'sensitivityAnalysis', name: '민감도 분석' },
        { key: 'monteCarloSimulation', name: '몬테카를로 시뮬레이션' },
        { key: 'whatIfScenarios', name: 'What-if 시나리오' },
        { key: 'advancedReporting', name: '고급 리포팅' }
      ]
    },
    {
      name: '협업 & 관리',
      features: [
        { key: 'teamCollaboration', name: '팀 협업' },
        { key: 'roleBasedAccess', name: '역할 기반 접근 제어' },
        { key: 'auditLog', name: '감사 로그' },
        { key: 'apiAccess', name: 'API 접근' }
      ]
    },
    {
      name: '지원',
      features: [
        { key: 'emailSupport', name: '이메일 지원' },
        { key: 'prioritySupport', name: '우선 지원' },
        { key: 'dedicatedAccountManager', name: '전담 계정 관리자' },
        { key: 'sla', name: 'SLA' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* 청구 주기 선택 */}
      {showAnnualDiscount && (
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === BillingCycle.MONTHLY
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
            >
              월간
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === BillingCycle.ANNUAL
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              onClick={() => setBillingCycle(BillingCycle.ANNUAL)}
            >
              연간
              <span className="ml-1 text-xs text-green-600 font-semibold">
                (최대 17% 할인)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 플랜 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.tier} 
            className={`relative p-6 ${
              plan.popular 
                ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
                : 'hover:shadow-lg transition-shadow'
            }`}
          >
            {/* 인기 배지 */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <StarIcon className="h-3 w-3 mr-1" />
                  인기
                </div>
              </div>
            )}

            {/* 플랜 헤더 */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              
              {/* 가격 */}
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {getDisplayPrice(plan.tier)}
                  </span>
                  {getPrice(plan.tier) > 0 && (
                    <span className="text-gray-600 ml-1">/월</span>
                  )}
                </div>
                
                {/* 연간 할인 표시 */}
                {billingCycle === BillingCycle.ANNUAL && getPrice(plan.tier) > 0 && (
                  <div className="mt-1">
                    <span className="text-sm text-gray-500">
                      연간 ${formatPriceValue(plan.pricing.annual).replace('$', '')}
                    </span>
                    {getAnnualDiscount(plan.tier) > 0 && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">
                        {getAnnualDiscount(plan.tier)}% 절약
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 주요 기능 */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                주요 기능
              </div>
              {[
                `프로젝트 ${formatLimitValue(plan.features.maxProjects)}개`,
                `평가자 ${formatLimitValue(plan.features.maxEvaluatorsPerProject)}명`,
                plan.features.basicAnalysis && '기본 분석',
                plan.features.sensitivityAnalysis && '민감도 분석',
                plan.features.monteCarloSimulation && '몬테카를로 시뮬레이션',
                plan.features.teamCollaboration && '팀 협업',
                plan.features.apiAccess && 'API 접근',
                plan.features.prioritySupport && '우선 지원'
              ].filter(Boolean).slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckIconSolid className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <Button
              variant={getButtonVariant(plan.tier)}
              className="w-full"
              onClick={() => onSelectPlan(plan.tier, billingCycle)}
              disabled={isCurrentPlan(plan.tier)}
            >
              {getButtonText(plan.tier)}
            </Button>
          </Card>
        ))}
      </div>

      {/* 상세 기능 비교 */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          상세 기능 비교
        </h3>
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기능
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.tier} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {featureCategories.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    {/* 카테고리 헤더 */}
                    <tr className="bg-gray-25">
                      <td colSpan={plans.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-700">
                        {category.name}
                      </td>
                    </tr>
                    {/* 카테고리 기능들 */}
                    {category.features.map((feature, featureIndex) => (
                      <tr key={`${categoryIndex}-${featureIndex}`}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {feature.name}
                        </td>
                        {plans.map((plan) => {
                          const value = plan.features[feature.key as keyof typeof plan.features];
                          return (
                            <td key={plan.tier} className="px-6 py-4 text-center">
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                                )
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {formatFeatureValue(value)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 커스텀 플랜 */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            엔터프라이즈 맞춤 솔루션
          </h3>
          <p className="text-gray-600 mb-6">
            더 많은 기능이 필요하신가요? 귀하의 조직에 맞는 맞춤형 플랜을 제공해드립니다.
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center">
              <CheckIconSolid className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">온프레미스 배포 옵션</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckIconSolid className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">전용 지원 팀</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckIconSolid className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">맞춤형 개발</span>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => onSelectPlan(PricingTier.CUSTOM, billingCycle)}
          >
            영업팀 문의하기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PricingTable;