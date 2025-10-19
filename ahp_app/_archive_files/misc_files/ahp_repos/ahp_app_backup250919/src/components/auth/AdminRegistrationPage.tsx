import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { AdminRegistrationData, AdminRole } from '../../types/userTypes';

interface AdminRegistrationPageProps {
  onRegister: (data: AdminRegistrationData & {
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

const AdminRegistrationPage: React.FC<AdminRegistrationPageProps> = ({
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
    
    // 관리자 정보
    requested_role: 'system_admin' as AdminRole,
    organization: '',
    purpose: '',
    reference_contact: '',
    special_permissions_requested: [] as string[]
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const adminRoles = [
    {
      value: 'system_admin' as AdminRole,
      title: '시스템 관리자',
      description: '사용자 관리 및 시스템 운영',
      permissions: ['사용자 관리', '프로젝트 관리', '시스템 설정']
    },
    {
      value: 'content_admin' as AdminRole,
      title: '콘텐츠 관리자',
      description: '콘텐츠 및 평가자 관리',
      permissions: ['콘텐츠 관리', '평가자 관리', '결과 분석']
    }
  ];

  const specialPermissions = [
    'USER_MANAGEMENT_ADVANCED',
    'PROJECT_OVERRIDE',
    'DATA_EXPORT_FULL',
    'AUDIT_LOGS_READ',
    'SYSTEM_SETTINGS_MODIFY',
    'SUBSCRIPTION_VIEW',
    'ANALYTICS_ADVANCED'
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 기본 검증
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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '비밀번호는 대소문자와 숫자를 포함해야 합니다.';
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

    // 관리자 정보 검증
    if (!formData.organization.trim()) {
      errors.organization = '소속 기관을 입력해주세요.';
    }

    if (!formData.purpose.trim()) {
      errors.purpose = '관리자 신청 목적을 입력해주세요.';
    } else if (formData.purpose.length < 50) {
      errors.purpose = '관리자 신청 목적을 50자 이상 상세히 입력해주세요.';
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
        requested_role: formData.requested_role,
        organization: formData.organization,
        purpose: formData.purpose,
        reference_contact: formData.reference_contact || undefined,
        special_permissions_requested: formData.special_permissions_requested
      });
    } catch (err) {
      console.error('Admin registration failed:', err);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      special_permissions_requested: prev.special_permissions_requested.includes(permission)
        ? prev.special_permissions_requested.filter(p => p !== permission)
        : [...prev.special_permissions_requested, permission]
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
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--accent-light) 50%, var(--bg-elevated) 100%)'
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
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
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
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            🛡️ 관리자 계정 신청
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            maxWidth: '32rem',
            margin: '0 auto'
          }}>
            AHP 시스템 관리자 계정을 신청합니다. 승인 후 시스템 관리 권한이 부여됩니다.
          </p>
        </div>

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
                  placeholder="admin_username"
                  value={formData.username}
                  onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
                  error={validationErrors.username}
                  required
                />
                
                <Input
                  id="email"
                  label="이메일"
                  type="email"
                  placeholder="admin@organization.com"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  error={validationErrors.email}
                  required
                />
                
                <Input
                  id="first_name"
                  label="이름"
                  type="text"
                  placeholder="홍길동"
                  value={formData.first_name}
                  onChange={(value) => setFormData(prev => ({ ...prev, first_name: value }))}
                  error={validationErrors.first_name}
                  required
                />
                
                <Input
                  id="last_name"
                  label="성"
                  type="text"
                  placeholder="김"
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
              
              {showPasswordRequirements && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--status-info-bg)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--status-info-text)'
                }}>
                  <strong>비밀번호 요구사항:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    <li>8자 이상</li>
                    <li>대문자와 소문자 포함</li>
                    <li>숫자 포함</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 관리자 정보 섹션 */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #dc2626'
              }}>
                관리자 정보
              </h3>
              
              {/* 관리자 역할 선택 */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem'
                }}>
                  신청할 관리자 역할 *
                </label>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {adminRoles.map((role) => (
                    <div
                      key={role.value}
                      style={{
                        padding: '1rem',
                        border: formData.requested_role === role.value 
                          ? '2px solid #dc2626' 
                          : '1px solid var(--border-subtle)',
                        borderRadius: '0.5rem',
                        backgroundColor: formData.requested_role === role.value 
                          ? '#fef2f2' 
                          : 'var(--bg-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, requested_role: role.value }))}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <input
                          type="radio"
                          checked={formData.requested_role === role.value}
                          onChange={() => setFormData(prev => ({ ...prev, requested_role: role.value }))}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <strong style={{ color: '#dc2626' }}>{role.title}</strong>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: '0 0 0.5rem 0'
                      }}>
                        {role.description}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        권한: {role.permissions.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                <Input
                  id="organization"
                  label="소속 기관/회사"
                  type="text"
                  placeholder="예: ABC 대학교, XYZ 컨설팅"
                  value={formData.organization}
                  onChange={(value) => setFormData(prev => ({ ...prev, organization: value }))}
                  error={validationErrors.organization}
                  required
                />
                
                <Input
                  id="reference_contact"
                  label="추천인 연락처 (선택)"
                  type="text"
                  placeholder="추천인 이메일 또는 전화번호"
                  value={formData.reference_contact}
                  onChange={(value) => setFormData(prev => ({ ...prev, reference_contact: value }))}
                />
              </div>
              
              <Input
                id="purpose"
                label="관리자 신청 목적"
                type="textarea"
                placeholder="관리자 권한이 필요한 이유와 사용 목적을 상세히 설명해주세요. (50자 이상)"
                value={formData.purpose}
                onChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                error={validationErrors.purpose}
                rows={4}
                required
              />
            </div>

            {/* 특별 권한 요청 섹션 */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                추가 권한 요청 (선택)
              </h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.5rem'
              }}>
                {specialPermissions.map((permission) => (
                  <label
                    key={permission}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      backgroundColor: formData.special_permissions_requested.includes(permission)
                        ? 'var(--accent-light)'
                        : 'var(--bg-primary)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.special_permissions_requested.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      style={{ marginRight: '0.75rem' }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      {permission.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </label>
                ))}
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
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626'
                }}
              >
                {loading ? '신청 중...' : '관리자 계정 신청하기'}
              </Button>
              
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                lineHeight: '1.5'
              }}>
                관리자 계정은 승인 후 사용 가능합니다.<br />
                승인 결과는 등록된 이메일로 안내됩니다.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;