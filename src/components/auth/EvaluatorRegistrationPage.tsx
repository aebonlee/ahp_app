import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { EvaluatorRegistrationData, InvitationMethod } from '../../types/userTypes';

interface EvaluatorRegistrationPageProps {
  onRegister: (data: EvaluatorRegistrationData & {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  onBackToSelection: () => void;
  loading?: boolean;
  error?: string;
  // URL 파라미터로 전달될 수 있는 초대 정보
  invitationCode?: string;
  accessKey?: string;
  projectId?: string;
}

const EvaluatorRegistrationPage: React.FC<EvaluatorRegistrationPageProps> = ({
  onRegister,
  onBackToSelection,
  loading = false,
  error,
  invitationCode,
  accessKey,
  projectId
}) => {
  const [formData, setFormData] = useState({
    // 기본 정보
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    
    // 초대 정보
    invitation_code: invitationCode || '',
    access_key: accessKey || '',
    project_id: projectId || '',
    
    // 프로필 정보
    display_name: '',
    organization: '',
    department: '',
    expertise_areas: [] as string[],
    bio: '',
    
    // 연락 선호도
    email_notifications: true,
    sms_notifications: false,
    reminder_frequency: 'weekly' as 'never' | 'daily' | 'weekly' | 'before_deadline',
    language_preference: 'ko' as 'ko' | 'en',
    
    // 약관 동의
    agree_terms: false,
    agree_privacy: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [invitationInfo, setInvitationInfo] = useState<{
    projectTitle?: string;
    invitedBy?: string;
    deadline?: string;
    isValid?: boolean;
  }>({});
  const [newExpertiseArea, setNewExpertiseArea] = useState('');

  const expertiseOptions = [
    '경영 전략', '마케팅', '인사관리', '재무관리', '운영관리',
    '정보기술', '연구개발', '품질관리', '위험관리', '프로젝트관리',
    '의료', '교육', '공공정책', '환경', '에너지',
    '제조업', '서비스업', '금융업', '건설업', '유통업'
  ];

  // 초대 정보 검증 및 로드
  useEffect(() => {
    const validateInvitation = async () => {
      if (formData.invitation_code || formData.access_key || formData.project_id) {
        try {
          // 실제로는 API 호출로 초대 정보를 확인
          // 여기서는 데모 데이터 사용
          setInvitationInfo({
            projectTitle: 'IT 시스템 선택을 위한 AHP 분석',
            invitedBy: '김관리자 (ABC 컨설팅)',
            deadline: '2025-01-20',
            isValid: true
          });
        } catch (err) {
          setInvitationInfo({
            isValid: false
          });
          setValidationErrors(prev => ({
            ...prev,
            invitation_code: '유효하지 않은 초대 정보입니다.'
          }));
        }
      }
    };

    validateInvitation();
  }, [formData.invitation_code, formData.access_key, formData.project_id]);

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
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.';
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

    // 초대 정보 검증 (하나라도 있어야 함)
    if (!formData.invitation_code && !formData.access_key && !formData.project_id) {
      errors.invitation_code = '초대 코드, 접근 키, 또는 프로젝트 ID 중 하나를 입력해주세요.';
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
        invitation_code: formData.invitation_code || undefined,
        access_key: formData.access_key || undefined,
        project_id: formData.project_id || undefined,
        invited_by: invitationInfo.invitedBy,
        profile_info: {
          display_name: formData.display_name || undefined,
          organization: formData.organization || undefined,
          department: formData.department || undefined,
          expertise_areas: formData.expertise_areas.length > 0 ? formData.expertise_areas : undefined,
          bio: formData.bio || undefined,
          contact_preferences: {
            email_notifications: formData.email_notifications,
            sms_notifications: formData.sms_notifications,
            reminder_frequency: formData.reminder_frequency,
            language_preference: formData.language_preference
          }
        }
      });
    } catch (err) {
      console.error('Evaluator registration failed:', err);
    }
  };

  const handleAddExpertiseArea = () => {
    if (newExpertiseArea.trim() && !formData.expertise_areas.includes(newExpertiseArea)) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, newExpertiseArea.trim()]
      }));
      setNewExpertiseArea('');
    }
  };

  const handleRemoveExpertiseArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter(a => a !== area)
    }));
  };

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
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, #ecfdf5 50%, var(--bg-elevated) 100%)'
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
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
      </div>

      <div style={{ 
        maxWidth: '48rem',
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
            color: '#059669',
            marginBottom: '0.5rem'
          }}>
            📝 평가자 가입
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '32rem',
            margin: '0 auto'
          }}>
            초대받은 AHP 프로젝트에 참여하여 의사결정 평가를 수행합니다.
          </p>
        </div>

        <Card variant="elevated" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <form onSubmit={handleSubmit}>
            {/* 초대 정보 섹션 */}
            {invitationInfo.isValid && (
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #059669',
                borderRadius: '0.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>📋</span>
                  프로젝트 초대 정보
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>프로젝트:</strong>
                    <br />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {invitationInfo.projectTitle}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>초대자:</strong>
                    <br />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {invitationInfo.invitedBy}
                    </span>
                  </div>
                  {invitationInfo.deadline && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>평가 마감일:</strong>
                      <br />
                      <span style={{ color: '#dc2626' }}>
                        {invitationInfo.deadline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 초대 정보 입력 */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #059669'
              }}>
                초대 정보
              </h3>
              
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                프로젝트 관리자로부터 받은 초대 코드, 접근 키, 또는 프로젝트 ID를 입력해주세요.
              </p>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <Input
                  id="invitation_code"
                  label="초대 코드"
                  type="text"
                  placeholder="예: INVITE-ABC123"
                  value={formData.invitation_code}
                  onChange={(value) => setFormData(prev => ({ ...prev, invitation_code: value }))}
                  error={validationErrors.invitation_code}
                />
                
                <Input
                  id="access_key"
                  label="접근 키"
                  type="text"
                  placeholder="예: AK-XYZ789"
                  value={formData.access_key}
                  onChange={(value) => setFormData(prev => ({ ...prev, access_key: value }))}
                />
                
                <Input
                  id="project_id"
                  label="프로젝트 ID"
                  type="text"
                  placeholder="예: proj_456"
                  value={formData.project_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                />
              </div>
            </div>

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
                  placeholder="evaluator123"
                  value={formData.username}
                  onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
                  error={validationErrors.username}
                  required
                />
                
                <Input
                  id="email"
                  label="이메일"
                  type="email"
                  placeholder="evaluator@email.com"
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
            </div>

            {/* 프로필 정보 섹션 */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                프로필 정보 (선택)
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <Input
                  id="display_name"
                  label="표시 이름"
                  type="text"
                  placeholder="홍길동 (선택적으로 다른 이름 사용)"
                  value={formData.display_name}
                  onChange={(value) => setFormData(prev => ({ ...prev, display_name: value }))}
                />
                
                <Input
                  id="organization"
                  label="소속 기관"
                  type="text"
                  placeholder="ABC 대학교, XYZ 회사"
                  value={formData.organization}
                  onChange={(value) => setFormData(prev => ({ ...prev, organization: value }))}
                />
                
                <Input
                  id="department"
                  label="부서/학과"
                  type="text"
                  placeholder="경영학과, 기획팀"
                  value={formData.department}
                  onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                />
              </div>
              
              {/* 전문 분야 */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  전문 분야
                </label>
                
                <div style={{ 
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="전문 분야 입력"
                    value={newExpertiseArea}
                    onChange={(e) => setNewExpertiseArea(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExpertiseArea();
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddExpertiseArea}
                    disabled={!newExpertiseArea.trim()}
                  >
                    추가
                  </Button>
                </div>
                
                {/* 선택된 전문 분야 */}
                {formData.expertise_areas.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {formData.expertise_areas.map((area, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #059669',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          color: '#059669'
                        }}
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertiseArea(area)}
                          style={{
                            marginLeft: '0.25rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#059669',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 추천 전문 분야 */}
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem'
                }}>
                  추천 분야:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.25rem'
                }}>
                  {expertiseOptions.slice(0, 8).map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        if (!formData.expertise_areas.includes(area)) {
                          setFormData(prev => ({
                            ...prev,
                            expertise_areas: [...prev.expertise_areas, area]
                          }));
                        }
                      }}
                      disabled={formData.expertise_areas.includes(area)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: formData.expertise_areas.includes(area) 
                          ? 'var(--bg-muted)' 
                          : 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: formData.expertise_areas.includes(area) 
                          ? 'var(--text-muted)' 
                          : 'var(--text-secondary)',
                        cursor: formData.expertise_areas.includes(area) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              
              <Input
                id="bio"
                label="간단한 소개"
                type="textarea"
                placeholder="본인의 경험이나 관심 분야에 대해 간단히 소개해주세요."
                value={formData.bio}
                onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
                rows={3}
              />
            </div>

            {/* 알림 설정 */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                알림 설정
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '0.5rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.email_notifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>이메일 알림 받기</span>
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.sms_notifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>SMS 알림 받기</span>
                  </label>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    알림 빈도
                  </label>
                  <select
                    value={formData.reminder_frequency}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      reminder_frequency: e.target.value as typeof formData.reminder_frequency 
                    }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="never">알림 받지 않음</option>
                    <option value="daily">매일</option>
                    <option value="weekly">주간</option>
                    <option value="before_deadline">마감일 전에만</option>
                  </select>
                </div>
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
                  maxWidth: '20rem',
                  backgroundColor: '#059669',
                  borderColor: '#059669'
                }}
              >
                {loading ? '가입 중...' : '평가자로 가입하기'}
              </Button>
              
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                lineHeight: '1.5'
              }}>
                가입 후 즉시 할당된 프로젝트의 평가를 시작할 수 있습니다.<br />
                평가 진행 상황은 이메일로 안내됩니다.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EvaluatorRegistrationPage;