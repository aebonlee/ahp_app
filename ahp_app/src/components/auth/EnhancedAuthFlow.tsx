import React, { useState } from 'react';
import UnifiedAuthPage from './UnifiedAuthPage';
import TwoFactorAuth from './TwoFactorAuth';
import AdminSelectPage from './AdminSelectPage';
import { twoFactorService, twoFactorSecurity } from '../../services/twoFactorService';
import { authApi } from '../../services/api';

interface EnhancedAuthFlowProps {
  onAuthSuccess: (user: any, tokens: any) => void;
  onAuthError: (error: string) => void;
}

type AuthStep = 'login' | '2fa-verify' | '2fa-setup' | 'admin-select';

interface AuthState {
  user: any;
  tempTokens: any;
  requires2FA: boolean;
  twoFactorEnabled: boolean;
  isAdmin: boolean;
}

const EnhancedAuthFlow: React.FC<EnhancedAuthFlowProps> = ({
  onAuthSuccess,
  onAuthError
}) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tempTokens: null,
    requires2FA: false,
    twoFactorEnabled: false,
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Handle initial login
  const handleLogin = async (email: string, password: string, role?: string) => {
    if (!twoFactorSecurity.checkRateLimit(`login_${email}`)) {
      setError('너무 많은 로그인 시도가 있었습니다. 5분 후 다시 시도해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, attempt login
      const loginResponse = await authApi.login(email, password);
      
      if (!loginResponse.success) {
        throw new Error(loginResponse.error || '로그인에 실패했습니다.');
      }

      const { user, token } = loginResponse.data || {};
      
      // Check if user has 2FA enabled
      const twoFactorStatus = await twoFactorService.getStatus();
      
      if (twoFactorStatus.success && twoFactorStatus.data?.is_enabled) {
        // 2FA is enabled, require verification
        setAuthState({
          user,
          tempTokens: { access_token: token },
          requires2FA: true,
          twoFactorEnabled: true,
          isAdmin: user.is_superuser || user.is_staff
        });
        setCurrentStep('2fa-verify');
      } else {
        // No 2FA, proceed with login
        // Check if admin and needs service selection
        if (user.is_superuser || user.is_staff) {
          setAuthState({
            user,
            tempTokens: { access_token: token },
            requires2FA: false,
            twoFactorEnabled: false,
            isAdmin: true
          });
          setCurrentStep('admin-select');
        } else {
          // Regular user login complete
          onAuthSuccess(user, { access_token: token });
        }
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (email: string, password: string, role?: string) => {
    if (!twoFactorSecurity.checkRateLimit(`register_${email}`)) {
      setError('너무 많은 가입 시도가 있었습니다. 5분 후 다시 시도해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 실제 회원가입 API 호출 (현재는 로그인으로 대체)
      // TODO: 백엔드에 register API 구현 후 수정 필요
      const registerResponse = await authApi.login(email, password);
      
      if (!registerResponse.success) {
        throw new Error(registerResponse.error || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공 후 자동 로그인 시도
      try {
        await handleLogin(email, password, role);
      } catch (loginErr) {
        // 자동 로그인 실패 시 수동 로그인 안내
        setError('회원가입이 완료되었습니다. 로그인해주세요.');
      }
      
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async (code: string) => {
    if (!twoFactorSecurity.validateTOTPFormat(code) && !twoFactorSecurity.validateBackupCodeFormat(code)) {
      setError('올바른 인증 코드 형식이 아닙니다.');
      return;
    }

    if (!twoFactorSecurity.checkRateLimit(`2fa_${authState.user?.email}`)) {
      setError('너무 많은 인증 시도가 있었습니다. 5분 후 다시 시도해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const codeType = twoFactorSecurity.validateTOTPFormat(code) ? 'totp' : 'backup';
      const verifyResponse = await twoFactorService.verifyCode(code, codeType);
      
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || '인증 코드가 올바르지 않습니다.');
      }

      // Clear rate limit on success
      twoFactorSecurity.clearRateLimit(`2fa_${authState.user.email}`);
      
      // Check if admin needs service selection
      if (authState.isAdmin) {
        setCurrentStep('admin-select');
      } else {
        // Complete authentication
        const finalTokens = verifyResponse.data?.tokens || authState.tempTokens;
        onAuthSuccess(authState.user, finalTokens);
      }
      
    } catch (err: any) {
      setError(err.message || '2FA 인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA setup completion
  const handle2FASetupComplete = async (secret: string, backupCodes: string[]) => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, save the secret and backup codes to backend
      // For now, just proceed with authentication
      
      if (authState.isAdmin) {
        setCurrentStep('admin-select');
      } else {
        onAuthSuccess(authState.user, authState.tempTokens);
      }
      
    } catch (err: any) {
      setError(err.message || '2FA 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin service selection
  const handleAdminServiceSelect = (serviceType: 'admin' | 'personal') => {
    // Update user role based on selection
    const updatedUser = {
      ...authState.user,
      current_role: serviceType === 'admin' ? 'admin' : 'evaluator'
    };
    
    onAuthSuccess(updatedUser, authState.tempTokens);
  };

  // Handle social authentication
  const handleSocialAuth = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    setError('');

    try {
      // Social authentication would be implemented here
      // For now, show placeholder message
      setError(`${provider} 로그인은 곧 지원될 예정입니다.`);
      
    } catch (err: any) {
      setError(`${provider} 로그인 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  // Reset authentication flow
  const resetAuthFlow = () => {
    setCurrentStep('login');
    setAuthState({
      user: null,
      tempTokens: null,
      requires2FA: false,
      twoFactorEnabled: false,
      isAdmin: false
    });
    setError('');
    setLoading(false);
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <UnifiedAuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGoogleAuth={() => handleSocialAuth('google')}
            onKakaoAuth={() => handleSocialAuth('kakao')}
            onNaverAuth={() => handleSocialAuth('naver')}
            loading={loading}
            error={error}
          />
        );

      case '2fa-verify':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              <TwoFactorAuth
                userEmail={authState.user?.email || ''}
                mode="verify"
                onVerificationSuccess={handle2FAVerification}
                onVerificationFailed={(error) => setError(error)}
                loading={loading}
              />
              
              <div className="mt-6 text-center">
                <button
                  onClick={resetAuthFlow}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  다른 계정으로 로그인
                </button>
              </div>
            </div>
          </div>
        );

      case '2fa-setup':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              <TwoFactorAuth
                userEmail={authState.user?.email || ''}
                mode="setup"
                onSetupComplete={handle2FASetupComplete}
                loading={loading}
              />
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    // Skip 2FA setup for now
                    if (authState.isAdmin) {
                      setCurrentStep('admin-select');
                    } else {
                      onAuthSuccess(authState.user, authState.tempTokens);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  나중에 설정하기
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin-select':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
              <AdminSelectPage
                onAdminSelect={() => handleAdminServiceSelect('admin')}
                onUserSelect={() => handleAdminServiceSelect('personal')}
                onBackToLogin={resetAuthFlow}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderCurrentStep();
};

export default EnhancedAuthFlow;