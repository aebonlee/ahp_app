import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';
import InteractiveCharts from '../visualization/InteractiveCharts';
import SystemManagement from './SystemManagement';
import { subscriptionService } from '../../services/subscriptionService';
import { ExtendedUser, SubscriptionPlan, UserSubscription } from '../../types/subscription';

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
    <div className="space-y-6">
      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="총 사용자">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">
              개인관리자: {stats.totalPersonalAdmins}명
            </div>
            <div className="text-xs text-green-600 mt-1">
              +{stats.monthlyGrowth}% 이번 달
            </div>
          </div>
        </Card>

        <Card title="프로젝트">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalProjects.toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-1">
              활성: {stats.activeProjects.toLocaleString()}개
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(stats.activeProjects / stats.totalProjects) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card title="수익">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              ₩{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              활성 구독: {stats.activeSubscriptions}개
            </div>
            <div className="text-xs text-green-600 mt-1">
              월 성장률: {stats.monthlyGrowth}%
            </div>
          </div>
        </Card>

        <Card title="시스템 상태">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.systemUptime}</div>
            <div className="text-sm text-gray-600 mt-1">가동률</div>
            <div className="flex justify-between text-xs mt-2">
              <span>CPU: {systemMetrics.cpu.toFixed(1)}%</span>
              <span>메모리: {systemMetrics.memory.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 실시간 시스템 메트릭 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="시스템 성능">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">CPU 사용률</span>
              <span className="text-sm font-medium">{systemMetrics.cpu.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  systemMetrics.cpu > 80 ? 'bg-red-500' : 
                  systemMetrics.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemMetrics.cpu}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">메모리 사용률</span>
              <span className="text-sm font-medium">{systemMetrics.memory.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  systemMetrics.memory > 80 ? 'bg-red-500' : 
                  systemMetrics.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemMetrics.memory}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {systemMetrics.responseTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-600">평균 응답시간</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {systemMetrics.activeConnections}
                </div>
                <div className="text-xs text-gray-600">활성 연결</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="최근 활동">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-gray-600">
                    {activity.userName} • {activity.details}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  activity.category === 'project' ? 'bg-blue-100 text-blue-800' :
                  activity.category === 'evaluation' ? 'bg-green-100 text-green-800' :
                  activity.category === 'subscription' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.category}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 성능 차트 */}
      <Card title="시스템 성능 추이">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {(['1h', '24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTimeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">사용자 관리</h2>
        <div className="flex space-x-2">
          <Button variant="secondary">사용자 내보내기</Button>
          <Button variant="primary">새 사용자 초대</Button>
        </div>
      </div>

      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="고급 관리자">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">활성 계정</div>
          </div>
        </Card>
        <Card title="개인 관리자">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPersonalAdmins}</div>
            <div className="text-sm text-gray-600">구독자</div>
          </div>
        </Card>
        <Card title="평가자">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalUsers - stats.totalPersonalAdmins - 12}
            </div>
            <div className="text-sm text-gray-600">초대된 사용자</div>
          </div>
        </Card>
      </div>

      {/* 사용자 테이블 */}
      <Card title="사용자 목록">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="사용자 검색..."
              className="border rounded px-3 py-2 flex-1"
            />
            <select className="border rounded px-3 py-2">
              <option value="">모든 역할</option>
              <option value="super_admin">고급 관리자</option>
              <option value="personal_admin">개인 관리자</option>
              <option value="evaluator">평가자</option>
            </select>
            <select className="border rounded px-3 py-2">
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">사용자</th>
                  <th className="px-4 py-2 text-left">역할</th>
                  <th className="px-4 py-2 text-left">상태</th>
                  <th className="px-4 py-2 text-left">가입일</th>
                  <th className="px-4 py-2 text-left">마지막 로그인</th>
                  <th className="px-4 py-2 text-left">관리</th>
                </tr>
              </thead>
              <tbody>
                {/* 샘플 사용자 데이터 */}
                {[
                  { id: '1', name: '김고급', email: 'kim@company.com', role: '고급 관리자', status: '활성', joinDate: '2024-01-15', lastLogin: '2024-03-10 09:30' },
                  { id: '2', name: '이개인', email: 'lee@startup.com', role: '개인 관리자', status: '활성', joinDate: '2024-02-01', lastLogin: '2024-03-10 14:20' },
                  { id: '3', name: '박평가', email: 'park@eval.com', role: '평가자', status: '활성', joinDate: '2024-02-15', lastLogin: '2024-03-09 16:45' }
                ].map(user => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === '고급 관리자' ? 'bg-red-100 text-red-800' :
                        user.role === '개인 관리자' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === '활성' ? 'bg-green-100 text-green-800' :
                        user.status === '비활성' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{user.joinDate}</td>
                    <td className="px-4 py-2">{user.lastLogin}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-1">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">편집</button>
                        <button className="text-red-600 hover:text-red-800 text-xs">삭제</button>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">보안 모니터링</h2>
        <div className="flex space-x-2">
          <Button variant="secondary">보안 보고서</Button>
          <Button variant="primary">알림 설정</Button>
        </div>
      </div>

      {/* 보안 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="보안 점수">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">94</div>
            <div className="text-sm text-gray-600">/ 100</div>
            <div className="text-xs text-green-600 mt-1">우수</div>
          </div>
        </Card>
        <Card title="금일 로그인 실패">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{systemMetrics.errors24h}</div>
            <div className="text-sm text-gray-600">회</div>
            <div className="text-xs text-yellow-600 mt-1">주의 필요</div>
          </div>
        </Card>
        <Card title="의심스러운 활동">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">2</div>
            <div className="text-sm text-gray-600">건</div>
            <div className="text-xs text-red-600 mt-1">확인 필요</div>
          </div>
        </Card>
        <Card title="성공률">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {systemMetrics.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">24시간</div>
            <div className="text-xs text-blue-600 mt-1">정상</div>
          </div>
        </Card>
      </div>

      {/* 보안 이벤트 */}
      <Card title="최근 보안 이벤트">
        <div className="space-y-3">
          {securityEvents.map(event => (
            <div key={event.id} className="flex items-start space-x-3 p-4 border rounded">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                event.severity === 'critical' ? 'bg-red-500' :
                event.severity === 'high' ? 'bg-orange-500' :
                event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{event.description}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      IP: {event.ipAddress} • {new Date(event.timestamp).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.severity}
                    </span>
                    {event.resolved ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        해결됨
                      </span>
                    ) : (
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
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
    <div className="space-y-6">
      <SubscriptionDashboard user={user} />
      
      {/* 추가 구독 관리 기능 */}
      <Card title="구독 플랜 관리">
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{plan.name}</h4>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                  <div className="mt-2">
                    <span className="text-lg font-bold">
                      ₩{plan.price.toLocaleString()}/월
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    구독자: {subscriptions.filter(s => s.planId === plan.id).length}명
                  </div>
                  <div className="mt-2 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">편집</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">비활성화</button>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">시스템 로그</h2>
        <div className="flex space-x-2">
          <select className="border rounded px-3 py-2 text-sm">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">시간</th>
                <th className="px-4 py-2 text-left">사용자</th>
                <th className="px-4 py-2 text-left">동작</th>
                <th className="px-4 py-2 text-left">카테고리</th>
                <th className="px-4 py-2 text-left">상태</th>
                <th className="px-4 py-2 text-left">IP 주소</th>
                <th className="px-4 py-2 text-left">상세</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={activity.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-2">{activity.userName}</td>
                  <td className="px-4 py-2">{activity.action}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      activity.category === 'project' ? 'bg-blue-100 text-blue-800' :
                      activity.category === 'evaluation' ? 'bg-green-100 text-green-800' :
                      activity.category === 'subscription' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.category}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{activity.ipAddress}</td>
                  <td className="px-4 py-2">{activity.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSystemManagement = () => (
    <SystemManagement className="space-y-6" />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <span className="text-4xl mr-3">🛡️</span>
                  고급 관리자 대시보드
                </h1>
                <p className="text-gray-600 mt-2">시스템 전반의 운영 상황을 모니터링하고 관리합니다</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemMetrics.successRate > 99 ? 'bg-green-500' :
                    systemMetrics.successRate > 95 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: '개요', icon: '📊' },
              { id: 'users', name: '사용자 관리', icon: '👥' },
              { id: 'subscriptions', name: '구독 관리', icon: '💳' },
              { id: 'security', name: '보안 모니터링', icon: '🔒' },
              { id: 'system', name: '시스템 관리', icon: '⚙️' },
              { id: 'logs', name: '시스템 로그', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeMenu === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default EnhancedSuperAdminDashboard;