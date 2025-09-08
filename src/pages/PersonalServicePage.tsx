import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CriteriaManagement from '../components/admin/CriteriaManagement';
import AlternativeManagement from '../components/admin/AlternativeManagement';
import EvaluatorAssignment from '../components/admin/EvaluatorAssignment';
import EnhancedEvaluatorManagement from '../components/admin/EnhancedEvaluatorManagement';
import SurveyLinkManager from '../components/admin/SurveyLinkManager';
import ModelFinalization from '../components/admin/ModelFinalization';
import WorkflowStageIndicator, { WorkflowStage } from '../components/workflow/WorkflowStageIndicator';
import { EvaluationMode } from '../components/evaluation/EvaluationModeSelector';
import PaymentSystem from '../components/payment/PaymentSystem';
import WorkshopManagement from '../components/workshop/WorkshopManagement';
import DecisionSupportSystem from '../components/decision/DecisionSupportSystem';
import PaperManagement from '../components/paper/PaperManagement';
import ProjectSelector from '../components/project/ProjectSelector';
import SurveyManagementSystem from '../components/survey/SurveyManagementSystem';
import PersonalSettings from '../components/settings/PersonalSettings';
import UsageManagement from '../components/admin/UsageManagement';
import ValidityCheck from '../components/validity/ValidityCheck';
import TrashBin from '../components/admin/TrashBin';
import dataService from '../services/dataService_clean';
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
  const [userPlan, setUserPlan] = useState<{
    planType: 'basic' | 'standard' | 'premium' | 'enterprise';
    additionalEvaluators: number;
    planName: string;
  }>({
    planType: 'standard',
    additionalEvaluators: 0,
    planName: 'Standard Plan'
  });

  useEffect(() => {
    if (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name) {
      setUser(initialUser);
    }
  }, [initialUser.first_name, initialUser.last_name]);

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
  
  const getCurrentQuotas = () => {
    const basePlan = PLAN_QUOTAS[userPlan.planType];
    const totalEvaluators = basePlan.evaluators + (userPlan.additionalEvaluators * 10);
    
    return {
      maxProjects: basePlan.projects,
      currentProjects: projects.length,
      maxEvaluators: totalEvaluators,
      currentEvaluators: projects.reduce((total, project) => total + (project.evaluator_count || 0), 0),
      planName: userPlan.planName,
      additionalEvaluators: userPlan.additionalEvaluators
    };
  };
  
  const quotas = getCurrentQuotas();
  
  const [activeMenu, setActiveMenu] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'demographic-survey') return 'demographic-survey';
    return externalActiveTab === 'personal-service' ? 'dashboard' :
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
           'dashboard';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(externalSelectedProjectId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);

  // Tab change handler
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
    } else {
      setActiveMenu(tab);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
    const projectId = project.id || '';
    setSelectedProjectId(projectId);
    if (externalOnSelectProject) {
      externalOnSelectProject(projectId);
    }
    if (projectSelectorConfig) {
      setActiveMenu(projectSelectorConfig.nextAction);
    }
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  const handleProjectSelectorCancel = () => {
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  // Render menu content
  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">대시보드</h2>
              <p className="text-gray-600">프로젝트 현황과 통계를 확인하세요</p>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">내 프로젝트</h2>
              <Button variant="primary" onClick={() => handleTabChange('creation')}>
                새 프로젝트 생성
              </Button>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">첫 번째 프로젝트를 시작해보세요</h3>
                <p className="text-gray-600 mb-6">AHP 분석을 통해 복잡한 의사결정을 체계적으로 해결할 수 있습니다.</p>
                <Button variant="primary" onClick={() => handleTabChange('creation')}>
                  새 프로젝트 생성
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>상태: {project.status}</span>
                      <span>{project.last_modified}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'creation':
        return (
          <div className="max-w-2xl mx-auto">
            <Card title="새 프로젝트 생성">
              <p className="text-gray-600 mb-6">새로운 AHP 분석 프로젝트를 생성하세요.</p>
              <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
                프로젝트 생성하기
              </Button>
            </Card>
          </div>
        );
      case 'model-builder':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="모델 구축">
              <p className="text-gray-600">기준과 대안을 설정하여 AHP 모델을 구성하세요.</p>
            </Card>
          </div>
        );
      case 'evaluators':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="평가자 관리">
              <p className="text-gray-600">평가 참여자를 초대하고 권한을 관리하세요.</p>
            </Card>
          </div>
        );
      case 'monitoring':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="진행률 확인">
              <p className="text-gray-600">평가 진행 상황을 실시간으로 모니터링하세요.</p>
            </Card>
          </div>
        );
      case 'analysis':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="결과 분석">
              <p className="text-gray-600">AHP 분석 결과와 순위를 확인하세요.</p>
            </Card>
          </div>
        );
      case 'export':
        return (
          <div className="max-w-4xl mx-auto">
            <Card title="보고서 내보내기">
              <p className="text-gray-600">Excel, PDF, PPT 형식으로 보고서를 내보내세요.</p>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <PersonalSettings 
              user={user}
              onUserUpdate={handleUserUpdate}
              onBack={() => handleTabChange('dashboard')}
            />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">대시보드</h2>
              <p className="text-gray-600">프로젝트 현황과 통계를 확인하세요</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 왼쪽 사이드바 */}
      <div className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="p-6">
          {/* 사용자 프로필 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">
                {user.first_name[0]}{user.last_name[0]}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full inline-block">
              {userPlan.planName}
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="space-y-2">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">메인 메뉴</h4>
              {[
                { id: 'dashboard', label: '대시보드', icon: '🏠' },
                { id: 'projects', label: '내 프로젝트', icon: '📂' },
                { id: 'creation', label: '새 프로젝트', icon: '➕' },
                { id: 'model-builder', label: '모델 구축', icon: '🏗️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">고급 기능</h4>
              {[
                { id: 'evaluators', label: '평가자 관리', icon: '👥' },
                { id: 'monitoring', label: '진행률 확인', icon: '📈' },
                { id: 'analysis', label: '결과 분석', icon: '📊' },
                { id: 'export', label: '보고서', icon: '📤' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">도구</h4>
              {[
                { id: 'survey-links', label: '설문 링크', icon: '🔗' },
                { id: 'evaluation-test', label: '평가 테스트', icon: '🧪' },
                { id: 'workshop', label: '워크샵', icon: '🎯' },
                { id: 'settings', label: '설정', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    activeMenu === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* 오른쪽 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-white shadow-sm border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">개인 서비스</h1>
              <p className="text-gray-600">AHP 의사결정 분석 플랫폼</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                프로젝트: {projects.length}/{quotas.maxProjects}
              </div>
              <div className="text-sm text-gray-500">
                평가자: {quotas.currentEvaluators}/{quotas.maxEvaluators}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeMenu === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* 환영 메시지 */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '2rem'
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '0.75rem', fontSize: '2rem' }}>🎯</span>
                    AHP 의사결정 분석 전문 플랫폼
                  </h1>
                  <p style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    margin: '0 0 1rem 0',
                    opacity: '0.9',
                    lineHeight: '1.5'
                  }}>
                    안녕하세요, {user.first_name} {user.last_name}님! 📊 체계적이고 과학적인 의사결정 분석을 위한 전문 플랫폼에 오신 것을 환영합니다.
                  </p>
                </div>
              </div>

              {/* 프로젝트 현황 대시보드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* 프로젝트 수 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">프로젝트</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-blue-600">{projects.length}</span>
                        <span className="text-sm text-gray-500 ml-1">/ {quotas.maxProjects}</span>
                      </div>
                    </div>
                    <div className="text-4xl text-blue-500">📂</div>
                  </div>
                </div>

                {/* 평가자 수 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">평가자</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-green-600">{quotas.currentEvaluators}</span>
                        <span className="text-sm text-gray-500 ml-1">/ {quotas.maxEvaluators}</span>
                      </div>
                    </div>
                    <div className="text-4xl text-green-500">👥</div>
                  </div>
                </div>

                {/* 진행률 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">완료율</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-purple-600">
                          {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="text-4xl text-purple-500">📈</div>
                  </div>
                </div>
              </div>

              {/* 최근 프로젝트 */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 프로젝트</h3>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-500">아직 프로젝트가 없습니다</p>
                    <button
                      onClick={() => handleTabChange('creation')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      새 프로젝트 만들기
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-500">{project.status}</p>
                        </div>
                        <span className="text-sm text-gray-400">{project.last_modified}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기타 메뉴 콘텐츠 렌더링 */}
          {activeMenu !== 'dashboard' && (
            <div className="max-w-7xl mx-auto">
              {renderMenuContent()}
            </div>
          )}
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