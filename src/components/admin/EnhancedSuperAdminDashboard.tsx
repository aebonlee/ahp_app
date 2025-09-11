import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';
import InteractiveCharts from '../visualization/InteractiveCharts';
import SystemManagement from './SystemManagement';
import { subscriptionService } from '../../services/subscriptionService';
import { ExtendedUser, SubscriptionPlan, UserSubscription } from '../../types/subscription';
// import { useAuth } from '../../hooks/useAuth'; // Removed - using props instead

// AEBON EXCLUSIVE PRIVILEGES - Duplicate from useAuth.tsx for display purposes
const AEBON_EXCLUSIVE_PERMISSIONS = [
  'SYSTEM_ADMIN',           // System-wide administration
  'USER_MANAGEMENT',        // Complete user lifecycle management
  'ROLE_ASSIGNMENT',        // Assign any role to any user
  'PROJECT_OVERRIDE',       // Override any project settings
  'DATA_EXPORT_ALL',        // Export all system data
  'AUDIT_LOGS',            // View all audit logs
  'SYSTEM_SETTINGS',       // Modify system-wide settings
  'DATABASE_ACCESS',       // Direct database operations
  'BACKUP_RESTORE',        // System backup and restore
  'SUBSCRIPTION_MANAGEMENT', // Manage all subscriptions
  'BILLING_ACCESS',        // Access billing information
  'ANALYTICS_FULL'         // Full analytics access
];

interface SystemStats {
  totalUsers: number;
  totalPersonalAdmins: number;
  totalProjects: number;
  activeProjects: number;
  totalEvaluations: number;
  totalRevenue: number;
  activeSubscriptions: number;
  systemUptime: string;
  storageUsed: string;
  monthlyGrowth: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  activeConnections: number;
  errors24h: number;
  successRate: number;
}

interface UserActivity {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'login' | 'project' | 'evaluation' | 'subscription' | 'admin';
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_failure' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  resolved: boolean;
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
}

interface EnhancedSuperAdminDashboardProps {
  user: ExtendedUser;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const EnhancedSuperAdminDashboard: React.FC<EnhancedSuperAdminDashboardProps> = ({
  user,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}) => {
  // Add CSS animations and responsive utilities
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Responsive helpers
  const isLg = windowWidth >= 1024;
  const isMd = windowWidth >= 768;
  const isSm = windowWidth >= 640;
  // 관리자 권한 확인 - admin 계정도 최고권한으로 처리
  const isAebon = user.first_name?.toLowerCase() === 'aebon' || 
                  user.email?.toLowerCase().includes('aebon') ||
                  user.email?.toLowerCase().includes('admin') ||
                  user.role === 'super_admin';
  const isSuperAdmin = user.role === 'super_admin';
  const canManageUsers = isSuperAdmin || isAebon;
  const canAccessSystemSettings = isSuperAdmin || isAebon;
  const hasAebonPrivilege = (privilege: string) => isAebon;
  
  const [activeMenu, setActiveMenu] = useState<string>(
    externalActiveTab || 'overview'
  );
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPersonalAdmins: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalEvaluations: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    systemUptime: '0일',
    storageUsed: '0MB',
    monthlyGrowth: 0
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    responseTime: 0,
    activeConnections: 0,
    errors24h: 0,
    successRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30초

  // 외부 탭 변경 감지
  useEffect(() => {
    if (externalActiveTab) {
      setActiveMenu(externalActiveTab);
    }
  }, [externalActiveTab]);

  const handleTabChange = (tab: string) => {
    setActiveMenu(tab);
    if (externalOnTabChange) {
      externalOnTabChange(tab);
    }
  };

  // 데이터 로딩
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 구독 통계
      const subscriptionStats = await subscriptionService.getSubscriptionStats();
      const allSubscriptions = await subscriptionService.getAllSubscriptions();
      const availablePlans = await subscriptionService.getAvailablePlans().catch(() => 
        subscriptionService.getDefaultPlans()
      );

      setSubscriptions(allSubscriptions);
      setPlans(availablePlans);

      // 시스템 통계 (실제로는 API에서 가져옴)
      setStats({
        totalUsers: 847,
        totalPersonalAdmins: 156,
        totalProjects: 2341,
        activeProjects: 892,
        totalEvaluations: 15647,
        totalRevenue: subscriptionStats.totalRevenue || 2847350,
        activeSubscriptions: subscriptionStats.totalActiveSubscriptions || 134,
        systemUptime: '99.8%',
        storageUsed: '2.3GB',
        monthlyGrowth: subscriptionStats.monthlyGrowth || 12.5
      });

      // 시스템 메트릭 (실제로는 모니터링 API에서 가져옴)
      setSystemMetrics({
        cpu: Math.random() * 60 + 20,
        memory: Math.random() * 40 + 40,
        responseTime: Math.random() * 200 + 100,
        activeConnections: Math.floor(Math.random() * 500 + 200),
        errors24h: Math.floor(Math.random() * 10),
        successRate: 99.2 + Math.random() * 0.7
      });

      // 최근 활동 (샘플 데이터)
      setRecentActivity([
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          userId: 'u123',
          userName: '김관리자',
          action: '새 프로젝트 생성',
          category: 'project',
          details: 'AI 도구 선택 프로젝트',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/91.0',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          userId: 'u456',
          userName: '이평가자',
          action: '쌍대비교 완료',
          category: 'evaluation',
          details: '기준 A vs B 평가',
          ipAddress: '192.168.1.101',
          userAgent: 'Firefox/89.0',
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          userId: 'u789',
          userName: '박개인관리자',
          action: '구독 플랜 업그레이드',
          category: 'subscription',
          details: '기본 → 프로페셔널',
          ipAddress: '192.168.1.102',
          userAgent: 'Safari/14.1',
          status: 'success'
        }
      ]);

