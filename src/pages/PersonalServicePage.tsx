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
import type { ProjectData } from '../services/api';

interface PersonalServiceProps {
  user: {
    id: string | number;  // 백엔드는 number로 보냄
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onUserUpdate?: (updatedUser: {
    id: string | number;  // 백엔드는 number로 보냄
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
  evaluation_method: 'pairwise' | 'direct' | 'mixed'; // 레거시 호환성
}


// 요금제별 할당량 정의
const PLAN_QUOTAS = {
  'basic': { projects: 3, evaluators: 30 },
  'standard': { projects: 3, evaluators: 50 },
  'premium': { projects: 3, evaluators: 100 },
  'enterprise': { projects: 3, evaluators: 100 } // + 10명 단위 추가 가능
};

const PersonalServicePage: React.FC<PersonalServiceProps> = ({ 
  user: initialUser, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  onUserUpdate,
  projects: externalProjects = [], // 기본값으로 빈 배열 설정
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
  // 사용자 정보 내부 상태 관리
  const [user, setUser] = useState(initialUser);
  
  // 요금제 정보 관리
  const [userPlan, setUserPlan] = useState<{
    planType: 'basic' | 'standard' | 'premium' | 'enterprise';
    additionalEvaluators: number; // 10명 단위 추가 구매
    planName: string;
  }>({
    planType: 'standard',
    additionalEvaluators: 0,
    planName: 'Standard Plan'
  });

  // props의 user가 변경될 때 내부 상태도 업데이트
  useEffect(() => {
    console.log('👀 PersonalServicePage: props user 변경 감지', {
      이전내부사용자: user,
      새props사용자: initialUser,
      변경됨: user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name
    });
    if (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name) {
      setUser(initialUser);
    }
  }, [initialUser.first_name, initialUser.last_name]);

  // 사용자 정보 업데이트 처리
  const handleUserUpdate = (updatedUser: typeof initialUser) => {
    console.log('🔄 PersonalServicePage: handleUserUpdate 호출!', {
      이전사용자: user,
      새사용자: updatedUser,
      onUserUpdate존재: !!onUserUpdate
    });
    
    // 새로운 객체 참조를 만들어 React 리렌더링 보장
    const newUserObject = {
      ...updatedUser,
      // 타임스탬프 추가로 강제 리렌더링
      _updated: Date.now()
    };
    
    setUser(newUserObject);
    if (onUserUpdate) {
      console.log('🚀 PersonalServicePage: App.tsx로 전파!', newUserObject);
      onUserUpdate(newUserObject);
    }
  };
  
  // props에서 받은 projects를 직접 사용 (내부 state 제거)
  const projects = Array.isArray(externalProjects) ? externalProjects : [];
  
  // 현재 사용량 및 할당량 계산
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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'overview' | 'projects' | 'criteria' | 'alternatives' | 'evaluators' | 'finalize'>('overview');
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    objective: '',
    evaluation_method: 'pairwise' as 'pairwise' | 'direct' | 'mixed',
    evaluation_mode: 'practical' as EvaluationMode,
    workflow_stage: 'creating' as WorkflowStage
  });
  const [newProjectStep, setNewProjectStep] = useState(1);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);
  const [projectEvaluators, setProjectEvaluators] = useState<any[]>([]);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);
  // 진행률 모니터링 페이지네이션 상태
  const [currentMonitoringPage, setCurrentMonitoringPage] = useState(1);
  
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'projects' | 'creation' | 'model-builder' | 'validity-check' | 'evaluators' | 'survey-links' | 'monitoring' | 'analysis' | 'paper' | 'export' | 'workshop' | 'decision-support' | 'evaluation-test' | 'settings' | 'usage-management' | 'payment' | 'demographic-survey' | 'trash'>(() => {
    // URL 파라미터에서 직접 demographic-survey 확인
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    console.log('🔍 PersonalServicePage 초기화:', { 
      tabParam, 
      externalActiveTab,
      urlSearch: window.location.search 
    });
    
    if (tabParam === 'demographic-survey') {
      console.log('✅ demographic-survey 탭으로 설정');
      return 'demographic-survey';
    }
    
    // 기존 externalActiveTab 기반 로직
    const result = externalActiveTab === 'personal-service' ? 'dashboard' :
    externalActiveTab === 'my-projects' ? 'projects' :
    externalActiveTab === 'project-creation' ? 'creation' :
    externalActiveTab === 'model-builder' ? 'model-builder' :
    externalActiveTab === 'evaluator-management' ? 'evaluators' :
    externalActiveTab === 'progress-monitoring' ? 'monitoring' :
    externalActiveTab === 'results-analysis' ? 'analysis' :
    externalActiveTab === 'paper-management' ? 'paper' :
    externalActiveTab === 'export-reports' ? 'export' :
    externalActiveTab === 'workshop-management' ? 'workshop' :
    externalActiveTab === 'decision-support-system' ? 'decision-support' :
    externalActiveTab === 'personal-settings' ? 'settings' :
    'dashboard';
    
    console.log('📊 최종 activeMenu 설정:', result);
    return result;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectTemplate, setProjectTemplate] = useState<'blank' | 'business' | 'technical' | 'academic'>('blank');
  
  // Project management UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress' | 'status'>('date');

  // 현재 사용자의 플랜 정보 (실제로는 API에서 가져와야 함)
  const currentPlan = 'standard'; // 임시로 Standard Plan으로 설정
  const planLimits = PLAN_QUOTAS[currentPlan];
  
  // 사용량 계산 (안전 가드 추가)
  const usedProjects = (projects || []).length;
  const usedEvaluators = (projects || []).reduce((sum, p) => sum + (p.evaluator_count || 0), 0);
  
  // 사용 가능한 옵션들 (플랜별로 다를 수 있음)
  const availableFeatures = {
    'basic': {
      'advanced-analysis': false,
      'group-ahp': false,
      'realtime-collab': false,
      'premium-support': false
    },
    'standard': {
      'advanced-analysis': false,
      'group-ahp': true,
      'realtime-collab': false,
      'premium-support': false
    },
    'premium': {
      'advanced-analysis': true,
      'group-ahp': true,
      'realtime-collab': true,
      'premium-support': true
    },
    'enterprise': {
      'advanced-analysis': true,
      'group-ahp': true,
      'realtime-collab': true,
      'premium-support': true
    }
  };
  
  const currentFeatures = availableFeatures[currentPlan];

  const projectTemplates = {
    blank: { name: '빈 프로젝트', desc: '처음부터 설정' },
    business: { name: '비즈니스 결정', desc: '경영 의사결정 템플릿' },
    technical: { name: '기술 선택', desc: '기술 대안 비교 템플릿' },
    academic: { name: '연구 분석', desc: '학술 연구용 템플릿' }
  };

  // 외부에서 activeTab이 변경되면 내부 activeMenu도 업데이트
  useEffect(() => {
    if (externalActiveTab) {
      const menuMap: Record<string, string> = {
        'personal-service': 'dashboard',
        'my-projects': 'projects',
        'project-creation': 'creation',
        'model-builder': 'model-builder',
        'validity-check': 'validity-check',
        'evaluator-management': 'evaluators',
        'progress-monitoring': 'monitoring',
        'results-analysis': 'analysis',
        'export-reports': 'export',
        'workshop-management': 'workshop',
        'decision-support-system': 'decision-support',
        'personal-settings': 'settings',
        'demographic-survey': 'demographic-survey'
      };
      const mappedMenu = menuMap[externalActiveTab] || 'dashboard';
      setActiveMenu(mappedMenu as any);
    }
  }, [externalActiveTab]);

  const handleTabChange = (tab: string) => {
    // 프로젝트 선택이 필요한 메뉴들
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
      // 내부 메뉴를 외부 activeTab ID로 변환
      const tabMap: Record<string, string> = {
        'dashboard': 'personal-service',
        'projects': 'my-projects',
        'creation': 'project-creation',
        'model-builder': 'model-builder',
        'validity-check': 'validity-check',
        'evaluators': 'evaluator-management',
        'monitoring': 'progress-monitoring',
        'analysis': 'results-analysis',
        'export': 'export-reports',
        'workshop': 'workshop-management',
        'decision-support': 'decision-support-system',
        'evaluation-test': 'evaluation-test',
        'settings': 'personal-settings',
        'demographic-survey': 'demographic-survey',
        'trash': 'trash'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    } else {
      setActiveMenu(tab as any);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
    setActiveProject(project.id || null);
    setSelectedProjectId(project.id || '');
    setShowProjectSelector(false);
    
    if (projectSelectorConfig) {
      // 선택된 프로젝트와 함께 해당 기능으로 이동
      if (projectSelectorConfig.nextAction === 'model-builder') {
        setCurrentStep('criteria');
        setActiveMenu('model-builder');
      } else if (projectSelectorConfig.nextAction === 'monitoring') {
        setActiveMenu('monitoring');
      } else if (projectSelectorConfig.nextAction === 'analysis') {
        setActiveMenu('analysis');
      }
    }
    
    setProjectSelectorConfig(null);
  };

  const handleProjectSelectorCancel = () => {
    setShowProjectSelector(false);
    setProjectSelectorConfig(null);
  };

  const renderOverview = () => (
    <div className="space-y-6">

      {/* 프로젝트 현황 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-info-text)' }}>프로젝트</p>
              <p className="text-3xl font-bold" style={{ 
                color: (projects || []).length >= getCurrentQuotas().maxProjects ? 'var(--status-error-text)' : 'var(--text-primary)' 
              }}>
                {(projects || []).length}<span className="text-lg text-gray-500">/{getCurrentQuotas().maxProjects}</span>
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
                color: getCurrentQuotas().currentEvaluators >= getCurrentQuotas().maxEvaluators ? 'var(--status-error-text)' : 'var(--text-primary)' 
              }}>
                {getCurrentQuotas().currentEvaluators}<span className="text-lg text-gray-500">/{getCurrentQuotas().maxEvaluators}</span>
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
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{(projects || []).filter(p => p.status === 'active').length}</p>
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
                {(projects || []).filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 6개 인라인 배치 */}
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

      {/* 빠른 시작 및 빠른 접근 통합 - 하단에 크게 배치 */}
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
      case 'projects':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>내 프로젝트</h3>
            <p className="text-gray-600 mb-4">나의 AHP 분석 프로젝트들을 관리하는 기능이 개발 중입니다.</p>
            <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
              대시보드로 돌아가기
            </Button>
          </div>
        );
      case 'creation':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">새 프로젝트 생성</h3>
            
            {/* 템플릿 선택 */}
            <Card title="프로젝트 템플릿 선택">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(projectTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setProjectTemplate(key as any)}
                    aria-label={`${template.name} 템플릿 선택 - ${template.desc}`}
                    aria-pressed={projectTemplate === key}
                    className={`p-4 text-center border-2 rounded-lg transition-all ${
                      projectTemplate === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {key === 'blank' ? '📄' : 
                       key === 'business' ? '📋' :
                       key === 'technical' ? '💻' : '📚'}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-600">{template.desc}</p>
                  </button>
                ))}
              </div>
            </Card>

            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>프로젝트 생성 UI</h3>
              <p className="text-gray-600 mb-4">새 프로젝트 생성 기능이 개발 중입니다.</p>
              <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        );
      case 'validity-check':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>평가문항 확인</h3>
              <p className="text-gray-600 mb-4">평가문항의 유효성을 검증하는 기능이 개발 중입니다.</p>
              <Button variant="primary" onClick={() => handleTabChange('dashboard')}>
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        );
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
              {activeMenu} 기능
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
                        {externalActiveTab === 'validity-check' && '🔍'}
                        {externalActiveTab === 'demographic-survey' && '📄'}
                        {externalActiveTab === 'trash' && '🗑️'}
                      </span>
                      {externalActiveTab === 'my-projects' && '내 프로젝트'}
                      {externalActiveTab === 'project-creation' && '새 프로젝트 생성'}
                      {externalActiveTab === 'evaluator-management' && '평가자 관리'}
                      {externalActiveTab === 'progress-monitoring' && '진행률 모니터링'}
                      {externalActiveTab === 'results-analysis' && '결과 분석'}
                      {externalActiveTab === 'export-reports' && '보고서 내보내기'}
                      {externalActiveTab === 'workshop-management' && '워크숍 관리'}
                      {externalActiveTab === 'decision-support-system' && '의사결정 지원'}
                      {externalActiveTab === 'personal-settings' && '개인 설정'}
                      {externalActiveTab === 'validity-check' && '평가문항 확인'}
                      {externalActiveTab === 'demographic-survey' && '인구통계학적 설문'}
                      {externalActiveTab === 'trash' && '휴지통'}
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
                      {externalActiveTab === 'validity-check' && '평가문항의 유효성을 검증합니다'}
                      {externalActiveTab === 'demographic-survey' && '연구를 위한 인구통계학적 정보를 수집합니다'}
                      {externalActiveTab === 'trash' && '삭제된 프로젝트를 관리합니다'}
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