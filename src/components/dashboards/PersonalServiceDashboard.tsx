import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { userManagementService } from '../../services/userManagementService';
import { PersonalServiceUser, BaseUser } from '../../types/userTypes';
import ProjectManagement from '../personal/ProjectManagement';
import AnalyticsPage from '../personal/AnalyticsPage';
import SettingsPage from '../personal/SettingsPage';
import AdminPersonalServiceDashboard from '../admin/PersonalServiceDashboard';

interface PersonalServiceDashboardProps {
  user: PersonalServiceUser | BaseUser;
  onLogout: () => void;
}

const PersonalServiceDashboard: React.FC<PersonalServiceDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 모든 hooks를 먼저 선언 (React hooks rules 준수)
  const getCurrentTab = () => {
    const pathname = location.pathname;
    if (pathname.includes('/projects')) return 'projects';
    if (pathname.includes('/analytics')) return 'analytics';
    if (pathname.includes('/settings')) return 'settings';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEvaluators: 0,
    storageUsed: 0
  });

  const loadProjectStats = async () => {
    setProjectStats({
      totalProjects: 12,
      activeProjects: 3,
      completedProjects: 9,
      totalEvaluators: 47,
      storageUsed: 2.3
    });
  };

  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);

  useEffect(() => {
    loadProjectStats();
  }, []);

  // Provide default subscription if undefined
  const personalUser = user as PersonalServiceUser;
  const safeUser = {
    ...user,
    subscription: personalUser.subscription || {
      tier: 'basic',
      status: 'trial',
      trial_ends_at: new Date().toISOString(),
      days_remaining: 30,
      storage_limit: 5,
      features: ['기본 기능'],
      limits: {
        projects: 5,
        evaluators_per_project: 10
      }
    }
  };

  // Admin 사용자인 경우 바로 완전한 PersonalService 컴포넌트 렌더링
  if (safeUser.user_type === 'admin') {
    return (
      <AdminPersonalServiceDashboard 
        user={{
          id: String(safeUser.id),
          first_name: safeUser.first_name,
          last_name: safeUser.last_name,
          email: safeUser.email,
          role: 'admin',
          admin_type: 'personal'
        }}
        projects={[]}
        activeTab="personal-service"
          onTabChange={(tab) => console.log('Tab changed:', tab)}
          onUserUpdate={(user) => console.log('User updated:', user)}
          onCreateProject={async (projectData) => {
            console.log('Creating project:', projectData);
            return { id: 'new-project', ...projectData };
          }}
          onDeleteProject={async (projectId) => {
            console.log('Deleting project:', projectId);
          }}
          onFetchCriteria={async (projectId) => {
            console.log('Fetching criteria for:', projectId);
            return [];
          }}
          onCreateCriteria={async (projectId, criteriaData) => {
            console.log('Creating criteria:', projectId, criteriaData);
            return criteriaData;
          }}
          onFetchAlternatives={async (projectId) => {
            console.log('Fetching alternatives for:', projectId);
            return [];
          }}
          onCreateAlternative={async (projectId, alternativeData) => {
            console.log('Creating alternative:', projectId, alternativeData);
            return alternativeData;
          }}
          onSaveEvaluation={async (projectId, evaluationData) => {
            console.log('Saving evaluation:', projectId, evaluationData);
            return evaluationData;
          }}
          onFetchTrashedProjects={async () => {
            console.log('Fetching trashed projects');
            return [];
          }}
          onRestoreProject={async (projectId) => {
            console.log('Restoring project:', projectId);
          }}
          onPermanentDeleteProject={async (projectId) => {
            console.log('Permanently deleting project:', projectId);
          }}
        selectedProjectId={null}
        onSelectProject={(projectId) => console.log('Selected project:', projectId)}
      />
    );
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 개인대시보드에서 로그아웃 시작');
      await onLogout();
      console.log('✅ 로그아웃 완료');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      navigate('/login');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem' 
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2563eb',
            margin: 0
          }}>
            💼 개인서비스 대시보드
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {safeUser.first_name} {safeUser.last_name} • {safeUser.subscription.tier} 플랜
          </p>
        </div>
        
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2rem'
      }}>
      {[
        { id: 'overview', label: '개요', icon: '📊', path: '/personal' },
        { id: 'projects', label: '프로젝트', icon: '📋', path: '/personal/projects' },
        { id: 'analytics', label: '분석', icon: '📈', path: '/personal/analytics' },
        { id: 'settings', label: '설정', icon: '⚙️', path: '/personal/settings' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            navigate(tab.path);
          }}
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === tab.id ? '#2563eb' : 'var(--text-secondary)',
            fontWeight: activeTab === tab.id ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
      </div>

      {/* 라우팅 */}
      <Routes>
        <Route path="/" element={(
          <>
            {/* 통계 카드들 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <Card title="총 프로젝트" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '0.5rem'
                  }}>
                    {projectStats.totalProjects}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    생성된 전체 프로젝트
                  </p>
                </div>
              </Card>
              
              <Card title="진행 중" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '0.5rem'
                  }}>
                    {projectStats.activeProjects}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    현재 진행 중인 프로젝트
                  </p>
                </div>
              </Card>
              
              <Card title="참여 평가자" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '0.5rem'
                  }}>
                    {projectStats.totalEvaluators}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    총 참여 평가자 수
                  </p>
                </div>
              </Card>
              
              <Card title="저장 공간" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '0.5rem'
                  }}>
                    {projectStats.storageUsed}GB
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    사용 중인 저장 공간
                  </p>
                </div>
              </Card>
            </div>

            {/* 빠른 액션 */}
            <Card title="빠른 액션" variant="elevated" style={{ marginTop: '2rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <Button variant="primary" style={{ justifyContent: 'center' }}>
                  🆕 새 프로젝트 생성
                </Button>
                <Button variant="secondary" style={{ justifyContent: 'center' }}>
                  👥 평가자 초대
                </Button>
                <Button variant="secondary" style={{ justifyContent: 'center' }}>
                  📊 결과 분석
                </Button>
                <Button variant="ghost" style={{ justifyContent: 'center' }}>
                  📋 템플릿 관리
                </Button>
              </div>
            </Card>
          </>
        )} />
        
        <Route path="projects" element={<ProjectManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        <Route path="*" element={<Navigate to="/personal" replace />} />
      </Routes>
    </div>
  );
};

export default PersonalServiceDashboard;