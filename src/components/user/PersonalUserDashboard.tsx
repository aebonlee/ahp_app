/**
 * 개인 서비스 사용자 전용 대시보드
 * service_user 역할 전용 페이지
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import cleanDataService from '../../services/dataService_clean';

interface PersonalUserDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

const PersonalUserDashboard: React.FC<PersonalUserDashboardProps> = ({ user, onTabChange }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEvaluations: 0,
    recentActivity: []
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
    loadRecentProjects();
  }, []);

  const loadUserStats = async () => {
    try {
      const projects = await cleanDataService.getProjects();
      const userProjects = projects.filter(p => p.owner === user.id);
      
      setStats({
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'active').length,
        completedProjects: userProjects.filter(p => p.status === 'completed').length,
        totalEvaluations: user.profile?.total_evaluations || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('사용자 통계 로딩 실패:', error);
    }
  };

  const loadRecentProjects = async () => {
    try {
      const projects = await cleanDataService.getProjects();
      const userProjects = projects
        .filter(p => p.owner === user.id)
        .sort((a, b) => new Date(b.updated_at || b.created_at || '').getTime() - 
                       new Date(a.updated_at || a.created_at || '').getTime())
        .slice(0, 5);
      
      setRecentProjects(userProjects);
    } catch (error) {
      console.error('최근 프로젝트 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'new-project',
      title: '새 프로젝트 만들기',
      description: 'AHP 분석을 위한 새 프로젝트를 생성합니다',
      icon: '➕',
      color: 'var(--accent-primary)',
      action: () => onTabChange('project-creation')
    },
    {
      id: 'my-projects',
      title: '내 프로젝트 관리',
      description: '생성한 프로젝트들을 확인하고 관리합니다',
      icon: '📂',
      color: 'var(--accent-secondary)',
      action: () => onTabChange('my-projects')
    },
    {
      id: 'evaluation-mode',
      title: '평가자 모드',
      description: '할당받은 평가 작업을 수행합니다',
      icon: '⚖️',
      color: 'var(--accent-tertiary)',
      action: () => onTabChange('evaluator-mode')
    },
    {
      id: 'results-analysis',
      title: '결과 분석',
      description: '완료된 프로젝트의 결과를 분석합니다',
      icon: '📊',
      color: 'var(--accent-quaternary)',
      action: () => onTabChange('results-analysis')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ color: 'var(--text-muted)' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              안녕하세요, {user.first_name || user.username}님! 👋
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              AHP 의사결정 지원 플랫폼에 오신 것을 환영합니다
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>🏢 {user.organization || '조직 미설정'}</span>
              <span>📧 {user.email}</span>
              <span>🎯 개인 서비스 사용자</span>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>총 프로젝트</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
              📋
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>진행 중</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
              🔄
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>완료된 프로젝트</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-tertiary)' }}>{stats.completedProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
              ✅
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>총 평가 수</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-quaternary)' }}>{stats.totalEvaluations}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-quaternary-pastel)' }}>
              ⚖️
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 실행 메뉴 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          빠른 실행 메뉴
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

      {/* 최근 프로젝트 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            최근 프로젝트
          </h2>
          <button
            onClick={() => onTabChange('my-projects')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            전체 보기 →
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-6xl mb-4" style={{ color: 'var(--text-muted)' }}>📂</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              아직 생성된 프로젝트가 없습니다
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              첫 번째 AHP 프로젝트를 만들어 의사결정 분석을 시작해보세요!
            </p>
            <button
              onClick={() => onTabChange('project-creation')}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              새 프로젝트 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg cursor-pointer transition-all"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
                onClick={() => onTabChange('my-projects')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {project.title}
                    </h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: project.status === 'active' ? 'var(--accent-secondary-pastel)' :
                                       project.status === 'completed' ? 'var(--accent-tertiary-pastel)' :
                                       'var(--bg-subtle)',
                        color: project.status === 'active' ? 'var(--accent-secondary-dark)' :
                               project.status === 'completed' ? 'var(--accent-tertiary-dark)' :
                               'var(--text-muted)'
                      }}
                    >
                      {project.status === 'active' ? '진행중' :
                       project.status === 'completed' ? '완료' :
                       project.status === 'draft' ? '초안' : project.status}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {new Date(project.updated_at || project.created_at || '').toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalUserDashboard;