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
  const { user, isAuthenticated, isLoading } = useDjangoAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showRegister, setShowRegister] = useState(false);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>시스템 로딩 중...</p>
        
        <style jsx>{`
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
        onSuccess={() => {
          // 로그인 성공 후 추가 로직 (필요시)
          console.log('Django 로그인 성공');
        }}
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  // 로그인된 사용자 - 역할에 따른 렌더링
  const renderMainContent = () => {
    // 관리자인 경우
    if (user.isAdmin || user.isProjectManager) {
      switch (activeTab) {
        case 'admin-dashboard':
          return <EnhancedSuperAdminDashboard />;
        case 'personal-service':
          return <PersonalServicePage />;
        default:
          return <HomePage />;
      }
    }

    // 평가자인 경우
    if (user.isEvaluator) {
      switch (activeTab) {
        case 'personal-service':
          return <PersonalServicePage />;
        default:
          return <HomePage />;
      }
    }

    // 기본 사용자
    return <HomePage />;
  };

  return (
    <Layout 
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderMainContent()}
    </Layout>
  );
};

export default MainApp;