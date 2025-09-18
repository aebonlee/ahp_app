// =============================================================================
// AHP Enterprise Platform - Main Application (3차 개발)
// =============================================================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Stores
import useAuthStore from './store/authStore';
import { initializeTheme } from './store/uiStore';

// Pages
<<<<<<< HEAD
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import ProjectPage from './pages/ProjectPage';
// import ComparisonPage from './pages/ComparisonPage';
// import ResultsPage from './pages/ResultsPage';
=======
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
// import ProjectPage from '@/pages/ProjectPage';
// import ComparisonPage from '@/pages/ComparisonPage';
// import ResultsPage from '@/pages/ResultsPage';
>>>>>>> 9509bf3ce9c8a1c5e1be607bc08c0e445b105130

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ToastContainer from './components/ui/ToastContainer';
import Layout from './components/layout/Layout';

// Styles
import './styles/global.css';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// Protected Route 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route 컴포넌트 (로그인된 사용자는 대시보드로 리다이렉트)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingSpinner message="로딩 중..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { checkSession } = useAuthStore();
  
  useEffect(() => {
    // 테마 초기화
    initializeTheme();
    
    // 세션 확인
    checkSession();
    
    console.log('🚀 AHP Enterprise Platform v3.0.0 시작');
  }, [checkSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/ahp_app">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global UI Components */}
          <ToastContainer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;