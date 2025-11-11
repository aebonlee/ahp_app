// Usage Dashboard Component
// Displays current usage against subscription limits

import React from 'react';
import { 
  ChartBarIcon, 
  ServerStackIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';
import { UsageDashboardProps } from '../../types/payment';
import { PRICING_PLANS, formatLimitValue } from '../../data/pricingPlans';

const UsageDashboard: React.FC<UsageDashboardProps> = ({
  usageReport,
  subscription,
  onUpgrade
}) => {
  const currentPlan = PRICING_PLANS[subscription.tier];

  const getUsageItems = () => [
    {
      key: 'projects',
      name: '프로젝트',
      icon: DocumentTextIcon,
      current: usageReport.currentUsage.projects || 0,
      limit: currentPlan.features.maxProjects,
      unit: '개'
    },
    {
      key: 'evaluators',
      name: '평가자',
      icon: UsersIcon,
      current: usageReport.currentUsage.evaluators || 0,
      limit: currentPlan.features.maxEvaluatorsPerProject,
      unit: '명'
    },
    {
      key: 'storage',
      name: '스토리지',
      icon: ServerStackIcon,
      current: usageReport.currentUsage.storage || 0,
      limit: currentPlan.limits.storageGB,
      unit: 'GB'
    },
    {
      key: 'api_calls',
      name: 'API 호출',
      icon: CloudIcon,
      current: usageReport.currentUsage.apiCalls || 0,
      limit: currentPlan.limits.monthlyApiCalls,
      unit: '회'
    },
    {
      key: 'exports',
      name: '내보내기',
      icon: ChartBarIcon,
      current: usageReport.currentUsage.exports || 0,
      limit: 100, // 예시 한계값
      unit: '회'
    }
  ];

  const getUsagePercentage = (current: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <CheckCircleIcon className="h-5 w-5" />;
    }
  };

  const getUpgradeRecommendation = () => {
    const criticalUsage = getUsageItems().filter(item => {
      const percentage = getUsagePercentage(item.current, item.limit);
      return percentage >= 75;
    });

    return criticalUsage.length > 0 ? criticalUsage : null;
  };

  const formatUsageValue = (value: number, unit: string) => {
    if (unit === 'GB') {
      return `${value.toFixed(1)} ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const upgradeRecommendation = getUpgradeRecommendation();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">사용량 대시보드</h2>
          <p className="text-gray-600 mt-1">
            현재 사용량과 {currentPlan.name} 플랜의 한계를 확인하세요
          </p>
        </div>
        <div className="text-sm text-gray-500">
          기간: {new Date(usageReport.period.start).toLocaleDateString()} - {new Date(usageReport.period.end).toLocaleDateString()}
        </div>
      </div>

      {/* 업그레이드 권장사항 */}
      {upgradeRecommendation && onUpgrade && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">업그레이드 권장</h3>
                  <p className="text-gray-600">
                    일부 사용량이 한계에 근접했습니다. 더 많은 리소스가 필요할 수 있습니다.
                  </p>
                </div>
              </div>
              <Button variant="primary" onClick={onUpgrade}>
                플랜 업그레이드
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 사용량 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getUsageItems().map((item) => {
          const percentage = getUsagePercentage(item.current, item.limit);
          const status = getUsageStatus(percentage);
          const Icon = item.icon;

          return (
            <Card key={item.key} className="relative">
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${
                      status === 'critical' ? 'bg-red-100' :
                      status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        status === 'critical' ? 'text-red-600' :
                        status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">
                      {item.name}
                    </h3>
                  </div>
                  <div className={getStatusColor(status)}>
                    {getStatusIcon(status)}
                  </div>
                </div>

                {/* 사용량 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatUsageValue(item.current, item.unit)}
                    </span>
                    <span className="text-sm text-gray-600">
                      / {formatLimitValue(item.limit)} {item.unit}
                    </span>
                  </div>

                  {/* 진행률 바 */}
                  {item.limit !== 'unlimited' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">
                          사용률
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(status)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 무제한인 경우 */}
                  {item.limit === 'unlimited' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">무제한</span>
                    </div>
                  )}

                  {/* 상태 메시지 */}
                  {item.limit !== 'unlimited' && (
                    <div className="text-sm">
                      {status === 'critical' && (
                        <span className="text-red-600">
                          한계에 도달했습니다. 업그레이드를 고려해보세요.
                        </span>
                      )}
                      {status === 'warning' && (
                        <span className="text-yellow-600">
                          한계에 근접했습니다. 사용량을 모니터링하세요.
                        </span>
                      )}
                      {status === 'normal' && (
                        <span className="text-gray-600">
                          양호한 사용량입니다.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 기능 사용 현황 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기능 사용 가능 여부</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: '기본 분석', available: currentPlan.features.basicAnalysis },
              { name: '민감도 분석', available: currentPlan.features.sensitivityAnalysis },
              { name: '몬테카를로 시뮬레이션', available: currentPlan.features.monteCarloSimulation },
              { name: 'What-if 시나리오', available: currentPlan.features.whatIfScenarios },
              { name: '고급 리포팅', available: currentPlan.features.advancedReporting },
              { name: 'API 접근', available: currentPlan.features.apiAccess },
              { name: '팀 협업', available: currentPlan.features.teamCollaboration },
              { name: '역할 기반 접근 제어', available: currentPlan.features.roleBasedAccess },
              { name: '감사 로그', available: currentPlan.features.auditLog }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm text-gray-900">{feature.name}</span>
                {feature.available ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">업그레이드 필요</span>
                    <div className="h-5 w-5 rounded-full bg-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 사용량 이력 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 달 사용량 트렌드</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">평균 일일 사용량</p>
                <p className="text-sm text-gray-600">지난 30일 기준</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round((usageReport.currentUsage.projects || 0) / 30 * 10) / 10} 프로젝트/일
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round((usageReport.currentUsage.apiCalls || 0) / 30)} API 호출/일
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">예상 월말 사용량</p>
                <p className="text-sm text-gray-600">현재 추세 기준</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round((usageReport.currentUsage.projects || 0) * 1.1)} 프로젝트
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round((usageReport.currentUsage.apiCalls || 0) * 1.1).toLocaleString()} API 호출
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UsageDashboard;