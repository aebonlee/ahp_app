/**
 * Django 백엔드와 연결된 메인 앱 컴포넌트
 */
import React, { useState } from 'react';
import { useDjangoAuth } from '../hooks/useDjangoAuth';
import DjangoLoginForm from './auth/DjangoLoginForm';
import Layout from './layout/Layout';
import HomePage from './home/HomePage';
import PersonalServicePage from '../pages/PersonalServicePage';
import EnhancedSuperAdminDashboard from './admin/EnhancedSuperAdminDashboard';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading, login } = useDjangoAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showRegister, setShowRegister] = useState(false);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>시스템 로딩 중...</p>
        
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    if (showRegister) {
      return (
        <div className="register-container">
          <h2>회원가입</h2>
          <p>회원가입 기능은 개발 중입니다.</p>
          <button onClick={() => setShowRegister(false)}>
            로그인으로 돌아가기
          </button>
        </div>
      );
    }

    return (
      <DjangoLoginForm 
        onLogin={async (userData) => {
          // 로그인 성공 후 사용자 데이터 처리
          console.log('Django 로그인 성공:', userData);
          // useDjangoAuth 훅이 상태를 관리하므로 별도 처리 불필요
        }}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  // 로그인된 사용자 - 역할에 따른 렌더링
  const renderMainContent = () => {
    // Convert Django User to ExtendedUser format (for components that need it)
    const extendedUser = {
      id: user.id.toString(),
      email: user.email,
      first_name: user.fullName.split(' ')[0] || '',
      last_name: user.fullName.split(' ').slice(1).join(' ') || '',
      role: (user.isAdmin ? 'super_admin' : user.isProjectManager ? 'admin' : 'evaluator') as 'super_admin' | 'admin' | 'service_tester' | 'evaluator',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 관리자인 경우
    if (user.isAdmin || user.isProjectManager) {
      switch (activeTab) {
        case 'admin-dashboard':
          return <EnhancedSuperAdminDashboard user={extendedUser} />;
        case 'personal-service':
          return <PersonalServicePage user={extendedUser} />;
        default:
          return <HomePage onLoginClick={() => {}} />;
      }
    }

    // 평가자인 경우
    if (user.isEvaluator) {
      switch (activeTab) {
        case 'personal-service':
          return <PersonalServicePage user={extendedUser} />;
        default:
          return <HomePage onLoginClick={() => {}} />;
      }
    }

    // 기본 사용자
    return <HomePage onLoginClick={() => {}} />;
  };

  // Convert Django User to Layout user format
  const layoutUser = {
    id: user.id.toString(),
    first_name: user.fullName.split(' ')[0] || '',
    last_name: user.fullName.split(' ').slice(1).join(' ') || '',
    email: user.email,
    role: (user.isAdmin ? 'super_admin' : user.isProjectManager ? 'admin' : 'evaluator') as 'super_admin' | 'admin' | 'service_tester' | 'evaluator',
  };

  return (
    <Layout 
      user={layoutUser}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderMainContent()}
    </Layout>
  );
};

export default MainApp;