// Subscription Management Component
// Allows users to view and manage their current subscription

import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  CalendarDaysIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Card from '../common/Card';
import { SubscriptionManagementProps, PricingTier, SubscriptionStatus } from '../../types/payment';
import { PRICING_PLANS, formatPriceValue, getTierLevel } from '../../data/pricingPlans';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import authService from '../../services/authService';

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  subscription,
  paymentMethod,
  onUpgrade,
  onDowngrade,
  onCancel,
  onUpdatePaymentMethod
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const currentPlan = PRICING_PLANS[subscription.tier];
  const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
  const isTrialing = subscription.status === SubscriptionStatus.TRIALING;
  const isPastDue = subscription.status === SubscriptionStatus.PAST_DUE;
  const isCanceled = subscription.status === SubscriptionStatus.CANCELED;

  const getStatusBadge = () => {
    const statusConfig = {
      [SubscriptionStatus.ACTIVE]: {
        text: '활성',
        className: 'bg-green-100 text-green-800'
      },
      [SubscriptionStatus.TRIALING]: {
        text: '평가판',
        className: 'bg-blue-100 text-blue-800'
      },
      [SubscriptionStatus.PAST_DUE]: {
        text: '결제 지연',
        className: 'bg-red-100 text-red-800'
      },
      [SubscriptionStatus.CANCELED]: {
        text: '취소됨',
        className: 'bg-gray-100 text-gray-800'
      },
      [SubscriptionStatus.PAUSED]: {
        text: '일시정지',
        className: 'bg-yellow-100 text-yellow-800'
      },
      [SubscriptionStatus.EXPIRED]: {
        text: '만료됨',
        className: 'bg-gray-100 text-gray-800'
      }
    };

    const config = statusConfig[subscription.status] || statusConfig[SubscriptionStatus.ACTIVE];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getUpgradeOptions = () => {
    const currentLevel = getTierLevel(subscription.tier);
    return Object.values(PRICING_PLANS)
      .filter(plan => getTierLevel(plan.tier) > currentLevel)
      .slice(0, 3); // 최대 3개 옵션만 표시
  };

  const getDowngradeOptions = () => {
    const currentLevel = getTierLevel(subscription.tier);
    return Object.values(PRICING_PLANS)
      .filter(plan => getTierLevel(plan.tier) < currentLevel && plan.tier !== PricingTier.CUSTOM)
      .slice(-2); // 최대 2개 옵션만 표시
  };

  const handleCancelConfirm = () => {
    onCancel(cancelReason);
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleDownloadInvoices = async () => {
    try {
      const token = authService.getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT.INVOICES}`, {
        credentials: 'include',
        headers,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Open invoices page as fallback
      window.open(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT.INVOICES}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 현재 구독 정보 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">현재 구독</h2>
              <p className="text-gray-600 mt-1">구독 정보를 관리하세요</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 플랜 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name} 플랜</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">월 요금</span>
                  <span className="font-semibold">
                    {formatPriceValue(subscription.amount, subscription.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">청구 주기</span>
                  <span className="font-semibold">
                    {subscription.billingCycle === 'monthly' ? '월간' : '연간'}
                  </span>
                </div>
                {subscription.discountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">할인율</span>
                    <span className="font-semibold text-green-600">
                      {subscription.discountPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 다음 결제 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isTrialing ? '평가판 종료' : '다음 결제'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {!isTrialing && (
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {paymentMethod?.card ? 
                        `•••• •••• •••• ${paymentMethod.card.last4}` : 
                        '결제 방법 없음'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 상태 알림 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">알림</h3>
              <div className="space-y-2">
                {isPastDue && (
                  <div className="flex items-start p-3 bg-red-50 rounded-md">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800">결제가 지연되었습니다</p>
                      <p className="text-red-600">결제 방법을 업데이트해 주세요.</p>
                    </div>
                  </div>
                )}
                
                {isTrialing && (
                  <div className="flex items-start p-3 bg-blue-50 rounded-md">
                    <CheckCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">평가판 중</p>
                      <p className="text-blue-600">
                        {Math.ceil((currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}일 남음
                      </p>
                    </div>
                  </div>
                )}

                {isCanceled && (
                  <div className="flex items-start p-3 bg-gray-50 rounded-md">
                    <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">구독이 취소됩니다</p>
                      <p className="text-gray-600">
                        {formatDate(subscription.currentPeriodEnd)}까지 이용 가능
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 플랜 변경 */}
      {!isCanceled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 업그레이드 */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ArrowUpIcon className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">플랜 업그레이드</h3>
              </div>
              <p className="text-gray-600 mb-4">더 많은 기능을 이용하세요</p>
              
              <div className="space-y-3">
                {getUpgradeOptions().map((plan) => (
                  <div key={plan.tier} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatPriceValue(plan.pricing.monthly)}/월
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpgrade(plan.tier)}
                    >
                      업그레이드
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 다운그레이드 */}
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ArrowDownIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">플랜 다운그레이드</h3>
              </div>
              <p className="text-gray-600 mb-4">비용을 절약하세요</p>
              
              <div className="space-y-3">
                {getDowngradeOptions().map((plan) => (
                  <div key={plan.tier} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatPriceValue(plan.pricing.monthly)}/월
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDowngrade(plan.tier)}
                    >
                      다운그레이드
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 결제 정보 관리 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">결제 방법</h3>
            </div>
            
            {paymentMethod ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {paymentMethod.card?.brand.toUpperCase()} •••• {paymentMethod.card?.last4}
                    </p>
                    <p className="text-sm text-gray-600">
                      만료일: {paymentMethod.card?.expMonth}/{paymentMethod.card?.expYear}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={onUpdatePaymentMethod}>
                    변경
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">등록된 결제 방법이 없습니다</p>
                <Button variant="outline" onClick={onUpdatePaymentMethod}>
                  결제 방법 추가
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">계정 관리</h3>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleDownloadInvoices}>
                청구서 다운로드
              </Button>
              
              {!isCanceled && (
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  구독 취소
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                 onClick={() => setShowCancelModal(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  구독을 취소하시겠습니까?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  구독을 취소하면 {formatDate(subscription.currentPeriodEnd)}까지 계속 이용할 수 있습니다.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    취소 사유 (선택사항)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="취소 사유를 입력해 주세요..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCancelModal(false)}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleCancelConfirm}
                  >
                    구독 취소
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;