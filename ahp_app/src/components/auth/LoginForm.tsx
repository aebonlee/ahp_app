import React, { useState } from 'react';
import UnifiedAuthPage from './UnifiedAuthPage';
import AdminSelectPage from './AdminSelectPage';

type LoginMode = 'auth' | 'admin-select';

interface LoginFormProps {
  onLogin: (email: string, password: string, role?: string) => Promise<void>;
  onRegister?: () => void;
  onGoogleAuth?: () => Promise<void>;
  onKakaoAuth?: () => Promise<void>;
  onNaverAuth?: () => Promise<void>;
  loading?: boolean;
  error?: string;
  isAdmin?: boolean; // 관리자 권한 여부
  userEmail?: string; // 로그인한 사용자 이메일
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  onRegister, 
  onGoogleAuth,
  onKakaoAuth,
  onNaverAuth,
  loading = false, 
  error, 
  isAdmin = false, 
  userEmail = '' 
}) => {
  const [mode, setMode] = useState<LoginMode>('auth');

  // 관리자 권한 확인 후 서비스 선택 모드로 전환
  React.useEffect(() => {
    if (isAdmin) {
      setMode('admin-select');
    }
  }, [isAdmin]);

  // 관리자 서비스 선택 핸들러
  const handleAdminServiceSelect = (serviceType: 'admin' | 'personal') => {
    if (serviceType === 'admin') {
      // 관리자 페이지로 이동하는 로직
      onLogin(userEmail, '', 'admin');
    } else {
      // 개인 서비스로 이동하는 로직  
      onLogin(userEmail, '', 'evaluator');
    }
  };

  const handleRegister = async (email: string, password: string, role?: string) => {
    await onLogin(email, password, role || 'user');
  };

  // 관리자 서비스 선택 화면
  if (mode === 'admin-select') {
    return (
      <AdminSelectPage
        onAdminSelect={() => handleAdminServiceSelect('admin')}
        onUserSelect={() => handleAdminServiceSelect('personal')}
        onBackToLogin={() => setMode('auth')}
      />
    );
  }

  // 통합 인증 화면 (로그인/회원가입 통합)
  return (
    <UnifiedAuthPage
      onLogin={onLogin}
      onRegister={handleRegister}
      onGoogleAuth={onGoogleAuth}
      onKakaoAuth={onKakaoAuth}
      onNaverAuth={onNaverAuth}
      loading={loading}
      error={error}
    />
  );
};

export default LoginForm;