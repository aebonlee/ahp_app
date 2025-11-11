// Subscription Page
// Main page for subscription management and pricing

import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import PricingTable from '../components/payment/PricingTable';
import SubscriptionManagement from '../components/payment/SubscriptionManagement';
import UsageDashboard from '../components/payment/UsageDashboard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  PricingTier, 
  BillingCycle, 
  Subscription, 
  PaymentMethodInfo, 
  UsageReport,
  SubscriptionStatus
} from '../types/payment';

const SubscriptionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'subscription' | 'usage' | 'billing'>('pricing');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInfo | null>(null);
  const [usageReport, setUsageReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user with existing subscription for demo
  const [user] = useState({
    id: 'user-123',
    email: 'user@example.com',
    name: 'John Doe',
    hasSubscription: true
  });

  useEffect(() => {
    loadUserSubscriptionData();
  }, []);

  const loadUserSubscriptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock subscription data
      if (user.hasSubscription) {
        setSubscription({
          id: 'sub-123',
          userId: user.id,
          planId: 'plan_starter',
          tier: PricingTier.STARTER,
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: 'stripe',
          providerSubscriptionId: 'sub_stripe_123',
          providerCustomerId: 'cus_stripe_123',
          currentPeriodStart: '2024-11-01T00:00:00Z',
          currentPeriodEnd: '2024-12-01T00:00:00Z',
          billingCycle: BillingCycle.MONTHLY,
          amount: 29,
          currency: 'USD',
          discountPercentage: 0,
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-11-12T00:00:00Z'
        });

        setPaymentMethod({
          id: 'pm_123',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025
          },
          billingDetails: {
            name: user.name,
            email: user.email
          }
        });

        setUsageReport({
          currentUsage: {
            projects: 8,
            evaluators: 15,
            storage: 2.3,
            apiCalls: 450,
            exports: 23
          },
          limits: {
            projects: 20,
            evaluators: 20,
            storage: 5,
            apiCalls: 1000,
            exports: 100
          },
          percentages: {
            projects: 40,
            evaluators: 75,
            storage: 46,
            apiCalls: 45,
            exports: 23
          },
          period: {
            start: '2024-11-01T00:00:00Z',
            end: '2024-11-30T23:59:59Z'
          }
        });

        setActiveTab('subscription');
      } else {
        setActiveTab('pricing');
      }
    } catch (err) {
      setError('구독 정보를 불러오는 중 오류가 발생했습니다.');
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (tier: PricingTier, billingCycle: BillingCycle) => {
    console.log('Selected plan:', tier, billingCycle);
    
    if (tier === PricingTier.CUSTOM) {
      // Handle custom plan inquiry
      window.open('mailto:sales@ahp-platform.com?subject=Custom Plan Inquiry');
      return;
    }

    if (tier === PricingTier.FREE) {
      // Handle free plan signup
      alert('무료 플랜으로 시작하기 - 가입 프로세스를 진행합니다.');
      return;
    }

    // Handle paid plan selection
    alert(`${tier} 플랜 (${billingCycle}) 선택됨 - 결제 프로세스를 진행합니다.`);
  };

  const handleUpgrade = async (newTier: PricingTier) => {
    if (!subscription) return;
    
    try {
      console.log('Upgrading to:', newTier);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSubscription({
        ...subscription,
        tier: newTier,
        planId: `plan_${newTier.toLowerCase()}`,
        amount: newTier === PricingTier.PROFESSIONAL ? 99 : 499,
        updatedAt: new Date().toISOString()
      });
      
      alert(`${newTier} 플랜으로 업그레이드되었습니다.`);
    } catch (err) {
      alert('업그레이드 중 오류가 발생했습니다.');
    }
  };

  const handleDowngrade = async (newTier: PricingTier) => {
    if (!subscription) return;
    
    try {
      console.log('Downgrading to:', newTier);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${newTier} 플랜으로 다운그레이드가 예약되었습니다. 현재 결제 기간 종료 후 적용됩니다.`);
    } catch (err) {
      alert('다운그레이드 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = async (reason?: string) => {
    if (!subscription) return;
    
    try {
      console.log('Canceling subscription with reason:', reason);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription({
        ...subscription,
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      alert('구독이 취소되었습니다. 현재 결제 기간 종료까지 계속 이용할 수 있습니다.');
    } catch (err) {
      alert('구독 취소 중 오류가 발생했습니다.');
    }
  };

  const handleUpdatePaymentMethod = async () => {
    alert('결제 방법 업데이트 - Stripe Elements 모달을 표시합니다.');
  };

  const tabs = [
    ...(subscription ? [] : [{ id: 'pricing', name: '요금제', icon: CreditCardIcon }]),
    ...(subscription ? [{ id: 'subscription', name: '구독 관리', icon: Cog6ToothIcon }] : []),
    ...(subscription ? [{ id: 'usage', name: '사용량', icon: ChartBarIcon }] : []),
    { id: 'billing', name: '청구 내역', icon: CreditCardIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">구독 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadUserSubscriptionData()}>
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">구독 관리</h1>
          <p className="text-gray-600 mt-2">
            요금제를 선택하고 구독을 관리하세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div>
          {activeTab === 'pricing' && (
            <PricingTable
              currentTier={subscription?.tier}
              onSelectPlan={handleSelectPlan}
              showAnnualDiscount={true}
            />
          )}

          {activeTab === 'subscription' && subscription && (
            <SubscriptionManagement
              subscription={subscription}
              paymentMethod={paymentMethod || undefined}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              onCancel={handleCancel}
              onUpdatePaymentMethod={handleUpdatePaymentMethod}
            />
          )}

          {activeTab === 'usage' && subscription && usageReport && (
            <UsageDashboard
              usageReport={usageReport}
              subscription={subscription}
              onUpgrade={() => setActiveTab('pricing')}
            />
          )}

          {activeTab === 'billing' && (
            <Card>
              <div className="p-8 text-center">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">청구 내역</h3>
                <p className="text-gray-600 mb-6">
                  청구 내역 및 인보이스 관리 기능이 곧 추가될 예정입니다.
                </p>
                <Button variant="outline">
                  최신 인보이스 다운로드
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;