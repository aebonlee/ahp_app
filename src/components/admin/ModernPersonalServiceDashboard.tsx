import React from 'react';
import UIIcon from '../common/UIIcon';
import UIButton, { PrimaryButton, SecondaryButton } from '../common/UIButton';
import type { User, Project } from '../../types';

interface ModernPersonalServiceDashboardProps {
  user: User;
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onTabChange: (tab: string) => void;
}

const ModernPersonalServiceDashboard: React.FC<ModernPersonalServiceDashboardProps> = ({
  user,
  projects,
  onCreateProject,
  onSelectProject,
  onTabChange
}) => {
  // Remove unused state - was for future feature

  // 프로젝트 상태 계산
  const activeProjects = projects.filter(p => 
    p.status === 'evaluation_in_progress' || p.status === 'model_building' || p.status === 'evaluator_assignment'
  );
  const completedProjects = projects.filter(p => 
    p.status === 'evaluation_complete' || p.status === 'results_available'
  );
  const totalEvaluators = projects.reduce((sum, p) => sum + (p.evaluator_count || 0), 0);

  // 최근 프로젝트 (최대 3개)
  const recentProjects = projects
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 간소화된 헤더 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, <span className="text-blue-600">{user.first_name || user.username}</span>님!
          </h1>
          <p className="text-gray-600 mt-1">오늘도 의미있는 AHP 연구를 시작해보세요.</p>
        </div>
        <PrimaryButton
          iconEmoji="➕"
          onClick={onCreateProject}
          size="lg"
        >
          새 연구 시작
        </PrimaryButton>
      </div>

      {/* 간소화된 연구 현황 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ui-card p-4 text-center">
          <UIIcon emoji="📋" size="lg" color="primary" className="mb-2" />
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          <p className="text-sm text-gray-600">전체 연구</p>
        </div>
        <div className="ui-card p-4 text-center">
          <UIIcon emoji="🚀" size="lg" color="success" className="mb-2" />
          <p className="text-2xl font-bold text-green-600">{activeProjects.length}</p>
          <p className="text-sm text-gray-600">진행중</p>
        </div>
        <div className="ui-card p-4 text-center">
          <UIIcon emoji="✅" size="lg" color="info" className="mb-2" />
          <p className="text-2xl font-bold text-blue-600">{completedProjects.length}</p>
          <p className="text-sm text-gray-600">완료</p>
        </div>
        <div className="ui-card p-4 text-center">
          <UIIcon emoji="👥" size="lg" color="warning" className="mb-2" />
          <p className="text-2xl font-bold text-orange-600">{totalEvaluators}</p>
          <p className="text-sm text-gray-600">평가자</p>
        </div>
      </div>

      {/* 메인 콘텐츠 - 최근 프로젝트와 빠른 액션 통합 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 최근 연구 프로젝트 */}
        <div className="lg:col-span-3">
          <div className="ui-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">최근 연구 프로젝트</h2>
              <SecondaryButton 
                onClick={() => onTabChange('my-projects')}
                size="sm"
              >
                전체 보기
              </SecondaryButton>
            </div>

            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => onSelectProject(String(project.id))}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                        <span>{project.evaluator_count || 0}명</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'evaluation_in_progress' || project.status === 'model_building' || project.status === 'evaluator_assignment' ? 'bg-green-100 text-green-700' :
                          project.status === 'evaluation_complete' || project.status === 'results_available' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status === 'evaluation_in_progress' || project.status === 'model_building' || project.status === 'evaluator_assignment' ? '진행중' :
                           project.status === 'evaluation_complete' || project.status === 'results_available' ? '완료' : '대기중'}
                        </span>
                      </div>
                    </div>
                    <UIIcon emoji="▶️" size="sm" color="secondary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UIIcon emoji="📋" size="3xl" color="muted" className="mb-3" />
                <p className="text-gray-600 mb-4">아직 연구 프로젝트가 없습니다</p>
                <PrimaryButton
                  iconEmoji="➕"
                  onClick={onCreateProject}
                  size="sm"
                >
                  첫 연구 시작하기
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* 통합된 빠른 액션 */}
        <div className="space-y-4">
          <div className="ui-card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">빠른 작업</h3>
            <div className="space-y-2">
              <UIButton
                variant="ghost"
                fullWidth
                iconEmoji="🏗️"
                onClick={() => onTabChange('model-builder')}
                className="justify-start text-sm"
                size="sm"
              >
                모델 설계
              </UIButton>
              <UIButton
                variant="ghost"
                fullWidth
                iconEmoji="👥"
                onClick={() => onTabChange('evaluator-management')}
                className="justify-start text-sm"
                size="sm"
              >
                평가자 관리
              </UIButton>
              <UIButton
                variant="ghost"
                fullWidth
                iconEmoji="📊"
                onClick={() => onTabChange('results-analysis')}
                className="justify-start text-sm"
                size="sm"
              >
                결과 분석
              </UIButton>
            </div>
          </div>
          
          <div className="ui-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">시스템 상태</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">정상</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 간단한 도움말 */}
      <div className="ui-card p-3 bg-gray-50 text-center">
        <p className="text-sm text-gray-600">
          <UIIcon emoji="💡" size="sm" className="mr-1" />
          왼쪽 사이드바에서 더 많은 기능을 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default ModernPersonalServiceDashboard;