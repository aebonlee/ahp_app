/**
 * 평가자 전용 대시보드
 * evaluator 역할 전용 페이지
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import cleanDataService from '../../services/dataService_clean';

interface EvaluatorOnlyDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

const EvaluatorOnlyDashboard: React.FC<EvaluatorOnlyDashboardProps> = ({ user, onTabChange }) => {
  const [evaluationStats, setEvaluationStats] = useState({
    totalAssignments: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    avgConsistencyRatio: 0,
    weeklyProgress: 0
  });
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluatorStats();
    loadAssignedProjects();
    loadRecentActivity();
  }, []);

  const loadEvaluatorStats = async () => {
    try {
      // TODO: 평가자 통계 API 연동
      setEvaluationStats({
        totalAssignments: 12,
        pendingEvaluations: 3,
        completedEvaluations: 9,
        avgConsistencyRatio: 0.08,
        weeklyProgress: 75
      });
    } catch (error) {
      console.error('평가자 통계 로딩 실패:', error);
    }
  };

  const loadAssignedProjects = async () => {
    try {
      // TODO: 할당된 프로젝트 API 연동
      const mockProjects = [
        {
          id: '1',
          title: '신제품 출시 전략 평가',
          description: '마케팅 전략 대안들의 우선순위 결정',
          dueDate: '2025-10-15',
          progress: 60,
          status: 'active',
          owner: 'marketing@company.com'
        },
        {
          id: '2', 
          title: 'IT 시스템 선택',
          description: '차세대 ERP 시스템 비교 분석',
          dueDate: '2025-10-20',
          progress: 0,
          status: 'pending',
          owner: 'it@company.com'
        }
      ];
      setAssignedProjects(mockProjects);
    } catch (error) {
      console.error('할당된 프로젝트 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // TODO: 최근 활동 API 연동
      const mockActivity = [
        {
          id: '1',
          action: '쌍대비교 평가 완료',
          project: '신제품 출시 전략 평가',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'evaluation'
        },
        {
          id: '2',
          action: '평가 초대 수락',
          project: 'IT 시스템 선택',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'invitation'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('최근 활동 로딩 실패:', error);
    }
  };

  const quickActions = [
    {
      id: 'pending-evaluations',
      title: '대기 중인 평가',
      description: '아직 완료하지 않은 평가 작업',
      icon: '⏳',
      color: 'var(--accent-warning)',
      count: evaluationStats.pendingEvaluations,
      action: () => onTabChange('assigned-projects')
    },
    {
      id: 'pairwise-evaluation',
      title: '쌍대비교 평가',
      description: '기준별 쌍대비교 평가 수행',
      icon: '⚖️',
      color: 'var(--accent-primary)',
      action: () => onTabChange('pairwise-evaluation')
    },
    {
      id: 'evaluation-history',
      title: '평가 이력',
      description: '완료한 평가들의 상세 내역',
      icon: '📜',
      color: 'var(--accent-secondary)',
      action: () => onTabChange('evaluation-history')
    },
    {
      id: 'consistency-check',
      title: '일관성 검증',
      description: '평가 일관성 확인 및 개선',
      icon: '✅',
      color: 'var(--accent-tertiary)',
      action: () => onTabChange('consistency-check')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4" style={{ color: 'var(--text-muted)' }}>⏳</div>
          <p style={{ color: 'var(--text-secondary)' }}>평가자 대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 평가자 환영 메시지 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            ⚖️
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              평가자 {user.first_name || user.username}님, 환영합니다! 👋
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              할당된 평가 작업을 확인하고 수행해보세요
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>📧 {user.email}</span>
              <span>🏢 {user.organization || '조직 미설정'}</span>
              <span>⚖️ 전문 평가자</span>
            </div>
          </div>
        </div>
      </div>

      {/* 평가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>총 할당 수</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{evaluationStats.totalAssignments}</p>
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
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>대기 중</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-warning)' }}>{evaluationStats.pendingEvaluations}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-warning-pastel)' }}>
              ⏳
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>완료됨</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-tertiary)' }}>{evaluationStats.completedEvaluations}</p>
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
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>평균 CR</p>
              <p className="text-3xl font-bold" style={{ color: evaluationStats.avgConsistencyRatio <= 0.1 ? 'var(--accent-tertiary)' : 'var(--accent-warning)' }}>
                {evaluationStats.avgConsistencyRatio.toFixed(3)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: evaluationStats.avgConsistencyRatio <= 0.1 ? 'var(--accent-tertiary-pastel)' : 'var(--accent-warning-pastel)' }}>
              🎯
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>주간 진행률</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{evaluationStats.weeklyProgress}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
              📈
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
              className="p-6 rounded-xl text-left transition-all hover:scale-105 relative"
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
              {action.count !== undefined && action.count > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{ backgroundColor: 'var(--accent-warning)', color: 'white' }}>
                  {action.count}
                </div>
              )}
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

      {/* 할당된 프로젝트 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            할당된 프로젝트
          </h2>
          <button
            onClick={() => onTabChange('assigned-projects')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            전체 보기 →
          </button>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="p-8 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-6xl mb-4" style={{ color: 'var(--text-muted)' }}>⚖️</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              할당된 평가 작업이 없습니다
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              프로젝트 관리자가 평가 작업을 할당하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedProjects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-lg cursor-pointer transition-all"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
                onClick={() => onTabChange('pairwise-evaluation')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {project.title}
                      </h4>
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: project.status === 'active' ? 'var(--accent-secondary-pastel)' :
                                         project.status === 'pending' ? 'var(--accent-warning-pastel)' :
                                         'var(--bg-subtle)',
                          color: project.status === 'active' ? 'var(--accent-secondary-dark)' :
                                 project.status === 'pending' ? 'var(--accent-warning-dark)' :
                                 'var(--text-muted)'
                        }}
                      >
                        {project.status === 'active' ? '진행중' :
                         project.status === 'pending' ? '대기중' : project.status}
                      </div>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>📧 {project.owner}</span>
                      <span>📅 마감: {new Date(project.dueDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="mb-2">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>진행률</span>
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {project.progress}%
                      </div>
                    </div>
                    <div className="w-20 h-2 rounded-full" style={{ backgroundColor: 'var(--border-light)' }}>
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: 'var(--accent-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 활동 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          최근 활동
        </h2>
        
        {recentActivity.length === 0 ? (
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p style={{ color: 'var(--text-muted)' }}>최근 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: 'var(--accent-primary-pastel)' }}
                >
                  {activity.type === 'evaluation' ? '⚖️' : 
                   activity.type === 'invitation' ? '📧' : '📝'}
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {activity.action}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    프로젝트: {activity.project}
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

export default EvaluatorOnlyDashboard;