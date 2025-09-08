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
          <div className="space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">대시보드</h2>
              <p className="text-lg text-gray-600 leading-relaxed">프로젝트 현황과 통계를 한눈에 확인하세요</p>
            </div>
            
            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">전체 프로젝트</p>
                    <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">참여 평가자</p>
                    <p className="text-3xl font-bold text-green-600">{quotas.currentEvaluators}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">완료율</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 최근 활동 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">최근 활동</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📋</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">아직 프로젝트가 없습니다</h4>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">첫 번째 AHP 프로젝트를 생성하여 의사결정 분석을 시작해보세요.</p>
                  <Button variant="primary" onClick={() => handleTabChange('creation')} className="px-8 py-3 text-lg">
                    새 프로젝트 시작하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-lg">📊</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{project.title}</h4>
                          <p className="text-gray-600 mt-1">{project.status}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{project.last_modified}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                    <span className="text-xl">📂</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">내 프로젝트</h2>
                    <p className="text-lg text-gray-600">생성한 AHP 프로젝트를 관리하고 분석하세요</p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => handleTabChange('creation')} className="px-6 py-3">
                  ➕ 새 프로젝트 생성
                </Button>
              </div>
            </div>
            
            {/* 프로젝트 목록 */}
            {projects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="text-8xl mb-8">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">첫 번째 프로젝트를 시작해보세요</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                  AHP 분석을 통해 복잡한 의사결정을 체계적이고 과학적으로 해결할 수 있습니다.
                </p>
                <Button variant="primary" onClick={() => handleTabChange('creation')} className="px-8 py-4 text-lg">
                  🚀 프로젝트 생성하기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-xl shadow-sm border p-8 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📊</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'completed' ? '완료' :
                         project.status === 'active' ? '진행중' : '초안'}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">{project.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">수정일: {project.last_modified}</span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">편집</button>
                        <button className="text-gray-600 hover:text-gray-800 font-medium">보기</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'creation':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">➕</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">새 프로젝트 생성</h2>
              <p className="text-lg text-gray-600 leading-relaxed">새로운 AHP 분석 프로젝트를 생성하여 의사결정 과정을 시작하세요</p>
            </div>
            
            {/* 템플릿 선택 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">프로젝트 템플릿 선택</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                  <div className="text-4xl mb-4">📋</div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">비즈니스 의사결정</h4>
                  <p className="text-gray-600 leading-relaxed">제품 선택, 공급업체 평가, 투자 결정 등 비즈니스 상황에 최적화</p>
                </div>
                <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
                  <div className="text-4xl mb-4">🎓</div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">학술 연구</h4>
                  <p className="text-gray-600 leading-relaxed">논문, 연구 프로젝트, 학술적 의사결정에 적합한 구조</p>
                </div>
                <div className="p-6 border-2 border-orange-200 rounded-xl bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors">
                  <div className="text-4xl mb-4">🔧</div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">기술 평가</h4>
                  <p className="text-gray-600 leading-relaxed">기술 선택, 시스템 평가, IT 의사결정에 특화된 템플릿</p>
                </div>
                <div className="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="text-4xl mb-4">📄</div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">빈 프로젝트</h4>
                  <p className="text-gray-600 leading-relaxed">처음부터 직접 설정하여 맞춤형 AHP 모델 구성</p>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t text-center">
                <Button variant="primary" onClick={() => handleTabChange('dashboard')} className="px-8 py-3 text-lg">
                  🚀 프로젝트 생성하기
                </Button>
              </div>
            </div>
          </div>
        );
      case 'model-builder':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <span className="text-2xl">🏧</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">모델 구축</h2>
              <p className="text-lg text-gray-600 leading-relaxed">기준과 대안을 체계적으로 설정하여 AHP 모델을 구성하세요</p>
            </div>
            
            {/* 모델 구축 단계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">목표 설정</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">의사결정 목표와 배경을 명확히 정의합니다.</p>
                <Button variant="outline" className="w-full">시작하기</Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">기준 설정</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">평가 기준을 추가하고 계층 구조를 구성합니다.</p>
                <Button variant="outline" className="w-full">기준 추가</Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">대안 설정</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">비교할 대안들을 추가하고 정의합니다.</p>
                <Button variant="outline" className="w-full">대안 추가</Button>
              </div>
            </div>
            
            {/* 모델 미리보기 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">모델 미리보기</h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🌳</div>
                <p className="text-gray-600 text-lg">모델을 구성하면 여기에 계층 구조가 표시됩니다.</p>
              </div>
            </div>
          </div>
        );
      case 'evaluators':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">평가자 관리</h2>
                    <p className="text-lg text-gray-600">평가 참여자를 초대하고 진행 상황을 관리하세요</p>
                  </div>
                </div>
                <Button variant="primary" className="px-6 py-3">
                  ➕ 평가자 초대
                </Button>
              </div>
            </div>
            
            {/* 평가자 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">{quotas.currentEvaluators}</div>
                    <div className="text-sm text-gray-500">전체 평가자</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-xl">✓</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500">활성 평가자</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <div className="text-sm text-gray-500">대기 중</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-purple-600">0%</div>
                    <div className="text-sm text-gray-500">평균 완료율</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 평가자 목록 */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">평가자 목록</h3>
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">👥</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">아직 초대된 평가자가 없습니다</h4>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">평가자를 초대하여 AHP 평가 과정을 시작하세요.</p>
                  <Button variant="primary" className="px-8 py-3">평가자 초대하기</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'monitoring':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">진행률 모니터링</h2>
              <p className="text-lg text-gray-600 leading-relaxed">평가 진행 상황을 실시간으로 모니터링하고 관리하세요</p>
            </div>
            
            {/* 전체 진행 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'active').length}</div>
                    <div className="text-sm text-gray-500">활성 프로젝트</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">{quotas.currentEvaluators}</div>
                    <div className="text-sm text-gray-500">참여 평가자</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-xl">🎣</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-500">평균 완료율</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-xl">⏱️</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-orange-600">~</div>
                    <div className="text-sm text-gray-500">평균 소요시간</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 프로젝트별 진행률 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">프로젝트별 진행 상황</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📈</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">모니터링할 프로젝트가 없습니다</h4>
                  <p className="text-gray-600 text-lg">프로젝트를 생성한 후 진행률을 모니터링하세요.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div key={project.id} className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-gray-900">{project.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'completed' ? '완료' :
                           project.status === 'active' ? '진행중' : '초안'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{width: `${project.completion_rate || 0}%`}}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>진행률: {project.completion_rate || 0}%</span>
                        <span>평가자: {project.evaluator_count || 0}명</span>
                        <span>수정일: {project.last_modified}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">결과 분석</h2>
              <p className="text-lg text-gray-600 leading-relaxed">AHP 분석 결과와 순위를 상세히 분석하고 리포트를 생성하세요</p>
            </div>
            
            {/* 분석 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">최종 순위</h3>
                <p className="text-gray-600 mb-4">대안별 최종 순위와 점수 확인</p>
                <Button variant="outline" className="w-full">보기</Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">기준별 중요도</h3>
                <p className="text-gray-600 mb-4">각 기준의 중요도와 가중치 분석</p>
                <Button variant="outline" className="w-full">보기</Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">일관성 분석</h3>
                <p className="text-gray-600 mb-4">CR 값과 일관성 평가 결과</p>
                <Button variant="outline" className="w-full">보기</Button>
              </div>
            </div>
            
            {/* 결과 요약 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">분석 결과 요약</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📊</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">분석할 데이터가 없습니다</h4>
                  <p className="text-gray-600 text-lg">프로젝트를 완성한 후 결과를 분석하세요.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 예시 결과 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <h4 className="font-bold text-lg text-gray-900 mb-3">최고 순위 대안</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">대안 A</span>
                        <span className="text-3xl font-bold text-blue-600">85.3%</span>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <h4 className="font-bold text-lg text-gray-900 mb-3">일관성 비율</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-gray-700">CR 비율</span>
                        <span className="text-3xl font-bold text-green-600">0.05</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'export':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">📤</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">보고서 내보내기</h2>
              <p className="text-lg text-gray-600 leading-relaxed">분석 결과를 다양한 형식으로 내보내고 보고서를 생성하세요</p>
            </div>
            
            {/* 내보내기 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Excel 보고서</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">데이터 테이블, 차트, 계산 과정이 포함된 상세 보고서</p>
                <Button variant="primary" className="w-full">
                  📥 Excel 다운로드
                </Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PDF 보고서</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">전문적인 분석 보고서와 시각적 차트가 포함된 문서</p>
                <Button variant="primary" className="w-full">
                  📥 PDF 다운로드
                </Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">🎑</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PowerPoint 프레젠테이션</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">발표용 슬라이드와 주요 결과가 정리된 프레젠테이션</p>
                <Button variant="primary" className="w-full">
                  📥 PPT 다운로드
                </Button>
              </div>
            </div>
            
            {/* 내보내기 설정 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">내보내기 옵션</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">포함할 내용</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">최종 순위 및 점수</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">기준별 가중치</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">일관성 분석</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-700">민감도 분석</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">추가 설정</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-700">로고 포함</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-gray-700">생성 일시 표시</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span className="text-gray-700">컴팩트 모드</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t text-center">
                <Button variant="primary" className="px-8 py-3 text-lg mr-4">
                  📦 전체 다운로드
                </Button>
                <Button variant="outline" className="px-6 py-3">
                  미리보기
                </Button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">개인 설정</h2>
              <p className="text-lg text-gray-600 leading-relaxed">계정 정보와 서비스 설정을 관리하세요</p>
            </div>
            
            {/* 설정 컴포넌트 */}
            <PersonalSettings 
              user={user}
              onUserUpdate={handleUserUpdate}
              onBack={() => handleTabChange('dashboard')}
            />
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">대시보드</h2>
              <p className="text-lg text-gray-600 leading-relaxed">프로젝트 현황과 통계를 한눈에 확인하세요</p>
            </div>
          </div>
        );
      case 'survey-links':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">설문 링크 관리</h2>
              <p className="text-lg text-gray-600 leading-relaxed">평가자들이 사용할 설문 링크를 생성하고 관리하세요</p>
            </div>
            
            {/* 링크 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-xl">🔗</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">생성된 링크</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-xl">✓</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500">활성 링크</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-500">참여 완료</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-orange-600">0%</div>
                    <div className="text-sm text-gray-500">응답률</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 링크 생성 및 관리 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">설문 링크 목록</h3>
                <Button variant="primary" className="px-6 py-3">
                  ➕ 새 링크 생성
                </Button>
              </div>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🔗</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">아직 생성된 링크가 없습니다</h4>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">평가자들이 접근할 수 있는 설문 링크를 생성하세요.</p>
                <Button variant="primary" className="px-8 py-3">설문 링크 만들기</Button>
              </div>
            </div>
          </div>
        );
      case 'evaluation-test':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">평가 테스트</h2>
              <p className="text-lg text-gray-600 leading-relaxed">평가 과정을 미리 테스트하고 배포 전에 검증하세요</p>
            </div>
            
            {/* 테스트 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">빠른 테스트</h3>
                  <p className="text-gray-600">간단한 평가 시나리오로 빠른 테스트</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">예상 소요시간</span>
                    <span className="font-semibold">5-10분</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">평가 항목 수</span>
                    <span className="font-semibold">3-5개</span>
                  </div>
                  <Button variant="primary" className="w-full mt-6">테스트 시작</Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🔬</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">상세 테스트</h3>
                  <p className="text-gray-600">실제 프로젝트와 동일한 환경에서 테스트</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">예상 소요시간</span>
                    <span className="font-semibold">15-30분</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">평가 항목 수</span>
                    <span className="font-semibold">전체</span>
                  </div>
                  <Button variant="outline" className="w-full mt-6">테스트 시작</Button>
                </div>
              </div>
            </div>
            
            {/* 최근 테스트 결과 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">최근 테스트 결과</h3>
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📈</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">아직 테스트 기록이 없습니다</h4>
                <p className="text-gray-600 text-lg">평가 테스트를 실행한 후 결과가 여기에 표시됩니다.</p>
              </div>
            </div>
          </div>
        );
      case 'workshop':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* 페이지 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">워크샵 관리</h2>
              <p className="text-lg text-gray-600 leading-relaxed">그룹 평가 워크샵을 기획하고 진행하세요</p>
            </div>
            
            {/* 워크샵 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-500">활성 워크샵</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">참여자</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-xl">✓</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-500">완료된 세션</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-xl">⏱️</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-purple-600">~</div>
                    <div className="text-sm text-gray-500">평균 소요시간</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 워크샵 생성 가이드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">준비 단계</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="mr-2">•</span>목표 설정</li>
                  <li className="flex items-center"><span className="mr-2">•</span>참여자 선정</li>
                  <li className="flex items-center"><span className="mr-2">•</span>일정 조율</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">진행 단계</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="mr-2">•</span>실시간 평가</li>
                  <li className="flex items-center"><span className="mr-2">•</span>토론 및 합의</li>
                  <li className="flex items-center"><span className="mr-2">•</span>결과 도출</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">결과 단계</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center"><span className="mr-2">•</span>결과 분석</li>
                  <li className="flex items-center"><span className="mr-2">•</span>보고서 작성</li>
                  <li className="flex items-center"><span className="mr-2">•</span>피드백 수집</li>
                </ul>
              </div>
            </div>
            
            {/* 워크샵 목록 */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">워크샵 목록</h3>
                <Button variant="primary" className="px-6 py-3">
                  ➕ 새 워크샵 만들기
                </Button>
              </div>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🎯</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">아직 워크샵이 없습니다</h4>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">그룹 평가 워크샵을 생성하여 협업적 의사결정을 진행하세요.</p>
                <Button variant="primary" className="px-8 py-3">워크샵 계획하기</Button>
              </div>
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

          {/* 네비게이션 메뉴 - 개선된 스타일링 */}
          <nav className="space-y-3">
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">메인 메뉴</h4>
              {[
                { id: 'dashboard', label: '대시보드', icon: '🏠' },
                { id: 'projects', label: '내 프로젝트', icon: '📂' },
                { id: 'creation', label: '새 프로젝트', icon: '➕' },
                { id: 'model-builder', label: '모델 구축', icon: '🏗️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 group ${
                    activeMenu === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">고급 기능</h4>
              {[
                { id: 'evaluators', label: '평가자 관리', icon: '👥' },
                { id: 'monitoring', label: '진행률 확인', icon: '📈' },
                { id: 'analysis', label: '결과 분석', icon: '📊' },
                { id: 'export', label: '보고서', icon: '📤' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 group ${
                    activeMenu === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">도구</h4>
              {[
                { id: 'survey-links', label: '설문 링크', icon: '🔗' },
                { id: 'evaluation-test', label: '평가 테스트', icon: '🧪' },
                { id: 'workshop', label: '워크샵', icon: '🎯' },
                { id: 'settings', label: '설정', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 group ${
                    activeMenu === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* 오른쪽 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 - 개선된 버전 */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">개인 서비스</h1>
                <p className="text-lg text-gray-600 leading-relaxed">AHP 의사결정 분석 전문 플랫폼에서 체계적인 분석을 수행하세요</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-blue-50 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">📊</span>
                    <div>
                      <div className="text-sm text-blue-600 font-medium">프로젝트</div>
                      <div className="text-lg font-bold text-blue-800">{projects.length}/{quotas.maxProjects}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">👥</span>
                    <div>
                      <div className="text-sm text-green-600 font-medium">평가자</div>
                      <div className="text-lg font-bold text-green-800">{quotas.currentEvaluators}/{quotas.maxEvaluators}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 - 개선된 여백과 최대 너비 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1400px] mx-auto">
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
          {activeMenu !== 'dashboard' && renderMenuContent()}
          </div>
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