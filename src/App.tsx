import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { userManagementService } from './services/userManagementService'; // Django 백엔드로 대체
import { API_BASE_URL } from './config/api';
import { BaseUser, UserType, isAdminUser, isPersonalServiceUser, isEvaluatorUser } from './types/userTypes';

// Auth components
import LoginPage from './components/auth/LoginPage';
import AdminRegistrationPage from './components/auth/AdminRegistrationPage';
import PersonalServiceRegistrationPage from './components/auth/PersonalServiceRegistrationPage';
import EvaluatorRegistrationPage from './components/auth/EvaluatorRegistrationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard components
// AdminDashboard removed - admin users now use PersonalServiceDashboard
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

  // User state management - 강제로 null로 시작 (자동 로그인 완전 차단)
  const [currentUser, setCurrentUser] = useState<BaseUser | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // 초기 로딩 상태

  // 초기 세션 설정 (로그인 상태 복구)
  React.useEffect(() => {
    console.log('🔄 앱 초기화 - 세션 상태 확인');
    
    // sessionStorage에서 세션 복구 시도
    const savedSession = sessionStorage.getItem('ahp_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        console.log('📦 기존 세션 복구:', sessionData.username, sessionData.user_type);
        setCurrentUser(sessionData);
      } catch (e) {
        console.error('세션 복구 실패:', e);
        sessionStorage.removeItem('ahp_session');
        setCurrentUser(null);
      }
    } else {
      console.log('📦 저장된 세션 없음');
      setCurrentUser(null);
    }
    
    // 초기화 완료
    setIsInitializing(false);
    console.log('✅ 초기 세션 로드 완료');
  }, []); // 빈 의존성 배열로 한 번만 실행

  // React 마운트 확인 로그
  useEffect(() => {
    console.log('⚡ React 컴포넌트 마운트됨');
    
    // 페이지 새로고침/이동 감지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentSession = sessionStorage.getItem('ahp_session');
      console.log('🔄 페이지 새로고침/이동 감지 - 세션 상태:', currentSession ? '존재' : '없음');
      if (currentSession) {
        console.log('🔄 세션 데이터가 새로고침 전에 존재함');
      }
    };
    
    const handleLoad = () => {
      console.log('🔄 페이지 로드 완료');
      const currentSession = sessionStorage.getItem('ahp_session');
      console.log('🔄 로드 후 세션 상태:', currentSession ? '존재' : '없음');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Helper function to get default dashboard path - 안전한 네비게이션
  const getDefaultDashboardPath = (user: BaseUser | null): string => {
    if (!user) return '/login';
    
    try {
      switch (user.user_type) {
        case 'admin':
          // 관리자도 개인서비스 대시보드를 사용 (모든 기능 접근 가능)
          return '/personal';
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


  // 세션 확인 로직 (로그인 후 세션 유지용) - 세션이 없을 때만 체크
  useEffect(() => {
    // 이미 sessionStorage에서 세션을 복구했거나 currentUser가 설정되어 있으면 Django 체크하지 않음
    if (currentUser) {
      console.log('🔍 기존 세션 존재 - Django 세션 체크 생략:', currentUser.username);
      return;
    }
    
    const currentPath = window.location.hash.replace('#', '');
    const isDashboardPage = currentPath.startsWith('/personal') || currentPath.startsWith('/evaluator');
    
    // 대시보드 페이지이면서 currentUser가 없을 때만 Django 세션 확인
    if (isDashboardPage) {
      console.log('🔍 대시보드 페이지 - 세션 없음 - Django 세션 확인 시작');
      
      // 1초 지연으로 초기 세션 복구가 완료된 후 실행
      const timer = setTimeout(async () => {
        // 다시 한번 currentUser 체크 (초기 세션 복구가 완료되었을 수 있음)
        if (currentUser) {
          console.log('🔍 초기 세션 복구 완료됨 - Django 체크 중단');
          return;
        }
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/user/`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
              // Django 백엔드에서 세션 복구 시에도 정확한 권한 결정
              let userType: UserType;
              if (data.user.is_superuser === true) {
                userType = 'admin';
              } else if (data.user.user_type === 'admin') {
                userType = 'admin';
              } else if (data.user.user_type === 'evaluator') {
                userType = 'evaluator';
              } else {
                userType = 'personal_service_user';
              }
              
              const userInfo: BaseUser = {
                id: data.user.id || data.user.username || 'unknown',
                username: data.user.username || '',
                email: data.user.email || '',
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
                user_type: userType,
                is_active: data.user.is_active !== undefined ? data.user.is_active : true,
                date_joined: data.user.date_joined || new Date().toISOString(),
                last_login: data.user.last_login || new Date().toISOString()
              };
              
              setCurrentUser(userInfo);
              sessionStorage.setItem('ahp_session', JSON.stringify(userInfo));
              console.log('✅ Django 백엔드에서 세션 복구 성공:', userInfo.username);
            } else {
              console.log('❌ Django 세션 없음 - 로그인 필요');
            }
          } else {
            console.log('❌ Django 세션 확인 실패 - 응답 상태:', response.status);
          }
        } catch (error) {
          console.log('Django 세션 확인 오류:', error);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('🏠 홈페이지 - Django 세션 확인 생략');
    }
  }, [currentUser]); // currentUser 의존성 추가하여 세션 상태 변경 감지

  // Authentication handlers
  const handleLogin = async (username: string, password: string) => {
    try {
      setAuthError('');
      
      // 새 로그인 시작 시 이전 세션 완전 클리어
      console.log('🧹 이전 세션 완전 클리어 시작');
      setCurrentUser(null);
      sessionStorage.removeItem('ahp_session');
      
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
        
        // Django 응답에서 사용자 정보 매핑 (정확한 권한 결정)
        console.log('🔍 Django 사용자 데이터:', data.user);
        
        // 사용자 타입 정확히 결정
        let userType: UserType;
        if (data.user.is_superuser === true) {
          userType = 'admin';
          console.log('✅ 슈퍼 관리자로 인식');
        } else if (data.user.user_type === 'admin') {
          userType = 'admin';
          console.log('✅ 일반 관리자로 인식');
        } else if (data.user.user_type === 'evaluator') {
          userType = 'evaluator';
          console.log('✅ 평가자로 인식');
        } else {
          userType = 'personal_service_user';
          console.log('✅ 개인서비스 사용자로 인식');
        }
        
        const userInfo: BaseUser = {
          id: data.user.id || data.user.username || 'unknown',
          username: data.user.username || '',
          email: data.user.email || '',
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          user_type: userType,
          is_active: data.user.is_active !== undefined ? data.user.is_active : true,
          date_joined: data.user.date_joined || new Date().toISOString(),
          last_login: data.user.last_login || new Date().toISOString()
        };
        
        // React 상태 업데이트
        setCurrentUser(userInfo);
        console.log('🎯 React 상태 업데이트 완료:', userInfo.username, userInfo.user_type);
        
        // sessionStorage에 새로운 세션 저장 (이전 세션 완전 대체)
        const sessionToSave = JSON.stringify(userInfo);
        console.log('📦 새로운 세션 저장 시도:', userInfo.username, userInfo.user_type);
        console.log('📦 저장할 사용자 권한:', userInfo.user_type);
        console.log('📦 저장할 데이터 크기:', sessionToSave.length, '바이트');
        
        try {
          sessionStorage.setItem('ahp_session', sessionToSave);
          console.log('📦 sessionStorage.setItem() 실행 완료');
          
          // 즉시 저장 확인
          const savedCheck = sessionStorage.getItem('ahp_session');
          console.log('📦 즉시 저장 검증:', savedCheck ? '성공' : '실패');
          
          if (savedCheck) {
            const parsedCheck = JSON.parse(savedCheck);
            console.log('📦 저장된 데이터 확인:', parsedCheck.username, parsedCheck.user_type);
          }
          
          // 3초 후 재확인 (비동기 처리 확인)
          setTimeout(() => {
            const delayedCheck = sessionStorage.getItem('ahp_session');
            console.log('📦 3초 후 세션 재확인:', delayedCheck ? '유지됨' : '사라짐');
          }, 3000);
          
        } catch (storageError) {
          console.error('📦 sessionStorage 저장 실패:', storageError);
        }
        
        // 로그인 성공 후 적절한 대시보드로 리다이렉트
        const dashboardPath = getDefaultDashboardPath(userInfo);
        console.log(`✅ 로그인 성공 - ${dashboardPath}로 이동`);
        
        // React Router를 통한 네비게이션 (HashRouter 안전한 방식)
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname + `#${dashboardPath}`;
        }, 100);
        
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
      sessionStorage.removeItem('ahp_session'); // sessionStorage 클리어
      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ Django 로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setCurrentUser(null);
      setAuthError('');
      sessionStorage.removeItem('ahp_session'); // sessionStorage 클리어
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

  // 로딩 화면 제거 - 깜빡임 방지를 위해 직접 콘텐츠 렌더링

  // 초기화 중이면 로딩 화면 표시
  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid var(--border-subtle)',
            borderTop: '2px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          앱 초기화 중...
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
              <Route path="/" element={<HomePage currentUser={currentUser} />} />
              
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
                    <Navigate to={getDefaultDashboardPath(currentUser)} replace />
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
              {/* Admin users now use the personal service dashboard with full admin privileges */}
              
              <Route 
                path="/personal/*" 
                element={
                  <ErrorBoundary>
                    <ProtectedRoute 
                      allowedUserTypes={["admin", "personal_service_user"]} 
                      currentUser={currentUser}
                    >
                      {currentUser && (isPersonalServiceUser(currentUser) || isAdminUser(currentUser)) && (
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

              {/* Default redirect - 더 정확한 처리 */}
              <Route 
                path="*" 
                element={
                  // 현재 경로를 확인해서 대시보드 경로가 아닌 경우에만 리다이렉트
                  window.location.hash.includes('/personal') || 
                  window.location.hash.includes('/evaluator') ? (
                    // 이미 대시보드 경로인 경우 그대로 유지
                    <div style={{ 
                      minHeight: '100vh', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      <div>페이지를 로드하는 중...</div>
                    </div>
                  ) : currentUser ? (
                    <Navigate to={getDefaultDashboardPath(currentUser)} replace />
                  ) : (
                    <Navigate to="/" replace />
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