/**
 * 관리자 전용 대시보드
 * super_admin, service_admin 역할 전용 페이지
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { API_BASE_URL } from '../../config/api';
import apiService from '../../services/apiService';

interface AdminOnlyDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

// ── API 응답 타입 ────────────────────────────────────

interface UserStatsResponse {
  total: number;
  active: number;
  superusers: number;
  staff: number;
  normal: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface UserItem {
  id: number | string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

interface ProjectItem {
  id: string;
  title: string;
  owner_name: string;
  status: string;
  created_at: string;
}

interface EvaluationItem {
  id: string;
  project: { id: string; title: string } | string;
  evaluator: { id: string; username: string; email: string } | string | null;
  status: string;
  created_at: string;
}

// ── 내부 상태 타입 ───────────────────────────────────

interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  activeEvaluations: number;
  systemHealth: 'healthy' | 'warning' | 'unknown';
  databaseSize: string;
  serverUptime: string;
}

interface RecentUser {
  id: string | number;
  username: string;
  email: string;
  role: 'super_admin' | 'service_admin' | 'service_user';
  isActive: boolean;
  joinedAt: Date;
}

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: 'project' | 'evaluation' | 'user' | 'system';
  details: string;
}

// ─────────────────────────────────────────────────────

const AdminOnlyDashboard: React.FC<AdminOnlyDashboardProps> = ({ user, onTabChange }) => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProjects: 0,
    activeEvaluations: 0,
    systemHealth: 'unknown',
    databaseSize: 'N/A',
    serverUptime: '운영 중',
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [systemActivity, setSystemActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.allSettled([
        loadSystemStats(),
        loadRecentUsers(),
        loadSystemActivity(),
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── API 로드 함수들 ──────────────────────────────────

  const loadSystemStats = async () => {
    const [statsRes, projectsRes, evalsRes, healthRes] = await Promise.allSettled([
      apiService.get<UserStatsResponse>('/api/service/accounts/users/stats/'),
      apiService.get<PaginatedResponse<any>>('/api/service/projects/projects/?page_size=1'),
      apiService.get<PaginatedResponse<any>>(
        '/api/service/evaluations/evaluations/?status=in_progress&page_size=1'
      ),
      fetch(`${API_BASE_URL}/health/`)
        .then(r => r.json())
        .catch(() => ({ status: 'unknown' })),
    ]);

    const totalUsers =
      statsRes.status === 'fulfilled' && !statsRes.value.error
        ? (statsRes.value.data as UserStatsResponse)?.total ?? 0
        : 0;

    const totalProjects =
      projectsRes.status === 'fulfilled' && !projectsRes.value.error
        ? (projectsRes.value.data as PaginatedResponse<any>)?.count ?? 0
        : 0;

    const activeEvaluations =
      evalsRes.status === 'fulfilled' && !evalsRes.value.error
        ? (evalsRes.value.data as PaginatedResponse<any>)?.count ?? 0
        : 0;

    const healthData =
      healthRes.status === 'fulfilled' ? (healthRes.value as any) : {};
    const systemHealth: SystemStats['systemHealth'] =
      healthData?.status === 'healthy' ? 'healthy' : 'warning';

    setSystemStats(prev => ({
      ...prev,
      totalUsers,
      totalProjects,
      activeEvaluations,
      systemHealth,
    }));
  };

  const loadRecentUsers = async () => {
    const res = await apiService.get<PaginatedResponse<UserItem>>(
      '/api/service/accounts/users/?page_size=5'
    );
    if (res.error || !res.data) return;

    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data as PaginatedResponse<UserItem>).results ?? [];

    setRecentUsers(
      raw.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.is_superuser
          ? 'super_admin'
          : u.is_staff
          ? 'service_admin'
          : 'service_user',
        isActive: u.is_active,
        joinedAt: new Date(u.date_joined),
      }))
    );
  };

  const loadSystemActivity = async () => {
    const [projectsRes, evalsRes] = await Promise.allSettled([
      apiService.get<PaginatedResponse<ProjectItem>>(
        '/api/service/projects/projects/?page_size=4&ordering=-created_at'
      ),
      apiService.get<PaginatedResponse<EvaluationItem>>(
        '/api/service/evaluations/evaluations/?page_size=4&ordering=-created_at'
      ),
    ]);

    const activities: ActivityItem[] = [];

    if (projectsRes.status === 'fulfilled' && !projectsRes.value.error) {
      const projects = Array.isArray(projectsRes.value.data)
        ? projectsRes.value.data
        : (projectsRes.value.data as PaginatedResponse<ProjectItem>)?.results ?? [];
      projects.forEach(p => {
        activities.push({
          id: `project-${p.id}`,
          action: '프로젝트 생성',
          user: p.owner_name || '알 수 없음',
          timestamp: new Date(p.created_at),
          type: 'project',
          details: p.title,
        });
      });
    }

    if (evalsRes.status === 'fulfilled' && !evalsRes.value.error) {
      const evals = Array.isArray(evalsRes.value.data)
        ? evalsRes.value.data
        : (evalsRes.value.data as PaginatedResponse<EvaluationItem>)?.results ?? [];
      evals.forEach(e => {
        const evaluatorName =
          e.evaluator && typeof e.evaluator === 'object'
            ? (e.evaluator as any).username || (e.evaluator as any).email
            : '알 수 없음';
        const projectTitle =
          e.project && typeof e.project === 'object'
            ? (e.project as any).title
            : String(e.project ?? '');
        activities.push({
          id: `eval-${e.id}`,
          action:
            e.status === 'completed'
              ? '평가 완료'
              : e.status === 'in_progress'
              ? '평가 진행 중'
              : '평가 시작',
          user: evaluatorName,
          timestamp: new Date(e.created_at),
          type: 'evaluation',
          details: projectTitle,
        });
      });
    }

    // 최신순 정렬 후 최대 6개
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setSystemActivity(activities.slice(0, 6));
  };

  // ── 유틸 ─────────────────────────────────────────────

  const roleLabel = (role: RecentUser['role']) => {
    if (role === 'super_admin') return '슈퍼관리자';
    if (role === 'service_admin') return '관리자';
    return '사용자';
  };

  const activityIcon = (type: ActivityItem['type']) => {
    if (type === 'project') return '📋';
    if (type === 'evaluation') return '⚖️';
    if (type === 'user') return '👤';
    return '📝';
  };

  const formatRelativeTime = (date: Date): string => {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const systemHealthColor =
    systemStats.systemHealth === 'healthy'
      ? 'var(--accent-tertiary)'
      : systemStats.systemHealth === 'warning'
      ? '#f59e0b'
      : 'var(--text-muted)';

  const healthLabel =
    systemStats.systemHealth === 'healthy'
      ? '정상'
      : systemStats.systemHealth === 'warning'
      ? '주의'
      : '확인 중';

  const healthIcon =
    systemStats.systemHealth === 'healthy' ? '✅' : systemStats.systemHealth === 'warning' ? '⚠️' : '❓';

  const quickActions = [
    {
      id: 'user-management',
      title: '사용자 관리',
      description: '전체 사용자 계정 및 권한 관리',
      icon: '👥',
      color: 'var(--accent-primary)',
      action: () => onTabChange('users'),
    },
    {
      id: 'project-monitoring',
      title: '프로젝트 모니터링',
      description: '전체 프로젝트 현황 및 진행 상태',
      icon: '📊',
      color: 'var(--accent-secondary)',
      action: () => onTabChange('projects'),
    },
    {
      id: 'system-settings',
      title: '시스템 설정',
      description: '플랫폼 전체 설정 및 구성',
      icon: '⚙️',
      color: 'var(--accent-tertiary)',
      action: () => onTabChange('settings'),
    },
    {
      id: 'django-admin',
      title: 'Django 관리자',
      description: '데이터베이스 직접 관리',
      icon: '🔧',
      color: 'var(--accent-quaternary)',
      action: () => window.open(`${API_BASE_URL}/admin/`, '_blank'),
    },
  ];

  // ── 렌더링 ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>관리자 대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 오류 배너 */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* 관리자 환영 메시지 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            >
              👑
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                관리자 {user.first_name || user.username}님, 환영합니다! 🛡️
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                AHP 플랫폼 전체 시스템을 관리하고 모니터링하세요
              </p>
              <div
                className="flex items-center space-x-4 mt-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>📧 {user.email}</span>
                <span>🏢 {user.organization || '시스템 관리자'}</span>
                <span>👑 {user.role === 'super_admin' ? '슈퍼 관리자' : '서비스 관리자'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={loadAll}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
            }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 시스템 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 총 사용자 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>👥</div>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {systemStats.totalUsers.toLocaleString()}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            총 사용자
          </p>
        </div>

        {/* 총 프로젝트 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>📋</div>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--accent-secondary)' }}>
            {systemStats.totalProjects.toLocaleString()}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            총 프로젝트
          </p>
        </div>

        {/* 진행 중인 평가 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>⚖️</div>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--accent-tertiary)' }}>
            {systemStats.activeEvaluations}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            진행 중 평가
          </p>
        </div>

        {/* 시스템 상태 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: systemHealthColor + '22' }}>{healthIcon}</div>
          </div>
          <p className="text-xl font-bold" style={{ color: systemHealthColor }}>
            {healthLabel}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            시스템 상태
          </p>
        </div>

        {/* DB 크기 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--accent-quaternary-pastel)' }}>🗄️</div>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--accent-quaternary)' }}>
            {systemStats.databaseSize}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            DB 크기
          </p>
        </div>

        {/* 서버 가동 */}
        <div
          className="p-5 rounded-xl col-span-1"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--bg-subtle)' }}>🖥️</div>
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {systemStats.serverUptime}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            서버 가동
          </p>
        </div>
      </div>

      {/* 관리자 도구 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          관리자 도구
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-6 rounded-xl text-left transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={e => {
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

      {/* 하단 2분할: 최근 사용자 + 활동 로그 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 최근 등록 사용자 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              최근 등록 사용자
            </h2>
            <button
              onClick={() => onTabChange('users')}
              className="text-sm font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              전체 보기 →
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p style={{ color: 'var(--text-muted)' }}>최근 등록된 사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                  }}
                  onClick={() => onTabChange('users')}
                  onMouseEnter={e =>
                    (e.currentTarget.style.borderColor = 'var(--accent-primary)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.borderColor = 'var(--border-light)')
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                      style={{ backgroundColor: 'var(--accent-primary-pastel)' }}
                    >
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {u.username}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium block mb-1"
                      style={{
                        backgroundColor:
                          u.role === 'super_admin'
                            ? '#fef3c7'
                            : u.role === 'service_admin'
                            ? 'var(--accent-primary-pastel)'
                            : 'var(--bg-subtle)',
                        color:
                          u.role === 'super_admin'
                            ? '#92400e'
                            : u.role === 'service_admin'
                            ? 'var(--accent-primary-dark)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {roleLabel(u.role)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {u.joinedAt.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 시스템 활동 로그 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              최근 시스템 활동
            </h2>
            <button
              onClick={() => onTabChange('audit')}
              className="text-sm font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              전체 로그 →
            </button>
          </div>

          {systemActivity.length === 0 ? (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p style={{ color: 'var(--text-muted)' }}>최근 활동이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent-primary-pastel)' }}
                  >
                    {activityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {activity.action}
                    </p>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {activity.details}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {activity.user} · {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOnlyDashboard;