      // 보안 이벤트 (샘플 데이터)
      setSecurityEvents([
        {
          id: 's1',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          type: 'login_failure',
          severity: 'medium',
          description: '5회 연속 로그인 실패',
          userId: 'u999',
          ipAddress: '192.168.1.200',
          resolved: false
        },
        {
          id: 's2',
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          type: 'suspicious_activity',
          severity: 'high',
          description: '비정상적인 API 호출 패턴',
          ipAddress: '10.0.0.50',
          resolved: true
        }
      ]);

      // 성능 데이터 (24시간)
      const hours = 24;
      const performanceMetrics: PerformanceMetric[] = [];
      for (let i = hours; i >= 0; i--) {
        performanceMetrics.push({
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          responseTime: Math.random() * 200 + 100,
          throughput: Math.random() * 1000 + 500,
          errorRate: Math.random() * 2,
          activeUsers: Math.floor(Math.random() * 200 + 100)
        });
      }
      setPerformanceData(performanceMetrics);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    
    // 자동 새로고침 설정
    const interval = setInterval(loadDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadDashboardData, refreshInterval]);

  // 실시간 메트릭 업데이트
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 50),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20))
      }));
    }, 5000);

    return () => clearInterval(metricsInterval);
  }, []);

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 주요 통계 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <Card title="총 사용자">
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: '#3b82f6',
              marginBottom: '0.25rem'
            }}>
              {stats.totalUsers.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              개인관리자: {stats.totalPersonalAdmins}명
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              marginTop: '0.25rem'
            }}>
              +{stats.monthlyGrowth}% 이번 달
            </div>
          </div>
        </Card>

        <Card title="프로젝트">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#10b981'
            }}>{stats.totalProjects.toLocaleString()}</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              활성: {stats.activeProjects.toLocaleString()}개
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '0.5rem',
              marginTop: '0.5rem'
            }}>
              <div 
                style={{
                  backgroundColor: '#10b981',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  width: `${(stats.activeProjects / stats.totalProjects) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </Card>

        <Card title="수익">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#9333ea'
            }}>
              ₩{stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>
              활성 구독: {stats.activeSubscriptions}개
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              marginTop: '0.25rem'
            }}>
              월 성장률: {stats.monthlyGrowth}%
            </div>
          </div>
        </Card>

        <Card title="시스템 상태">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#ea580c'
            }}>{stats.systemUptime}</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem'
            }}>가동률</div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <span>CPU: {systemMetrics.cpu.toFixed(1)}%</span>
              <span>메모리: {systemMetrics.memory.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 실시간 시스템 메트릭 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isLg ? 'repeat(2, 1fr)' : '1fr',
        gap: '1.5rem'
      }}>
        <Card title="시스템 성능">
          <div style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem' }}>CPU 사용률</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>{systemMetrics.cpu.toFixed(1)}%</span>
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '0.75rem'
            }}>
              <div 
                style={{
                  height: '0.75rem',
                  borderRadius: '9999px',
                  transition: 'all 0.5s ease',
                  backgroundColor: systemMetrics.cpu > 80 ? '#ef4444' : 
                    systemMetrics.cpu > 60 ? '#eab308' : '#22c55e',
                  width: `${systemMetrics.cpu}%`
                }}
              ></div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem' }}>메모리 사용률</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>{systemMetrics.memory.toFixed(1)}%</span>
            </div>
            <div style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '0.75rem'
            }}>
              <div 
                style={{
                  height: '0.75rem',
                  borderRadius: '9999px',
                  transition: 'all 0.5s ease',
                  backgroundColor: systemMetrics.memory > 80 ? '#ef4444' : 
                    systemMetrics.memory > 60 ? '#eab308' : '#22c55e',
                  width: `${systemMetrics.memory}%`
                }}
              ></div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#3b82f6'
                }}>
                  {systemMetrics.responseTime.toFixed(0)}ms
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>평균 응답시간</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#10b981'
                }}>
                  {systemMetrics.activeConnections}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>활성 연결</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="최근 활동">
          <div style={{
            gap: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '16rem',
            overflowY: 'auto'
          }}>
            {recentActivity.map((activity, index) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  marginTop: '0.5rem',
                  backgroundColor: activity.status === 'success' ? '#22c55e' :
                    activity.status === 'warning' ? '#eab308' : '#ef4444'
                }}></div>
                <div style={{ flex: '1 1 0%' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>{activity.action}</div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    {activity.userName} • {activity.details}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.25rem'
                  }}>
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div style={{
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  paddingTop: '0.25rem',
                  paddingBottom: '0.25rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  backgroundColor: activity.category === 'project' ? '#dbeafe' :
                    activity.category === 'evaluation' ? '#dcfce7' :
                    activity.category === 'subscription' ? '#f3e8ff' : '#f3f4f6',
                  color: activity.category === 'project' ? '#1e40af' :
                    activity.category === 'evaluation' ? '#166534' :
                    activity.category === 'subscription' ? '#7c3aed' : '#374151'
                }}>
                  {activity.category}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 성능 차트 */}
      <Card title="시스템 성능 추이">
        <div style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            {(['1h', '24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                style={{
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.25rem',
                  paddingBottom: '0.25rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.375rem',
                  backgroundColor: selectedTimeRange === range ? '#3b82f6' : '#e5e7eb',
                  color: selectedTimeRange === range ? '#ffffff' : '#374151',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (selectedTimeRange !== range) {
                    e.currentTarget.style.backgroundColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTimeRange !== range) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
              >
                {range}
              </button>
            ))}
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{
              fontSize: '0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              paddingTop: '0.25rem',
              paddingBottom: '0.25rem'
            }}
          >
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
            <option value={30000}>30초</option>
            <option value={60000}>1분</option>
          </select>
        </div>
        
        <InteractiveCharts
          data={{
            labels: performanceData.slice(-12).map(d => 
              new Date(d.timestamp).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            ),
            datasets: [{
              label: '응답시간 (ms)',
              data: performanceData.slice(-12).map(d => d.responseTime / 100), // 스케일 조정
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
            }]
          }}
          chartType="line"
          title="응답시간 추이"
        />
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>사용자 관리</h2>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Button variant="secondary">사용자 내보내기</Button>
          <Button variant="primary">새 사용자 초대</Button>
        </div>
      </div>

      {/* 사용자 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMd ? 'repeat(3, 1fr)' : '1fr',
        gap: '1.5rem'
      }}>
        <Card title="고급 관리자">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>12</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>활성 계정</div>
          </div>
        </Card>
        <Card title="개인 관리자">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#10b981'
            }}>{stats.totalPersonalAdmins}</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>구독자</div>
          </div>
        </Card>
        <Card title="평가자">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#9333ea'
            }}>
              {stats.totalUsers - stats.totalPersonalAdmins - 12}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>초대된 사용자</div>
          </div>
        </Card>
      </div>

      {/* 사용자 테이블 */}
      <Card title="사용자 목록">
        <div style={{
          gap: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <input
              type="text"
              placeholder="사용자 검색..."
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                flex: '1 1 0%'
              }}
            />
            <select style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }}>
              <option value="">모든 역할</option>
              <option value="super_admin">고급 관리자</option>
              <option value="admin">관리자</option>
              <option value="service_tester">서비스 테스터</option>
              <option value="evaluator">평가자</option>
            </select>
            <select style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }}>
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              fontSize: '0.875rem'
            }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>사용자</th>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>역할</th>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>상태</th>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>가입일</th>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>마지막 로그인</th>
                  <th style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    textAlign: 'left'
                  }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {/* 샘플 사용자 데이터 */}
                {[
                  { id: '1', name: '김고급', email: 'kim@company.com', role: '고급 관리자', status: '활성', joinDate: '2024-01-15', lastLogin: '2024-03-10 09:30' },
                  { id: '2', name: '이개인', email: 'lee@startup.com', role: '개인 관리자', status: '활성', joinDate: '2024-02-01', lastLogin: '2024-03-10 14:20' },
                  { id: '3', name: '박평가', email: 'park@eval.com', role: '평가자', status: '활성', joinDate: '2024-02-15', lastLogin: '2024-03-09 16:45' }
                ].map(user => (
                  <tr key={user.id} style={{
                    borderTop: '1px solid #e5e7eb'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{user.name}</div>
                        <div style={{ color: '#6b7280' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>
                      <span style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        backgroundColor: user.role === '고급 관리자' ? '#fee2e2' :
                          user.role === '개인 관리자' ? '#dbeafe' : '#dcfce7',
                        color: user.role === '고급 관리자' ? '#991b1b' :
                          user.role === '개인 관리자' ? '#1e40af' : '#166534'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>
                      <span style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        backgroundColor: user.status === '활성' ? '#dcfce7' :
                          user.status === '비활성' ? '#f3f4f6' : '#fef3c7',
                        color: user.status === '활성' ? '#166534' :
                          user.status === '비활성' ? '#374151' : '#92400e'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>{user.joinDate}</td>
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>{user.lastLogin}</td>
                    <td style={{
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.25rem'
                      }}>
                        <button style={{
                          color: '#3b82f6',
                          fontSize: '0.75rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1e40af'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                        >편집</button>
                        <button style={{
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                        >삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSecurityMonitoring = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>보안 모니터링</h2>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Button variant="secondary">보안 보고서</Button>
          <Button variant="primary">알림 설정</Button>
        </div>
      </div>

      {/* 보안 지표 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMd ? 'repeat(4, 1fr)' : '1fr',
        gap: '1.5rem'
      }}>
        <Card title="보안 점수">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#10b981'
            }}>94</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>/ 100</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#10b981',
              marginTop: '0.25rem'
            }}>우수</div>
          </div>
        </Card>
        <Card title="금일 로그인 실패">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#eab308'
            }}>{systemMetrics.errors24h}</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>회</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#eab308',
              marginTop: '0.25rem'
            }}>주의 필요</div>
          </div>
        </Card>
        <Card title="의심스러운 활동">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#dc2626'
            }}>2</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>건</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.25rem'
            }}>확인 필요</div>
          </div>
        </Card>
        <Card title="성공률">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {systemMetrics.successRate.toFixed(1)}%
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>24시간</div>
            <div style={{
              fontSize: '0.75rem',
              color: '#3b82f6',
              marginTop: '0.25rem'
            }}>정상</div>
          </div>
        </Card>
      </div>

      {/* 보안 이벤트 */}
      <Card title="최근 보안 이벤트">
        <div style={{
          gap: '0.75rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {securityEvents.map(event => (
            <div key={event.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '9999px',
                marginTop: '0.25rem',
                backgroundColor: event.severity === 'critical' ? '#ef4444' :
                  event.severity === 'high' ? '#f97316' :
                  event.severity === 'medium' ? '#eab308' : '#3b82f6'
              }}></div>
              <div style={{ flex: '1 1 0%' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{event.description}</div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      IP: {event.ipAddress} • {new Date(event.timestamp).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      backgroundColor: event.severity === 'critical' ? '#fee2e2' :
                        event.severity === 'high' ? '#fed7aa' :
                        event.severity === 'medium' ? '#fef3c7' : '#dbeafe',
                      color: event.severity === 'critical' ? '#991b1b' :
                        event.severity === 'high' ? '#9a3412' :
                        event.severity === 'medium' ? '#92400e' : '#1e40af'
                    }}>
                      {event.severity}
                    </span>
                    {event.resolved ? (
                      <span style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }}>
                        해결됨
                      </span>
                    ) : (
                      <button style={{
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.25rem',
                        paddingBottom: '0.25rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      >
                        처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSubscriptionManagement = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SubscriptionDashboard user={user} />
      
      {/* 추가 구독 관리 기능 */}
      <Card title="구독 플랜 관리">
        <div style={{
          gap: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h4 style={{ fontWeight: '500' }}>{plan.name}</h4>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>{plan.description}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold'
                    }}>
                      ₩{plan.price.toLocaleString()}/월
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    구독자: {subscriptions.filter(s => s.planId === plan.id).length}명
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    gap: '0.5rem',
                    display: 'flex'
                  }}>
                    <button style={{
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#1e40af'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                    >편집</button>
                    <button style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
                    >비활성화</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSystemLogs = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>시스템 로그</h2>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <select style={{
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <option value="">모든 카테고리</option>
            <option value="login">로그인</option>
            <option value="project">프로젝트</option>
            <option value="evaluation">평가</option>
            <option value="subscription">구독</option>
            <option value="admin">관리</option>
          </select>
          <Button variant="secondary">로그 내보내기</Button>
        </div>
      </div>

      <Card title="활동 로그">
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            fontSize: '0.875rem'
          }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>시간</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>사용자</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>동작</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>카테고리</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>상태</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>IP 주소</th>
                <th style={{
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  textAlign: 'left'
                }}>상세</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={activity.id} style={{
                  borderTop: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>{activity.userName}</td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>{activity.action}</td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>
                    <span style={{
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      backgroundColor: activity.category === 'project' ? '#dbeafe' :
                        activity.category === 'evaluation' ? '#dcfce7' :
                        activity.category === 'subscription' ? '#f3e8ff' : '#f3f4f6',
                      color: activity.category === 'project' ? '#1e40af' :
                        activity.category === 'evaluation' ? '#166534' :
                        activity.category === 'subscription' ? '#7c3aed' : '#374151'
                    }}>
                      {activity.category}
                    </span>
                  </td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>
                    <span style={{
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      backgroundColor: activity.status === 'success' ? '#dcfce7' :
                        activity.status === 'warning' ? '#fef3c7' : '#fee2e2',
                      color: activity.status === 'success' ? '#166534' :
                        activity.status === 'warning' ? '#92400e' : '#991b1b'
                    }}>
                      {activity.status}
                    </span>
                  </td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}>{activity.ipAddress}</td>
                  <td style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem'
                  }}>{activity.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSystemManagement = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SystemManagement />
    </div>
  );

  // AEBON EXCLUSIVE RENDER FUNCTIONS - Only accessible by aebon
  const renderAebonControlCenter = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card title="👑 AEBON 최고 권한 제어센터" style={{
        borderColor: '#e9d5ff'
      }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #faf5ff, #eef2ff)',
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#581c87',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🎯</span>
            ULTIMATE ADMIN PRIVILEGES
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isLg ? 'repeat(3, 1fr)' : isMd ? 'repeat(2, 1fr)' : '1fr',
            gap: '1rem'
          }}>
            {AEBON_EXCLUSIVE_PERMISSIONS.map((permission, index) => (
              <div key={index} style={{
                backgroundColor: '#ffffff',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e9d5ff'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#581c87'
                  }}>{permission}</span>
                  <span style={{ color: '#22c55e' }}>✓</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            gap: '1rem'
          }}>
            <Button variant="primary" style={{
              backgroundColor: '#9333ea'
            }}>
              시스템 완전 제어
            </Button>
            <Button variant="error">
              긴급 정지
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDatabaseManagement = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card title="🗄️ 데이터베이스 직접 관리" style={{
        borderColor: '#bfdbfe'
      }}>
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }}>
          <p style={{
            color: '#1e40af',
            marginBottom: '1rem'
          }}>⚠️ 이 섹션은 aebon만 접근 가능합니다.</p>
          <div style={{
            gap: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Button variant="primary">PostgreSQL 관리</Button>
            <Button variant="secondary">데이터 백업 실행</Button>
            <Button variant="error">데이터베이스 복원</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBillingManagement = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card title="💰 빌링 및 수익 관리" style={{
        borderColor: '#bbf7d0'
      }}>
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }}>
          <p style={{
            color: '#166534',
            marginBottom: '1rem'
          }}>💎 전체 수익 및 결제 관리</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMd ? 'repeat(3, 1fr)' : '1fr',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981'
              }}>$123,456</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>총 수익</div>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>$12,345</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>이번 달 수익</div>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#9333ea'
              }}>1,234</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>활성 구독</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAdvancedAnalytics = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card title="📈 고급 분석 및 인사이트" style={{
        borderColor: '#fed7aa'
      }}>
        <div style={{
          backgroundColor: '#fff7ed',
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }}>
          <p style={{
            color: '#9a3412',
            marginBottom: '1rem'
          }}>🔍 전체 시스템 상세 분석</p>
          <div style={{
            gap: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div>사용자 행동 패턴 분석</div>
            <div>수익 최적화 제안</div>
            <div>보안 위험 요소 식별</div>
            <div>성능 개선 권고사항</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUnauthorized = () => (
    <div style={{
      gap: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card title="🚫 접근 거부" style={{
        borderColor: '#fecaca'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3.75rem',
            marginBottom: '1rem'
          }}>🚫</div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#7f1d1d',
            marginBottom: '0.5rem'
          }}>권한이 없습니다</h3>
          <p style={{ color: '#b91c1c' }}>이 섹션은 aebon 최고관리자만 접근할 수 있습니다.</p>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '16rem'
        }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '3rem',
            width: '3rem',
            borderBottom: '2px solid #3b82f6'
          }}></div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'users':
        return renderUserManagement();
      case 'security':
        return renderSecurityMonitoring();
      case 'subscriptions':
        return renderSubscriptionManagement();
      case 'logs':
        return renderSystemLogs();
      case 'system':
        return renderSystemManagement();
      // AEBON EXCLUSIVE CASES - Only aebon can access these
      case 'aebon-control':
        return isAebon ? renderAebonControlCenter() : renderUnauthorized();
      case 'database':
        return isAebon ? renderDatabaseManagement() : renderUnauthorized();
      case 'billing':
        return isAebon ? renderBillingManagement() : renderUnauthorized();
      case 'analytics':
        return isAebon ? renderAdvancedAnalytics() : renderUnauthorized();
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* 상단 네비게이션 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '80rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: isLg ? '2rem' : isSm ? '1.5rem' : '1rem',
          paddingRight: isLg ? '2rem' : isSm ? '1.5rem' : '1rem'
        }}>
          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '2.25rem',
                    marginRight: '0.75rem'
                  }}>{isAebon ? '👑' : '🛡️'}</span>
                  {isAebon ? 'AEBON 최고 관리자 대시보드' : '고급 관리자 대시보드'}
                  {isAebon && (
                    <span style={{
                      marginLeft: '0.75rem',
                      paddingLeft: '0.75rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      backgroundColor: '#9333ea',
                      borderRadius: '9999px',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}>
                      ULTIMATE ACCESS
                    </span>
                  )}
                </h1>
                <p style={{
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  {isAebon 
                    ? '🎯 시스템의 모든 권한과 기능을 완전히 제어할 수 있습니다' 
                    : '시스템 전반의 운영 상황을 모니터링하고 관리합니다'
                  }
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: systemMetrics.successRate > 99 ? '#22c55e' :
                      systemMetrics.successRate > 95 ? '#eab308' : '#ef4444'
                  }}></div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    시스템 정상 ({systemMetrics.successRate.toFixed(1)}%)
                  </span>
                </div>
                <Button variant="secondary" onClick={loadDashboardData}>
                  새로고침
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 탭 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '80rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: isLg ? '2rem' : isSm ? '1.5rem' : '1rem',
          paddingRight: isLg ? '2rem' : isSm ? '1.5rem' : '1rem'
        }}>
          <nav style={{
            display: 'flex',
            gap: '2rem'
          }}>
            {[
              { id: 'overview', name: '개요', icon: '📊' },
              { id: 'users', name: '사용자 관리', icon: '👥' },
              { id: 'subscriptions', name: '구독 관리', icon: '💳' },
              { id: 'security', name: '보안 모니터링', icon: '🔒' },
              { id: 'system', name: '시스템 관리', icon: '⚙️' },
              { id: 'logs', name: '시스템 로그', icon: '📝' },
              // AEBON EXCLUSIVE TABS - Only aebon can see these
              ...(isAebon ? [
                { id: 'aebon-control', name: '👑 AEBON 제어센터', icon: '👑' },
                { id: 'database', name: '🗄️ 데이터베이스', icon: '🗄️' },
                { id: 'billing', name: '💰 빌링 관리', icon: '💰' },
                { id: 'analytics', name: '📈 고급 분석', icon: '📈' }
              ] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  paddingLeft: '0.25rem',
                  paddingRight: '0.25rem',
                  borderBottom: `2px solid ${activeMenu === tab.id ? '#3b82f6' : 'transparent'}`,
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: activeMenu === tab.id ? '#3b82f6' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = activeMenu === tab.id ? '#3b82f6' : '#374151';
                  e.currentTarget.style.borderBottomColor = activeMenu === tab.id ? '#3b82f6' : '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = activeMenu === tab.id ? '#3b82f6' : '#6b7280';
                  e.currentTarget.style.borderBottomColor = activeMenu === tab.id ? '#3b82f6' : 'transparent';
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        maxWidth: '80rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: isLg ? '2rem' : isSm ? '1.5rem' : '1rem',
        paddingRight: isLg ? '2rem' : isSm ? '1.5rem' : '1rem',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default EnhancedSuperAdminDashboard;