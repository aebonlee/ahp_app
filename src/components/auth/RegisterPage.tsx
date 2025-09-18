import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import apiService from '../../services/apiService';

interface RegisterPageProps {
  onRegister: (userData: any) => void;
  onBackToSelection: () => void;
  onSwitchToLogin: () => void;
  loading?: boolean;
  error?: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ 
  onRegister, 
  onBackToSelection,
  onSwitchToLogin,
  loading = false, 
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const isFormLoading = loading || localLoading;

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

    if (!email) {
      errors.email = '이메일은 필수입니다';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 주소를 입력하세요';
    }

    if (!password) {
      errors.password = '비밀번호는 필수입니다';
    } else if (password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    if (!confirmPassword) {
      errors.confirmPassword = '비밀번호 확인은 필수입니다';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!fullName) {
      errors.fullName = '이름은 필수입니다';
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
      
      console.log('🔐 Django 회원가입 시도:', { email, fullName });

      // Django 백엔드를 통한 회원가입
      if (password !== confirmPassword) {
        setLocalError('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      const response = await apiService.authAPI.register({
        username: email,
        email: email,
        password: password,
        first_name: fullName.split(' ')[0] || fullName,
        last_name: fullName.split(' ').slice(1).join(' ') || ''
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 회원가입 성공 시 사용자 데이터 처리
      const data = response.data || {};
      const userData = {
        id: (data as any)?.id || 1,
        username: email,
        email: email,
        first_name: fullName.split(' ')[0] || fullName,
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        is_superuser: false,
        is_staff: false,
        role: 'evaluator'
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

  const displayError = error || localError;

  // 서비스 상태 확인 중 화면
  if (serviceStatus === 'checking') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="card auth-card">
            <div className="loading-state">
              <div className="spinner" />
              <h2>서비스 연결 확인 중...</h2>
              <p>Django 백엔드 서비스에 연결하고 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 서비스 사용 불가 화면
  if (serviceStatus === 'unavailable') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="card auth-card">
            <div className="alert alert-error text-center">
              <div className="error-icon">⚠️</div>
              <h2>서비스에 연결할 수 없습니다</h2>
              <p>Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.</p>
              <button
                onClick={checkServiceStatus}
                className="btn btn-danger"
              >
                다시 연결 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* 헤더 */}
        <div className="auth-header">
          <button
            onClick={onBackToSelection}
            className="btn btn-ghost back-button"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로 돌아가기
          </button>
          
          <h2 className="auth-title">AHP Platform - 회원가입</h2>
          
          <p className="auth-subtitle">
            Django 백엔드 연동 - AHP 분석 서비스에 가입하여 전문적인 의사결정을 시작하세요
          </p>
          
          <div className="status-indicator">
            <div className="status-dot"></div>
            Django 서비스 연결됨
          </div>
        </div>
        
        {/* 회원가입 폼 */}
        <div className="card auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {displayError && (
              <div className="alert alert-error">
                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{displayError}</p>
              </div>
            )}

            <Input
              id="fullName"
              type="text"
              label="이름"
              placeholder="실명을 입력하세요"
              value={fullName}
              onChange={setFullName}
              error={validationErrors.fullName}
              required
              variant="bordered"
            />

            <Input
              id="email"
              type="email"
              label="이메일 주소"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={setEmail}
              error={validationErrors.email}
              required
              variant="bordered"
            />

            <Input
              id="organization"
              type="text"
              label="소속 기관 (선택사항)"
              placeholder="소속 기관을 입력하세요"
              value={organization}
              onChange={setOrganization}
              variant="bordered"
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder="6자리 이상 비밀번호"
              value={password}
              onChange={setPassword}
              error={validationErrors.password}
              required
              variant="bordered"
            />

            <Input
              id="confirmPassword"
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={validationErrors.confirmPassword}
              required
              variant="bordered"
            />

            <div className="form-actions">
              <button
                type="submit"
                disabled={isFormLoading}
                className="btn btn-primary btn-large"
              >
                {isFormLoading ? (
                  <span className="loading-text">
                    <div className="spinner-small" />
                    Django 가입 처리 중...
                  </span>
                ) : (
                  <span>
                    Django 계정 생성하기
                  </span>
                )}
              </button>

              <div className="form-footer">
                <p>이미 계정이 있으신가요?</p>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="btn btn-link"
                >
                  서비스 로그인하기
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;