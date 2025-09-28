import React, { useState } from 'react';
import LoginSelectionPage from './LoginSelectionPage';
import RegisterPage from './RegisterPage';
import ServiceLoginPage from './ServiceLoginPage';
import AdminSelectPage from './AdminSelectPage';

type LoginMode = 'selection' | 'service' | 'register' | 'admin-select';

interface LoginFormProps {
  onLogin: (email: string, password: string, role?: string) => Promise<void>;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
  isAdmin?: boolean; // 관리자 권한 여부
  userEmail?: string; // 로그인한 사용자 이메일
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister, loading = false, error, isAdmin = false, userEmail = '' }) => {
  const [mode, setMode] = useState<LoginMode>('selection');

  // 관리자 권한 확인 후 서비스 선택 모드로 전환
  React.useEffect(() => {
    if (isAdmin && mode === 'service') {
      setMode('admin-select');
    }
  }, [isAdmin, mode]);

  const handleModeSelect = (selectedMode: 'service' | 'register') => {
    setMode(selectedMode);
  };

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

  const handleBackToSelection = () => {
    setMode('selection');
  };

  const handleRegister = async (email: string, password: string, role?: string) => {
    await onLogin(email, password, role || 'user');
  };

  if (mode === 'selection') {
    return (
      <LoginSelectionPage
        onRegisterSelect={() => handleModeSelect('register')}
        onServiceSelect={() => handleModeSelect('service')}
      />
    );
  }

  // 회원가입 폼 화면
  if (mode === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onBackToSelection={handleBackToSelection}
        onSwitchToLogin={() => handleModeSelect('service')}
        loading={loading}
        error={error}
      />
    );
  }

  // 관리자 서비스 선택 화면
  if (mode === 'admin-select') {
    return (
      <AdminSelectPage
        onAdminSelect={() => handleAdminServiceSelect('admin')}
        onUserSelect={() => handleAdminServiceSelect('personal')}
        onBackToLogin={() => setMode('selection')}
      />
    );
  }

  // 개선된 로그인 폼 화면 (서비스)
  return (
    <ServiceLoginPage
      onLogin={onLogin}
      onBackToSelection={handleBackToSelection}
      onSwitchToRegister={() => handleModeSelect('register')}
      loading={loading}
      error={error}
    />
  );
};

export default LoginForm;