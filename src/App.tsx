import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { userManagementService } from './services/userManagementService';
import { BaseUser, isAdminUser, isPersonalServiceUser, isEvaluatorUser } from './types/userTypes';

// Layout components
import Layout from './components/layout/Layout';

// Auth components
import LoginPage from './components/auth/LoginPage';
import AdminRegistrationPage from './components/auth/AdminRegistrationPage';
import PersonalServiceRegistrationPage from './components/auth/PersonalServiceRegistrationPage';
import EvaluatorRegistrationPage from './components/auth/EvaluatorRegistrationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard components
import AdminDashboard from './components/dashboards/AdminDashboard';
import PersonalServiceDashboard from './components/dashboards/PersonalServiceDashboard';
import EvaluatorDashboard from './components/dashboards/EvaluatorDashboard';

// Other components
import HomePage from './components/home/HomePage';
import Card from './components/common/Card';
import TestAccountManager from './components/dev/TestAccountManager';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  // User state management
  const [currentUser, setCurrentUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check if user is already authenticated via Django session
        const isAuth = await userManagementService.isAuthenticated();
        if (isAuth) {
          const user = userManagementService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setAuthError('앱 초기화 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Authentication handlers
  const handleLogin = async (username: string, password: string) => {
    try {
      setAuthError('');
      const result = await userManagementService.login(username, password);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        return { success: true };
      } else {
        setAuthError(result.error || '로그인에 실패했습니다.');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = async () => {
    try {
      await userManagementService.logout();
      setCurrentUser(null);
      setAuthError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      const result = await userManagementService.registerAdmin(data);
      
      if (!result.success) {
        setAuthError(result.error || '관리자 가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '관리자 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
    }
  };

  const handlePersonalServiceRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      const result = await userManagementService.registerPersonalServiceUser(data);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setAuthError(result.error || '개인서비스 가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개인서비스 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
    }
  };

  const handleEvaluatorRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      const result = await userManagementService.registerEvaluator(data);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setAuthError(result.error || '평가자 가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '평가자 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            ⚡ AHP System
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            시스템을 준비하고 있습니다...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Developer Tools */}
          <Route path="/dev/test-accounts" element={<TestAccountManager />} />
          
          {/* Authentication Routes */}
          <Route 
            path="/login" 
            element={
              currentUser ? (
                <Navigate to={userManagementService.getDefaultDashboardPath()} replace />
              ) : (
                <LoginPage 
                  onLogin={handleLogin}
                  error={authError}
                />
              )
            } 
          />
          
          <Route 
            path="/register/admin" 
            element={
              <AdminRegistrationPage 
                onRegister={handleAdminRegister}
                onBackToSelection={() => window.history.back()}
                error={authError}
              />
            } 
          />
          
          <Route 
            path="/register/personal" 
            element={
              <PersonalServiceRegistrationPage 
                onRegister={handlePersonalServiceRegister}
                onBackToSelection={() => window.history.back()}
                error={authError}
              />
            } 
          />
          
          <Route 
            path="/register/evaluator" 
            element={
              <EvaluatorRegistrationPage 
                onRegister={handleEvaluatorRegister}
                onBackToSelection={() => window.history.back()}
                error={authError}
              />
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredUserType="admin">
                {currentUser && isAdminUser(currentUser) && (
                  <AdminDashboard user={currentUser} />
                )}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/personal/*" 
            element={
              <ProtectedRoute requiredUserType="personal_service_user">
                {currentUser && isPersonalServiceUser(currentUser) && (
                  <PersonalServiceDashboard user={currentUser} />
                )}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/evaluator/*" 
            element={
              <ProtectedRoute requiredUserType="evaluator">
                {currentUser && isEvaluatorUser(currentUser) && (
                  <EvaluatorDashboard user={currentUser} />
                )}
              </ProtectedRoute>
            } 
          />

          {/* Unauthorized Access */}
          <Route 
            path="/unauthorized" 
            element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-primary)'
              }}>
                <Card title="접근 권한 없음" variant="elevated">
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '1rem'
                    }}>
                      접근 권한이 없습니다
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '2rem',
                      lineHeight: '1.5'
                    }}>
                      이 페이지에 접근할 권한이 없습니다.<br />
                      로그인 후 다시 시도해주세요.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => window.location.href = '/login'}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        로그인
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        홈으로
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            } 
          />

          {/* Default redirect based on authentication status */}
          <Route 
            path="*" 
            element={
              currentUser ? (
                <Navigate to={userManagementService.getDefaultDashboardPath()} replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;