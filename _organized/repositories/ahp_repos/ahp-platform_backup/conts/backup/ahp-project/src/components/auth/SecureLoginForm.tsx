import React, { useState } from 'react';
import SecureInput from '../common/SecureInput';
import Button from '../common/Button';
import Card from '../common/Card';
import { CSRFProvider, SecureForm, useCSRF } from '../security/CSRFProvider';
import { RateLimiter } from '../security/RateLimiter';
import { isValidEmail } from '../../utils/security';

type LoginMode = 'selection' | 'service' | 'admin';

interface SecureLoginFormProps {
  onLogin: (email: string, password: string, role?: string, csrfToken?: string) => Promise<void>;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
}

const SecureLoginFormContent: React.FC<SecureLoginFormProps> = ({ 
  onLogin, 
  onRegister, 
  loading = false, 
  error 
}) => {
  const [mode, setMode] = useState<LoginMode>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [securityErrors, setSecurityErrors] = useState<string[]>([]);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const { token: csrfToken } = useCSRF();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0 && securityErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, csrfToken: string) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (securityErrors.length > 0) {
      alert('보안 오류가 있습니다. 입력을 확인해주세요.');
      return;
    }

    try {
      const role = mode === 'service' ? 'evaluator' : 'admin';
      await onLogin(email, password, role, csrfToken);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSecurityError = (errors: string[]) => {
    setSecurityErrors(errors);
  };

  const handleRateLimitExceeded = (resetTime: number) => {
    setRateLimitExceeded(true);
    const resetDate = new Date(resetTime);
    alert(`너무 많은 로그인 시도가 있었습니다. ${resetDate.toLocaleTimeString()} 이후에 다시 시도해주세요.`);
  };

  const getUserIdentifier = () => {
    return email || 'anonymous-user';
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--accent-primary), var(--accent-secondary))'
      }}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-cyan-200 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full blur-lg"></div>
          <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-indigo-200 rounded-full blur-md"></div>
        </div>

        <div className="max-w-4xl w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-black mb-4 drop-shadow-lg" style={{
                color: 'var(--text-inverse)'
              }}>
                AHP for Paper
              </h1>
              <p className="text-2xl font-semibold" style={{
                color: 'var(--text-inverse)'
              }}>
                보안 강화된 의사결정 지원 시스템
              </p>
              <p className="text-lg mt-2 font-medium" style={{
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Secure Analytic Hierarchy Process Decision Support System
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-white/30 hover:border-primary-300 transform hover:scale-105 cursor-pointer">
              <div 
                className="text-center p-8"
                onClick={() => setMode('service')}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-blocksy-xl flex items-center justify-center shadow-blocksy-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-4" style={{
                  color: 'var(--text-primary)'
                }}>서비스 이용</h3>
                <p className="mb-6 leading-relaxed font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>
                  AHP 평가를 수행하고 결과를 분석합니다. 
                  보안 강화된 로그인으로 안전한 평가 환경을 제공합니다.
                </p>
                <div className="flex items-center justify-center space-x-2" style={{
                  color: 'var(--accent-primary)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">보안 인증</span>
                </div>
              </div>
            </Card>

            <Card className="border-2 border-white/30 hover:border-secondary-300 transform hover:scale-105 cursor-pointer">
              <div 
                className="text-center p-8"
                onClick={() => setMode('admin')}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-blocksy-xl flex items-center justify-center shadow-blocksy-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-4" style={{
                  color: 'var(--text-primary)'
                }}>관리자 패널</h3>
                <p className="mb-6 leading-relaxed font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>
                  프로젝트 관리, 사용자 관리, 시스템 설정을 수행합니다.
                  고급 보안 인증이 필요합니다.
                </p>
                <div className="flex items-center justify-center space-x-2" style={{
                  color: 'var(--accent-secondary)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">관리자 권한</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm" style={{
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              🔒 모든 데이터는 암호화되어 안전하게 보호됩니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RateLimiter
      identifier={getUserIdentifier()}
      maxRequests={10}
      windowMs={15 * 60 * 1000}
      onRateLimitExceeded={handleRateLimitExceeded}
    >
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
        background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--accent-primary), var(--accent-secondary))'
      }}>
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              {mode === 'service' ? '서비스 로그인' : '관리자 로그인'}
            </h2>
            <p style={{
              color: 'var(--text-secondary)'
            }}>
              {mode === 'service' ? '평가를 시작하려면 로그인하세요' : '관리 권한이 필요합니다'}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm" style={{
              color: 'var(--accent-primary)'
            }}>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              보안 강화 로그인
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-blocksy text-red-700 text-sm">
              {error}
            </div>
          )}

          {rateLimitExceeded && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-blocksy text-yellow-700 text-sm">
              보안상 로그인 시도가 제한되었습니다.
            </div>
          )}

          <SecureForm onSubmit={handleSubmit}>
            <div className="space-y-4">
              <SecureInput
                id="email"
                label="이메일"
                type="email"
                value={email}
                onChange={setEmail}
                onSecurityError={handleSecurityError}
                placeholder="example@domain.com"
                required
                maxLength={254}
                autoSanitize={true}
                error={validationErrors.email}
              />

              <SecureInput
                id="password"
                label="비밀번호"
                type="password"
                value={password}
                onChange={setPassword}
                onSecurityError={handleSecurityError}
                placeholder="비밀번호를 입력하세요"
                required
                minLength={6}
                maxLength={128}
                autoSanitize={true}
                showPasswordStrength={mode === 'service'}
                error={validationErrors.password}
              />
            </div>

            {securityErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-blocksy">
                <h4 className="text-red-800 font-medium mb-2">보안 경고</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {securityErrors.map((error, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading || securityErrors.length > 0}
                className="w-full"
              >
                {loading ? '인증 중...' : '보안 로그인'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('selection')}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-hover)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                >
                  ← 돌아가기
                </button>
              </div>
            </div>
          </SecureForm>

          {onRegister && mode === 'service' && (
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm mb-2" style={{
                color: 'var(--text-secondary)'
              }}>계정이 없으신가요?</p>
              <button
                onClick={onRegister}
                className="font-semibold text-sm transition-colors duration-200"
                style={{ color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
              >
                회원가입
              </button>
            </div>
          )}

          {csrfToken && (
            <div className="mt-4 text-center">
              <p className="text-xs" style={{
                color: 'var(--text-muted)'
              }}>
                🔐 CSRF 보호 활성화 | 세션 토큰: {csrfToken.substring(0, 8)}...
              </p>
            </div>
          )}
        </Card>
      </div>
    </RateLimiter>
  );
};

const SecureLoginForm: React.FC<SecureLoginFormProps> = (props) => {
  return (
    <CSRFProvider>
      <SecureLoginFormContent {...props} />
    </CSRFProvider>
  );
};

export default SecureLoginForm;