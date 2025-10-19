import React, { useState } from 'react';
import Input from '../common/Input';
import Card from '../common/Card';

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
      // 서비스 로그인 시 역할을 'evaluator'로 설정
      // 실제 역할(admin/user)은 백엔드에서 이메일 기반으로 결정
      const role = 'evaluator';
      await onLogin(email, password, role);
    } catch (err) {
      console.error('Login failed:', err);
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
          backgroundColor: 'rgba(var(--accent-rgb), 0.2)'
        }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{
          backgroundColor: 'rgba(var(--accent-rgb), 0.15)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{
          backgroundColor: 'rgba(var(--accent-rgb), 0.1)'
        }}></div>
      </div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* 개선된 헤더 */}
        <div className="text-center">
          <button
            onClick={onBackToSelection}
            className="inline-flex items-center hover:bg-gray-100 mb-4 border-0 transition-all duration-200 px-4 py-2 rounded-lg"
            style={{ 
              color: '#374151'
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로 돌아가기
          </button>
          
          <h2 className="text-3xl font-bold mb-3" style={{
            color: '#1f2937'
          }}>
            서비스 로그인
          </h2>
          
          <p className="mt-2 text-base font-normal" style={{
            color: '#4b5563'
          }}>
            AHP 의사결정 분석 서비스에 로그인하세요
            <br />
            <span className="text-sm" style={{ color: '#6b7280' }}>관리자 권한은 이메일 기반으로 자동 인식됩니다</span>
          </p>
        </div>
        
        {/* 개선된 로그인 폼 */}
        <Card variant="glass" className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 shadow-lg">
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
              placeholder="비밀번호를 입력하세요"
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    서비스 로그인
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* 개선된 회원가입 링크 */}
          <div className="mt-6 text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-normal" style={{
              color: '#6b7280'
            }}>
              계정이 없으신가요?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-semibold transition-all duration-200 hover:underline"
                style={{
                  color: '#3b82f6'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#1d4ed8'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6'}
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