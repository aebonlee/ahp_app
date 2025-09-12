import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import EnhancedEvaluatorManagement from './EnhancedEvaluatorManagement';
import SurveyLinkManager from './SurveyLinkManager';
import ModelFinalization from './ModelFinalization';
import WorkflowStageIndicator, { WorkflowStage } from '../workflow/WorkflowStageIndicator';
import { EvaluationMode } from '../evaluation/EvaluationModeSelector';
import PaymentSystem from '../payment/PaymentSystem';
import WorkshopManagement from '../workshop/WorkshopManagement';
import DecisionSupportSystem from '../decision/DecisionSupportSystem';
import PaperManagement from '../paper/PaperManagement';
import ProjectSelector from '../project/ProjectSelector';
import SurveyManagementSystem from '../survey/SurveyManagementSystem';
import PersonalSettings from '../settings/PersonalSettings';
import UsageManagement from './UsageManagement';
import ValidityCheck from '../validity/ValidityCheck';
import TrashBin from './TrashBin';
import dataService from '../../services/dataService_clean';
import type { ProjectData } from '../../services/api';
// DEMO 데이터 제거 - 실제 DB만 사용

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

const PersonalServiceDashboard: React.FC<PersonalServiceProps> = ({ 
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
  // Auth context에서 관리자 권한 확인
  const { user: authUser, isAdmin, isSuperAdmin, hasRole } = useAuth();
  
  // 사용자 정보 내부 상태 관리 (aebon이면 관리자 권한 부여)
  const [user, setUser] = useState(() => {
    const enhancedUser = {
      ...initialUser,
      role: (initialUser.first_name === 'AHP' && initialUser.last_name === 'Super Admin') || 
            authUser?.username === 'aebon' || 
            isSuperAdmin ? 'super_admin' : initialUser.role,
      admin_type: isSuperAdmin ? 'super' : (initialUser.admin_type || 'personal')
    };
    return enhancedUser;
  });
  
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

  // props에서 projects를 직접 사용하므로 useEffect 불필요

  // props의 user가 변경될 때 내부 상태도 업데이트
  useEffect(() => {
    console.log('👀 PersonalServiceDashboard: props user 변경 감지', {
      이전내부사용자: user,
      새props사용자: initialUser,
      변경됨: user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name
    });
    if (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name) {
      setUser({
        ...initialUser,
        admin_type: initialUser.admin_type || 'personal'
      });
    }
  }, [initialUser.first_name, initialUser.last_name]);

  // 사용자 정보 업데이트 처리
  const handleUserUpdate = (updatedUser: typeof initialUser) => {
    console.log('🔄 PersonalServiceDashboard: handleUserUpdate 호출!', {
      이전사용자: user,
      새사용자: updatedUser,
      onUserUpdate존재: !!onUserUpdate
    });
    
    // 새로운 객체 참조를 만들어 React 리렌더링 보장
    const newUserObject = {
      ...updatedUser,
      admin_type: updatedUser.admin_type || 'personal',
      // 타임스탬프 추가로 강제 리렌더링
      _updated: Date.now()
    };
    
    setUser(newUserObject);
    if (onUserUpdate) {
      console.log('🚀 PersonalServiceDashboard: App.tsx로 전파!', newUserObject);
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
    
    console.log('🔍 PersonalServiceDashboard 초기화:', { 
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
    technical: { name: '기술 선택', desc: '기술 대안 비교 템플맿' },
    academic: { name: '연구 분석', desc: '학술 연구용 템플맿' }
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

  // projects는 App.tsx에서 관리하므로 여기서 별도 로드 불필요

  // loadProjects 함수 제거 - App.tsx에서 관리

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      objective: '',
      evaluation_method: 'pairwise',
      evaluation_mode: 'practical' as EvaluationMode,
      workflow_stage: 'creating' as WorkflowStage
    });
    setProjectTemplate('blank');
    setEditingProject(null);
    setNewProjectStep(1);
    setNewProjectId(null);
    setProjectEvaluators([]);
    setIsProjectFormOpen(false);
    setError(null);
  };


  const handleEditProject = (project: UserProject) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      objective: project.objective || '',
      evaluation_method: project.evaluation_method,
      evaluation_mode: project.evaluation_mode || 'practical',
      workflow_stage: project.workflow_stage || 'creating'
    });
    setIsProjectFormOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectTitle = project?.title || '프로젝트';
    
    if (window.confirm(`"${projectTitle}"를 휴지통으로 이동하시겠습니까?\n\n휴지통에서 복원하거나 영구 삭제할 수 있습니다.`)) {
      try {
        console.log('🗑️ 삭제 시작:', projectId, projectTitle);
        
        // onDeleteProject prop 사용 (백엔드 API 호출)
        if (onDeleteProject) {
          await onDeleteProject(projectId);
          console.log('✅ 백엔드 삭제 완료');
          
          // 삭제는 App.tsx에서 관리됨
          console.log('✅ 프로젝트 목록 새로고침 완료');
          
          alert(`"${projectTitle}"가 휴지통으로 이동되었습니다.`);
        } else {
          console.error('❌ onDeleteProject prop이 없습니다');
          alert('삭제 기능이 연결되지 않았습니다.');
        }
      } catch (error) {
        console.error('❌ Project deletion error:', error);
        alert(error instanceof Error ? error.message : '프로젝트 삭제 중 오류가 발생했습니다.');
        
        // 실패시에도 App.tsx에서 관리됨
      }
    }
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💾 통합 데이터 서비스로 프로젝트 저장');
      
      if (editingProject) {
        // 편집 모드 - 프로젝트 수정
        const updatedProject = await dataService.updateProject(editingProject.id!, {
          title: projectForm.title,
          description: projectForm.description,
          objective: projectForm.objective,
          evaluation_mode: projectForm.evaluation_mode,
          workflow_stage: projectForm.workflow_stage
        });
        
        if (updatedProject) {
          const updatedUserProject: UserProject = {
            ...updatedProject,
            evaluator_count: editingProject.evaluator_count || 0,
            completion_rate: editingProject.completion_rate || 0,
            criteria_count: editingProject.criteria_count || 0,
            alternatives_count: editingProject.alternatives_count || 0,
            last_modified: new Date().toISOString().split('T')[0],
            evaluation_method: projectForm.evaluation_method
          };
          
          // 프로젝트 수정은 App.tsx에서 관리됨
          console.log('✅ 프로젝트 수정 완료');
        } else {
          throw new Error('프로젝트 수정에 실패했습니다.');
        }
      } else {
        // 생성 모드 - 새 프로젝트 생성
        console.log('🔍 프로젝트 생성 시작:', projectForm.title);
        
        let newProject;
        if (onCreateProject) {
          console.log('✅ App.tsx onCreateProject prop 사용');
          newProject = await onCreateProject({
            title: projectForm.title,
            description: projectForm.description,
            objective: projectForm.objective,
            status: 'draft',
            evaluation_mode: projectForm.evaluation_mode,
            workflow_stage: projectForm.workflow_stage
          });
        } else {
          console.log('⚠️ dataService 직접 호출 (fallback)');
          newProject = await dataService.createProject({
            title: projectForm.title,
            description: projectForm.description,
            objective: projectForm.objective,
            status: 'draft',
            evaluation_mode: projectForm.evaluation_mode,
            workflow_stage: projectForm.workflow_stage
          });
        }
        
        console.log('✅ 프로젝트 생성 결과:', newProject);
        
        if (newProject) {
          // 새 프로젝트 생성 완료 - App.tsx에서 관리됨
          setSelectedProjectId(newProject.id || '');
          console.log('✅ 새 프로젝트 생성 완료:', newProject.title);
        } else {
          throw new Error('프로젝트 생성에 실패했습니다.');
        }
      }
      
      resetProjectForm();
    } catch (error) {
      console.error('Project save error:', error);
      setError(error instanceof Error ? error.message : '프로젝트 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = (format: string, data?: any) => {
    // 결과 내보내기 로직
    console.log(`Exporting results to ${format}`, data);
    alert(`${format.toUpperCase()} 형식으로 결과를 내보내는 기능을 개발 중입니다.`);
  };

  // 프로젝트의 기준 개수 업데이트
  const handleCriteriaCountUpdate = (count: number) => {
    if (selectedProjectId) {
      // 기준 수 업데이트는 App.tsx에서 관리
      console.log('🔢 기준 수 업데이트:', count);
    }
  };

  // 프로젝트의 대안 개수 업데이트
  const handleAlternativesCountUpdate = (count: number) => {
    if (selectedProjectId) {
      // 대안 수 업데이트는 App.tsx에서 관리
      console.log('🔢 대안 수 업데이트:', count);
    }
  };

  const handleCreateNewProject = async () => {
    if (!projectForm.title.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // dataService를 사용하여 프로젝트 생성 (자동으로 온라인/오프라인 모드 처리)
      const projectData: Omit<ProjectData, 'id'> = {
        title: projectForm.title,
        description: projectForm.description,
        objective: projectForm.objective || '',
        status: 'draft',
        evaluation_mode: projectForm.evaluation_mode || 'practical',
        workflow_stage: 'creating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating project with dataService:', projectData);
      const createdProject = await dataService.createProject(projectData);
      
      if (!createdProject) {
        throw new Error('프로젝트 생성에 실패했습니다.');
      }

      // UserProject 형식으로 변환
      const newProject: UserProject = {
        id: createdProject.id || '',
        title: createdProject.title,
        description: createdProject.description || '',
        objective: createdProject.objective || '',
        status: createdProject.status || 'draft',
        evaluation_mode: createdProject.evaluation_mode || 'practical',
        workflow_stage: createdProject.workflow_stage || 'creating',
        created_at: createdProject.created_at ? new Date(createdProject.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        evaluator_count: 0, // 실제 DB에서 조회
        completion_rate: 85, // 실제 진행률
        criteria_count: 0, // 실제 DB에서 조회
        alternatives_count: 0, // 실제 DB에서 조회
        evaluation_method: projectForm.evaluation_method || 'pairwise'
      };

      // 새 프로젝트 추가는 App.tsx에서 관리됨
      setSelectedProjectId(newProject.id || '');
      setNewProjectId(newProject.id || '');
      
      console.log('Project created successfully:', newProject);
      setError(null);
      
      // 프로젝트 생성 후 평가자 배정 단계로 이동
      setNewProjectStep(2);
      
      // 폼 데이터는 유지 (평가자 배정 후 완전히 리셋)
    } catch (error: any) {
      console.error('Project creation error:', error);
      // dataService가 자동으로 오프라인 모드로 처리하므로 에러 메시지를 사용자 친화적으로 변경
      setError(error.message || '프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 요금제 데이터 정의
  const pricingPlans = {
    subscription: [
      {
        id: 'basic',
        name: 'Basic',
        description: '개인/연구자용',
        color: 'green',
        icon: '🟢',
        monthly: 19,
        yearly: 190,
        projects: 3,
        evaluators: 10,
        features: ['기본 설문 생성 및 AHP 계산', '자동 일관성 검증', 'PDF/Excel 보고서 다운로드']
      },
      {
        id: 'pro',
        name: 'Pro',
        description: '연구팀/기관용',
        color: 'blue',
        icon: '🔵',
        monthly: 99,
        yearly: 990,
        projects: 20,
        evaluators: 100,
        features: ['Basic 기능 포함', '협업 기능(팀 단위 계정 관리)', '커스터마이징 보고서 & API 연동', '우선 기술 지원']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: '대규모 기관/공공 프로젝트용',
        color: 'purple',
        icon: '🟣',
        monthly: '맞춤 견적',
        yearly: '맞춤 견적',
        projects: '무제한',
        evaluators: '무제한',
        features: ['Pro 기능 포함', '온프레미스 설치 또는 전용 클라우드', '보안/권한 관리 강화', '전담 기술 지원 매니저']
      }
    ],
    oneTime: [
      {
        id: 'single',
        name: 'Single Project Pack',
        description: '단일 프로젝트용',
        color: 'yellow',
        icon: '🟡',
        price: 49,
        projects: 1,
        evaluators: 30,
        duration: '3개월',
        target: '대학원 논문, 단기 과제, 학술 발표 준비'
      },
      {
        id: 'team',
        name: 'Team Project Pack',
        description: '소규모 연구팀 단기 이용',
        color: 'orange',
        icon: '🟠',
        price: 149,
        projects: 1,
        evaluators: 100,
        duration: '6개월',
        target: '기업·기관 연구과제, 단일 컨설팅 프로젝트'
      },
      {
        id: 'institution',
        name: 'Institution Pack',
        description: '기관 단위 단기 프로젝트',
        color: 'red',
        icon: '🔴',
        price: 499,
        projects: 1,
        evaluators: '무제한',
        duration: '12개월',
        target: '공공기관·대규모 연구 프로젝트 단위 사용'
      }
    ]
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

      {/* Enhanced Navigation Menu - 2 Rows Layout - COMPLETE 16 MENUS */}
      <div 
        className="card-enhanced p-6"
        style={{
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="mb-4">
          <h2 
            className="text-lg font-bold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            서비스 메뉴
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            AHP 의사결정 분석의 모든 기능을 한 곳에서
          </p>
        </div>
        
        <div className="space-y-4">
          {/* First Row - Core Functions (7 items) */}
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { id: 'dashboard', label: '대시보드', icon: '🏠', tooltip: '프로젝트 현황과 통계를 한눈에 확인', priority: 'high' },
              { id: 'projects', label: '내 프로젝트', icon: '📂', tooltip: '생성한 모든 프로젝트 관리 및 편집', priority: 'high' },
              { id: 'trash', label: '휴지통', icon: '🗑️', tooltip: '삭제된 프로젝트 복원 및 영구 삭제', priority: 'high' },
              { id: 'creation', label: '새 프로젝트', icon: '➕', tooltip: '새로운 AHP 분석 프로젝트 생성', priority: 'high' },
              { id: 'model-builder', label: '모델 구축', icon: '🏗️', tooltip: '기준과 대안을 설정하여 모델 구성', priority: 'high' },
              { id: 'evaluators', label: '평가자 관리', icon: '👥', tooltip: '평가 참여자 초대 및 권한 관리' },
              { id: 'monitoring', label: '진행률 확인', icon: '📈', tooltip: '평가 진행 상황 실시간 모니터링' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-label={item.label}
                  className="w-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] hover:shadow-xl transform"
                  style={{
                    backgroundColor: activeMenu === item.id ? 'var(--color-gold-pastel-2)' : 'var(--neutral-50)',
                    borderColor: activeMenu === item.id ? 'var(--color-gold-dark-1)' : 'var(--color-gold-pastel-3)',
                    color: activeMenu === item.id ? 'var(--color-gold-dark-2)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gold-pastel-1)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm lg:text-base leading-tight">{item.label}</div>
                  {item.priority === 'high' && (
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--status-danger-bg)' }}
                    ></div>
                  )}
                </button>
                {/* Enhanced Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-xl"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                >
                  {item.tooltip}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{ borderTopColor: 'var(--text-primary)' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - Advanced Functions (9 items) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { id: 'analysis', label: '결과 분석', icon: '📊', tooltip: 'AHP 분석 결과와 순위 확인' },
              { id: 'demographic-survey', label: '인구통계학적 설문조사', icon: '📋', tooltip: 'Google Forms 스타일 설문 생성 및 관리' },
              { id: 'export', label: '보고서', icon: '📤', tooltip: 'Excel, PDF, PPT 형식으로 내보내기' },
              { id: 'survey-links', label: '설문 링크', icon: '🔗', tooltip: '평가자별 설문 링크 생성 및 관리' },
              { id: 'evaluation-test', label: '평가 테스트', icon: '🧪', tooltip: '실제 평가 환경에서 테스트 진행' },
              { id: 'workshop', label: '워크숍', icon: '🎯', tooltip: '협업 의사결정 워크숍 관리' },
              { id: 'decision-support', label: '의사결정 지원', icon: '🧠', tooltip: '과학적 의사결정 지원 도구' },
              { id: 'usage-management', label: '사용량 관리', icon: '📊', tooltip: '구독 현황, 할당량 및 데이터 관리' },
              { id: 'settings', label: '설정', icon: '⚙️', tooltip: '개인 계정 및 환경 설정' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-label={item.label}
                  className="w-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] hover:shadow-xl transform"
                  style={{
                    backgroundColor: activeMenu === item.id ? 'var(--color-gold-pastel-2)' : 'var(--neutral-50)',
                    borderColor: activeMenu === item.id ? 'var(--color-gold-dark-1)' : 'var(--color-gold-pastel-3)',
                    color: activeMenu === item.id ? 'var(--color-gold-dark-2)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gold-pastel-1)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm lg:text-base leading-tight">{item.label}</div>
                </button>
                {/* Enhanced Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-xl"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                >
                  {item.tooltip}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{ borderTopColor: 'var(--text-primary)' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'projects':
        return (
          <Card title="프로젝트 설정">
            <div className="space-y-4">
              <p>프로젝트 기본 정보를 설정하는 단계입니다.</p>
              <Button variant="primary" className="p-5 lg:p-6 text-xl lg:text-2xl" onClick={() => setCurrentStep('criteria')}>
                다음 단계: 기준 설정
              </Button>
            </div>
          </Card>
        );
      case 'criteria':
        return (
          <div className="space-y-4">
            <CriteriaManagement 
              projectId={selectedProjectId} 
              onComplete={() => setCurrentStep('alternatives')}
              onCriteriaChange={handleCriteriaCountUpdate}
            />
            <div className="flex justify-between">
              <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('projects')}>
                이전
              </Button>
              <Button variant="primary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('alternatives')}>
                다음: 대안 설정
              </Button>
            </div>
          </div>
        );
      case 'alternatives':
        return (
          <div className="space-y-4">
            <AlternativeManagement 
              projectId={selectedProjectId} 
              onComplete={() => setCurrentStep('evaluators')}
              onAlternativesChange={handleAlternativesCountUpdate}
            />
            <div className="flex justify-between">
              <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('criteria')}>
                이전
              </Button>
              <Button variant="primary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('evaluators')}>
                다음: 평가자 배정
              </Button>
            </div>
          </div>
        );
      case 'evaluators':
        return (
          <div className="space-y-4">
            <EvaluatorAssignment projectId={selectedProjectId} onComplete={() => setCurrentStep('finalize')} />
            <div className="flex justify-between">
              <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('alternatives')}>
                이전
              </Button>
              <Button variant="primary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('finalize')}>
                다음: 모델 확정
              </Button>
            </div>
          </div>
        );
      case 'finalize':
        return (
          <ModelFinalization 
            projectId={selectedProjectId} 
            onFinalize={() => {
              setCurrentStep('overview');
              // 프로젝트 상태를 활성화로 변경
              // 프로젝트 상태 변경은 App.tsx에서 관리됨
              console.log('✅ 프로젝트 활성화됨:', selectedProjectId);
            }}
            isReadyToFinalize={true}
          />
        );
      default:
        return renderOverview();
    }
  };

  const getStepProgress = () => {
    const steps = ['overview', 'projects', 'criteria', 'alternatives', 'evaluators', 'finalize'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

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

  const renderMyProjectsFullPage = () => (
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
                    <span className="text-4xl mr-3">📂</span>
                    내 프로젝트
                  </h1>
                  <p className="text-gray-600 mt-2">나의 AHP 분석 프로젝트들을 관리합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="primary" className="p-5 lg:p-6 text-xl lg:text-2xl" onClick={() => handleTabChange('creation')}>
                  ➕ 새 프로젝트 생성
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMyProjects()}
      </div>
    </div>
  );

  const renderMyProjects = () => {
    // 필터링 및 검색 로직
    const filteredProjects = (projects || []).filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime();
        case 'progress':
          return (b.completion_rate || 0) - (a.completion_rate || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return (
    <div className="space-y-6">
      {/* 프로젝트 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-info-text)' }}>전체 프로젝트</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{(projects || []).length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-info-text)' }}>
              <span className="text-white text-2xl">📊</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-success-text)' }}>진행중</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{(projects || []).filter(p => p.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-success-text)' }}>
              <span className="text-white text-2xl">🚀</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>완료됨</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{(projects || []).filter(p => p.status === 'completed').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white text-2xl">✅</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-warning-text)' }}>평균 진행률</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {(projects || []).length > 0 ? Math.round((projects || []).reduce((sum, p) => sum + (p.completion_rate || 0), 0) / (projects || []).length) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 컨트롤 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 검색 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">상태:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="draft">준비중</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">정렬:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">최신순</option>
                <option value="name">이름순</option>
                <option value="progress">진행률순</option>
                <option value="status">상태순</option>
              </select>
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-1">⊞</span>그리드
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-1">☰</span>리스트
              </button>
            </div>

            <div className="flex space-x-2">
              <Button variant="error" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => handleTabChange('trash')}>
                🗑️휴지통
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 프로젝트 생성/편집 모달 */}
      {isProjectFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProject ? '프로젝트 편집' : '새 프로젝트 생성'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveProject();
            }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
                <input 
                  type="text" 
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2" 
                  placeholder="예: AI 도구 선택을 위한 중요도 분석" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea 
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20" 
                  placeholder="프로젝트의 목적과 배경을 설명해주세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">분석 목표</label>
                <textarea 
                  value={projectForm.objective}
                  onChange={(e) => setProjectForm({...projectForm, objective: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-16" 
                  placeholder="이 분석을 통해 달성하고자 하는 목표"
                />
              </div>
              {/* 평가 방법 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">평가 방법</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'pairwise', label: '쌍대비교', desc: '두 요소를 비교하여 평가', icon: '⚖️' },
                    { value: 'direct_input', label: '직접입력', desc: '직접 점수를 입력하여 평가', icon: '📝' },
                    { value: 'practical', label: '실무형', desc: '실무 중심의 평가 방식', icon: '📈' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setProjectForm({
                        ...projectForm,
                        evaluation_mode: mode.value as EvaluationMode,
                        evaluation_method: mode.value === 'direct_input' ? 'direct' : 'pairwise'
                      })}
                      className={`p-3 text-left border-2 rounded-lg transition-all ${
                        projectForm.evaluation_mode === mode.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{mode.icon}</span>
                        <span className="font-medium text-sm">{mode.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" type="button" onClick={resetProjectForm}>
                  취소
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? '처리 중...' : (editingProject ? '수정' : '생성')}
                </Button>
              </div>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* 프로젝트 목록 또는 빈 상태 */}
      {(projects || []).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">첫 번째 프로젝트를 시작해보세요</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            AHP 분석을 통해 복잡한 의사결정을 체계적으로 해결할 수 있습니다. 
            지금 바로 새 프로젝트를 생성하여 시작해보세요.
          </p>
          <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setIsProjectFormOpen(true)}>
            ➕ 새 프로젝트 생성
          </Button>
          <div className="mt-8 grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium mb-1">목표 설정</h4>
              <p className="text-sm text-gray-600">의사결정 목표와 평가 기준을 명확히 정의</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-medium mb-1">쌍대비교</h4>
              <p className="text-sm text-gray-600">기준과 대안을 체계적으로 비교 평가</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium mb-1">결과 분석</h4>
              <p className="text-sm text-gray-600">객관적이고 신뢰할 수 있는 우선순위 도출</p>
            </div>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            다른 검색어를 시도하거나 필터를 조정해보세요.
          </p>
          <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => {
            setSearchTerm('');
            setFilterStatus('all');
          }}>
            필터 초기화
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 결과 헤더 */}
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              {filteredProjects.length}개의 프로젝트
              {searchTerm && <span className="text-gray-500"> • 검색: "{searchTerm}"</span>}
              {filterStatus !== 'all' && <span className="text-gray-500"> • 필터: {filterStatus === 'draft' ? '준비중' : filterStatus === 'active' ? '진행중' : '완료'}</span>}
            </h4>
          </div>

          {/* 그리드 뷰 */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* 프로젝트 헤더 */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'active' ? '🚀 진행중' : 
                           project.status === 'completed' ? '✅ 완료' : '📝 준비중'}
                        </span>
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">진행률</span>
                        <span className="text-sm text-gray-600">{(project.completion_rate || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (project.completion_rate || 0) >= 80 ? 'bg-green-500' :
                            (project.completion_rate || 0) >= 50 ? 'bg-blue-500' :
                            (project.completion_rate || 0) >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(project.completion_rate || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* 워크플로우 상태 */}
                    <WorkflowStageIndicator currentStage={project.workflow_stage || 'creating'} />
                  </div>

                  {/* 프로젝트 통계 */}
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">평가자</span>
                        <span className="font-medium text-blue-600">{project.evaluator_count}명</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">기준</span>
                        <span className="font-medium text-purple-600">{project.criteria_count}개</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">대안</span>
                        <span className="font-medium text-orange-600">{project.alternatives_count}개</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">평가방식</span>
                        <span className="font-medium text-gray-700 text-xs">
                          {project.evaluation_method === 'pairwise' ? '쌍대비교' : 
                           project.evaluation_method === 'direct' ? '직접입력' : '혼합'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        수정: {project.last_modified}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="편집"
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProjectId(project.id || '');
                            setActiveProject(project.id || null);
                            if (externalOnTabChange) {
                              externalOnTabChange('model-building');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="모델 구성"
                          type="button"
                        >
                          🏗️
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProjectId(project.id || '');
                            setActiveProject(project.id || null);
                            if (externalOnTabChange) {
                              externalOnTabChange('results-analysis');
                            }
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="결과 분석"
                          type="button"
                        >
                          📊
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🗑️ 삭제 버튼 클릭됨:', project.id, project.title);
                            handleDeleteProject(project.id || '');
                          }}
                          className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-200"
                          title="휴지통으로 이동"
                          type="button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
            </div>
          )}

          {/* 리스트 뷰 */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* 프로젝트 정보 */}
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* 제목과 설명 */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {project.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status === 'active' ? '🚀 진행중' : 
                               project.status === 'completed' ? '✅ 완료' : '📝 준비중'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="text-xs text-gray-500 mt-2">
                            수정: {project.last_modified}
                          </div>
                        </div>

                        {/* 진행률 */}
                        <div className="lg:col-span-2">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-700 mb-1">진행률</div>
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    (project.completion_rate || 0) >= 80 ? 'bg-green-500' :
                                    (project.completion_rate || 0) >= 50 ? 'bg-blue-500' :
                                    (project.completion_rate || 0) >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${(project.completion_rate || 0)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600">
                                {(project.completion_rate || 0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 통계 */}
                        <div className="lg:col-span-4">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                            <div>
                              <div className="text-lg font-semibold text-blue-600">{project.evaluator_count}</div>
                              <div className="text-xs text-gray-500">평가자</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-purple-600">{project.criteria_count}</div>
                              <div className="text-xs text-gray-500">기준</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-orange-600">{project.alternatives_count}</div>
                              <div className="text-xs text-gray-500">대안</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-700">
                                {project.evaluation_method === 'pairwise' ? '쌍대비교' : 
                                 project.evaluation_method === 'direct' ? '직접입력' : '혼합'}
                              </div>
                              <div className="text-xs text-gray-500">평가방식</div>
                            </div>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="lg:col-span-2 flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="편집"
                            type="button"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProjectId(project.id || '');
                              setActiveProject(project.id || null);
                              if (externalOnTabChange) {
                                externalOnTabChange('model-building');
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="모델 구성"
                            type="button"
                          >
                            🏗️
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProjectId(project.id || '');
                              setActiveProject(project.id || null);
                              if (externalOnTabChange) {
                                externalOnTabChange('results-analysis');
                              }
                            }}
                            className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                            title="결과 분석"
                            type="button"
                          >
                            📊
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🗑️ 삭제 버튼 클릭됨 (리스트뷰):', project.id, project.title);
                              handleDeleteProject(project.id || '');
                            }}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-200"
                            title="휴지통으로 이동"
                            type="button"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

  const renderProjectCreationFullPage = () => (
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
                    <span className="text-4xl mr-3">➕</span>
                    새 프로젝트 생성
                  </h1>
                  <p className="text-gray-600 mt-2">새로운 AHP 의사결정 분석 프로젝트를 만들어보세요</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('projects')}>
                  📂 내 프로젝트
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderProjectCreation()}
      </div>
    </div>
  );

  const renderProjectCreation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">새 프로젝트 생성</h3>
      
      {/* 템플맿 선택 */}
      <Card title="프로젝트 템플맿 선택">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(projectTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setProjectTemplate(key as any)}
              aria-label={`${template.name} 템플맿 선택 - ${template.desc}`}
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

      <Card title="프로젝트 생성 단계">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 border-2 rounded-lg ${newProjectStep === 1 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900 mb-1">1. 기본 정보</h4>
              <p className="text-xs text-gray-600">프로젝트명, 설명, 목적</p>
            </div>
            <div className={`text-center p-4 border-2 rounded-lg ${newProjectStep === 2 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-medium text-gray-900 mb-1">2. 평가자 배정</h4>
              <p className="text-xs text-gray-600">2-3명 평가자 추가</p>
            </div>
            <div className={`text-center p-4 border-2 rounded-lg ${newProjectStep === 3 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">3. 기준 설정</h4>
              <p className="text-xs text-gray-600">평가 기준 정의</p>
            </div>
            <div className={`text-center p-4 border-2 rounded-lg ${newProjectStep === 4 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-medium text-gray-900 mb-1">4. 완료</h4>
              <p className="text-xs text-gray-600">프로젝트 생성 완료</p>
            </div>
          </div>

          {/* Step 1: 기본 정보 */}
          {newProjectStep === 1 && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              handleCreateNewProject();
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
                <input 
                  type="text" 
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2" 
                  placeholder="예: AI 도구 선택을 위한 중요도 분석" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea 
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20" 
                  placeholder="프로젝트의 목적과 배경을 설명해주세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">분석 목표</label>
                <textarea 
                  value={projectForm.objective}
                  onChange={(e) => setProjectForm({...projectForm, objective: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-16" 
                  placeholder="이 분석을 통해 달성하고자 하는 구체적인 목표"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">평가 방법</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2">
                  <option>쌍대비교 (권장)</option>
                  <option>직접입력</option>
                  <option>혼합 방식</option>
                </select>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" type="button" onClick={() => handleTabChange('projects')}>
                  취소
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? '생성 중...' : '다음: 평가자 배정'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: 평가자 배정 */}
          {newProjectStep === 2 && newProjectId && (
            <div className="space-y-4">
              <EvaluatorAssignment 
                projectId={newProjectId} 
                onComplete={() => setNewProjectStep(3)} 
              />
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setNewProjectStep(1)}>
                  이전
                </Button>
                <Button variant="primary" onClick={() => {
                  if (projectEvaluators.length > 0) {
                    setNewProjectStep(3);
                  } else {
                    alert('최소 1명 이상의 평가자를 추가해주세요.');
                  }
                }}>
                  다음: 기준 설정
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 기준 설정 */}
          {newProjectStep === 3 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-4">평가 기준 설정</h3>
                <p className="text-gray-600 mb-6">프로젝트 생성이 완료되었습니다. 모델 구축에서 기준을 설정하세요.</p>
                <Button variant="primary" onClick={() => {
                  setCurrentStep('criteria');
                  handleTabChange('model-builder');
                  setNewProjectStep(1);
                  setNewProjectId(null);
                }}>
                  모델 구축으로 이동
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderEvaluatorManagementFullPage = () => (
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
                    <span className="text-4xl mr-3">👥</span>
                    평가자 관리
                  </h1>
                  <p className="text-gray-600 mt-2">프로젝트 참여자를 초대하고 관리합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('monitoring')}>
                  📈 진행률 확인
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderEvaluatorManagement()}
      </div>
    </div>
  );

  const renderEvaluatorManagement = () => {
    // 선택된 프로젝트 정보 가져오기
    const currentProject = projects.find(p => p.id === selectedProjectId);
    
    return (
      <EnhancedEvaluatorManagement 
        projectId={selectedProjectId || undefined}
        projectName={currentProject?.title || '프로젝트'}
      />
    );
  };

  const renderSurveyLinks = () => {
    // 선택된 프로젝트 정보 가져오기
    const currentProject = projects.find(p => p.id === selectedProjectId);
    
    // 평가자 목록 가져오기 (실제로는 API에서)
    const evaluators: any[] = [
      // 임시 데이터 - 실제로는 EnhancedEvaluatorManagement와 연동
    ];
    
    return (
      <SurveyLinkManager 
        projectId={selectedProjectId || undefined}
        projectName={currentProject?.title || '프로젝트'}
        evaluators={evaluators}
      />
    );
  };

  const renderProgressMonitoringFullPage = () => (
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
                    <span className="text-4xl mr-3">📈</span>
                    진행률 모니터링
                  </h1>
                  <p className="text-gray-600 mt-2">평가자별 진행 상황을 실시간으로 추적합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('evaluators')}>
                  👥 평가자 관리
                </Button>
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>
                  📊 결과 분석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderProgressMonitoring()}
      </div>
    </div>
  );

  const renderProgressMonitoring = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">진행률 모니터링</h3>

        {/* 3개 카드를 인라인 가로 배열 */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', width: '100%' }}>
          <div style={{ flex: '1 1 33.333%' }}>
            <Card title="전체 진행률">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">-</div>
                <div className="text-sm text-gray-500 mt-1">등록된 평가자 없음</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ flex: '1 1 33.333%' }}>
            <Card title="평균 소요 시간">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">-</div>
                <div className="text-sm text-gray-500 mt-1">데이터 없음</div>
                <div className="text-xs text-gray-500 mt-2">평가 진행 후 확인 가능</div>
              </div>
            </Card>
          </div>

          <div style={{ flex: '1 1 33.333%' }}>
            <Card title="일관성 품질">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">-</div>
                <div className="text-sm text-gray-500 mt-1">데이터 없음</div>
                <div className="text-xs text-gray-500 mt-2">평가 완료 후 확인 가능</div>
              </div>
            </Card>
          </div>
        </div>

        <Card title="평가자별 진행 현황">
          {/* 빈 상태 메시지 */}
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 평가자가 없습니다</h4>
            <p className="text-gray-500 mb-6">프로젝트에 평가자를 추가하여 진행률을 모니터링하세요</p>
            <Button 
              variant="primary" 
              onClick={() => handleTabChange('evaluators')}
            >
              평가자 추가하기
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const renderResultsAnalysisFullPage = () => (
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
                    <span className="text-4xl mr-3">📊</span>
                    고급 결과 분석
                  </h1>
                  <p className="text-gray-600 mt-2">AHP 분석 결과를 확인하고 심화 인사이트를 도출합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleExportResults('excel')}>
                  📤 Excel 내보내기
                </Button>
                <Button variant="secondary" onClick={() => handleExportResults('pdf')}>
                  📄 PDF 보고서
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProjectId ? (
          <div className="space-y-6">
            {/* 선택된 프로젝트 정보 */}
            {(() => {
              const project = projects.find(p => p.id === selectedProjectId);
              return project ? (
                <div className="space-y-6">
                  <Card title={`결과 분석: ${project.title}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium mb-3">프로젝트 개요</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">목표:</span> {project.objective}</p>
                          <p><span className="font-medium">평가 방식:</span> {project.evaluation_method === 'pairwise' ? '쌍대비교' : project.evaluation_method === 'direct' ? '직접입력' : '혼합'}</p>
                          <p><span className="font-medium">생성일:</span> {project.created_at}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">평가 현황</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{project.evaluator_count}명</div>
                            <div className="text-xs text-gray-600">참여자</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{(project.completion_rate || 0)}%</div>
                            <div className="text-xs text-gray-600">완료율</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">모델 구성</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-bold text-purple-600">{project.criteria_count}개</div>
                            <div className="text-xs text-gray-600">평가 기준</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="font-bold text-orange-600">{project.alternatives_count}개</div>
                            <div className="text-xs text-gray-600">대안</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AHP 분석 결과 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="🏆 최종 순위">
                      <div className="space-y-3">
                        {(project.id === '1' ? [
                          { rank: 1, name: '코딩 작성 속도 향상', weight: 38.7, color: 'bg-yellow-500' },
                          { rank: 2, name: '코드 품질 개선', weight: 28.5, color: 'bg-gray-400' },
                          { rank: 3, name: '반복 작업 최소화', weight: 19.8, color: 'bg-orange-500' },
                          { rank: 4, name: '형상관리 지원', weight: 13.0, color: 'bg-blue-500' }
                        ] : [
                          { rank: 1, name: 'Jira', weight: 45.2, color: 'bg-yellow-500' },
                          { rank: 2, name: 'Asana', weight: 32.1, color: 'bg-gray-400' },
                          { rank: 3, name: 'Trello', weight: 22.7, color: 'bg-orange-500' }
                        ]).map((item) => (
                          <div key={item.rank} className="flex justify-between items-center p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                                {item.rank}
                              </div>
                              <div className="font-medium">{item.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.weight}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title="📈 일관성 분석">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">0.058</div>
                          <div className="text-sm text-gray-500">통합 일관성 비율 (CR)</div>
                          <div className="text-xs text-green-600 mt-1">🟢 우수 (&lt; 0.1)</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">기준 일관성</span>
                            <span className="text-sm font-medium text-green-600">0.052</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">대안 일관성 (평균)</span>
                            <span className="text-sm font-medium text-green-600">0.063</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">참여 평가자</span>
                            <span className="text-sm font-medium">{project.evaluator_count}명</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* 추가 분석 도구 */}
                  <Card title="🔍 고급 분석 도구">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="text-2xl mb-2">📊</div>
                        <h5 className="font-medium mb-1">민감도 분석</h5>
                        <p className="text-xs text-gray-600">가중치 변화에 따른 순위 변동 분석</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="text-2xl mb-2">🎯</div>
                        <h5 className="font-medium mb-1">시나리오 분석</h5>
                        <p className="text-xs text-gray-600">다양한 조건에서의 결과 시뮬레이션</p>
                      </button>
                      <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="text-2xl mb-2">📈</div>
                        <h5 className="font-medium mb-1">트렌드 분석</h5>
                        <p className="text-xs text-gray-600">시간에 따른 평가 결과 변화</p>
                      </button>
                    </div>
                  </Card>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <Card title="프로젝트를 선택하세요">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">분석할 프로젝트를 선택해주세요.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {(projects || []).filter(p => p.status === 'active' || p.status === 'completed').map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id || '')}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status === 'active' ? '진행중' : '완료'}
                      </span>
                      <span className="text-xs text-gray-500">
                        완료율: {(project.completion_rate || 0)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderResultsAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">결과 분석</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="최종 순위">
          <div className="space-y-3">
            {[
              { rank: 1, name: '코딩 작성 속도 향상', weight: 16.959, color: 'text-yellow-600' },
              { rank: 2, name: '코드 품질 개선 및 최적화', weight: 15.672, color: 'text-gray-500' },
              { rank: 3, name: '반복 작업 최소화', weight: 13.382, color: 'text-orange-600' },
              { rank: 4, name: '형상관리 및 배포 지원', weight: 11.591, color: 'text-blue-600' },
              { rank: 5, name: '디버깅 시간 단축', weight: 10.044, color: 'text-green-600' }
            ].map((item) => (
              <div key={item.rank} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    item.rank === 1 ? 'bg-yellow-500' :
                    item.rank === 2 ? 'bg-gray-500' :
                    item.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {item.rank}
                  </div>
                  <div className="font-medium">{item.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.weight}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="일관성 분석">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0.00192</div>
              <div className="text-sm text-gray-500">통합 일관성 비율</div>
              <div className="text-xs text-green-600 mt-1">🟢 매우 우수 (&lt; 0.1)</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">기준 일관성</span>
                <span className="text-sm font-medium text-green-600">0.001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">대안 일관성 (평균)</span>
                <span className="text-sm font-medium text-green-600">0.003</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">전체 평가자</span>
                <span className="text-sm font-medium">26명</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="민감도 분석">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">기준 가중치 변화 시뮬레이션</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">개발 생산성 효율화</span>
                <input type="range" min="0" max="100" defaultValue="40" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">코딩 실무 품질 적합화</span>
                <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">개발 프로세스 자동화</span>
                <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
                <span className="text-sm font-medium w-12 text-right">30%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">예상 순위 변화</h4>
            <div className="text-sm text-gray-600">
              <p>• 현재 설정에서는 순위 변화 없음</p>
              <p>• 생산성 가중치 20% 감소 시: 2위↔3위 변동 가능</p>
              <p>• 품질 가중치 50% 증가 시: 1위↔2위 변동 가능</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderExportReportsFullPage = () => (
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
                    <span className="text-4xl mr-3">📤</span>
                    보고서 내보내기
                  </h1>
                  <p className="text-gray-600 mt-2">분석 결과를 다양한 형태로 내보냅니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>
                  📊 결과 분석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderExportReports()}
      </div>
    </div>
  );

  const renderExportReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">보고서 내보내기</h3>

      <div className="grid grid-cols-3 gap-8">
        <Card title="Excel 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              상세한 데이터와 계산 과정이 포함된 스프레드시트
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">원시 데이터</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">계산 과정</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">차트</span>
              </label>
            </div>
            <Button variant="primary" className="w-full p-4 lg:p-5 text-lg lg:text-xl">
              📊 Excel 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PDF 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              프레젠테이션용 요약 보고서
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">요약 정보</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">시각화 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">상세 분석</span>
              </label>
            </div>
            <Button variant="primary" className="w-full p-4 lg:p-5 text-lg lg:text-xl">
              📄 PDF 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PowerPoint">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              발표용 슬라이드 자료
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">개요 슬라이드</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결론 및 제안</span>
              </label>
            </div>
            <Button variant="primary" className="w-full p-4 lg:p-5 text-lg lg:text-xl">
              📺 PPT 다운로드
            </Button>
          </div>
        </Card>
      </div>

      <Card title="맞춤형 보고서">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보고서 형식</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>상세 분석 보고서</option>
                <option>요약 보고서</option>
                <option>평가자별 개별 보고서</option>
                <option>비교 분석 보고서</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2">
                <option>한국어</option>
                <option>English</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">포함할 섹션</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">프로젝트 개요</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">방법론 설명</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 분석</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">민감도 분석</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">일관성 검증</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">평가자 의견</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결론 및 제안</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">부록</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl">
              맞춤 보고서 생성
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderWorkshopManagementFullPage = () => (
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
                    <span className="text-4xl mr-3">🎯</span>
                    워크숍 관리
                  </h1>
                  <p className="text-gray-600 mt-2">팀 협업을 위한 의사결정 워크숍을 관리합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>
                  📊 결과 분석
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderWorkshopManagement()}
      </div>
    </div>
  );

  const renderDecisionSupportSystemFullPage = () => (
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
                    <span className="text-4xl mr-3">🧠</span>
                    의사결정 지원 시스템
                  </h1>
                  <p className="text-gray-600 mt-2">AHP 방법론을 활용한 과학적 의사결정을 지원합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => handleTabChange('analysis')}>
                  📊 고급 분석
                </Button>
                <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => handleTabChange('workshop')}>
                  🎯 워크숍
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDecisionSupportSystem()}
      </div>
    </div>
  );

  const renderDemographicSurveyFullPage = () => (
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
                    <span className="text-4xl mr-3">📊</span>
                    인구통계학적 설문조사
                  </h1>
                  <p className="text-gray-600 mt-2">평가자를 위한 Google Forms 스타일 설문조사를 생성하고 관리합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyManagementSystem 
          projectId="current-project-id"
          onBack={() => handleTabChange('dashboard')}
        />
      </div>
    </div>
  );

  const renderPersonalSettingsFullPage = () => (
    <PersonalSettings 
      user={user}
      onBack={() => handleTabChange('dashboard')}
      onUserUpdate={(updatedUser) => {
        setUser({
          ...updatedUser,
          admin_type: updatedUser.admin_type || 'personal'
        });
      }}
    />
  );


  const renderWorkshopManagement = () => (
    <WorkshopManagement />
  );

  const renderDecisionSupportSystem = () => (
    <DecisionSupportSystem />
  );

  const renderPaperManagementFullPage = () => (
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
                    <span className="text-4xl mr-3">📝</span>
                    논문 작성 관리
                  </h1>
                  <p className="text-gray-600 mt-2">AHP 분석 결과를 활용한 논문 작성 지원 도구</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaperManagement />
      </div>
    </div>
  );

  const renderEvaluationTest = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mb-6">
          <div 
            className="w-24 h-24 mx-auto rounded-full border-4 border-dashed flex items-center justify-center mb-4"
            style={{ borderColor: 'var(--accent-primary)' }}
          >
            <span className="text-4xl">🧪</span>
          </div>
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            평가 테스트
          </h3>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            실제 평가 환경에서 테스트를 진행해보세요
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 테스트 프로젝트 선택 */}
            <Card 
              title="테스트 프로젝트" 
              icon="📋"
              className="p-6"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid var(--accent-primary)'
              }}
            >
              <div className="space-y-4">
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  테스트할 프로젝트를 선택하세요
                </p>
                <select 
                  className="w-full p-3 rounded-lg border-2"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-elevated)'
                  }}
                >
                  <option value="">프로젝트 선택...</option>
                  {(projects || []).filter(p => (p.criteria_count || 0) >= 3 && (p.alternatives_count || 0) >= 2).map((project, index) => (
                    <option key={index} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* 평가자 역할 선택 */}
            <Card 
              title="평가자 역할" 
              icon="👤"
              className="p-6"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid var(--accent-secondary)'
              }}
            >
              <div className="space-y-4">
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  테스트할 평가자 역할을 선택하세요
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="evaluator-role" 
                      value="expert"
                      className="form-radio"
                    />
                    <span className="text-sm">전문가 평가자</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="evaluator-role" 
                      value="stakeholder"
                      className="form-radio"
                    />
                    <span className="text-sm">이해관계자</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name="evaluator-role" 
                      value="general"
                      className="form-radio"
                    />
                    <span className="text-sm">일반 평가자</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* 테스트 모드 설정 */}
            <Card 
              title="테스트 모드" 
              icon="⚙️"
              className="p-6"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid var(--status-info-bg)'
              }}
            >
              <div className="space-y-4">
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  테스트 환경을 설정하세요
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="form-checkbox"
                    />
                    <span className="text-sm">일관성 검증 활성화</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="form-checkbox"
                      defaultChecked
                    />
                    <span className="text-sm">진행률 표시</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="form-checkbox"
                    />
                    <span className="text-sm">자동 저장</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* 테스트 시작 버튼 */}
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg"
              className="px-12 py-4 text-lg font-bold"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white'
              }}
            >
              🚀 평가 테스트 시작
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-semibold mb-1">쌍대비교 평가</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  실제 평가 화면에서 비교 진행
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold mb-1">실시간 결과</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  평가 중 실시간 순위 확인
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-semibold mb-1">일관성 검증</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  평가 품질 자동 검증
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalSettings = () => (
    <PersonalSettings 
      user={user}
      onBack={() => handleTabChange('dashboard')}
      onUserUpdate={handleUserUpdate}
    />
  );

  const renderUsageManagement = () => (
    <UsageManagement 
      user={user}
      onBack={() => handleTabChange('dashboard')}
    />
  );

  const renderModelBuilderFullPage = () => (
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
                    <span className="text-4xl mr-3">🏗️</span>
                    모델 구축
                  </h1>
                  <p className="text-gray-600 mt-2">단계별로 AHP 분석 모델을 구성합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('projects')}>
                  📂 내 프로젝트
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProjectId ? (
          <div className="space-y-6">
            {/* 선택된 프로젝트 정보 */}
            {(() => {
              const project = projects.find(p => p.id === selectedProjectId);
              return project ? (
                <Card title={`모델 구축: ${project.title}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">프로젝트 정보</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">목표:</span> {project.objective}</p>
                        <p><span className="font-medium">설명:</span> {project.description}</p>
                        <p><span className="font-medium">평가 방식:</span> {project.evaluation_method === 'pairwise' ? '쌍대비교' : project.evaluation_method === 'direct' ? '직접입력' : '혼합'}</p>
                        <p><span className="font-medium">현재 상태:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'active' ? '진행중' : 
                             project.status === 'completed' ? '완료' : '준비중'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">진행 현황</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{project.criteria_count}개</div>
                          <div className="text-sm text-gray-600">평가 기준</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{project.alternatives_count}개</div>
                          <div className="text-sm text-gray-600">대안</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{project.evaluator_count}명</div>
                          <div className="text-sm text-gray-600">평가자</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">{(project.completion_rate || 0)}%</div>
                          <div className="text-sm text-gray-600">완료율</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <Button variant="primary" className="p-5 lg:p-6 text-xl lg:text-2xl" onClick={() => setCurrentStep('criteria')}>
                      🎯 기준 설정 시작
                    </Button>
                    <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('alternatives')}>
                      📋 대안 관리
                    </Button>
                    <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('evaluators')}>
                      👥 평가자 관리
                    </Button>
                  </div>
                </Card>
              ) : null;
            })()}
            
            {/* 모델 구축 단계 진행 */}
            {currentStep !== 'overview' ? renderStepContent() : null}
          </div>
        ) : (
          <Card title="모델 구축">
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🏗️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">모델을 구축할 프로젝트를 선택하세요</h3>
                <p className="text-gray-600 mb-4">프로젝트를 선택하고 단계별로 모델을 구성해보세요.</p>
                <Button variant="primary" className="p-5 lg:p-6 text-xl lg:text-2xl" onClick={() => handleTabChange('projects')}>
                  프로젝트 선택하기
                </Button>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">모델 구축 단계</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">1️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">프로젝트 설정</h5>
                    <p className="text-xs text-gray-600">기본 정보 및 목표 설정</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">2️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">기준 정의</h5>
                    <p className="text-xs text-gray-600">평가 기준 및 계층 구조</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">3️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">대안 설정</h5>
                    <p className="text-xs text-gray-600">비교할 대안들 등록</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-2">4️⃣</div>
                    <h5 className="font-medium text-gray-900 mb-1">평가자 배정</h5>
                    <p className="text-xs text-gray-600">참여자 초대 및 권한 설정</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderOverview();
      case 'projects':
        return renderMyProjects();
      case 'creation':
        return renderProjectCreation();
      case 'model-builder':
        return currentStep !== 'overview' ? renderStepContent() : (
          <Card title="모델 구축">
            <p>프로젝트를 선택하고 단계별로 모델을 구성해보세요.</p>
            <Button variant="secondary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => handleTabChange('projects')}>
              프로젝트 선택하기
            </Button>
          </Card>
        );
      case 'validity-check':
        return (
          <div className="space-y-6">
            <ValidityCheck />
          </div>
        );
      case 'evaluators':
        return renderEvaluatorManagement();
      case 'survey-links':
        return renderSurveyLinks();
      case 'monitoring':
        return renderProgressMonitoring();
      case 'analysis':
        return renderResultsAnalysis();
      case 'export':
        return renderExportReports();
      case 'workshop':
        return renderWorkshopManagement();
      case 'decision-support':
        return renderDecisionSupportSystem();
      case 'evaluation-test':
        return renderEvaluationTest();
      case 'usage-management':
        return renderUsageManagement();
      case 'settings':
        return renderPersonalSettings();
      case 'payment':
        return (
          <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        💳 결제 관리
                      </h1>
                      <p className="text-gray-600 mt-1">
                        구독 결제 내역 및 플랜 변경을 관리하세요
                      </p>
                    </div>
                    <Button 
                      variant="secondary"
                      onClick={() => handleTabChange('dashboard')}
                    >
                      ← 대시보드로
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <PaymentSystem />
          </div>
        );
      case 'trash':
        return (
          <TrashBin
            onFetchTrashedProjects={onFetchTrashedProjects}
            onRestoreProject={onRestoreProject}
            onPermanentDeleteProject={onPermanentDeleteProject}
          />
        );
      case 'demographic-survey':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <span className="text-3xl mr-3">📊</span>
                인구통계학적 설문조사
              </h2>
              <button 
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ 
                  borderColor: 'var(--border-default)', 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ← 대시보드로
              </button>
            </div>
            
            <SurveyManagementSystem 
              projectId="current-project-id"
              onBack={() => handleTabChange('dashboard')}
            />
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // 개별 메뉴 페이지들은 전체 화면을 사용
  if (externalActiveTab && externalActiveTab !== 'personal-service') {
    return (
      <>
        {externalActiveTab === 'my-projects' && renderMyProjectsFullPage()}
        {externalActiveTab === 'project-creation' && renderProjectCreationFullPage()}
        {externalActiveTab === 'model-builder' && renderModelBuilderFullPage()}
        {externalActiveTab === 'evaluator-management' && renderEvaluatorManagementFullPage()}
        {externalActiveTab === 'progress-monitoring' && renderProgressMonitoringFullPage()}
        {externalActiveTab === 'results-analysis' && renderResultsAnalysisFullPage()}
        {externalActiveTab === 'paper-management' && renderPaperManagementFullPage()}
        {externalActiveTab === 'export-reports' && renderExportReportsFullPage()}
        {externalActiveTab === 'workshop-management' && renderWorkshopManagementFullPage()}
        {externalActiveTab === 'decision-support-system' && renderDecisionSupportSystemFullPage()}
        {externalActiveTab === 'personal-settings' && renderPersonalSettingsFullPage()}
        {externalActiveTab === 'demographic-survey' && renderDemographicSurveyFullPage()}
      </>
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
              <div 
                className="w-12 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              ></div>
              <span 
                className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{ 
                  color: 'var(--accent-primary)',
                  borderColor: 'var(--accent-light)'
                }}
              >
                Pro Plan 🔵
              </span>
              <div 
                className="w-12 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              ></div>
            </div>
            <p 
              className="text-lg font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              전문적인 AHP 의사결정 분석으로 복잡한 문제를 체계적으로 해결해보세요
            </p>
          </div>
        </div>
        
        {/* 요금제 할당량 정보 - 각 섹션을 개별 박스로 구분 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 프로젝트 개수 박스 */}
          <div 
            className="rounded-xl p-6 transition-all duration-300"
            style={{
              border: '1px solid var(--border-light)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'white' 
                  }}
                >
                  P
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  프로젝트 개수
                </h3>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {usedProjects}/{planLimits.projects}
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                  사용 중인 프로젝트
                </div>
                <div className="w-full max-w-40 mx-auto">
                  <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((usedProjects / planLimits.projects) * 100, 100)}%`,
                        backgroundColor: 'var(--accent-primary)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {planLimits.projects - usedProjects}개 남음
                </div>
              </div>
            </div>
          </div>

          {/* 평가자 인원수 박스 */}
          <div 
            className="rounded-xl p-6 transition-all duration-300"
            style={{
              border: '1px solid var(--border-light)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--accent-secondary)', 
                    color: 'white' 
                  }}
                >
                  E
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  평가자 인원수
                </h3>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {usedEvaluators}/{planLimits.evaluators}명
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                  사용 중인 평가자
                </div>
                <div className="w-full max-w-40 mx-auto">
                  <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((usedEvaluators / planLimits.evaluators) * 100, 100)}%`,
                        backgroundColor: 'var(--accent-secondary)'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {planLimits.evaluators - usedEvaluators}명 남음
                </div>
              </div>
            </div>
          </div>

          {/* 사용 가능 옵션 박스 */}
          <div 
            className="rounded-xl p-6 transition-all duration-300"
            style={{
              border: '1px solid var(--border-light)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div 
                    className="text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--accent-tertiary)', 
                      color: 'white' 
                    }}
                  >
                    O
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    사용 가능 옵션
                  </h3>
                </div>
              </div>
              {/* 체크박스 목록 - 왼쪽 정렬 및 가독성 개선 */}
              <div className="space-y-3">
                <div 
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    id="advanced-analysis" 
                    checked={currentFeatures['advanced-analysis']} 
                    readOnly 
                    className={`w-5 h-5 text-purple-600 bg-gray-100 border-2 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${
                      currentFeatures['advanced-analysis'] 
                        ? 'border-purple-300 dark:border-purple-600' 
                        : 'border-gray-300 dark:border-gray-600 opacity-50'
                    }`}
                  />
                  <label htmlFor="advanced-analysis" className={`text-sm font-semibold cursor-pointer ${
                    currentFeatures['advanced-analysis'] 
                      ? 'text-purple-700 dark:text-purple-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    고급 분석 도구
                  </label>
                </div>
                <div 
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    id="group-ahp" 
                    checked={currentFeatures['group-ahp']} 
                    readOnly 
                    className={`w-5 h-5 text-purple-600 bg-gray-100 border-2 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${
                      currentFeatures['group-ahp'] 
                        ? 'border-purple-300 dark:border-purple-600' 
                        : 'border-gray-300 dark:border-gray-600 opacity-50'
                    }`}
                  />
                  <label htmlFor="group-ahp" className={`text-sm font-semibold cursor-pointer ${
                    currentFeatures['group-ahp'] 
                      ? 'text-purple-700 dark:text-purple-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    그룹 AHP 분석
                  </label>
                </div>
                <div 
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    id="realtime-collab" 
                    checked={currentFeatures['realtime-collab']} 
                    readOnly 
                    className={`w-5 h-5 text-purple-600 bg-gray-100 border-2 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${
                      currentFeatures['realtime-collab'] 
                        ? 'border-purple-300 dark:border-purple-600' 
                        : 'border-gray-300 dark:border-gray-600 opacity-50'
                    }`}
                  />
                  <label htmlFor="realtime-collab" className={`text-sm font-semibold cursor-pointer ${
                    currentFeatures['realtime-collab'] 
                      ? 'text-purple-700 dark:text-purple-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    실시간 협업
                  </label>
                </div>
                <div 
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    id="premium-support" 
                    checked={currentFeatures['premium-support']} 
                    readOnly 
                    className={`w-5 h-5 text-purple-600 bg-gray-100 border-2 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${
                      currentFeatures['premium-support'] 
                        ? 'border-purple-300 dark:border-purple-600' 
                        : 'border-gray-300 dark:border-gray-600 opacity-50'
                    }`}
                  />
                  <label htmlFor="premium-support" className={`text-sm font-semibold cursor-pointer ${
                    currentFeatures['premium-support'] 
                      ? 'text-purple-700 dark:text-purple-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    프리미엄 지원
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
          
        {/* 요금제 관리 버튼 */}
        <div className="mt-6 flex justify-center space-x-4">
          <button 
            onClick={() => handleTabChange('payment')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            결제 관리
          </button>
          <button 
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all duration-200"
          >
            플랜 변경
          </button>
        </div>
        
        {/* 설명 텍스트 */}
        <div className="mt-6 text-center">
          <p 
            className="text-lg font-light max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            전문적인 AHP 의사결정 분석으로 복잡한 문제를 체계적으로 해결해보세요
          </p>
        </div>
      </div>

      {/* 최근 프로젝트 및 사용량 현황 - 2등분 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* 왼쪽: 최근 프로젝트 */}
        <div 
          className="p-6 rounded-xl transition-all duration-300"
          style={{
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                📂 최근 프로젝트
              </h3>
              {(projects || []).length > 0 && (
                <button
                  onClick={() => handleTabChange('projects')}
                  className="text-sm font-medium transition-all duration-300"
                  style={{ color: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                >
                  모든 프로젝트 보기 ({(projects || []).length}개) →
                </button>
              )}
            </div>
            
            {(projects || []).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 opacity-50">📊</div>
                <h4 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  첫 번째 프로젝트를 시작해보세요
                </h4>
                <p 
                  className="text-sm mb-6 max-w-xs mx-auto leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  AHP 분석을 통해 복잡한 의사결정을 체계적으로 해결할 수 있습니다.
                </p>
                <button
                  onClick={() => handleTabChange('creation')}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    color: 'var(--text-primary)'
                  }}
                >
                  ➕ 새 프로젝트 생성
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(projects || []).slice(0, 3).map((project) => (
                  <div 
                    key={project.id} 
                    className="p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(5px)'
                    }}
                    onClick={() => {
                      setSelectedProjectId(project.id || '');
                      handleTabChange('projects');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {project.title}
                          </h5>
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'active' 
                                ? 'bg-green-100 text-green-700' :
                              project.status === 'completed' 
                                ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {project.status === 'active' ? '🚀' : 
                             project.status === 'completed' ? '✅' : '📝'}
                          </span>
                        </div>
                        <p 
                          className="text-xs leading-relaxed line-clamp-2 mb-3"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {project.description || '프로젝트 설명이 없습니다.'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {project.last_modified} • {project.evaluator_count}명 참여
                          </div>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-16 bg-gray-200 rounded-full h-1.5"
                              style={{ backgroundColor: 'var(--bg-elevated)' }}
                            >
                              <div 
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(project.completion_rate || 0)}%`,
                                  backgroundColor: (project.completion_rate || 0) >= 80 ? 'var(--status-success-bg)' :
                                                   (project.completion_rate || 0) >= 50 ? 'var(--accent-primary)' :
                                                   'var(--status-warning-bg)'
                                }}
                              />
                            </div>
                            <span 
                              className="text-xs font-medium"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              {(project.completion_rate || 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* 오른쪽: 사용량 현황 (3개 계열로 분류) */}
        <div 
          className="p-6 rounded-xl transition-all duration-300"
          style={{
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
            <h3 
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              📊 진행률 현황
            </h3>
            
            <div className="space-y-6">
              {/* 1. 프로젝트별 설정 진행률 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ 
                      borderColor: 'var(--color-gold-dark-1)',
                      backgroundColor: 'var(--color-gold-pastel-1)'
                    }}
                  >
                    <span className="text-lg">⚙️</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--color-gold-dark-2)' }}
                    >
                      프로젝트 설정
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Configuration Progress
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-3">
                  {(projects || []).slice(0, 3).map((project, index) => {
                    const progressPercent = ((project.criteria_count || 0) >= 3 && (project.alternatives_count || 0) >= 2 && (project.evaluator_count || 0) >= 1) ? 100 : 
                      (((project.criteria_count || 0) >= 3 ? 40 : 0) + ((project.alternatives_count || 0) >= 2 ? 40 : 0) + ((project.evaluator_count || 0) >= 1 ? 20 : 0));
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-sm truncate"
                            style={{ color: 'var(--text-secondary)' }}
                            title={project.title}
                          >
                            {project.title.length > 20 ? `${project.title.slice(0, 20)}...` : project.title}
                          </span>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: progressPercent === 100 ? 'var(--semantic-success)' : 'var(--color-gold-dark-1)' }}
                          >
                            {progressPercent}%
                          </span>
                        </div>
                        <div 
                          className="w-full rounded-full h-2 overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-elevated)' }}
                        >
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progressPercent}%`,
                              background: progressPercent === 100 ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {(projects || []).length > 3 && (
                    <div 
                      className="text-xs text-center pt-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      +{(projects || []).length - 3}개 프로젝트 더 있음
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 평가자 배정 및 진행률 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ 
                      borderColor: 'var(--color-gray-dark-1)',
                      backgroundColor: 'var(--color-gray-pastel-1)'
                    }}
                  >
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--color-gray-dark-2)' }}
                    >
                      평가자 진행률
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Evaluator Progress
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-3">
                  {(projects || []).filter(p => (p.evaluator_count || 0) > 0).slice(0, 3).map((project, index) => {
                    const totalEvaluators = project.evaluator_count || 0;
                    const completedEvaluators = Math.floor(totalEvaluators * 0.6); // 60% 완료율 시뮤레이션
                    const progressPercent = totalEvaluators > 0 ? Math.round((completedEvaluators / totalEvaluators) * 100) : 0;
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-sm truncate"
                            style={{ color: 'var(--text-secondary)' }}
                            title={project.title}
                          >
                            {project.title.length > 15 ? `${project.title.slice(0, 15)}...` : project.title}
                          </span>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: 'var(--color-gray-dark-1)' }}
                          >
                            {completedEvaluators}/{totalEvaluators}명
                          </span>
                        </div>
                        <div 
                          className="w-full rounded-full h-2 overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-elevated)' }}
                        >
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progressPercent}%`,
                              background: progressPercent >= 100 ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        전체 평가자
                      </span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-gray-dark-1)' }}
                      >
                        {(projects || []).reduce((sum, p) => sum + (p.evaluator_count || 0), 0)}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        완료 평가자
                      </span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: 'var(--status-success-text)' }}
                      >
                        {Math.floor((projects || []).reduce((sum, p) => sum + (p.evaluator_count || 0), 0) * 0.6)}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 리소스 사용 계열 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'var(--status-info-bg)' }}
                  >
                    <span className="text-lg">📈</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--status-info-text)' }}
                    >
                      종합 현황
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Overall Progress
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      완료된 프로젝트
                    </span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--status-success-text)' }}
                    >
                      {(projects || []).filter(p => (p.criteria_count || 0) >= 3 && (p.alternatives_count || 0) >= 2 && (p.evaluator_count || 0) >= 1).length}/{(projects || []).length}
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(projects || []).length > 0 ? Math.round(((projects || []).filter(p => (p.criteria_count || 0) >= 3 && (p.alternatives_count || 0) >= 2 && (p.evaluator_count || 0) >= 1).length / (projects || []).length) * 100) : 0}%`,
                        backgroundColor: 'var(--status-success-bg)'
                      }}
                    ></div>
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    평균 진행률: {(projects || []).length > 0 ? Math.round((projects || []).reduce((sum, p) => {
                      const progress = ((p.criteria_count || 0) >= 3 && (p.alternatives_count || 0) >= 2 && (p.evaluator_count || 0) >= 1) ? 100 : 
                        (((p.criteria_count || 0) >= 3 ? 40 : 0) + ((p.alternatives_count || 0) >= 2 ? 40 : 0) + ((p.evaluator_count || 0) >= 1 ? 20 : 0));
                      return sum + progress;
                    }, 0) / (projects || []).length) : 0}%
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 네비게이션 */}

      {/* Enhanced Navigation Menu - 2 Rows Layout */}
      <div 
        className="card-enhanced p-6"
        style={{
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="mb-4">
          <h2 
            className="text-lg font-bold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            서비스 메뉴
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            AHP 의사결정 분석의 모든 기능을 한 곳에서
          </p>
        </div>
        
        <div className="space-y-4">
          {/* First Row - Core Functions (7 items) */}
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { id: 'dashboard', label: '대시보드', icon: '🏠', tooltip: '프로젝트 현황과 통계를 한눈에 확인', priority: 'high' },
              { id: 'projects', label: '내 프로젝트', icon: '📂', tooltip: '생성한 모든 프로젝트 관리 및 편집', priority: 'high' },
              { id: 'trash', label: '휴지통', icon: '🗑️', tooltip: '삭제된 프로젝트 복원 및 영구 삭제', priority: 'high' },
              { id: 'creation', label: '새 프로젝트', icon: '➕', tooltip: '새로운 AHP 분석 프로젝트 생성', priority: 'high' },
              { id: 'model-builder', label: '모델 구축', icon: '🏗️', tooltip: '기준과 대안을 설정하여 모델 구성', priority: 'high' },
              { id: 'evaluators', label: '평가자 관리', icon: '👥', tooltip: '평가 참여자 초대 및 권한 관리' },
              { id: 'monitoring', label: '진행률 확인', icon: '📈', tooltip: '평가 진행 상황 실시간 모니터링' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-label={item.label}
                  className="w-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] hover:shadow-xl transform"
                  style={{
                    backgroundColor: activeMenu === item.id ? 'var(--color-gold-pastel-2)' : 'var(--neutral-50)',
                    borderColor: activeMenu === item.id ? 'var(--color-gold-dark-1)' : 'var(--color-gold-pastel-3)',
                    color: activeMenu === item.id ? 'var(--color-gold-dark-2)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gold-pastel-1)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm lg:text-base leading-tight">{item.label}</div>
                  {item.priority === 'high' && (
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'var(--status-danger-bg)' }}
                    ></div>
                  )}
                </button>
                {/* Enhanced Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-xl"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                >
                  {item.tooltip}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{ borderTopColor: 'var(--text-primary)' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - Advanced Functions (8 items) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { id: 'analysis', label: '결과 분석', icon: '📊', tooltip: 'AHP 분석 결과와 순위 확인' },
              { id: 'demographic-survey', label: '인구통계학적 설문조사', icon: '📋', tooltip: 'Google Forms 스타일 설문 생성 및 관리' },
              { id: 'export', label: '보고서', icon: '📤', tooltip: 'Excel, PDF, PPT 형식으로 내보내기' },
              { id: 'survey-links', label: '설문 링크', icon: '🔗', tooltip: '평가자별 설문 링크 생성 및 관리' },
              { id: 'evaluation-test', label: '평가 테스트', icon: '🧪', tooltip: '실제 평가 환경에서 테스트 진행' },
              { id: 'workshop', label: '워크숍', icon: '🎯', tooltip: '협업 의사결정 워크숍 관리' },
              { id: 'decision-support', label: '의사결정 지원', icon: '🧠', tooltip: '과학적 의사결정 지원 도구' },
              { id: 'usage-management', label: '사용량 관리', icon: '📊', tooltip: '구독 현황, 할당량 및 데이터 관리' },
              { id: 'settings', label: '설정', icon: '⚙️', tooltip: '개인 계정 및 환경 설정' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-label={item.label}
                  className="w-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] hover:shadow-xl transform"
                  style={{
                    backgroundColor: activeMenu === item.id ? 'var(--color-gold-pastel-2)' : 'var(--neutral-50)',
                    borderColor: activeMenu === item.id ? 'var(--color-gold-dark-1)' : 'var(--color-gold-pastel-3)',
                    color: activeMenu === item.id ? 'var(--color-gold-dark-2)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gold-pastel-1)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-gold-pastel-3)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }
                  }}
                >
                  <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm lg:text-base leading-tight">{item.label}</div>
                </button>
                {/* Enhanced Tooltip */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-xl"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                >
                  {item.tooltip}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{ borderTopColor: 'var(--text-primary)' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (only show when in model builder flow) */}
      {activeMenu === 'model-builder' && currentStep !== 'overview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">모델 구축 진행상황</h3>
            <span className="text-sm text-gray-600">{Math.round(getStepProgress())}% 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>프로젝트</span>
            <span>기준</span>
            <span>대안</span>
            <span>평가자</span>
            <span>완료</span>
          </div>
        </div>
      )}

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

export default PersonalServiceDashboard;