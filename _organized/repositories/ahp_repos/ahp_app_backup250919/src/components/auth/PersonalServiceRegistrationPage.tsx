import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { ServiceRegistrationData, ServiceTier } from '../../types/userTypes';

interface PersonalServiceRegistrationPageProps {
  onRegister: (data: ServiceRegistrationData & {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  onBackToSelection: () => void;
  loading?: boolean;
  error?: string;
}

const PersonalServiceRegistrationPage: React.FC<PersonalServiceRegistrationPageProps> = ({
  onRegister,
  onBackToSelection,
  loading = false,
  error
}) => {
  const [formData, setFormData] = useState({
    // 기본 정보
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    
    // 서비스 정보
    organization: '',
    estimated_projects: 5,
    estimated_evaluators: 20,
    use_case_description: '',
    trial_request: true,
    preferred_tier: 'professional' as ServiceTier,
    payment_ready: false,
    
    // 약관 동의
    agree_terms: false,
    agree_privacy: false,
    agree_marketing: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPricing, setShowPricing] = useState(false);

  const serviceTiers = [
    {
      value: 'basic' as ServiceTier,
      title: 'Basic',
      price: 49000,
      description: '소규모 프로젝트에 적합',
      features: [
        '프로젝트 3개',
        '프로젝트당 평가자 10명',
        '기본 분석 도구',
        '이메일 지원',
        '1GB 저장공간'
      ],
      limits: {
        projects: 3,
        evaluators: 10,
        criteria: 20,
        alternatives: 10
      },
      popular: false
    },
    {
      value: 'professional' as ServiceTier,
      title: 'Professional',
      price: 129000,
      description: '중간 규모 조직에 최적',
      features: [
        '프로젝트 10개',
        '프로젝트당 평가자 50명',
        '고급 분석 도구',
        '우선 지원',
        '5GB 저장공간',
        '그룹 의사결정',
        'API 접근'
      ],
      limits: {
        projects: 10,
        evaluators: 50,
        criteria: 50,
        alternatives: 30
      },
      popular: true
    },
    {
      value: 'enterprise' as ServiceTier,
      title: 'Enterprise',
      price: 299000,
      description: '대규모 조직용',
      features: [
        '무제한 프로젝트',
        '프로젝트당 평가자 500명',
        '전체 기능 이용',
        '전담 지원',
        '50GB 저장공간',
        '커스텀 브랜딩',
        '온프레미스 옵션'
      ],
      limits: {
        projects: 999,
        evaluators: 500,
        criteria: 100,
        alternatives: 100
      },
      popular: false
    }
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 기본 정보 검증
    if (!formData.username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 3) {
      errors.username = '사용자명은 3자 이상이어야 합니다.';
    }

    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = '이름을 입력해주세요.';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = '성을 입력해주세요.';
    }

    // 서비스 정보 검증
    if (!formData.use_case_description.trim()) {
      errors.use_case_description = '서비스 이용 목적을 입력해주세요.';
    } else if (formData.use_case_description.length < 20) {
      errors.use_case_description = '서비스 이용 목적을 20자 이상 입력해주세요.';
    }

    if (formData.estimated_projects < 1) {
      errors.estimated_projects = '예상 프로젝트 수는 1개 이상이어야 합니다.';
    }

    if (formData.estimated_evaluators < 1) {
      errors.estimated_evaluators = '예상 평가자 수는 1명 이상이어야 합니다.';
    }

    // 약관 동의 검증
    if (!formData.agree_terms) {
      errors.agree_terms = '이용약관에 동의해주세요.';
    }

    if (!formData.agree_privacy) {
      errors.agree_privacy = '개인정보처리방침에 동의해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        organization: formData.organization || undefined,
        expected_usage: {
          estimated_projects: formData.estimated_projects,
          estimated_evaluators: formData.estimated_evaluators,
          use_case_description: formData.use_case_description
        },
        trial_request: formData.trial_request,
        preferred_tier: formData.preferred_tier,
        payment_ready: formData.payment_ready
      });
    } catch (err) {
      console.error('Personal service registration failed:', err);
    }
  };

