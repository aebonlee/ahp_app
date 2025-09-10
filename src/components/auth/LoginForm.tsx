import React, { useState, useEffect } from 'react';
import LoginSelectionPage from './LoginSelectionPage';
import RegisterPage from './RegisterPage';
import ServiceLoginPage from './ServiceLoginPage';
import AdminSelectPage from './AdminSelectPage';
import apiService from '../../services/apiService';

type LoginMode = 'selection' | 'service' | 'register' | 'admin-select';

interface LoginFormProps {
  onLogin: (userData: any) => void;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
  isAdmin?: boolean; // 관리자 권한 여부
  userEmail?: string; // 로그인한 사용자 이메일
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister, loading = false, error, isAdmin = false, userEmail = '' }) => {
  const [mode, setMode] = useState<LoginMode>('selection');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

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
      const userData = {
        id: 1,
        username: userEmail,
        email: userEmail,
        first_name: userEmail,
        last_name: '',
        is_superuser: userEmail === 'aebon',
        is_staff: true,
        role: userEmail === 'aebon' ? 'super_admin' : 'admin'
      };
      onLogin(userData);
    } else {
      // 개인 서비스로 이동하는 로직  
      const userData = {
        id: 1,
        username: userEmail,
        email: userEmail,
        first_name: userEmail,
        last_name: '',
        is_superuser: false,
        is_staff: false,
        role: 'evaluator'
      };
      onLogin(userData);
    }
  };

  const handleBackToSelection = () => {
    setMode('selection');
  };

  const handleRegister = async (userData: any) => {
    onLogin(userData);
  };

  // 서비스 상태 확인 중 화면
  if (serviceStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{
              borderColor: 'var(--accent-primary)'
            }}></div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스 연결 확인 중...
            </h2>
            <p className="text-sm" style={{
              color: 'var(--text-secondary)'
            }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4" style={{
              color: 'var(--semantic-danger)'
            }}>⚠️</div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-sm mb-4" style={{
              color: 'var(--text-secondary)'
            }}>
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--semantic-danger)',
                borderColor: 'var(--semantic-danger)'
              }}
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

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