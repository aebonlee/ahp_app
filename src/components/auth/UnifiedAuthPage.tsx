import React, { useState } from 'react';
import Input from '../common/Input';
import Card from '../common/Card';

interface UnifiedAuthPageProps {
  onLogin: (email: string, password: string, role?: string) => Promise<void>;
  onRegister: (email: string, password: string, role?: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const UnifiedAuthPage: React.FC<UnifiedAuthPageProps> = ({ 
  onLogin, 
  onRegister,
  loading = false, 
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // 기본적으로 로그인 모드
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (isRegistering && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      if (isRegistering) {
        await onRegister(email, password, 'user');
      } else {
        await onLogin(email, password, 'evaluator');
      }
    } catch (err) {
      console.error('Auth failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* 고급스러운 그라디언트 배경 */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--accent-primary), var(--accent-secondary))'
      }}></div>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top right, transparent, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.2))'
      }}></div>
      
      {/* 세련된 기하학적 패턴 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
          backgroundColor: isRegistering ? 'rgba(168, 85, 247, 0.2)' : 'rgba(var(--accent-rgb), 0.2)'
        }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{
          backgroundColor: isRegistering ? 'rgba(147, 51, 234, 0.15)' : 'rgba(var(--accent-rgb), 0.15)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{
          backgroundColor: isRegistering ? 'rgba(196, 181, 253, 0.1)' : 'rgba(var(--accent-rgb), 0.1)'
        }}></div>
      </div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* 개선된 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              AHP for Paper
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          
          <p className="text-base sm:text-lg font-semibold mt-4 mb-2" style={{
            color: '#374151'
          }}>
            전문가급 의사결정 지원 시스템
          </p>
          <p className="text-sm font-medium tracking-wide" style={{
            color: '#6b7280'
          }}>
            Analytic Hierarchy Process Decision Support System
          </p>
        </div>
        
        {/* 통합 인증 폼 */}
        <Card variant="glass" className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{
              color: '#1f2937'
            }}>
              {isRegistering ? '회원가입' : '서비스 로그인'}
            </h2>
            
            <p className="text-base font-normal" style={{
              color: '#4b5563'
            }}>
              {isRegistering 
                ? 'AHP 분석 서비스에 가입하여 전문적인 의사결정을 시작하세요'
                : 'AHP 의사결정 분석 서비스에 로그인하세요'
              }
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-2 border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder={isRegistering ? "6자리 이상 비밀번호" : "비밀번호를 입력하세요"}
              value={password}
              onChange={setPassword}
              error={validationErrors.password}
              required
              variant="bordered"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="relative group">
              <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity ${
                isRegistering 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-800'
              }`}></div>
              <button
                type="submit"
                disabled={loading}
                className={`relative w-full py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${
                  isRegistering
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegistering ? '가입 처리 중...' : '로그인 중...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        isRegistering 
                          ? "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          : "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      } />
                    </svg>
                    {isRegistering ? '계정 생성하기' : '서비스 로그인'}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* 전환 버튼 */}
          <div className="mt-6 text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-normal" style={{
              color: '#6b7280'
            }}>
              {isRegistering ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setValidationErrors({});
                  setEmail('');
                  setPassword('');
                }}
                className="font-semibold transition-all duration-200 hover:underline"
                style={{
                  color: isRegistering ? '#3b82f6' : '#8b5cf6'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = isRegistering ? '#1d4ed8' : '#7c3aed'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = isRegistering ? '#3b82f6' : '#8b5cf6'}
              >
                {isRegistering ? '서비스 로그인하기 →' : '회원가입하기 →'}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;