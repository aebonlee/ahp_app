import React from 'react';
import useAuthStore from '../store/authStore';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AHP 시스템 대시보드</h1>
        <div className="user-info">
          <span>안녕하세요, {user?.name}님!</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>프로젝트 관리</h3>
            <p>AHP 프로젝트를 생성하고 관리합니다.</p>
            <button className="card-button">
              프로젝트 보기
            </button>
          </div>
          
          <div className="dashboard-card">
            <h3>평가 진행</h3>
            <p>쌍대비교를 통한 평가를 진행합니다.</p>
            <button className="card-button">
              평가하기
            </button>
          </div>
          
          <div className="dashboard-card">
            <h3>결과 분석</h3>
            <p>평가 결과를 분석하고 리포트를 생성합니다.</p>
            <button className="card-button">
              분석 보기
            </button>
          </div>
          
          <div className="dashboard-card">
            <h3>설정</h3>
            <p>사용자 설정 및 시스템 관리</p>
            <button className="card-button">
              설정하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;