import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { userManagementService } from './services/userManagementService'; // Django 백엔드로 대체
import { API_BASE_URL } from './config/api';
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
import SupportPage from './components/support/SupportPage';
import NewsPage from './components/support/NewsPage';
import ErrorBoundary from './components/common/ErrorBoundary';
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

  // React 마운트 시 즉시 로딩 fallback 제거
  useEffect(() => {
    const fallbackElement = document.getElementById('loading-fallback');
    if (fallbackElement) {
      fallbackElement.style.display = 'none';
      console.log('📱 HTML fallback 화면 제거됨');
    }
  }, []);

  // Helper function to get default dashboard path - 안전한 네비게이션
  const getDefaultDashboardPath = (user: BaseUser | null): string => {
    if (!user) return '/login';
    
    try {
      switch (user.user_type) {
        case 'admin':
          return '/admin';
        case 'personal_service_user':
          return '/personal';
        case 'evaluator':
          return '/evaluator';
        default:
          return '/personal';
      }
    } catch (error) {
      console.error('Error in getDefaultDashboardPath:', error);
      return '/login';
    }
  };

  // 안전한 네비게이션 함수 - GitHub Pages 경로 고려
  const safeNavigate = (path: string) => {
    try {
      // GitHub Pages의 경우 /ahp_app 접두사 추가
      const fullPath = path.startsWith('/') ? `/ahp_app${path}` : `/ahp_app/${path}`;
      window.location.href = fullPath;
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.reload();
    }
  };

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // 타임아웃을 설정하여 백엔드 응답을 기다리지 않고도 앱이 로드되도록 함
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 5000); // 5초 타임아웃
        });
        
        // Django 백엔드 세션 검증
        try {
          const fetchPromise = fetch(`${API_BASE_URL}/api/user/`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
              console.log('🔄 페이지 새로고침 - Django 세션 복구 성공');
              // Django 사용자 정보를 React 형식으로 변환 (안전한 접근)
              const userInfo: BaseUser = {
                id: data.user.id || data.user.username || 'unknown',
                username: data.user.username || '',
                email: data.user.email || '',
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
                user_type: data.user.is_superuser ? 'admin' : 
                          data.user.user_type === 'evaluator' ? 'evaluator' : 'personal_service_user',
                is_active: data.user.is_active !== undefined ? data.user.is_active : true,
                date_joined: data.user.date_joined || new Date().toISOString(),
                last_login: data.user.last_login || new Date().toISOString()
              };
              setCurrentUser(userInfo);
              console.log('✅ 사용자 세션 복구 완료:', userInfo.username);
            } else {
              console.log('❌ Django 세션 인증되지 않음');
              setCurrentUser(null);
            }
          } else {
            console.log('ℹ️ 로그인되지 않은 상태');
            setCurrentUser(null);
          }
        } catch (sessionError) {
          const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
          console.log('ℹ️ Django 세션 검증 실패 또는 타임아웃 (앱은 계속 로드됩니다):', errorMessage);
          setCurrentUser(null);
          // 백엔드 연결 실패해도 앱은 계속 동작
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setAuthError('앱 초기화 중 오류가 발생했습니다.');
        setCurrentUser(null);
      } finally {
        // 빠른 초기화를 위해 타임아웃 단축
        setTimeout(() => {
          setLoading(false);
          console.log('🚀 React 애플리케이션 초기화 완료');
          console.log('📍 현재 경로:', window.location.pathname);
          console.log('👤 사용자 상태:', currentUser ? '로그인됨' : '로그인 필요');
        }, 500); // 1초에서 0.5초로 단축
      }
    };

    initializeApp();
  }, []);

  // Authentication handlers
  const handleLogin = async (username: string, password: string) => {
    try {
      setAuthError('');
      
      console.log('🔍 Django 백엔드 로그인 시도:', { username });
      
      // Django 간단한 로그인 API 사용 (안정적)
      const response = await fetch(`${API_BASE_URL}/api/simple-login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username,  // Django는 username 필드 사용
          password: password 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Django 로그인 응답:', data);
        
        // Django 응답에서 사용자 정보 매핑 (simple-login과 login 모두 호환)
        const userInfo: BaseUser = {
          id: data.user.id || data.user.username || 'unknown',
          username: data.user.username || '',
          email: data.user.email || '',
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          user_type: (data.user.is_superuser || data.user.user_type === 'admin') ? 'admin' : 
                    data.user.user_type === 'evaluator' ? 'evaluator' : 'personal_service_user',
          is_active: data.user.is_active !== undefined ? data.user.is_active : true,
          date_joined: data.user.date_joined || new Date().toISOString(),
          last_login: data.user.last_login || new Date().toISOString()
        };
        
        setCurrentUser(userInfo);
        
        // 로그인 성공 후 적절한 대시보드로 리다이렉트
        const dashboardPath = getDefaultDashboardPath(userInfo);
        console.log(`✅ 로그인 성공 - ${dashboardPath}로 이동`);
        
        // 짧은 지연 후 리다이렉트 (상태 업데이트 완료 대기)
        setTimeout(() => {
          safeNavigate(dashboardPath);
        }, 500);
        
        return { success: true };
      } else {
        const errorMessage = data.message || '로그인에 실패했습니다.';
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Django 로그인 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = async () => {
    try {
      // Django 로그아웃 API 호출
      await fetch(`${API_BASE_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setCurrentUser(null);
      setAuthError('');
      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ Django 로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setCurrentUser(null);
      setAuthError('');
    }
  };

  const handleAdminRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      console.log('🔍 Django 관리자 가입 시도:', data);
      
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          user_type: 'admin'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '관리자 가입에 실패했습니다.');
      }
      
      console.log('✅ Django 관리자 가입 성공');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '관리자 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
      console.error('❌ Django 관리자 가입 실패:', error);
    }
  };

  const handlePersonalServiceRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      console.log('🔍 Django 개인서비스 가입 시도:', data);
      
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          user_type: 'personal_service_user'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '개인서비스 가입에 실패했습니다.');
      }
      
      const result = await response.json();
      
      // 가입 성공 후 자동 로그인
      if (result.success) {
        await handleLogin(data.email, data.password);
      }
      
      console.log('✅ Django 개인서비스 가입 성공');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '개인서비스 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
      console.error('❌ Django 개인서비스 가입 실패:', error);
    }
  };

  const handleEvaluatorRegister = async (data: any): Promise<void> => {
    try {
      setAuthError('');
      console.log('🔍 Django 평가자 가입 시도:', data);
      
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          user_type: 'evaluator'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '평가자 가입에 실패했습니다.');
      }
      
      const result = await response.json();
      
      // 가입 성공 후 자동 로그인
      if (result.success) {
        await handleLogin(data.email, data.password);
      }
      
      console.log('✅ Django 평가자 가입 성공');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '평가자 가입 중 오류가 발생했습니다.';
      setAuthError(errorMessage);
      console.error('❌ Django 평가자 가입 실패:', error);
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
    <ErrorBoundary>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              
              {/* Developer Tools */}
              <Route path="/dev/test-accounts" element={<TestAccountManager />} />
              
              {/* Support Pages */}
              <Route 
                path="/support" 
                element={<SupportPage onBackClick={() => window.history.back()} />} 
              />
              <Route 
                path="/news" 
                element={<NewsPage onBackClick={() => window.history.back()} />} 
              />
              
              {/* Authentication Routes */}
              <Route 
                path="/login" 
                element={
                  currentUser ? (
                    <div>
                      {(() => {
                        const dashboardPath = getDefaultDashboardPath(currentUser);
                        setTimeout(() => safeNavigate(dashboardPath), 100);
                        return <div style={{ textAlign: 'center', padding: '2rem' }}>리다이렉트 중...</div>;
                      })()}
                    </div>
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

              {/* Protected Dashboard Routes - with individual error boundaries */}
              <Route 
                path="/admin/*" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requiredUserType="admin" currentUser={currentUser}>
                      {currentUser && isAdminUser(currentUser) && (
                        <AdminDashboard user={currentUser} />
                      )}
                    </ProtectedRoute>
                  </ErrorBoundary>
                } 
              />
              
              <Route 
                path="/personal/*" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requiredUserType="personal_service_user" currentUser={currentUser}>
                      {currentUser && isPersonalServiceUser(currentUser) && (
                        <PersonalServiceDashboard user={currentUser} />
                      )}
                    </ProtectedRoute>
                  </ErrorBoundary>
                } 
              />
              
              <Route 
                path="/evaluator/*" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute requiredUserType="evaluator" currentUser={currentUser}>
                      {currentUser && isEvaluatorUser(currentUser) && (
                        <EvaluatorDashboard user={currentUser} />
                      )}
                    </ProtectedRoute>
                  </ErrorBoundary>
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
                    <div>
                      {(() => {
                        const dashboardPath = getDefaultDashboardPath(currentUser);
                        setTimeout(() => safeNavigate(dashboardPath), 100);
                        return <div style={{ textAlign: 'center', padding: '2rem' }}>대시보드로 이동 중...</div>;
                      })()}
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        setTimeout(() => safeNavigate('/'), 100);
                        return <div style={{ textAlign: 'center', padding: '2rem' }}>홈으로 이동 중...</div>;
                      })()}
                    </div>
                  )
                } 
              />
            </Routes>
          </ErrorBoundary>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;