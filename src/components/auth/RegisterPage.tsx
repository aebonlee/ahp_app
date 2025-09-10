import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Card from '../common/Card';
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
      // 클라이언트 측에서 비밀번호 확인
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스 연결 확인 중...
            </h2>
            <p className="text-gray-600 text-sm">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary, #f8fafc)'
    }}>
      {/* 보라색 테마 그라디언트 배경 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'linear-gradient(to bottom right, var(--bg-elevated, #ffffff), #8b5cf6, #7c3aed)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'linear-gradient(to top right, transparent, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.2))'
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
          borderRadius: '9999px',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          borderRadius: '9999px',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(147, 51, 234, 0.15)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '1000ms'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24rem',
          height: '24rem',
          borderRadius: '9999px',
          filter: 'blur(48px)',
          backgroundColor: 'rgba(196, 181, 253, 0.1)'
        }}></div>
      </div>

      <div style={{
        maxWidth: '36rem',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        padding: '0 1rem'
      }}>
        {/* 개선된 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={onBackToSelection}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '1rem',
              border: '0',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              color: '#374151',
              backgroundColor: 'transparent',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{
              width: '1.25rem',
              height: '1.25rem',
              marginRight: '0.5rem'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로 돌아가기
          </button>
          
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            color: '#1f2937'
          }}>
            AHP Platform - 회원가입
          </h2>
          
          <p style={{
            marginTop: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'normal',
            color: '#4b5563'
          }}>
            Django 백엔드 연동 - AHP 분석 서비스에 가입하여 전문적인 의사결정을 시작하세요
            <br /><div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              marginTop: '0.5rem'
            }}>
              <span style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                marginRight: '0.25rem'
              }}></span>
              Django 서비스 연결됨
            </div>
          </p>
        </div>
        
        {/* 회원가입 폼 */}
        <Card variant="glass" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '2px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <form style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }} onSubmit={handleSubmit}>
            {displayError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
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
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>{displayError}</p>
                </div>
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
              icon={
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
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
              icon={
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              id="organization"
              type="text"
              label="소속 기관 (선택사항)"
              placeholder="소속 기관을 입력하세요"
              value={organization}
              onChange={setOrganization}
              variant="bordered"
              icon={
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
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
              icon={
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
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
              icon={
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  bottom: '-1px',
                  left: '-1px',
                  background: 'linear-gradient(to right, #7c3aed, #5b21b6)',
                  borderRadius: '1rem',
                  filter: 'blur(4px)',
                  opacity: '0.25',
                  transition: 'opacity 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.25';
                }}></div>
                <button
                  type="submit"
                  disabled={isFormLoading}
                  style={{
                    position: 'relative',
                    width: '100%',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: isFormLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    transform: 'scale(1)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    opacity: isFormLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isFormLoading) {
                      e.currentTarget.style.background = 'linear-gradient(to right, #6d28d9, #5b21b6)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFormLoading) {
                      e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
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
                        <circle style={{
                          opacity: 0.25
                        }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{
                          opacity: 0.75
                        }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Django 가입 처리 중...
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Django 계정 생성하기
                    </span>
                  )}
                </button>
              </div>

              <div style={{
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: '#6b7280'
                }}>이미 계정이 있으신가요?</p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    style={{
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: '#3b82f6',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#1d4ed8'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6'}
                  >
                    서비스 로그인하기
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `
      }} />
    </div>
  );
};

export default RegisterPage;