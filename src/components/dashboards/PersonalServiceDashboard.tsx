import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Navigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { userManagementService } from '../../services/userManagementService';
import { PersonalServiceUser, BaseUser } from '../../types/userTypes';
import ProjectManagement from '../personal/ProjectManagement';
import AnalyticsPage from '../personal/AnalyticsPage';
import SettingsPage from '../personal/SettingsPage';

interface PersonalServiceDashboardProps {
  user: PersonalServiceUser | BaseUser;
}

const PersonalServiceDashboard: React.FC<PersonalServiceDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // URL에서 관리자가 특정 사용자를 조회하는지 확인
  const targetUserId = searchParams.get('user');
  const isAdminViewing = user.user_type === 'admin' && targetUserId;
  
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

  // 현재 경로에 따라 activeTab 결정
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

  // 경로 변경 시 activeTab 업데이트
  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);

  useEffect(() => {
    loadProjectStats();
  }, []);

  const loadProjectStats = async () => {
    // 실제로는 API 호출
    setProjectStats({
      totalProjects: 12,
      activeProjects: 3,
      completedProjects: 9,
      totalEvaluators: 47,
      storageUsed: 2.3
    });
  };

  const handleLogout = async () => {
    await userManagementService.logout();
    navigate('/login');
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'trial': return '#3b82f6';
      case 'expired': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active': return '정상 구독';
      case 'trial': return '무료 체험';
      case 'expired': return '구독 만료';
      case 'cancelled': return '구독 취소';
      default: return '알 수 없음';
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
            {safeUser.user_type === 'admin' && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                🎯 슈퍼관리자 모드
              </span>
            )}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: getSubscriptionStatusColor(safeUser.subscription.status),
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {getSubscriptionStatusText(safeUser.subscription.status)}
          </div>
          
          {safeUser.user_type === 'admin' && (
            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  const mode = e.target.value;
                  console.log('🔄 모드 전환 요청:', mode);
                  
                  if (mode === 'personal') {
                    console.log('✅ 이미 개인서비스 모드입니다');
                    return; // 현재 페이지 유지
                  }
                  
                  if (mode === 'super-admin') {
                    console.log('🎯 슈퍼관리자 모드로 전환');
                    // 슈퍼관리자 전용 기능 활성화 (추후 구현 가능)
                    alert('🎯 슈퍼관리자 모드 활성화됨\n(모든 고급 기능에 접근 가능)');
                    return;
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                }}
                defaultValue="personal"
              >
                <option value="personal">💼 개인서비스 모드</option>
                <option value="super-admin">🎯 슈퍼관리자 모드</option>
              </select>
            </div>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>

      {/* 구독 상태 알림 */}
      {safeUser.subscription.status === 'trial' && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                margin: 0,
                fontWeight: '600'
              }}>
                🎉 무료 체험 중입니다!
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: '#3730a3',
                margin: '0.25rem 0 0 0'
              }}>
                체험 종료일: {safeUser.subscription.trial_ends_at} • 남은 일수: {safeUser.subscription.days_remaining}일
              </p>
            </div>
            <Button variant="primary" size="sm">
              유료 플랜 선택
            </Button>
          </div>
        </div>
      )}

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

      {/* 라우트 기반 콘텐츠 */}
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
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '2px',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: `${(projectStats.storageUsed / safeUser.subscription.storage_limit) * 100}%`,
                      height: '100%',
                      backgroundColor: '#dc2626',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              </Card>
            </div>

            {/* 구독 정보 */}
            <Card title="구독 정보" variant="bordered">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    현재 플랜: {safeUser.subscription.tier.toUpperCase()}
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>프로젝트</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {projectStats.totalProjects} / {safeUser.subscription.limits.projects === 999 ? '무제한' : safeUser.subscription.limits.projects}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>평가자</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {safeUser.subscription.limits.evaluators_per_project}명/프로젝트
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>저장공간</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {projectStats.storageUsed}GB / {safeUser.subscription.storage_limit}GB
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}>
                    이용 가능 기능
                  </h4>
                  
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: '0.25rem'
                  }}>
                    {safeUser.subscription.features.slice(0, 5).map((feature, index) => (
                      <li key={index} style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        paddingLeft: '1rem',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          color: '#10b981'
                        }}>
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* 빠른 액션 */}
            <Card title="빠른 액션" variant="elevated">
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
        
        {/* 기본 리다이렉트 - 대시보드 내 경로만 처리 */}
        <Route path="*" element={
          // 대시보드 내의 잘못된 경로는 개요로 리다이렉트
          <Navigate to="/personal" replace />
        } />
      </Routes>
    </div>
  );
};

export default PersonalServiceDashboard;