  const selectedTier = serviceTiers.find(tier => tier.value === formData.preferred_tier);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 그라디언트 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, #eff6ff 50%, var(--bg-elevated) 100%)'
      }} />
      
      {/* 기하학적 패턴 */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '5rem',
          width: '24rem',
          height: '24rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
      </div>

      <div style={{ 
        maxWidth: '56rem',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={onBackToSelection}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로 돌아가기
          </button>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '0.5rem'
          }}>
            💼 개인서비스 이용자 가입
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '32rem',
            margin: '0 auto'
          }}>
            AHP 분석 서비스를 이용하여 전문적인 의사결정을 지원받으세요.
          </p>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: showPricing ? '1fr 1fr' : '1fr',
          gap: '2rem'
        }}>
          {/* 가입 폼 */}
          <Card variant="elevated" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <form onSubmit={handleSubmit}>
              {/* 기본 정보 섹션 */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid var(--accent-primary)'
                }}>
                  기본 정보
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  <Input
                    id="username"
                    label="사용자명"
                    type="text"
                    placeholder="user123"
                    value={formData.username}
                    onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
                    error={validationErrors.username}
                    required
                  />
                  
                  <Input
                    id="email"
                    label="이메일"
                    type="email"
                    placeholder="user@company.com"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    error={validationErrors.email}
                    required
                  />
                  
                  <Input
                    id="first_name"
                    label="이름"
                    type="text"
                    placeholder="길동"
                    value={formData.first_name}
                    onChange={(value) => setFormData(prev => ({ ...prev, first_name: value }))}
                    error={validationErrors.first_name}
                    required
                  />
                  
                  <Input
                    id="last_name"
                    label="성"
                    type="text"
                    placeholder="홍"
                    value={formData.last_name}
                    onChange={(value) => setFormData(prev => ({ ...prev, last_name: value }))}
                    error={validationErrors.last_name}
                    required
                  />
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <Input
                    id="password"
                    label="비밀번호"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                    error={validationErrors.password}
                    required
                  />
                  
                  <Input
                    id="confirmPassword"
                    label="비밀번호 확인"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                    error={validationErrors.confirmPassword}
                    required
                  />
                </div>

                <Input
                  id="organization"
                  label="소속 기관/회사 (선택)"
                  type="text"
                  placeholder="예: ABC 컨설팅, XYZ 연구소"
                  value={formData.organization}
                  onChange={(value) => setFormData(prev => ({ ...prev, organization: value }))}
                />
              </div>

              {/* 서비스 계획 섹션 */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #2563eb'
                }}>
                  서비스 이용 계획
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      예상 프로젝트 수 (월)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.estimated_projects}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        estimated_projects: parseInt(e.target.value) || 1 
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-default)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      예상 평가자 수 (프로젝트당)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.estimated_evaluators}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        estimated_evaluators: parseInt(e.target.value) || 1 
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-default)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
                
                <Input
                  id="use_case_description"
                  label="서비스 이용 목적"
                  type="textarea"
                  placeholder="AHP를 어떤 목적으로 활용하실 예정인지 구체적으로 설명해주세요. (예: 기업 전략 선택, 투자 우선순위 결정, 제품 선택 등)"
                  value={formData.use_case_description}
                  onChange={(value) => setFormData(prev => ({ ...prev, use_case_description: value }))}
                  error={validationErrors.use_case_description}
                  rows={4}
                  required
                />
              </div>

              {/* 요금제 선택 */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    요금제 선택
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPricing(!showPricing)}
                  >
                    {showPricing ? '요금제 숨기기' : '요금제 비교'}
                  </Button>
                </div>

                {selectedTier && (
                  <div style={{
                    padding: '1rem',
                    border: '2px solid #2563eb',
                    borderRadius: '0.5rem',
                    backgroundColor: '#eff6ff',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#2563eb',
                        margin: 0
                      }}>
                        {selectedTier.title} 플랜
                      </h4>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#2563eb'
                      }}>
                        ₩{selectedTier.price.toLocaleString()}/월
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {selectedTier.description}
                    </p>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      <div>프로젝트: {selectedTier.limits.projects}개</div>
                      <div>평가자: {selectedTier.limits.evaluators}명</div>
                      <div>기준: {selectedTier.limits.criteria}개</div>
                      <div>대안: {selectedTier.limits.alternatives}개</div>
                    </div>
                  </div>
                )}

                {/* 무료 체험 옵션 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--accent-light)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="checkbox"
                    id="trial_request"
                    checked={formData.trial_request}
                    onChange={(e) => setFormData(prev => ({ ...prev, trial_request: e.target.checked }))}
                    style={{ marginRight: '0.75rem' }}
                  />
                  <label htmlFor="trial_request" style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}>
                    14일 무료 체험으로 시작하기 (신용카드 불필요)
                  </label>
                </div>
              </div>

              {/* 약관 동의 */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  약관 동의
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.agree_terms}
                      onChange={(e) => setFormData(prev => ({ ...prev, agree_terms: e.target.checked }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>이용약관</strong>에 동의합니다. (필수)
                    </span>
                    {validationErrors.agree_terms && (
                      <span style={{ color: 'var(--status-danger-text)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        {validationErrors.agree_terms}
                      </span>
                    )}
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.agree_privacy}
                      onChange={(e) => setFormData(prev => ({ ...prev, agree_privacy: e.target.checked }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      <strong>개인정보처리방침</strong>에 동의합니다. (필수)
                    </span>
                    {validationErrors.agree_privacy && (
                      <span style={{ color: 'var(--status-danger-text)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                        {validationErrors.agree_privacy}
                      </span>
                    )}
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.agree_marketing}
                      onChange={(e) => setFormData(prev => ({ ...prev, agree_marketing: e.target.checked }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      마케팅 정보 수신에 동의합니다. (선택)
                    </span>
                  </label>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--status-danger-text)'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* 제출 버튼 */}
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb'
                  }}
                >
                  {loading 
                    ? '가입 중...' 
                    : formData.trial_request 
                    ? '14일 무료 체험 시작하기' 
                    : '서비스 이용 시작하기'
                  }
                </Button>
                
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  marginTop: '1rem',
                  lineHeight: '1.5'
                }}>
                  {formData.trial_request 
                    ? '14일 무료 체험 후 자동으로 선택한 플랜이 시작됩니다.'
                    : '가입 즉시 선택한 플랜의 모든 기능을 이용할 수 있습니다.'
                  }
                </p>
              </div>
            </form>
          </Card>

          {/* 요금제 비교표 */}
          {showPricing && (
            <Card variant="elevated">
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                요금제 비교
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {serviceTiers.map((tier) => (
                  <div
                    key={tier.value}
                    style={{
                      padding: '1rem',
                      border: formData.preferred_tier === tier.value 
                        ? '2px solid #2563eb' 
                        : '1px solid var(--border-subtle)',
                      borderRadius: '0.5rem',
                      backgroundColor: formData.preferred_tier === tier.value 
                        ? '#eff6ff' 
                        : 'var(--bg-primary)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, preferred_tier: tier.value }))}
                  >
                    {tier.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-0.5rem',
                        right: '1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        인기
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: formData.preferred_tier === tier.value ? '#2563eb' : 'var(--text-primary)',
                        margin: 0
                      }}>
                        {tier.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: formData.preferred_tier === tier.value ? '#2563eb' : 'var(--text-primary)'
                        }}>
                          ₩{tier.price.toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-muted)'
                        }}>
                          /월
                        </span>
                      </div>
                    </div>
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem'
                    }}>
                      {tier.description}
                    </p>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.75rem'
                    }}>
                      <div>프로젝트: {tier.limits.projects === 999 ? '무제한' : tier.limits.projects + '개'}</div>
                      <div>평가자: {tier.limits.evaluators}명</div>
                      <div>기준: {tier.limits.criteria}개</div>
                      <div>대안: {tier.limits.alternatives}개</div>
                    </div>
                    
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {tier.features.slice(0, 3).map((feature, index) => (
                        <li key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '0.25rem'
                        }}>
                          <span style={{
                            color: '#10b981',
                            marginRight: '0.5rem'
                          }}>
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalServiceRegistrationPage;