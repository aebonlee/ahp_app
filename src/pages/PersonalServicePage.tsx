import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import ProjectSelector from '../components/project/ProjectSelector';
import PersonalSettings from '../components/settings/PersonalSettings';
import type { ProjectData } from '../services/api';

interface PersonalServiceProps {
  user: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUserUpdate?: (updatedUser: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  }) => void;
  projects?: any[];
  onCreateProject?: (projectData: any) => Promise<any>;
  onDeleteProject?: (projectId: string) => Promise<any>;
  onFetchCriteria?: (projectId: string) => Promise<any[]>;
  onCreateCriteria?: (projectId: string, criteriaData: any) => Promise<any>;
  onFetchAlternatives?: (projectId: string) => Promise<any[]>;
  onCreateAlternative?: (projectId: string, alternativeData: any) => Promise<any>;
  onSaveEvaluation?: (projectId: string, evaluationData: any) => Promise<any>;
  onFetchTrashedProjects?: () => Promise<any[]>;
  onRestoreProject?: (projectId: string) => Promise<any>;
  onPermanentDeleteProject?: (projectId: string) => Promise<any>;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
}

interface UserProject extends Omit<ProjectData, 'evaluation_method'> {
  evaluator_count?: number;
  completion_rate?: number;
  criteria_count: number;
  alternatives_count: number;
  last_modified: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}

const PLAN_QUOTAS = {
  'basic': { projects: 3, evaluators: 30 },
  'standard': { projects: 3, evaluators: 50 },
  'premium': { projects: 3, evaluators: 100 },
  'enterprise': { projects: 3, evaluators: 100 }
};

