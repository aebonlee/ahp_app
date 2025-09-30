import React, { useState } from 'react';
import Input from '../common/Input';
import Card from '../common/Card';

interface UnifiedAuthPageProps {
  onLogin: (email: string, password: string, role?: string) => Promise<void>;
  onRegister: (email: string, password: string, role?: string) => Promise<void>;
  onGoogleAuth?: () => Promise<void>;
  onKakaoAuth?: () => Promise<void>;
  onNaverAuth?: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

const UnifiedAuthPage: React.FC<UnifiedAuthPageProps> = ({ 
  onLogin, 
  onRegister,
  onGoogleAuth,
  onKakaoAuth,
  onNaverAuth,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* 간소화된 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
            AHP for Paper
          </h1>
          <p className="text-lg font-medium text-gray-600 mb-2">
            전문가급 의사결정 지원 시스템
          </p>
          <p className="text-sm text-gray-500">
            Analytic Hierarchy Process Decision Support System
          </p>
        </div>
        
        {/* 통합 인증 폼 */}
        <Card variant="glass" className="bg-white border-2 border-blue-200 shadow-lg">
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

            {/* 인라인 버튼 배치 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group flex-1">
                <div className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity bg-gradient-to-r from-blue-600 to-blue-800"></div>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setIsRegistering(false)}
                  className="relative w-full py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {loading && !isRegistering ? (
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
                      로그인
                    </span>
                  )}
                </button>
              </div>
              
              <div className="relative group flex-1">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setIsRegistering(true)}
                  className="relative w-full py-4 px-8 text-purple-600 font-bold text-lg rounded-xl border-2 border-purple-600 bg-white hover:bg-purple-50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && isRegistering ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      가입 처리 중...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      회원가입
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            {/* 구글 로그인 */}
            <button
              type="button"
              onClick={onGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글 이메일로 가입하기
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={onKakaoAuth}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-yellow-300 rounded-xl text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              카카오 이메일로 가입하기
            </button>

            {/* 네이버 로그인 */}
            <button
              type="button"
              onClick={onNaverAuth}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-green-500 rounded-xl text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
              </svg>
              네이버 이메일로 가입하기
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;