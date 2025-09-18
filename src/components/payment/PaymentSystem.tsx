import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: {
    projects: number;
    users: number;
    evaluators: number;
    support: string;
    export: boolean;
    api: boolean;
  };
  popular?: boolean;
}

const paymentPlans: PaymentPlan[] = [
  {
    id: 'free',
    name: '무료 체험',
    price: 0,
    period: '7일',
    features: {
      projects: 1,
      users: 1,
      evaluators: 3,
      support: '커뮤니티',
      export: false,
      api: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29000,
    period: '월',
    features: {
      projects: 5,
      users: 1,
      evaluators: 10,
      support: '이메일',
      export: true,
      api: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 59000,
    originalPrice: 79000,
    period: '월',
    features: {
      projects: 20,
      users: 5,
      evaluators: 50,
      support: '우선 지원',
      export: true,
      api: true
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199000,
    period: '월',
    features: {
      projects: -1, // unlimited
      users: -1,
      evaluators: -1,
      support: '전담 매니저',
      export: true,
      api: true
    }
  }
];

const PaymentSystem: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');

  const handlePayment = (planId: string) => {
    // 결제 프로세스 시작
    console.log('결제 시작:', planId);
    // TODO: PG사 연동
  };

  const getDiscountedPrice = (price: number): number => {
    if (billingCycle === 'yearly') {
      return Math.floor(price * 10); // 2개월 할인
    }
    return price;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 요금제 선택 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          합리적인 요금제 선택
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          프로젝트 규모에 맞는 최적의 요금제를 선택하세요
        </p>
        
        {/* 결제 주기 선택 */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            월간 결제
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            연간 결제
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              2개월 무료
            </span>
          </button>
        </div>
      </div>

      {/* 요금제 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {paymentPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
              plan.popular ? 'ring-2 ring-blue-600' : ''
            } ${selectedPlan === plan.id ? 'transform scale-105' : ''} 
            transition-transform cursor-pointer hover:shadow-xl`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-semibold">
                인기
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              
              <div className="mb-4">
                {plan.originalPrice && billingCycle === 'monthly' && (
                  <span className="text-gray-400 line-through text-sm">
                    ₩{plan.originalPrice.toLocaleString()}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? '무료' : `₩${getDiscountedPrice(plan.price).toLocaleString()}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    프로젝트 {plan.features.projects === -1 ? '무제한' : `${plan.features.projects}개`}
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    사용자 {plan.features.users === -1 ? '무제한' : `${plan.features.users}명`}
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>
                    평가자 {plan.features.evaluators === -1 ? '무제한' : `${plan.features.evaluators}명`}
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{plan.features.support}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className={`mr-2 ${plan.features.export ? 'text-green-500' : 'text-gray-300'}`}>
                    {plan.features.export ? '✓' : '✗'}
                  </span>
                  <span className={plan.features.export ? '' : 'text-gray-400'}>
                    보고서 내보내기
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  <span className={`mr-2 ${plan.features.api ? 'text-green-500' : 'text-gray-300'}`}>
                    {plan.features.api ? '✓' : '✗'}
                  </span>
                  <span className={plan.features.api ? '' : 'text-gray-400'}>
                    API 접근
                  </span>
                </li>
              </ul>

              <button
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlan === plan.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(plan.id);
                }}
              >
                {plan.id === 'free' ? '무료 시작' : '선택하기'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 결제 정보 입력 */}
      {selectedPlan !== 'free' && (
        <Card title="결제 정보">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 결제 수단 선택 */}
            <div>
              <h4 className="font-semibold mb-4">결제 수단</h4>
              <div className="space-y-3">
                {[
                  { id: 'card', name: '신용/체크카드', icon: '💳' },
                  { id: 'kakao', name: '카카오페이', icon: '🟡' },
                  { id: 'naver', name: '네이버페이', icon: '🟢' },
                  { id: 'toss', name: '토스페이', icon: '🔵' },
                  { id: 'transfer', name: '계좌이체', icon: '🏦' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-xl mr-3">{method.icon}</span>
                    <span className="font-medium">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 결제 요약 */}
            <div>
              <h4 className="font-semibold mb-4">결제 요약</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">선택한 요금제</span>
                    <span className="font-medium">
                      {paymentPlans.find(p => p.id === selectedPlan)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 주기</span>
                    <span className="font-medium">
                      {billingCycle === 'monthly' ? '월간' : '연간'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">기본 금액</span>
                    <span className="font-medium">
                      ₩{(paymentPlans.find(p => p.id === selectedPlan)?.price || 0).toLocaleString()}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="flex justify-between text-green-600">
                      <span>연간 할인 (2개월 무료)</span>
                      <span className="font-medium">
                        -₩{((paymentPlans.find(p => p.id === selectedPlan)?.price || 0) * 2).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>최종 결제 금액</span>
                      <span className="text-blue-600">
                        ₩{getDiscountedPrice(
                          paymentPlans.find(p => p.id === selectedPlan)?.price || 0
                        ).toLocaleString()}
                        {billingCycle === 'yearly' && '/년'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="primary" size="lg" className="w-full">
                    결제하기
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    결제 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다
                  </p>
                </div>
              </div>

              {/* 안전 결제 보장 */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-3">🔒</span>
                  <div>
                    <h5 className="font-medium text-green-900">안전한 결제</h5>
                    <p className="text-sm text-green-700">
                      모든 결제는 PG사를 통해 안전하게 처리됩니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* FAQ 섹션 */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6">자주 묻는 질문</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-2">언제든지 요금제를 변경할 수 있나요?</h4>
            <p className="text-sm text-gray-600">
              네, 언제든지 상위 또는 하위 요금제로 변경 가능합니다. 
              변경 시 일할 계산되어 적용됩니다.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-2">환불 정책은 어떻게 되나요?</h4>
            <p className="text-sm text-gray-600">
              첫 구매 후 7일 이내 전액 환불이 가능하며, 
              이후에는 사용하지 않은 기간에 대해 일할 계산하여 환불됩니다.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-2">기업용 맞춤 요금제가 있나요?</h4>
            <p className="text-sm text-gray-600">
              Enterprise 요금제 외에도 대규모 조직을 위한 맞춤 요금제를 
              제공합니다. 별도 문의 바랍니다.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-2">해외 결제도 가능한가요?</h4>
            <p className="text-sm text-gray-600">
              현재는 국내 결제만 지원하며, 해외 결제는 
              2025년 상반기 중 지원 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;