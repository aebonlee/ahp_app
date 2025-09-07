import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import './App.css';

function App() {
  const { isAuthenticated, checkSession, isLoading } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 세션 확인
    checkSession();
  }, [checkSession]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">로딩 중...</div>
      </div>
    );
  }

  return (
    <Router basename="/ahp_app">
      <div className="App">
        <Routes>
          {/* 공개 라우트 */}
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
          />
          
          {/* 보호된 라우트 */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/projects" 
            element={isAuthenticated ? <ProjectsPage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
