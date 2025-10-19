import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import apiService from '../../services/apiService';

interface RegisterFormProps {
  onRegister: (userData: any) => void;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string;
  mode: 'service' | 'admin';
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onBackToLogin, 
  loading = false, 
  error,
  mode 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Django 백엔드 서비스 상태 확인
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await apiService.authAPI.status();
      if (response.success !== false) {
        setServiceStatus('available');
        console.log('✅ Django 백엔드 연결 성공');
      } else {
        setServiceStatus('unavailable');
      }
    } catch (error) {
      console.log('⚠️ Django 백엔드 연결 실패:', error);
      setServiceStatus('unavailable');
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = '이름을 입력해주세요';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = '성을 입력해주세요';
    }

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (serviceStatus !== 'available') {
      setLocalError('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError('');
      
      console.log('🔐 Django 회원가입 시도:', { email: formData.email, mode });

      const role = mode === 'service' ? 'evaluator' : 'admin';
      
      // Django 백엔드를 통한 회원가입
      const response = await apiService.authAPI.register({
        username: formData.email,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 회원가입 성공 시 사용자 데이터 처리
      const data = response.data || {};
      const userData = {
        id: (data as any)?.id || 1,
        username: formData.email,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_superuser: formData.email === 'aebon',
        is_staff: role === 'admin' || formData.email === 'aebon',
        role: formData.email === 'aebon' ? 'super_admin' : role
      };
      
      console.log('✅ Django 회원가입 성공:', userData);
      onRegister(userData);
      
    } catch (err: any) {
      console.error('❌ Django 회원가입 실패:', err);
      setLocalError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const displayError = error || localError;
  const displayLoading = loading || localLoading;

  // 서비스 상태 확인 중 화면
  if (serviceStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{
              borderColor: 'var(--accent-primary)'
            }}></div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스 연결 확인 중...
            </h2>
            <p className="text-sm" style={{
              color: 'var(--text-secondary)'
            }}>
              Django 백엔드 서비스에 연결하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 서비스 사용 불가 화면
  if (serviceStatus === 'unavailable') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4" style={{
              color: 'var(--semantic-danger)'
            }}>⚠️</div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-sm mb-4" style={{
              color: 'var(--text-secondary)'
            }}>
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--semantic-danger)',
                borderColor: 'var(--semantic-danger)'
              }}
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
      background: 'var(--gradient-accent-subtle)'
    }}>
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="btn btn-ghost inline-flex items-center mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            로그인으로 돌아가기
          </button>
          
          <h2 className="text-3xl font-bold" style={{
            color: 'var(--text-primary)'
          }}>
            {mode === 'service' ? (
              <>
                <span style={{ color: 'var(--accent-primary)' }}>AHP Platform - 서비스</span> 회원가입
              </>
            ) : (
              <>
                <span style={{ color: 'var(--accent-secondary)' }}>AHP Platform - 관리자</span> 회원가입
              </>
            )}
          </h2>
          
          <p className="mt-2 text-sm" style={{
            color: 'var(--text-secondary)'
          }}>
            {mode === 'service' 
              ? 'Django 백엔드 연동 - AHP 의사결정 분석 서비스에 가입하세요'
              : 'Django 백엔드 연동 - 시스템 관리자 계정을 생성하세요'
            }
          </p>
          <div className="mt-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success-text)'
            }}>
              <div className="w-2 h-2 rounded-full mr-1" style={{
                backgroundColor: 'var(--semantic-success)'
              }}></div>
              Django 서비스 연결됨
            </div>
          </div>
        </div>
        
        {/* 회원가입 폼 */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {displayError && (
              <div className="p-4 rounded" style={{
                backgroundColor: 'var(--status-danger-bg)',
                borderColor: 'var(--status-danger-border)',
                border: '1px solid'
              }}>
                <p className="text-sm" style={{
                  color: 'var(--status-danger-text)'
                }}>{displayError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                type="text"
                label="이름"
                placeholder="이름"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                error={validationErrors.firstName}
                required
              />

              <Input
                id="lastName"
                type="text"
                label="성"
                placeholder="성"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                error={validationErrors.lastName}
                required
              />
            </div>

            <Input
              id="email"
              type="email"
              label="이메일 주소"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={validationErrors.email}
              required
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={validationErrors.password}
              required
            />

            <Input
              id="confirmPassword"
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              error={validationErrors.confirmPassword}
              required
            />

            <button
              type="submit"
              disabled={displayLoading}
              className="btn btn-primary w-full"
              style={{
                backgroundColor: mode === 'service' 
                  ? 'var(--accent-primary)'
                  : 'var(--accent-secondary)'
              }}
            >
              {displayLoading ? 'Django 계정 생성 중...' : '회원가입'}
            </button>
          </form>

          {/* 서비스 안내 */}
          <div className="mt-6 p-4 rounded-lg" style={{
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <h4 className="text-sm font-medium mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              {mode === 'service' ? '서비스 혜택' : '관리자 권한'}
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {mode === 'service' ? (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <div className="flex items-center mb-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="font-medium">Django + PostgreSQL 기반 - 회원 가입 후 무료 체험은 1일간 1개 프로젝트에 3명의 평가자를 초대하여 이용해 보고 전문 분석 리포트까지 확인할 수 있습니다.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    PostgreSQL 기반 사용자 및 권한 관리
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    구독 서비스 운영
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    시스템 모니터링
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;