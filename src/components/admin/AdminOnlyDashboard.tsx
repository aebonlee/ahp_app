/**
 * 관리자 전용 대시보드  
 * super_admin, service_admin 역할 전용 페이지
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import authService from '../../services/authService';

interface AdminOnlyDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

const AdminOnlyDashboard: React.FC<AdminOnlyDashboardProps> = ({ user, onTabChange }) => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeEvaluations: 0,
    systemHealth: 'healthy',
    databaseSize: '0 MB',
    serverUptime: '0 days'
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [systemActivity, setSystemActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
    loadRecentUsers();
    loadSystemActivity();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadSystemStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STATUS}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSystemStats({
          totalUsers: data.total_users ?? data.totalUsers ?? 0,
          totalProjects: data.total_projects ?? data.totalProjects ?? 0,
          activeEvaluations: data.active_evaluations ?? data.activeEvaluations ?? 0,
          systemHealth: data.system_health ?? data.systemHealth ?? 'healthy',
          databaseSize: data.database_size ?? data.databaseSize ?? '—',
          serverUptime: data.server_uptime ?? data.serverUptime ?? '—',
        });
      }
    } catch (error) {
      console.error('시스템 통계 로딩 실패:', error);
    }
  };

  const loadRecentUsers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/service/admin/users/?ordering=-created_at&limit=10`,
        { headers: getAuthHeaders(), credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        const users = Array.isArray(data) ? data : (data.results ?? []);
        setRecentUsers(users.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role ?? u.user_role ?? 'service_user',
          created_at: new Date(u.created_at ?? u.date_joined ?? Date.now()),
          status: u.status ?? (u.is_active ? 'active' : 'inactive'),
        })));
      }
    } catch (error) {
      console.error('최근 사용자 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemActivity = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/service/admin/activity/?limit=20`,
        { headers: getAuthHeaders(), credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results ?? []);
        setSystemActivity(items.map((item: any) => ({
          id: item.id ?? String(Math.random()),
          action: item.action ?? item.event_type ?? '알 수 없는 이벤트',
          user: item.user ?? item.user_email ?? 'system',
          timestamp: new Date(item.timestamp ?? item.created_at ?? Date.now()),
          type: item.type ?? item.category ?? 'system',
          details: item.details ?? item.description ?? '',
        })));
      }
    } catch (error) {
      console.error('시스템 활동 로딩 실패:', error);
    }
  };

  const quickActions = [
    {
      id: 'user-management',
      title: '사용자 관리',
      description: '전체 사용자 계정 및 권한 관리',
      icon: '👥',
      color: 'var(--accent-primary)',
      action: () => onTabChange('users')
    },
    {
      id: 'project-monitoring',
      title: '프로젝트 모니터링',
      description: '전체 프로젝트 현황 및 진행 상태',
      icon: '📊',
      color: 'var(--accent-secondary)',
      action: () => onTabChange('projects')
    },
    {
      id: 'system-settings',
      title: '시스템 설정',
      description: '플랫폼 전체 설정 및 구성',
      icon: '⚙️',
      color: 'var(--accent-tertiary)',
      action: () => onTabChange('settings')
    },
    {
      id: 'django-admin',
      title: 'Django 관리자',
      description: '데이터베이스 직접 관리',
      icon: '🔧',
      color: 'var(--accent-quaternary)',
      action: () => window.open(`${API_BASE_URL}/admin/`, '_blank')
    }
  ];

  const systemHealthColor = systemStats.systemHealth === 'healthy' ? 'var(--accent-tertiary)' : 'var(--accent-warning)';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ color: 'var(--text-muted)' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>관리자 대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 관리자 환영 메시지 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            👑
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              관리자 {user.first_name || user.username}님, 환영합니다! 🛡️
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              AHP 플랫폼 전체 시스템을 관리하고 모니터링하세요
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>📧 {user.email}</span>
              <span>🏢 {user.organization || '시스템 관리자'}</span>
              <span>👑 {user.role === 'super_admin' ? '슈퍼 관리자' : '서비스 관리자'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 시스템 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>총 사용자</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
              👥
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>총 프로젝트</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{systemStats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
              📋
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>진행 중인 평가</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-tertiary)' }}>{systemStats.activeEvaluations}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
              ⚖️
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>시스템 상태</p>
              <p className="text-lg font-bold" style={{ color: systemHealthColor }}>
                {systemStats.systemHealth === 'healthy' ? '정상' : '주의'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: systemHealthColor + '20' }}>
              {systemStats.systemHealth === 'healthy' ? '✅' : '⚠️'}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>DB 크기</p>
              <p className="text-xl font-bold" style={{ color: 'var(--accent-quaternary)' }}>{systemStats.databaseSize}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-quaternary-pastel)' }}>
              🗄️
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>서버 가동시간</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{systemStats.serverUptime}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--bg-subtle)' }}>
              🖥️
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 실행 메뉴 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          관리자 도구
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-6 rounded-xl text-left transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-light)' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: action.color, color: 'white' }}
                >
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {action.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 최근 사용자 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            최근 등록 사용자
          </h2>
          <button
            onClick={() => onTabChange('users')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            전체 사용자 관리 →
          </button>
        </div>

        {recentUsers.length === 0 ? (
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-muted)' }}>최근 등록된 사용자가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
                onClick={() => onTabChange('users')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: 'var(--accent-primary-pastel)' }}
                  >
                    👤
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.username}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium mb-1"
                    style={{
                      backgroundColor: user.role === 'service_admin' ? 'var(--accent-primary-pastel)' :
                                     user.role === 'evaluator' ? 'var(--accent-secondary-pastel)' :
                                     'var(--bg-subtle)',
                      color: user.role === 'service_admin' ? 'var(--accent-primary-dark)' :
                             user.role === 'evaluator' ? 'var(--accent-secondary-dark)' :
                             'var(--text-muted)'
                    }}
                  >
                    {user.role === 'service_admin' ? '관리자' :
                     user.role === 'evaluator' ? '평가자' :
                     user.role === 'service_user' ? '사용자' : user.role}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {user.created_at.toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 시스템 활동 로그 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            시스템 활동 로그
          </h2>
          <button
            onClick={() => onTabChange('audit')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            전체 로그 보기 →
          </button>
        </div>
        
        {systemActivity.length === 0 ? (
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-muted)' }}>시스템 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {systemActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: 'var(--accent-primary-pastel)' }}
                >
                  {activity.type === 'project' ? '📋' : 
                   activity.type === 'user' ? '👤' : '📝'}
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {activity.action}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    사용자: {activity.user} | {activity.details}
                  </p>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {activity.timestamp.toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOnlyDashboard;