import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { SubscriptionPlan, PaymentRequest, ExtendedUser } from '../../types/subscription';
import { subscriptionService } from '../../services/subscriptionService';

interface PaymentOptionsPageProps {
  user: User;
  onTabChange: (tab: string) => void;
}

interface PaymentFormData {
  planId: string;
  paymentMethod: 'card' | 'bank_transfer';
  
  // 카드 결제 정보
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  
  // 통장 결제 정보
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  
  // 청구 주소
  billingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  
  // 회원 설정
  targetUserId: string;
  customLimits: {
    maxProjects: number;
    maxEvaluators: number;
    aiEnabled: boolean;
  };
  
  couponCode?: string;
}

const PaymentOptionsPage: React.FC<PaymentOptionsPageProps> = ({ user, onTabChange }) => {
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    planId: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    billingAddress: {
      country: 'KR',
      city: '',
      address: '',
      postalCode: ''
    },
    targetUserId: '',
    customLimits: {
      maxProjects: 3,
      maxEvaluators: 10,
      aiEnabled: false
    },
    couponCode: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const plans = subscriptionService.getDefaultPlans();
      setAvailablePlans(plans);
      
      // 사용자 목록 로드 (localStorage에서)
      const storedUsers = JSON.parse(localStorage.getItem('ahp_users') || '[]');
      setUsers(storedUsers.filter((u: any) => u.role !== 'super_admin'));
      
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.planId || !formData.targetUserId) {
      setError('플랜과 대상 사용자를 선택해주세요.');
      return;
    }

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardHolderName) {
        setError('카드 정보를 모두 입력해주세요.');
        return;
      }
    } else {
      if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
        setError('계좌 정보를 모두 입력해주세요.');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const paymentRequest: PaymentRequest = {
        planId: formData.planId,
        paymentMethod: formData.paymentMethod,
        billingAddress: formData.billingAddress,
        couponCode: formData.couponCode || undefined
      };

      const response = await subscriptionService.subscribeToPlan(paymentRequest);
      
      if (response.success) {
        // 사용자 제한사항 업데이트
        await subscriptionService.updatePersonalAdminLimits(formData.targetUserId, {
          maxEvaluators: formData.customLimits.maxEvaluators,
          maxSurveys: 50, // 기본값
          maxCriteria: 15, // 기본값
          maxAlternatives: 10, // 기본값
          remainingEvaluators: formData.customLimits.maxEvaluators,
          remainingSurveys: 50,
          remainingCriteria: 15,
          remainingAlternatives: 10
        });

        setSuccess('결제가 성공적으로 처리되었습니다.');
        
        // 폼 초기화
        setFormData({
          ...formData,
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: '',
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          couponCode: ''
        });
        
        setTimeout(() => {
          onTabChange('users');
        }, 2000);
      } else {
        setError(response.error || '결제 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('결제 처리 실패:', error);
      setError('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return match;
    }
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const selectedPlan = availablePlans.find(plan => plan.id === formData.planId);
  const selectedUser = users.find(u => u.id === formData.targetUserId);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            💳 결제 옵션 관리
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            회원의 구독 플랜 및 결제 옵션을 설정합니다
          </p>
        </div>
        <button
          onClick={() => onTabChange('superadmin-dashboard')}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          ← 대시보드로 돌아가기
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. 대상 사용자 선택 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            1️⃣ 대상 사용자 선택
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                사용자 선택
              </label>
              <select
                value={formData.targetUserId}
                onChange={(e) => handleInputChange('targetUserId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">사용자를 선택하세요</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.first_name} {user.last_name})
                  </option>
                ))}
              </select>
            </div>
            {selectedUser && (
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">선택된 사용자 정보</h3>
                <p className="text-sm text-gray-600">이메일: {selectedUser.email}</p>
                <p className="text-sm text-gray-600">이름: {selectedUser.first_name} {selectedUser.last_name}</p>
                <p className="text-sm text-gray-600">역할: {selectedUser.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. 구독 플랜 선택 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            2️⃣ 구독 플랜 선택
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map(plan => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.planId === plan.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.isPopular ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={() => handleInputChange('planId', plan.id)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      인기
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    ₩{plan.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-600">/월</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2">
                    {plan.features.slice(0, 3).map(feature => (
                      <div key={feature.id} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{feature.name}: {feature.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 사용자 정의 제한사항 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            3️⃣ 사용자 정의 제한사항
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                최대 프로젝트 수
              </label>
              <input
                type="number"
                value={formData.customLimits.maxProjects}
                onChange={(e) => handleInputChange('customLimits.maxProjects', parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                최대 평가자 수
              </label>
              <input
                type="number"
                value={formData.customLimits.maxEvaluators}
                onChange={(e) => handleInputChange('customLimits.maxEvaluators', parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                AI 기능 활용
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    checked={formData.customLimits.aiEnabled === true}
                    onChange={() => handleInputChange('customLimits.aiEnabled', true)}
                    className="mr-2"
                  />
                  <span>활성화</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    checked={formData.customLimits.aiEnabled === false}
                    onChange={() => handleInputChange('customLimits.aiEnabled', false)}
                    className="mr-2"
                  />
                  <span>비활성화</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 결제 방법 선택 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            4️⃣ 결제 방법 선택
          </h2>
          
          {/* 결제 방법 선택 */}
          <div className="flex space-x-4 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="font-medium">💳 카드 결제</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <span className="font-medium">🏦 통장 결제</span>
            </label>
          </div>

          {/* 카드 결제 폼 */}
          {formData.paymentMethod === 'card' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">카드 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">카드 번호</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">유효기간 (MM/YY)</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">카드 소지자명</label>
                  <input
                    type="text"
                    value={formData.cardHolderName}
                    onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                    placeholder="카드에 표시된 이름"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* 통장 결제 폼 */}
          {formData.paymentMethod === 'bank_transfer' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">계좌 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">은행명</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">은행을 선택하세요</option>
                    <option value="KB국민은행">KB국민은행</option>
                    <option value="신한은행">신한은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="하나은행">하나은행</option>
                    <option value="농협">농협</option>
                    <option value="기업은행">기업은행</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">계좌번호</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/[^0-9-]/g, ''))}
                    placeholder="123-456-789012"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">예금주명</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                    placeholder="예금주 이름"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. 청구 주소 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            5️⃣ 청구 주소
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">국가</label>
              <select
                value={formData.billingAddress.country}
                onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="KR">대한민국</option>
                <option value="US">미국</option>
                <option value="JP">일본</option>
                <option value="CN">중국</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">도시</label>
              <input
                type="text"
                value={formData.billingAddress.city}
                onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">주소</label>
              <input
                type="text"
                value={formData.billingAddress.address}
                onChange={(e) => handleInputChange('billingAddress.address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">우편번호</label>
              <input
                type="text"
                value={formData.billingAddress.postalCode}
                onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* 6. 쿠폰 코드 (선택사항) */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            6️⃣ 쿠폰 코드 (선택사항)
          </h2>
          <div className="max-w-md">
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
              placeholder="쿠폰 코드를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 결제 요약 */}
        {selectedPlan && (
          <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900">💰 결제 요약</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>선택된 플랜:</span>
                <span className="font-bold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>월 요금:</span>
                <span className="font-bold">₩{selectedPlan.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>대상 사용자:</span>
                <span className="font-bold">{selectedUser?.email || '미선택'}</span>
              </div>
              <div className="flex justify-between">
                <span>결제 방법:</span>
                <span className="font-bold">
                  {formData.paymentMethod === 'card' ? '💳 카드 결제' : '🏦 통장 결제'}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>총 결제 금액:</span>
                <span>₩{selectedPlan.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => onTabChange('users')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || !formData.planId || !formData.targetUserId}
          >
            {loading ? '처리 중...' : '결제 진행'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentOptionsPage;