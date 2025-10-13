import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface UsageManagementProps {
  user: {
    id: string | number;  // 백엔드는 number로 보냄
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  onBack?: () => void;
}

interface SubscriptionInfo {
  plan_type: string;
  start_date: string;
  end_date: string;
  status: string;
  days_remaining: number;
  trial_days: number;
  is_active: boolean;
}

interface UsageInfo {
  projects: number;
  evaluators: number;
  storage_mb: number;
  quota: {
    max_projects: number;
    max_evaluators_per_project: number;
    max_storage_mb: number;
    can_export: boolean;
    can_use_advanced_features: boolean;
  };
}

const UsageManagement: React.FC<UsageManagementProps> = ({ user, onBack }) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetConfirm, setResetConfirm] = useState('');
  const [keepArchives, setKeepArchives] = useState(true);

  // 구독 정보 및 사용량 로드
  useEffect(() => {
    loadSubscriptionData();
    loadUsageData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  };

  const loadUsageData = async () => {
    try {
      const response = await fetch('/api/subscription/usage', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTrial = async (days: number) => {
    try {
      const response = await fetch('/api/subscription/extend', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          days, 
          reason: 'manual_extension' 
        })
      });

      if (response.ok) {
        alert(`사용기간이 ${days}일 연장되었습니다.`);
        loadSubscriptionData();
      } else {
        const error = await response.json();
        alert(`연장 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to extend trial:', error);
      alert('연장 중 오류가 발생했습니다.');
    }
  };

  const handleResetData = async () => {
    if (!resetConfirm) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (!window.confirm('모든 프로젝트 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/reset-data', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          confirmPassword: resetConfirm,
          keepArchives 
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`데이터 초기화 완료: ${result.deleted_projects}개 프로젝트 삭제`);
        setResetConfirm('');
        loadUsageData();
      } else {
        const error = await response.json();
        alert(`초기화 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('초기화 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg" style={{ color: 'var(--text-muted)' }}>
          사용량 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  const getProgressColor = (current: number, max: number) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 70) return '#f59e0b'; // amber
    return 'var(--accent-primary)'; // primary
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="border-b sticky top-0 z-10" style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderBottomColor: 'var(--border-subtle)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  >
                    ←
                  </button>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📊</span>
                    사용량 관리
                  </h1>
                  <p className="text-gray-600 mt-2">구독 현황, 사용량 확인 및 데이터 관리</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 구독 정보 */}
          <Card title="구독 현황">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>플랜</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.plan_type === 'premium' ? 'bg-blue-100 text-blue-800' :
                    subscription.plan_type === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.plan_type === 'trial' ? '체험판' :
                     subscription.plan_type === 'basic' ? '기본' :
                     subscription.plan_type === 'premium' ? '프리미엄' : '엔터프라이즈'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>시작일</span>
                  <span>{formatDate(subscription.start_date)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>만료일</span>
                  <span className={subscription.status === 'expired' ? 'text-red-600' : ''}>
                    {formatDate(subscription.end_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>남은 기간</span>
                  <span className={`font-medium ${
                    subscription.days_remaining < 7 ? 'text-red-600' :
                    subscription.days_remaining < 30 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {subscription.days_remaining > 0 ? `${Math.ceil(subscription.days_remaining)}일` : '만료됨'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>상태</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status === 'active' ? '활성' : '만료'}
                  </span>
                </div>

                {subscription.plan_type === 'trial' && subscription.days_remaining > 0 && (
                  <div className="pt-4 space-y-2">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      체험 기간 연장
                    </h4>
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleExtendTrial(7)}
                      >
                        +7일
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleExtendTrial(30)}
                      >
                        +30일
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                구독 정보를 불러올 수 없습니다.
              </div>
            )}
          </Card>

          {/* 사용량 현황 */}
          <Card title="사용량 현황">
            {usage ? (
              <div className="space-y-6">
                {/* 프로젝트 사용량 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>프로젝트</span>
                    <span className="text-sm font-medium">
                      {usage.projects}/{usage.quota.max_projects > 0 ? usage.quota.max_projects : '무제한'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage.projects / (usage.quota.max_projects || usage.projects || 1)) * 100, 100)}%`,
                        backgroundColor: getProgressColor(usage.projects, usage.quota.max_projects)
                      }}
                    ></div>
                  </div>
                </div>

                {/* 평가자 수 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>총 평가자 수</span>
                    <span className="text-sm font-medium">
                      {usage.evaluators}/{usage.quota.max_evaluators_per_project > 0 ? usage.quota.max_evaluators_per_project : '무제한'} (프로젝트당)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage.evaluators / (usage.quota.max_evaluators_per_project || usage.evaluators || 1)) * 100, 100)}%`,
                        backgroundColor: getProgressColor(usage.evaluators, usage.quota.max_evaluators_per_project)
                      }}
                    ></div>
                  </div>
                </div>

                {/* 저장공간 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>저장공간</span>
                    <span className="text-sm font-medium">
                      {usage.storage_mb.toFixed(1)}MB/{usage.quota.max_storage_mb > 0 ? usage.quota.max_storage_mb : '무제한'}MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((usage.storage_mb / (usage.quota.max_storage_mb || usage.storage_mb || 1)) * 100, 100)}%`,
                        backgroundColor: getProgressColor(usage.storage_mb, usage.quota.max_storage_mb)
                      }}
                    ></div>
                  </div>
                </div>

                {/* 기능 제한 */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    사용 가능 기능
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">내보내기 기능</span>
                      <span className={`text-sm ${usage.quota.can_export ? 'text-green-600' : 'text-red-600'}`}>
                        {usage.quota.can_export ? '✓ 사용 가능' : '✗ 제한됨'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">고급 분석 기능</span>
                      <span className={`text-sm ${usage.quota.can_use_advanced_features ? 'text-green-600' : 'text-red-600'}`}>
                        {usage.quota.can_use_advanced_features ? '✓ 사용 가능' : '✗ 제한됨'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                사용량 정보를 불러올 수 없습니다.
              </div>
            )}
          </Card>

          {/* 플랜 비교 */}
          <Card title="플랜 비교">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <th className="text-left py-2" style={{ color: 'var(--text-secondary)' }}>기능</th>
                    <th className="text-center py-2" style={{ color: 'var(--text-secondary)' }}>체험판</th>
                    <th className="text-center py-2" style={{ color: 'var(--text-secondary)' }}>기본</th>
                    <th className="text-center py-2" style={{ color: 'var(--text-secondary)' }}>프리미엄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">프로젝트 수</td>
                    <td className="text-center">3개</td>
                    <td className="text-center">10개</td>
                    <td className="text-center">50개</td>
                  </tr>
                  <tr>
                    <td className="py-2">평가자 수 (프로젝트당)</td>
                    <td className="text-center">5명</td>
                    <td className="text-center">15명</td>
                    <td className="text-center">100명</td>
                  </tr>
                  <tr>
                    <td className="py-2">저장공간</td>
                    <td className="text-center">100MB</td>
                    <td className="text-center">500MB</td>
                    <td className="text-center">2GB</td>
                  </tr>
                  <tr>
                    <td className="py-2">내보내기</td>
                    <td className="text-center text-red-600">✗</td>
                    <td className="text-center text-green-600">✓</td>
                    <td className="text-center text-green-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2">고급 분석</td>
                    <td className="text-center text-red-600">✗</td>
                    <td className="text-center text-red-600">✗</td>
                    <td className="text-center text-green-600">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* 데이터 초기화 */}
          <Card title="데이터 초기화">
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ 주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 모든 프로젝트와 평가 데이터가 삭제됩니다</li>
                  <li>• 삭제된 데이터는 복구할 수 없습니다</li>
                  <li>• 아카이브 보관 옵션을 선택할 수 있습니다</li>
                </ul>
              </div>

              <div>
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={keepArchives}
                    onChange={(e) => setKeepArchives(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">삭제된 데이터를 아카이브에 보관 (2년)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border transition-colors"
                  style={{ 
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--bg-elevated)'
                  }}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <Button 
                variant="primary"
                onClick={handleResetData}
                disabled={!resetConfirm}
                style={{ 
                  backgroundColor: '#ef4444',
                  borderColor: '#dc2626'
                }}
              >
                <span className="mr-2">🗑️</span>
                데이터 초기화 실행
              </Button>
            </div>
          </Card>

          {/* 활동 요약 */}
          <Card title="최근 활동">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>총 로그인 횟수</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>마지막 활동</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>생성한 프로젝트</span>
                <span className="font-medium">{usage?.projects || 0}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>참여한 평가</span>
                <span className="font-medium">-</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                * 상세한 활동 내역은 추후 업데이트에서 제공됩니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UsageManagement;