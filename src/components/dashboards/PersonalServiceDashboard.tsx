import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { userManagementService } from '../../services/userManagementService';
import { PersonalServiceUser } from '../../types/userTypes';

interface PersonalServiceDashboardProps {
  user: PersonalServiceUser;
}

const PersonalServiceDashboard: React.FC<PersonalServiceDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEvaluators: 0,
    storageUsed: 0
  });

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
    window.location.href = '/login';
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
            {user.first_name} {user.last_name} • {user.subscription.tier} 플랜
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: getSubscriptionStatusColor(user.subscription.status),
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {getSubscriptionStatusText(user.subscription.status)}
          </div>
          
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
      {user.subscription.status === 'trial' && (
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
                체험 종료일: {user.subscription.trial_ends_at} • 남은 일수: {user.subscription.days_remaining}일
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
          { id: 'overview', label: '개요', icon: '📊' },
          { id: 'projects', label: '프로젝트', icon: '📋' },
          { id: 'analytics', label: '분석', icon: '📈' },
          { id: 'settings', label: '설정', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* 탭 콘텐츠 */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {activeTab === 'overview' && (
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
                      width: `${(projectStats.storageUsed / user.subscription.storage_limit) * 100}%`,
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
                    현재 플랜: {user.subscription.tier.toUpperCase()}
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>프로젝트</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {projectStats.totalProjects} / {user.subscription.limits.projects === 999 ? '무제한' : user.subscription.limits.projects}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>평가자</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {user.subscription.limits.evaluators_per_project}명/프로젝트
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>저장공간</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {projectStats.storageUsed}GB / {user.subscription.storage_limit}GB
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
                    {user.subscription.features.slice(0, 5).map((feature, index) => (
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
        )}

        {activeTab === 'projects' && (
          <Card title="프로젝트 관리" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                프로젝트 관리 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                AHP 프로젝트를 생성하고 관리할 수 있는 기능이 곧 추가됩니다.
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card title="분석 대시보드" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                분석 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                프로젝트별 상세 분석과 인사이트를 제공할 예정입니다.
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card title="계정 설정" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                설정 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                프로필 수정, 결제 정보, 알림 설정 등을 관리할 수 있습니다.
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalServiceDashboard;