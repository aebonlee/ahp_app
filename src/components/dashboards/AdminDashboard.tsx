import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { userManagementService } from '../../services/userManagementService';
import { AdminUser } from '../../types/userTypes';
import EnhancedSuperAdminDashboard from '../admin/EnhancedSuperAdminDashboard';

interface AdminDashboardProps {
  user: AdminUser;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeSubscriptions: 0,
    systemStatus: 'healthy' as 'healthy' | 'warning' | 'critical'
  });

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    // 실제로는 API 호출
    setSystemStats({
      totalUsers: 1247,
      totalProjects: 892,
      activeSubscriptions: 156,
      systemStatus: 'healthy'
    });
  };

  const handleLogout = async () => {
    try {
      // Django 로그아웃 API 호출
      await fetch(`${process.env.REACT_APP_API_URL || 'https://ahp-django-backend.onrender.com'}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
    navigate('/login');
  };

  // 관리자 권한 확인 (admin 계정도 aebon처럼 처리)
  const isAebonUser = user.username?.toLowerCase() === 'aebon' || user.username?.toLowerCase() === 'admin';
  const isSuperAdmin = user.user_type === 'admin';
  
  if (isAebonUser || isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        {/* 헤더 */}
        <header style={{
          backgroundColor: 'var(--card-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              🛡️ 슈퍼 관리자 대시보드
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {user.first_name} {user.last_name} ({user.username})
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: isAebonUser ? '#dc2626' : '#059669',
              color: 'white',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {isAebonUser ? 'AEBON 계정' : '슈퍼 관리자'}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </header>

        {/* 슈퍼 관리자 대시보드 */}
        <EnhancedSuperAdminDashboard
          user={{
            id: String(user.id),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: 'super_admin' as const,
            subscription: undefined,
            parentAdminId: undefined,
            createdBy: undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    );
  }

  // 일반 관리자 대시보드
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
            color: '#dc2626',
            margin: 0
          }}>
            🛡️ 관리자 대시보드
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            {user.first_name} {user.last_name} • {user.admin_role === 'system_admin' ? '시스템 관리자' : '콘텐츠 관리자'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {user.admin_role === 'system_admin' ? '시스템 관리자' : '콘텐츠 관리자'}
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

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'overview', label: '개요', icon: '📊' },
          { id: 'users', label: '사용자 관리', icon: '👥' },
          { id: 'projects', label: '프로젝트 관리', icon: '📋' },
          { id: 'content', label: '콘텐츠 관리', icon: '📝' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
              color: activeTab === tab.id ? '#dc2626' : 'var(--text-secondary)',
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
            {/* 시스템 상태 카드들 */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <Card title="총 사용자 수" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '0.5rem'
                  }}>
                    {systemStats.totalUsers.toLocaleString()}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    전체 등록된 사용자
                  </p>
                </div>
              </Card>
              
              <Card title="진행 중인 프로젝트" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '0.5rem'
                  }}>
                    {systemStats.totalProjects.toLocaleString()}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    활성 AHP 프로젝트
                  </p>
                </div>
              </Card>
              
              <Card title="활성 구독" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '0.5rem'
                  }}>
                    {systemStats.activeSubscriptions.toLocaleString()}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    유료 구독 사용자
                  </p>
                </div>
              </Card>
              
              <Card title="시스템 상태" variant="elevated">
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    {systemStats.systemStatus === 'healthy' ? '🟢' : 
                     systemStats.systemStatus === 'warning' ? '🟡' : '🔴'}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    {systemStats.systemStatus === 'healthy' ? '정상 작동' :
                     systemStats.systemStatus === 'warning' ? '주의 필요' : '점검 필요'}
                  </p>
                </div>
              </Card>
            </div>

            {/* 권한 정보 */}
            <Card title="관리자 권한" variant="bordered">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    현재 권한
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {user.permissions.slice(0, 5).map((permission, index) => (
                      <li key={index} style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem',
                        paddingLeft: '1rem',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          color: '#059669'
                        }}>
                          ✓
                        </span>
                        {permission.name}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    관리 범위
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {user.admin_role === 'system_admin' 
                      ? '시스템 전반의 사용자 관리, 프로젝트 감독, 기술 지원을 담당합니다.'
                      : '콘텐츠 관리, 평가자 지원, 프로젝트 운영을 담당합니다.'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'users' && (
          <Card title="사용자 관리" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                사용자 관리 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                {user.admin_role === 'system_admin' 
                  ? '모든 사용자 계정을 관리할 수 있습니다.'
                  : '평가자 및 콘텐츠 사용자를 관리할 수 있습니다.'
                }
              </div>
            </div>
          </Card>
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
                진행 중인 AHP 프로젝트들을 모니터링하고 지원할 수 있습니다.
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'content' && (
          <Card title="콘텐츠 관리" variant="elevated">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem'
              }}>
                콘텐츠 관리 기능을 개발 중입니다.
              </p>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                시스템 콘텐츠, 도움말, 공지사항을 관리할 수 있습니다.
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;