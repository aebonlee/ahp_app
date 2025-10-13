import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import './StyledLoginForm.css';

interface StyledLoginFormProps {
  onLogin: (userData: any) => void;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
}

const StyledLoginForm: React.FC<StyledLoginFormProps> = ({
  onLogin,
  onRegister,
  loading = false,
  error
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await apiService.authAPI.status();
      if (response.success !== false) {
        setServiceStatus('available');
      } else {
        setServiceStatus('unavailable');
      }
    } catch (error) {
      setServiceStatus('unavailable');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRegisterMode) {
      setRegisterData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
    setLocalError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setLocalError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    if (serviceStatus !== 'available') {
      setLocalError('서비스에 연결할 수 없습니다.');
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      console.log('🔐 로그인 시도:', { username: formData.username, password: '***' });
      const response = await apiService.authAPI.login({
        username: formData.username,
        password: formData.password
      });

      console.log('📥 로그인 응답:', response);

      if (response.error) {
        console.error('❌ 로그인 에러:', response.error);
        throw new Error(response.error);
      }

      // Django 백엔드 응답 형식에 맞게 처리
      const userResponse = response as any;
      if (!userResponse.success) {
        console.error('❌ 로그인 실패:', userResponse.message);
        throw new Error(userResponse.message || '로그인에 실패했습니다.');
      }
      const userData = {
        id: userResponse.user?.id || 1,
        username: userResponse.user?.username || formData.username,
        email: userResponse.user?.email || formData.username,
        first_name: userResponse.user?.first_name || formData.username,
        last_name: userResponse.user?.last_name || '',
        role: userResponse.user?.is_superuser ? 'super_admin' : 
              userResponse.user?.is_staff ? 'admin' : 'evaluator'
      };
      
      onLogin(userData);
    } catch (error: any) {
      setLocalError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (registerData.password.length < 8) {
      setLocalError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      const response = await apiService.authAPI.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.firstName,
        last_name: registerData.lastName
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setFormData({
        username: registerData.username,
        password: registerData.password
      });
      setIsRegisterMode(false);
      setLocalError('');
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (error: any) {
      setLocalError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setLocalLoading(false);
    }
  };

  const displayError = error || localError;
  const displayLoading = loading || localLoading;

  if (serviceStatus === 'checking') {
    return (
      <div className="login-container">
        <div className="loading-card">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">서비스 연결 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* 배경 애니메이션 */}
      <div className="background-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-content">
        {/* 로고 및 타이틀 */}
        <div className="login-header">
          <div className="logo-container">
            <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="login-title">AHP Platform</h1>
          <p className="login-subtitle">의사결정을 위한 최적의 선택</p>
        </div>

        {/* 메인 카드 */}
        <div className="login-card">
          {/* 탭 전환 */}
          <div className="tab-container">
            <button
              onClick={() => setIsRegisterMode(false)}
              className={`tab-button ${!isRegisterMode ? 'active' : ''}`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsRegisterMode(true)}
              className={`tab-button ${isRegisterMode ? 'active' : ''}`}
            >
              회원가입
            </button>
          </div>

          {!isRegisterMode ? (
            // 로그인 폼
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  사용자명 또는 이메일
                </label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input with-icon"
                    placeholder="admin 또는 admin@ahp-platform.com"
                    required
                    disabled={displayLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  비밀번호
                </label>
                <div className="input-container">
                  <div className="input-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input with-icon with-toggle"
                    placeholder="비밀번호 입력"
                    required
                    disabled={displayLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox" />
                  <span>로그인 상태 유지</span>
                </label>
                <button type="button" className="forgot-password">
                  비밀번호 찾기
                </button>
              </div>

              {displayError && (
                <div className="error-message">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" />
                  </svg>
                  <p>{displayError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={displayLoading}
                className="submit-button"
              >
                {displayLoading ? (
                  <span className="button-loading">
                    <div className="button-spinner"></div>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          ) : (
            // 회원가입 폼
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    name="firstName"
                    value={registerData.firstName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="이름"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">성</label>
                  <input
                    type="text"
                    name="lastName"
                    value={registerData.lastName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="성"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  사용자명 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="사용자명"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  이메일 <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  비밀번호 <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="최소 8자 이상"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  비밀번호 확인 <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="비밀번호 재입력"
                  required
                />
              </div>

              {displayError && (
                <div className="error-message">
                  <p>{displayError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={displayLoading}
                className="submit-button"
              >
                {displayLoading ? '가입 중...' : '회원가입'}
              </button>
            </form>
          )}

          {/* 테스트 계정 정보 */}
          <div className="test-account-info">
            <p className="info-title">테스트 계정</p>
            <div className="info-box">
              <div className="info-row">
                <span className="info-label">테스트 계정:</span>
                <span className="info-value">admin / ahp2025admin</span>
              </div>
            </div>
          </div>

          {/* 서비스 상태 */}
          <div className="service-status">
            {serviceStatus === 'available' ? (
              <div className="status-indicator available">
                <div className="status-dot"></div>
                서비스 정상 작동 중
              </div>
            ) : (
              <div className="status-indicator unavailable">
                <div className="status-dot"></div>
                서비스 연결 불가
              </div>
            )}
          </div>
        </div>

        {/* 소셜 로그인 */}
        <div className="social-login">
          <div className="divider">
            <span>또는</span>
          </div>
          <div className="social-buttons">
            <button className="social-button google">
              <svg viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
            </button>
            <button className="social-button github">
              <svg viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="social-button twitter">
              <svg viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledLoginForm;