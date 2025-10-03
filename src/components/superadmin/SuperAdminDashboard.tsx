import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import dataService from '../../services/dataService_clean';
import { projectApi } from '../../services/api';

interface SuperAdminDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

interface Activity {
  time: string;
  user: string;
  action: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onTabChange }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeEvaluations: 0,
    systemHealth: 'healthy',
    databaseSize: '0 MB',
    serverUptime: '0 days',
    cpuUsage: 0,
    memoryUsage: 0,
    requestsPerMinute: 0,
    errorRate: 0
  });
  
  const [usersByRole, setUsersByRole] = useState({
    super_admin: 0,
    service_admin: 0,
    service_user: 0,
    evaluator: 0
  });

  const getRecentActivities = (): Activity[] => {
    const recentActivities: Activity[] = [];
    
    // localStorage에서 최근 활동 추출
    try {
      // 로그인 기록
      const loginHistory = JSON.parse(localStorage.getItem('ahp_login_history') || '[]');
      loginHistory.slice(-3).forEach((login: any) => {
        const time = new Date(login.timestamp);
        const timeDiff = Date.now() - time.getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const hours = Math.floor(minutes / 60);
        
        recentActivities.push({
          time: hours > 0 ? `${hours}시간 전` : `${minutes}분 전`,
          user: login.email || 'unknown',
          action: '로그인',
          type: 'info'
        });
      });

      // 프로젝트 생성 기록
      const projects = JSON.parse(localStorage.getItem('ahp_projects') || '[]');
      const recentProjects = projects
        .filter((p: any) => p.created_at)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2);
      
      recentProjects.forEach((project: any) => {
        const time = new Date(project.created_at);
        const timeDiff = Date.now() - time.getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        recentActivities.push({
          time: days > 0 ? `${days}일 전` : hours > 0 ? `${hours}시간 전` : `${minutes}분 전`,
          user: project.created_by || user.email,
          action: `프로젝트 '${project.title}' 생성`,
          type: 'success'
        });
      });

      // 시스템 활동
      recentActivities.push({
        time: '방금 전',
        user: 'system',
        action: '시스템 상태 점검',
        type: 'info'
      });

      // 현재 세션
      recentActivities.unshift({
        time: '현재',
        user: user.email,
        action: '슈퍼 관리자 대시보드 접속',
        type: 'success'
      });

    } catch (error) {
      console.error('활동 로그 로딩 실패:', error);
    }

    // 기본 활동 추가 (활동이 없는 경우)
    if (recentActivities.length === 0) {
      recentActivities.push({
        time: '방금 전',
        user: user.email,
        action: '시스템 접속',
        type: 'info'
      });
    }

    return recentActivities.slice(0, 10); // 최대 10개만 표시
  };

  useEffect(() => {
    loadSystemStats();
    loadUserStatsByRole();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      loadSystemStats();
      loadUserStatsByRole();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = async () => {
    try {
      // 실제 데이터 가져오기
      const projects = await projectApi.getProjects();
      
      // localStorage에서 사용자 데이터 가져오기
      const users = JSON.parse(localStorage.getItem('ahp_users') || '[]');

      // localStorage에서 추가 데이터 가져오기
      const allStorageKeys = Object.keys(localStorage);
      const evaluationKeys = allStorageKeys.filter(key => key.includes('evaluation'));
      const activeEvaluations = evaluationKeys.filter(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return data.status === 'in_progress' || data.status === 'pending';
        } catch {
          return false;
        }
      }).length;

      // 스토리지 크기 계산
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

      // 세션 시작 시간 계산
      const sessionStart = localStorage.getItem('ahp_session_start') || new Date().toISOString();
      const uptimeDays = Math.floor((new Date().getTime() - new Date(sessionStart).getTime()) / (1000 * 60 * 60 * 24));

      // 실시간 성능 메트릭 (시뮬레이션)
      const performanceData = performance.getEntriesByType('navigation')[0] as any;
      const memoryInfo = (performance as any).memory;
      
      setSystemStats({
        totalUsers: users?.length || 0,
        totalProjects: projects?.length || 0,
        activeEvaluations: activeEvaluations,
        systemHealth: parseFloat(sizeInMB) < 5 ? 'healthy' : 'warning',
        databaseSize: `${sizeInMB} MB`,
        serverUptime: `${uptimeDays || 0} days`,
        cpuUsage: Math.floor(Math.random() * 30 + 20), // 실제 CPU 사용량은 브라우저에서 직접 접근 불가
        memoryUsage: memoryInfo ? Math.floor((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100) : 45,
        requestsPerMinute: Math.floor(Math.random() * 50 + 80),
        errorRate: 0.1
      });
    } catch (error) {
      console.error('시스템 통계 로딩 실패:', error);
      // 에러 시 기본값 사용
      setSystemStats(prev => ({
        ...prev,
        systemHealth: 'warning'
      }));
    }
  };

  const loadUserStatsByRole = async () => {
    try {
      // localStorage에서 사용자 데이터 가져오기
      const users = JSON.parse(localStorage.getItem('ahp_users') || '[]');
      
      const roleCount = {
        super_admin: 0,
        service_admin: 0,
        service_user: 0,
        evaluator: 0
      };

      users?.forEach((user: any) => {
        if (user.role && roleCount.hasOwnProperty(user.role)) {
          roleCount[user.role as keyof typeof roleCount]++;
        }
      });

      // localStorage에서 추가 사용자 데이터 확인
      const localUsers = JSON.parse(localStorage.getItem('ahp_users') || '[]');
      localUsers.forEach((user: any) => {
        if (user.role && roleCount.hasOwnProperty(user.role)) {
          roleCount[user.role as keyof typeof roleCount]++;
        }
      });

      setUsersByRole(roleCount);
    } catch (error) {
      console.error('사용자 통계 로딩 실패:', error);
      // 에러 시 최소값 표시
      setUsersByRole({
        super_admin: 1, // 현재 사용자
        service_admin: 0,
        service_user: 0,
        evaluator: 0
      });
    }
  };

  const quickActions = [
    {
      id: 'role-switch',
      title: '역할 전환 테스트',
      description: '다른 사용자 역할로 시스템 테스트',
      icon: '🔄',
      color: 'var(--accent-primary)',
      actions: [
        { label: '서비스 관리자', onClick: () => onTabChange('role-switch-admin') },
        { label: '서비스 사용자', onClick: () => onTabChange('role-switch-user') },
        { label: '평가자', onClick: () => onTabChange('role-switch-evaluator') }
      ]
    },
    {
      id: 'system-management',
      title: '시스템 관리',
      description: '핵심 시스템 관리 도구',
      icon: '⚙️',
      color: 'var(--accent-secondary)',
      actions: [
        { label: '시스템 정보', onClick: () => onTabChange('system-info') },
        { label: '시스템 설정', onClick: () => onTabChange('system-settings') },
        { label: '시스템 초기화', onClick: () => onTabChange('system-reset') }
      ]
    },
    {
      id: 'monitoring',
      title: '모니터링',
      description: '실시간 시스템 모니터링',
      icon: '📊',
      color: 'var(--accent-tertiary)',
      actions: [
        { label: '시스템 모니터링', onClick: () => onTabChange('system-monitoring') },
        { label: '전체 프로젝트', onClick: () => onTabChange('all-projects') },
        { label: '사용자 관리', onClick: () => onTabChange('users') }
      ]
    },
    {
      id: 'integration',
      title: '연동 관리',
      description: '외부 시스템 연동 관리',
      icon: '🔗',
      color: 'var(--accent-quaternary)',
      actions: [
        { label: '연결 테스트', onClick: () => onTabChange('connection-test') },
        { label: 'Django Admin', onClick: () => window.open('https://ahp-django-backend.onrender.com/admin/', '_blank') },
        { label: 'API 문서', onClick: () => window.open('/api/docs', '_blank') }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              👑 슈퍼 관리자 대시보드
            </h1>
            <p className="text-lg opacity-90">
              전체 시스템을 관리하고 모니터링하는 최고 권한 페이지입니다
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                시스템 정상 작동 중
              </span>
              <span>|</span>
              <span>{user.email}</span>
              <span>|</span>
              <span>마지막 로그인: {new Date().toLocaleString('ko-KR')}</span>
            </div>
          </div>
          <div className="text-6xl">👑</div>
        </div>
      </div>

      {/* 시스템 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">👥</span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">+12%</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>총 사용자</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.totalUsers}</p>
          <div className="mt-2 text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <div>슈퍼관리자: {usersByRole.super_admin}</div>
            <div>서비스관리자: {usersByRole.service_admin}</div>
            <div>일반사용자: {usersByRole.service_user}</div>
            <div>평가자: {usersByRole.evaluator}</div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">📋</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">+8%</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>총 프로젝트</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.totalProjects}</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>진행률 70%</p>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">⚖️</span>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">진행중</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>활성 평가</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.activeEvaluations}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            이번 주 +23 새로운 평가
          </p>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🗄️</span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">안정</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>데이터베이스</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.databaseSize}</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>10GB 중 사용</p>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🖥️</span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">정상</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>서버 가동시간</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.serverUptime}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            99.9% 가용성
          </p>
        </div>
      </div>

      {/* 시스템 성능 모니터 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            🚀 시스템 성능
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>CPU 사용량</span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${systemStats.cpuUsage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>메모리 사용량</span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${systemStats.memoryUsage}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>요청/분</span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.requestsPerMinute}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-600 h-3 rounded-full transition-all" style={{ width: `${Math.min(systemStats.requestsPerMinute / 2, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>오류율</span>
                <span className="text-sm font-bold" style={{ color: systemStats.errorRate > 1 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                  {systemStats.errorRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-600 h-3 rounded-full transition-all" style={{ width: `${systemStats.errorRate * 10}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 최근 활동
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {getRecentActivities().map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {activity.action}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 실행 메뉴 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          ⚡ 빠른 실행
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((section) => (
            <div
              key={section.id}
              className="p-6 rounded-xl"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-light)'
              }}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: section.color + '20' }}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {section.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {section.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    → {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;