const PersonalServicePage: React.FC<PersonalServiceProps> = ({ 
  user: initialUser, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  onUserUpdate,
  projects: externalProjects = [],
  onCreateProject,
  onDeleteProject,
  onFetchCriteria,
  onCreateCriteria,
  onFetchAlternatives,
  onCreateAlternative,
  onSaveEvaluation,
  onFetchTrashedProjects,
  onRestoreProject,
  onPermanentDeleteProject,
  selectedProjectId: externalSelectedProjectId,
  onSelectProject: externalOnSelectProject
}) => {
  const [user, setUser] = useState(initialUser);
  
  const userPlan = {
    planType: 'standard' as const,
    additionalEvaluators: 0,
    planName: 'Standard Plan'
  };

  useEffect(() => {
    if (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name) {
      setUser(initialUser);
    }
  }, [initialUser.first_name, initialUser.last_name, user.first_name, user.last_name]);

  const handleUserUpdate = (updatedUser: typeof initialUser) => {
    const newUserObject = {
      ...updatedUser,
      _updated: Date.now()
    };
    
    setUser(newUserObject);
    if (onUserUpdate) {
      onUserUpdate(newUserObject);
    }
  };
  
  const projects = Array.isArray(externalProjects) ? externalProjects : [];
  
  const quotas = {
    currentProjects: projects.length,
    maxProjects: PLAN_QUOTAS[userPlan.planType].projects,
    currentEvaluators: 0,
    maxEvaluators: PLAN_QUOTAS[userPlan.planType].evaluators + (userPlan.additionalEvaluators * 10),
    remainingProjects: Math.max(0, PLAN_QUOTAS[userPlan.planType].projects - projects.length),
    remainingEvaluators: Math.max(0, PLAN_QUOTAS[userPlan.planType].evaluators + (userPlan.additionalEvaluators * 10) - 0)
  };

  const activeMenu = externalActiveTab === 'personal-service' ? 'dashboard' :
                     externalActiveTab === 'my-projects' ? 'projects' :
                     externalActiveTab === 'project-creation' ? 'creation' :
                     externalActiveTab === 'model-builder' ? 'model-builder' :
                     externalActiveTab === 'evaluator-management' ? 'evaluators' :
                     externalActiveTab === 'progress-monitoring' ? 'monitoring' :
                     externalActiveTab === 'results-analysis' ? 'analysis' :
                     externalActiveTab === 'export-reports' ? 'export' :
                     externalActiveTab === 'workshop-management' ? 'workshop' :
                     externalActiveTab === 'decision-support-system' ? 'decision-support' :
                     externalActiveTab === 'personal-settings' ? 'settings' :
                     externalActiveTab === 'evaluation-test' ? 'evaluation-test' :
                     externalActiveTab === 'user-guide' ? 'user-guide' :
                     externalActiveTab === 'demographic-survey' ? 'demographic-survey' :
                     externalActiveTab === 'paper-management' ? 'paper-management' :
                     externalActiveTab === 'survey-links' ? 'survey-links' :
                     'dashboard';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(externalSelectedProjectId || '');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);

  const handleTabChange = (tab: string) => {
    const projectRequiredMenus = ['model-builder', 'monitoring', 'analysis'];
    
    if (projectRequiredMenus.includes(tab)) {
      const menuConfigs = {
        'model-builder': {
          title: '모델 구축할 프로젝트 선택',
          description: 'AHP 모델을 구축하거나 수정할 프로젝트를 선택해주세요.',
          nextAction: 'model-builder'
        },
        'monitoring': {
          title: '진행률을 모니터링할 프로젝트 선택',
          description: '평가 진행 상황을 확인할 프로젝트를 선택해주세요.',
          nextAction: 'monitoring'
        },
        'analysis': {
          title: '결과를 분석할 프로젝트 선택',
          description: '평가 결과를 분석하고 보고서를 생성할 프로젝트를 선택해주세요.',
          nextAction: 'analysis'
        }
      };
      
      setProjectSelectorConfig(menuConfigs[tab as keyof typeof menuConfigs]);
      setShowProjectSelector(true);
      return;
    }
    
    if (externalOnTabChange) {
      const tabMap: Record<string, string> = {
        'dashboard': 'personal-service',
        'projects': 'my-projects',
        'creation': 'project-creation',
        'model-builder': 'model-builder',
        'evaluators': 'evaluator-management',
        'monitoring': 'progress-monitoring',
        'analysis': 'results-analysis',
        'export': 'export-reports',
        'workshop': 'workshop-management',
        'decision-support': 'decision-support-system',
        'settings': 'personal-settings'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
    const projectId = project.id || '';
    setSelectedProjectId(projectId);
    if (externalOnSelectProject) {
      externalOnSelectProject(projectId);
    }
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  const handleProjectSelectorCancel = () => {
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  // 원본 PersonalServiceDashboard의 전문적 디자인 완전 적용
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 프로젝트 현황 대시보드 - 원본과 동일한 Tailwind 구조 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-info-text)' }}>프로젝트</p>
              <p className="text-3xl font-bold" style={{ 
                color: projects.length >= quotas.maxProjects ? 'var(--status-error-text)' : 'var(--text-primary)' 
              }}>
                {projects.length}<span className="text-lg text-gray-500">/{quotas.maxProjects}</span>
              </p>
              <p className="text-sm text-gray-500">{userPlan.planName}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-info-text)' }}>
              <span className="text-white text-2xl">📊</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-success-text)' }}>평가자</p>
              <p className="text-3xl font-bold" style={{ 
                color: quotas.currentEvaluators >= quotas.maxEvaluators ? 'var(--status-error-text)' : 'var(--text-primary)' 
              }}>
                {quotas.currentEvaluators}<span className="text-lg text-gray-500">/{quotas.maxEvaluators}</span>
              </p>
              <p className="text-sm text-gray-500">
                {userPlan.additionalEvaluators > 0 && `+${userPlan.additionalEvaluators * 10}명 추가`}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-success-text)' }}>
              <span className="text-white text-2xl">👥</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>진행중</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white text-2xl">🚀</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-warning-text)' }}>완료됨</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 6개 인라인 배치 - 원본과 완전 동일 */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'creation', label: '새 프로젝트', icon: '🚀', color: 'from-blue-500 to-blue-600' },
          { id: 'projects', label: '내 프로젝트', icon: '📂', color: 'from-green-500 to-green-600' },
          { id: 'trash', label: '휴지통', icon: '🗑️', color: 'from-red-500 to-red-600' },
          { id: 'evaluators', label: '평가자 관리', icon: '👥', color: 'from-purple-500 to-purple-600' },
          { id: 'analysis', label: '결과 분석', icon: '📊', color: 'from-orange-500 to-orange-600' },
          { id: 'export', label: '보고서', icon: '📤', color: 'from-indigo-500 to-indigo-600' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className="inline-flex items-center px-6 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          >
            <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mr-3`}>
              <span className="text-white text-lg">{item.icon}</span>
            </div>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 빠른 시작 및 빠른 접근 통합 - 원본과 완전 동일 */}
      <div 
        className="p-8 rounded-xl border-2 transition-all duration-300"
        style={{
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="text-center mb-8">
          <h2 
            className="text-2xl lg:text-3xl font-bold mb-2"
            style={{ color: 'var(--accent-secondary)' }}
          >
            ⚡ 빠른 시작 및 접근
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            AHP 분석의 모든 기능을 빠르고 쉽게 사용해보세요
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: 'user-guide', label: '사용자 가이드', icon: '📚', color: 'from-blue-500 to-blue-600' },
            { id: 'model-builder', label: '모델 구성', icon: '🏗️', color: 'from-green-500 to-green-600' },
            { id: 'validity-check', label: '평가문항 확인', icon: '🔍', color: 'from-teal-500 to-teal-600' },
            { id: 'monitoring', label: '진행률 확인', icon: '📈', color: 'from-purple-500 to-purple-600' },
            { id: 'survey-links', label: '설문 링크', icon: '🔗', color: 'from-orange-500 to-orange-600' },
            { id: 'workshop', label: '워크숍 관리', icon: '🎯', color: 'from-indigo-500 to-indigo-600' },
            { id: 'decision-support', label: '의사결정 지원', icon: '🧠', color: 'from-pink-500 to-pink-600' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                <span className="text-white text-2xl">{item.icon}</span>
              </div>
              <span 
                className="text-base font-medium text-center leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderOverview();
      case 'settings':
        return (
          <PersonalSettings
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {activeMenu === 'projects' && '내 프로젝트'}
              {activeMenu === 'creation' && '새 프로젝트 생성'}
              {activeMenu === 'evaluators' && '평가자 관리'}
              {activeMenu === 'monitoring' && '진행률 모니터링'}
              {activeMenu === 'analysis' && '결과 분석'}
              {activeMenu === 'export' && '보고서 내보내기'}
              {activeMenu === 'workshop' && '워크샵 관리'}
              {activeMenu === 'decision-support' && '의사결정 지원'}
            </h3>
            <p className="text-gray-600 mb-4">이 기능은 개발 중입니다. 빠른 시일 내에 완성하여 제공하겠습니다.</p>
            <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
              대시보드로 돌아가기
            </Button>
          </div>
        );
    }
  };

  // 개별 메뉴 페이지들은 전체 화면을 사용
  if (externalActiveTab && externalActiveTab !== 'personal-service') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => handleTabChange('dashboard')}
                    className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <span className="text-4xl mr-3">
                        {externalActiveTab === 'my-projects' && '📂'}
                        {externalActiveTab === 'project-creation' && '➕'}
                        {externalActiveTab === 'evaluator-management' && '👥'}
                        {externalActiveTab === 'progress-monitoring' && '📈'}
                        {externalActiveTab === 'results-analysis' && '📊'}
                        {externalActiveTab === 'export-reports' && '📤'}
                        {externalActiveTab === 'workshop-management' && '🎯'}
                        {externalActiveTab === 'decision-support-system' && '🧠'}
                      </span>
                      {externalActiveTab === 'my-projects' && '내 프로젝트'}
                      {externalActiveTab === 'project-creation' && '새 프로젝트 생성'}
                      {externalActiveTab === 'evaluator-management' && '평가자 관리'}
                      {externalActiveTab === 'progress-monitoring' && '진행률 모니터링'}
                      {externalActiveTab === 'results-analysis' && '결과 분석'}
                      {externalActiveTab === 'export-reports' && '보고서 내보내기'}
                      {externalActiveTab === 'workshop-management' && '워크샵 관리'}
                      {externalActiveTab === 'decision-support-system' && '의사결정 지원'}
                      {externalActiveTab === 'personal-settings' && '개인 설정'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      {externalActiveTab === 'my-projects' && '나의 AHP 분석 프로젝트들을 관리합니다'}
                      {externalActiveTab === 'project-creation' && '새로운 AHP 분석 프로젝트를 생성합니다'}
                      {externalActiveTab === 'evaluator-management' && '평가 참여자를 초대하고 관리합니다'}
                      {externalActiveTab === 'progress-monitoring' && '평가 진행 상황을 실시간으로 확인합니다'}
                      {externalActiveTab === 'results-analysis' && '평가 결과를 분석하고 순위를 확인합니다'}
                      {externalActiveTab === 'export-reports' && '분석 결과를 다양한 형식으로 내보냅니다'}
                      {externalActiveTab === 'workshop-management' && '협업 의사결정 워크숍을 관리합니다'}
                      {externalActiveTab === 'decision-support-system' && '과학적 의사결정 지원 도구를 제공합니다'}
                      {externalActiveTab === 'personal-settings' && '개인 계정 및 환경 설정을 관리합니다'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderMenuContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 환영 메시지 + 요금제 정보 통합 */}
      <div className="py-6">
        {/* 환영 메시지 (기존 스타일) */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-3 p-6 rounded-xl" 
               style={{
                 border: '1px solid var(--border-light)',
                 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
               }}>
            <h1 
              className="text-4xl lg:text-5xl font-light tracking-wide"
              style={{ 
                color: 'var(--text-primary)',
                fontFamily: "'Inter', 'Pretendard', system-ui, sans-serif"
              }}
            >
              안녕하세요, 
              <span 
                className="font-semibold ml-2"
                style={{ color: 'var(--accent-primary)' }}
              >
                {user.first_name} {user.last_name}
              </span>님
            </h1>
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--accent-bg-light)',
                  color: 'var(--accent-primary)'
                }}
              >
                ✨ {userPlan.planName}
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                • 프로젝트 {projects.length}/{quotas.maxProjects} • 평가자 {quotas.currentEvaluators}/{quotas.maxEvaluators}
              </span>
            </div>
            <p 
              className="text-lg leading-relaxed"
              style={{ 
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', 'Pretendard', system-ui, sans-serif"
              }}
            >
              AHP 분석으로 복잡한 의사결정을 과학적이고 체계적으로 해결하세요. 🎯
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {renderMenuContent()}
        </div>
      </div>

      {/* Project Selector Modal */}
      {showProjectSelector && projectSelectorConfig && (
        <ProjectSelector
          title={projectSelectorConfig.title}
          description={projectSelectorConfig.description}
          onProjectSelect={handleProjectSelect}
          onCancel={handleProjectSelectorCancel}
        />
      )}
    </div>
  );
};

export default PersonalServicePage;