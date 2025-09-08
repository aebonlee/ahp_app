import React, { useState } from 'react';
import Input from '../common/Input';
import Card from '../common/Card';
import useDjangoAuth from '../../hooks/useDjangoAuth';

interface ServiceLoginPageProps {
  onLogin: (email: string, password: string, role?: string) => Promise<void>;
  onBackToSelection: () => void;
  onSwitchToRegister: () => void;
  loading?: boolean;
  error?: string;
}

const ServiceLoginPage: React.FC<ServiceLoginPageProps> = ({ 
  onLogin, 
  onBackToSelection,
  onSwitchToRegister,
  loading = false, 
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useDjangoAuth();
  
  const isFormLoading = loading || isLoading;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      // Django 인증 시스템 사용
      const result = await login(email, password);
      if (result.success) {
        // 성공적으로 로그인되면 기존 onLogin 호출하여 앱 상태 업데이트
        await onLogin(email, password, 'evaluator');
      } else {
        console.error('Django login failed:', result.message);
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary, #f9fafb)'
    }}>
      {/* 고급스러운 그라디언트 배경 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'linear-gradient(to bottom right, var(--bg-elevated, #ffffff), var(--accent-primary, #C8A968), var(--accent-secondary, #B8956A))'
      }}></div>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'linear-gradient(to top right, transparent, rgba(var(--accent-rgb, 200, 169, 104), 0.1), rgba(var(--accent-rgb, 200, 169, 104), 0.2))'
      }}></div>
      
      {/* 세련된 기하학적 패턴 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '5rem',
          width: '24rem',
          height: '24rem',
          borderRadius: '50%',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(var(--accent-rgb, 200, 169, 104), 0.2)',
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(var(--accent-rgb, 200, 169, 104), 0.15)',
          animation: 'pulse 2s infinite 1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24rem',
          height: '24rem',
          borderRadius: '50%',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(var(--accent-rgb, 200, 169, 104), 0.1)'
        }}></div>
      </div>

      <div style={{
        maxWidth: '36rem',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* 개선된 헤더 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onBackToSelection}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              border: 'none',
              backgroundColor: 'transparent',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              color: '#374151',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로 돌아가기
          </button>
          
          <h2 style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            color: '#1f2937'
          }}>
            서비스 로그인
          </h2>
          
          <p style={{
            marginTop: '0.5rem',
            fontSize: '1rem',
            lineHeight: '1.5rem',
            fontWeight: '400',
            color: '#4b5563'
          }}>
            AHP 의사결정 분석 서비스에 로그인하세요
            <br />
            <span style={{ 
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              color: '#6b7280' 
            }}>관리자 권한은 이메일 기반으로 자동 인식됩니다</span>
          </p>
        </div>
        
        {/* 개선된 로그인 폼 */}
        <Card variant="glass" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '2px solid #e5e7eb',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <form style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }} onSubmit={handleSubmit}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <svg style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#f87171',
                    marginRight: '0.5rem'
                  }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>{error}</p>
                </div>
              </div>
            )}

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
              icon={
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={setPassword}
              error={validationErrors.password}
              required
              variant="bordered"
              icon={
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-1px',
                right: '-1px',
                bottom: '-1px',
                left: '-1px',
                background: 'linear-gradient(to right, #2563eb, #1e40af)',
                borderRadius: '1rem',
                filter: 'blur(4px)',
                opacity: 0.25,
                transition: 'opacity 0.3s'
              }}></div>
              <button
                type="submit"
                disabled={isFormLoading}
                style={{
                  position: 'relative',
                  width: '100%',
                  padding: '1rem 2rem',
                  background: isFormLoading ? '#9ca3af' : 'linear-gradient(to right, #2563eb, #1d4ed8)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  transition: 'all 0.3s',
                  cursor: isFormLoading ? 'not-allowed' : 'pointer',
                  opacity: isFormLoading ? 0.6 : 1,
                  transform: isFormLoading ? 'none' : 'scale(1)',
                  boxShadow: isFormLoading ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                onMouseEnter={(e) => {
                  if (!isFormLoading) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) {
                      prevElement.style.opacity = '0.4';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFormLoading) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) {
                      prevElement.style.opacity = '0.25';
                    }
                  }
                }}
              >
                {isFormLoading ? (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{
                      animation: 'spin 1s linear infinite',
                      marginLeft: '-0.25rem',
                      marginRight: '0.75rem',
                      height: '1.25rem',
                      width: '1.25rem'
                    }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      marginRight: '0.5rem'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    서비스 로그인
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* 개선된 회원가입 링크 */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
              fontWeight: '400',
              color: '#6b7280'
            }}>
              계정이 없으신가요?{' '}
              <button
                onClick={onSwitchToRegister}
                style={{
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  color: '#3b82f6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#1d4ed8';
                  (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6';
                  (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none';
                }}
              >
                회원가입하기 →
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceLoginPage;