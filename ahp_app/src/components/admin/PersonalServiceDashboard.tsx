/**
 * PersonalServiceDashboard - AHP 플랫폼 개인 서비스 대시보드
 * 프로젝트 생성 워크플로우: 기본정보 → 기준설정 → 대안설정 → 평가자배정
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import MyProjects from './MyProjects';
import ProjectCreation from './ProjectCreation';
import EnhancedProjectCreationWizard from '../project/EnhancedProjectCreationWizard';
import DemographicSurveyConfig from '../project/DemographicSurveyConfig';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import EnhancedEvaluatorManagement from '../evaluator/EnhancedEvaluatorManagement';
import SurveyLinkManager from './SurveyLinkManager';
import ModelFinalization from './ModelFinalization';
import type { WorkflowStage } from '../workflow/WorkflowStageIndicator';
import { EvaluationMode } from '../evaluation/EvaluationModeSelector';
import PaymentSystem from '../payment/PaymentSystem';
import WorkshopManagement from '../workshop/WorkshopManagement';
import DecisionSupportSystem from '../decision/DecisionSupportSystem';
import PaperManagement from '../paper/PaperManagement';
import ProjectSelector from '../project/ProjectSelector';
import PersonalSettings from '../settings/PersonalSettings';
import SurveyFormBuilder from '../survey/SurveyFormBuilder';
import UsageManagement from './UsageManagement';
import ValidityCheck from '../validity/ValidityCheck';
import TrashBin from './TrashBin';
import PSDEvaluationTestTab from './PSDEvaluationTestTab';
import PSDExportTab from './PSDExportTab';
import PSDExportFullPage from './PSDExportFullPage';
import PSDProgressMonitoringTab from './PSDProgressMonitoringTab';
import PSDResultsAnalysisTab from './PSDResultsAnalysisTab';
import PersonalUserDashboard from '../user/PersonalUserDashboard';
import dataService from '../../services/dataService_clean';
import type { ProjectData } from '../../services/api';
import type { User, UserProject } from '../../types';
import { SUPER_ADMIN_EMAIL } from '../../config/api';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigationContext } from '../../contexts/NavigationContext';
import { useProjectContext } from '../../contexts/ProjectContext';

type ActiveMenuTab = 'dashboard' | 'projects' | 'creation' | 'project-wizard' | 'demographic-setup' | 'evaluator-invitation' | 'model-builder' | 'validity-check' | 'evaluators' | 'survey-links' | 'monitoring' | 'analysis' | 'paper' | 'export' | 'workshop' | 'decision-support' | 'evaluation-test' | 'settings' | 'usage-management' | 'payment' | 'demographic-survey' | 'trash' | 'dev-tools';

interface PersonalServiceProps {
  tabOverride?: string;
}



// 요금제별 할당량 정의
const PLAN_QUOTAS = {
  'basic': { projects: 3, evaluators: 30 },
  'standard': { projects: 5, evaluators: 50 },
  'premium': { projects: 10, evaluators: 100 },
  'enterprise': { projects: 999, evaluators: 999 } // 무제한
};

// 사용자별 요금제 매핑 (이메일 기반)
const USER_PLANS: Record<string, 'basic' | 'standard' | 'premium' | 'enterprise'> = {
  'test@test.com': 'basic',        // 테스트 계정은 basic (3개 프로젝트, 30명 평가자)
  [SUPER_ADMIN_EMAIL]: 'enterprise', // 관리자는 enterprise (무제한)
  'premium@test.com': 'premium',
  'default': 'basic' // 기본값
};

const PersonalServiceDashboard: React.FC<PersonalServiceProps> = ({ tabOverride }) => {
  // ── Context 소비 ──────────────────────────────────────────────────────────
  const {
    user: initialUser, setUser: contextSetUser,
  } = useAuthContext();
  const {
    activeTab: contextActiveTab, setActiveTab: contextSetActiveTab,
  } = useNavigationContext();
  const {
    projects: contextProjects,
    createProject: onCreateProject,
    deleteProject: onDeleteProject,
    fetchCriteria: onFetchCriteria,
    fetchAlternatives: onFetchAlternatives,
    fetchTrashedProjects: onFetchTrashedProjects,
    restoreProject: onRestoreProject,
    permanentDeleteProject: onPermanentDeleteProject,
  } = useProjectContext();

  // Context 값을 기존 변수명에 매핑 (최소 변경 원칙)
  const externalActiveTab = tabOverride || contextActiveTab;
  const externalOnTabChange = contextSetActiveTab;
  const externalProjects = useMemo(() => contextProjects || [], [contextProjects]);
  const onUserUpdate = contextSetUser;

  // 사용자 정보 내부 상태 관리
  const [user, setUser] = useState(initialUser!);
  
  // 사용자 이메일에 따른 요금제 결정
  const getUserPlanType = (): 'basic' | 'standard' | 'premium' | 'enterprise' => {
    const email = initialUser?.email?.toLowerCase() || '';
    return USER_PLANS[email] || USER_PLANS['default'];
  };
  
  // 요금제 정보 관리
  const [userPlan] = useState<{
    planType: 'basic' | 'standard' | 'premium' | 'enterprise';
    additionalEvaluators: number; // 10명 단위 추가 구매
    planName: string;
  }>(() => {
    const planType = getUserPlanType();
    const planNames = {
      'basic': 'Basic Plan',
      'standard': 'Standard Plan',
      'premium': 'Premium Plan',
      'enterprise': 'Enterprise Plan'
    };
    return {
      planType,
      additionalEvaluators: 0,
      planName: planNames[planType]
    };
  });

  // 프로젝트 자동 로딩 로직 (빈 상태일 때만)
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // App.tsx에서 'home' 탭일 때도 fetchProjects를 호출하도록 수정했으므로
    // 이제 PersonalServiceDashboard에서 중복 로딩할 필요가 없습니다.

    // 상위에서 프로젝트가 전달되지 않고, 아직 로딩 시도하지 않았으면 자동 로딩
    if (!externalProjects?.length && !hasAttemptedLoad && !isAutoLoading) {
      const autoLoadProjects = async () => {
        setIsAutoLoading(true);
        setHasAttemptedLoad(true);

        try {
          await dataService.getProjects();
        } catch (error) {
          setError('프로젝트를 불러오는데 실패했습니다. 새로고침을 시도해보세요.');
        } finally {
          setIsAutoLoading(false);
        }
      };

      autoLoadProjects();
    }
  }, [externalProjects, hasAttemptedLoad, isAutoLoading]);

  // Context의 user가 변경될 때 내부 상태도 업데이트
  useEffect(() => {
    if (initialUser && (user.first_name !== initialUser.first_name || user.last_name !== initialUser.last_name)) {
      setUser(initialUser);
    }
  }, [initialUser, user]);

  // 사용자 정보 업데이트 처리
  const handleUserUpdate = (updatedUser: User) => {
    // 새로운 객체 참조를 만들어 React 리렌더링 보장
    const newUserObject = { ...updatedUser };
    setUser(newUserObject);
    if (onUserUpdate) {
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
  
  const [currentStep, setCurrentStep] = useState<'overview' | 'projects' | 'criteria' | 'alternatives' | 'evaluators' | 'finalize'>('overview');
  const [loading, setLoading] = useState(false);
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
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);
  // 프로젝트 목록 새로고침을 위한 트리거
  const [projectRefreshTrigger, setProjectRefreshTrigger] = useState(0);
  
  // 실시간 프로젝트 동기화 함수
  const refreshProjectList = useCallback(async () => {
    const updatedProjects = await dataService.getProjects();

    if (updatedProjects.length > 0) {
      setProjectRefreshTrigger(prev => prev + 1);
    }

    return updatedProjects;
  }, []);
  
  const [activeMenu, setActiveMenu] = useState<ActiveMenuTab>(() => {
    // externalActiveTab이 있으면 그것을 우선 사용
    if (externalActiveTab && ['project-wizard', 'demographic-setup', 'evaluator-invitation'].includes(externalActiveTab)) {
      return externalActiveTab as ActiveMenuTab;
    }

    // URL 파라미터에서 직접 demographic-survey 확인
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam === 'demographic-survey') {
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
    externalActiveTab === 'ai-paper-assistant' ? 'paper' :
    externalActiveTab === 'export-reports' ? 'export' :
    externalActiveTab === 'workshop-management' ? 'workshop' :
    externalActiveTab === 'decision-support-system' ? 'decision-support' :
    externalActiveTab === 'personal-settings' ? 'settings' :
    'dashboard';

    return result;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectTemplate, setProjectTemplate] = useState<'blank' | 'business' | 'technical' | 'academic'>('blank');
  

  const projectTemplates = {
    blank: { name: '빈 프로젝트', desc: '처음부터 설정' },
    business: { name: '비즈니스 결정', desc: '경영 의사결정 템플릿' },
    technical: { name: '기술 선택', desc: '기술 대안 비교 템플릿' },
    academic: { name: '연구 분석', desc: '학술 연구용 템플릿' }
  };

  // externalActiveTab이 변경되면 activeMenu도 업데이트
  useEffect(() => {
    if (externalActiveTab && ['project-wizard', 'demographic-setup', 'evaluator-invitation'].includes(externalActiveTab)) {
      setActiveMenu(externalActiveTab as ActiveMenuTab);
    }
  }, [externalActiveTab]);
  
  // 슈퍼 관리자 모드 체크 및 리다이렉트
  // PSD는 항상 연구자 대시보드로 동작. 관리자 리디렉트는 AppContent에서 처리.

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
      setActiveMenu(mappedMenu as ActiveMenuTab);
    }
  }, [externalActiveTab]);

  // projects는 App.tsx에서 관리하므로 여기서 별도 로드 불필요

  // loadProjects 함수 제거 - App.tsx에서 관리


  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectTitle = project?.title || '프로젝트';
    
    // MyProjects에서 이미 확인을 받았으므로 여기서는 확인하지 않음
    try {
      // App.tsx의 onDeleteProject 사용 (휴지통 오버플로우 처리 포함)
      if (onDeleteProject) {
        await onDeleteProject(projectId);

        // 삭제 후 실시간 프로젝트 목록 새로고침
        if (refreshProjectList) {
          await refreshProjectList();
        }

        // 프로젝트 새로고침 트리거
        setProjectRefreshTrigger(prev => prev + 1);

        // 성공 메시지 표시
        showActionMessage('success', `"${projectTitle}"가 휴지통으로 이동되었습니다.`);
      } else {
        // Fallback to dataService
        const success = await dataService.deleteProject(projectId);

        if (success) {
          // 삭제 후 실시간 프로젝트 목록 새로고침
          if (refreshProjectList) {
            await refreshProjectList();
          }

          // 프로젝트 새로고침 트리거
          setProjectRefreshTrigger(prev => prev + 1);

          showActionMessage('success', `"${projectTitle}"가 휴지통으로 이동되었습니다.`);
        } else {
          throw new Error('프로젝트 삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      // JSON 에러 메시지 처리
      if (error instanceof Error) {
        // JSON 파싱 에러인 경우 처리
        const errorMessage = error.message.includes('JSON')
          ? '서버 응답 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          : error.message;
        showActionMessage('error', errorMessage);
      } else {
        showActionMessage('error', '프로젝트 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleExportResults = (format: string, data?: unknown) => {
    // 결과 내보내기 로직
    showActionMessage('info', `${format.toUpperCase()} 형식으로 결과를 내보내는 기능을 개발 중입니다.`);
  };

  // 프로젝트의 기준/대안 개수 업데이트 (App.tsx에서 관리하므로 no-op)
  const handleCriteriaCountUpdate = (_count: number) => {};
  const handleAlternativesCountUpdate = (_count: number) => {};

  const handleCreateNewProject = async () => {
    // 폼 검증
    if (!projectForm.title.trim()) {
      setError('프로젝트명을 입력해주세요.');
      return;
    }
    
    if (!projectForm.description.trim()) {
      setError('프로젝트 설명을 입력해주세요.');
      return;
    }
    
    if (!projectForm.objective.trim()) {
      setError('분석 목표를 입력해주세요.');
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
      
      setError(null);
      
      // 프로젝트 생성 후 평가자 배정 단계로 이동
      setNewProjectStep(2);
      
      // 폼 데이터는 유지 (평가자 배정 후 완전히 리셋)
    } catch (error: unknown) {
      // dataService가 자동으로 오프라인 모드로 처리하므로 에러 메시지를 사용자 친화적으로 변경
      setError((error instanceof Error ? error.message : '') || '프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    // 최근 프로젝트 가져오기 (최대 3개)
    const recentProjects = (projects || [])
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 3);
      
    return (
    <div className="space-y-6">

      {/* 환영 메시지 및 빠른 시작 영역 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              안녕하세요, {user?.first_name || user?.username || '연구자'}님 👋
            </h2>
            <p className="text-gray-600">
              오늘도 성공적인 AHP 분석을 시작해보세요
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleTabChange('project-wizard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center"
            >
              <span className="text-xl mr-2">➕</span>
              새 프로젝트 시작
            </button>
            <button
              onClick={() => handleTabChange('user-guide')}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow border border-gray-200 flex items-center"
            >
              <span className="text-xl mr-2">📚</span>
              사용 가이드
            </button>
          </div>
        </div>
      </div>

      {/* 주요 통계 카드 - 개선된 디자인 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">전체 프로젝트</p>
              <p className="text-3xl font-bold text-gray-900">
                {(projects || []).length}
                <span className="text-lg text-gray-400 ml-1">/{getCurrentQuotas().maxProjects}</span>
              </p>
              {getCurrentQuotas().maxProjects - (projects || []).length <= 2 && (
                <p className="text-xs text-orange-600 mt-1">
                  {getCurrentQuotas().maxProjects - (projects || []).length}개 남음
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">진행중</p>
              <p className="text-3xl font-bold text-green-600">
                {(projects || []).filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                활성 프로젝트
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">평가자 현황</p>
              <p className="text-3xl font-bold text-purple-600">
                {getCurrentQuotas().currentEvaluators}
                <span className="text-lg text-gray-400 ml-1">명</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                최대 {getCurrentQuotas().maxEvaluators}명
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">완료됨</p>
              <p className="text-3xl font-bold text-orange-600">
                {(projects || []).filter(p => p.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                분석 완료
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 프로젝트 섹션 */}
      {recentProjects.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="text-xl mr-2">📋</span>
              최근 프로젝트
            </h3>
            <button
              onClick={() => handleTabChange('projects')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              모두 보기 →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                onClick={() => {
                  setSelectedProjectId(project.id ?? '');
                  handleTabChange('model-builder');
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                    {project.title}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : project.status === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status === 'active' ? '진행중' : 
                     project.status === 'completed' ? '완료' : '준비중'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {project.description || '설명 없음'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>평가자: {project.evaluator_count || 0}명</span>
                  <span>진행률: {project.completion_rate || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AHP 워크플로우 가이드 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">🚀</span>
          AHP 분석 워크플로우
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: 1, title: '프로젝트 생성', icon: '📝', desc: '목표 설정', action: 'project-wizard' },
            { step: 2, title: '계층 구성', icon: '🏗️', desc: '기준/대안 설정', action: 'model-builder' },
            { step: 3, title: '평가자 초대', icon: '👥', desc: '참여자 관리', action: 'evaluators' },
            { step: 4, title: '데이터 수집', icon: '📊', desc: '평가 진행', action: 'monitoring' },
            { step: 5, title: '결과 분석', icon: '📈', desc: '의사결정', action: 'analysis' }
          ].map((item, index) => (
            <button
              key={item.step}
              onClick={() => handleTabChange(item.action)}
              className="relative bg-white p-4 rounded-lg hover:shadow-md transition-all border border-gray-200 text-left"
            >
              {index < 4 && (
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-400 hidden md:block">
                  →
                </div>
              )}
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{item.icon}</span>
                <span className="text-xs font-bold text-gray-400">STEP {item.step}</span>
              </div>
              <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 빠른 접근 메뉴 - 개선된 디자인 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'projects', label: '내 프로젝트', icon: '📁', color: 'bg-blue-500' },
          { id: 'evaluators', label: '평가자 관리', icon: '👥', color: 'bg-purple-500' },
          { id: 'analysis', label: '결과 분석', icon: '📊', color: 'bg-green-500' },
          { id: 'export', label: '보고서 출력', icon: '📄', color: 'bg-orange-500' },
          { id: 'workshop', label: '워크숍', icon: '🎯', color: 'bg-pink-500' },
          { id: 'decision-support', label: '의사결정', icon: '🧠', color: 'bg-indigo-500' },
          { id: 'survey-links', label: '설문 링크', icon: '🔗', color: 'bg-teal-500' },
          { id: 'trash', label: '휴지통', icon: '🗑️', color: 'bg-red-500' },
          { id: 'dev-tools', label: '개발자 도구', icon: '🛠️', color: 'bg-gray-600' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${item.color} bg-opacity-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{item.icon}</span>
              </div>
              <span className="font-medium text-gray-800">{item.label}</span>
            </div>
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
            { id: 'model-builder', label: '모델 구성', icon: '⚙️', color: 'from-green-500 to-green-600' },
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

      {/* 도움말 및 리소스 섹션 */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">💡</span>
          도움말 및 리소스
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-70 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-lg mr-2">📖</span>
              사용자 매뉴얼
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              AHP 플랫폼의 모든 기능을 자세히 알아보세요
            </p>
            <button
              onClick={() => handleTabChange('user-guide')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              매뉴얼 보기 →
            </button>
          </div>

          <div className="bg-white bg-opacity-70 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-lg mr-2">🎥</span>
              비디오 튜토리얼
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              동영상으로 쉽게 따라하는 AHP 분석 과정
            </p>
            <button
              onClick={() => window.open('https://youtube.com/playlist?list=AHP_Tutorial', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              동영상 보기 →
            </button>
          </div>

          <div className="bg-white bg-opacity-70 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-lg mr-2">💬</span>
              고객 지원
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              궁금한 점이 있으신가요? 전문가가 도와드립니다
            </p>
            <button
              onClick={() => handleTabChange('support')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              문의하기 →
            </button>
          </div>
        </div>

        {/* 공지사항 또는 팁 */}
        <div className="mt-4 p-4 bg-yellow-50 bg-opacity-70 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <span className="text-xl mr-2">💡</span>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">오늘의 팁</h4>
              <p className="text-xs text-gray-600">
                AHP 분석에서 일관성 비율(CR)이 0.1 이하일 때 결과의 신뢰성이 높습니다. 
                평가 시 일관된 판단을 유지하는 것이 중요합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
    );
  };

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
            <EvaluatorAssignment 
              projectId={selectedProjectId} 
              onComplete={() => setCurrentStep('finalize')} 
              maxEvaluators={getCurrentQuotas().maxEvaluators}
              currentPlan={userPlan.planName}
            />
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
            }}
            onNavigateToEvaluators={() => {
              // 평가자 관리 페이지로 자동 이동
              if (externalOnTabChange) {
                externalOnTabChange('evaluators');
              } else {
                setActiveMenu('evaluators');
              }
            }}
            isReadyToFinalize={true}
          />
        );
      default:
        return renderOverview();
    }
  };

  const [projectData, setProjectData] = useState<{
    criteria: unknown[];
    alternatives: unknown[];
    results: unknown[];
  }>({
    criteria: [],
    alternatives: [],
    results: []
  });

  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  useEffect(() => {
    const loadProjectData = async () => {
      if (!selectedProjectId) return;
      try {
        const [criteria, alternatives] = await Promise.all([
          onFetchCriteria?.(selectedProjectId) || Promise.resolve([]),
          onFetchAlternatives?.(selectedProjectId) || Promise.resolve([])
        ]);
        setProjectData({
          criteria,
          alternatives,
          results: [] // 결과 데이터는 아직 API가 없어서 빈 배열로 설정
        });
      } catch (error) {
        showActionMessage('error', '프로젝트 데이터를 불러오는 데 실패했습니다.');
      }
    };
    loadProjectData();
  }, [selectedProjectId, onFetchCriteria, onFetchAlternatives]);


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
        'project-wizard': 'project-wizard',
        'demographic-setup': 'demographic-setup',
        'evaluator-invitation': 'evaluator-invitation',
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
        'trash': 'trash',
        'dev-tools': 'dev-tools'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    } else {
      setActiveMenu(tab as ActiveMenuTab);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
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
        <MyProjects
          refreshTrigger={projectRefreshTrigger}
          onCreateNew={() => {
            if (externalOnTabChange) {
              externalOnTabChange('project-workflow');
            } else {
              handleTabChange('creation');
            }
          }}
          onProjectSelect={(project) => {
            setSelectedProjectId(project.id || '');
          }}
          onEditProject={(project) => {
            setProjectForm({
              title: project.title,
              description: project.description || '',
              objective: project.objective || '',
              evaluation_method: 'pairwise',
              evaluation_mode: project.evaluation_mode || 'practical',
              workflow_stage: project.workflow_stage || 'creating'
            });
          }}
          onDeleteProject={handleDeleteProject}
          onModelBuilder={(project) => {
            setSelectedProjectId(project.id || '');
            if (externalOnTabChange) {
              externalOnTabChange('model-builder');
            } else {
              setActiveMenu('model-builder');
            }
          }}
          onAnalysis={(project) => {
            setSelectedProjectId(project.id || '');
            if (externalOnTabChange) {
              externalOnTabChange('results-analysis');
            } else {
              setActiveMenu('analysis');
            }
          }}
        />
      </div>
    </div>
  );

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
        <ProjectCreation
          onProjectCreated={() => {
            if (externalOnTabChange) {
              externalOnTabChange('project-workflow');
            } else {
              handleTabChange('projects');
            }
            setProjectRefreshTrigger(prev => prev + 1);
          }}
          onCancel={() => {
            if (externalOnTabChange) {
              externalOnTabChange('my-projects');
            } else {
              handleTabChange('projects');
            }
          }}
          createProject={async (projectData) => {
            // ProjectCreation에서 오는 데이터를 ProjectData 형식으로 변환
            const convertedData = {
              title: projectData.title,
              description: projectData.description,
              objective: projectData.objective,
              evaluation_mode: projectData.evaluationMode, // evaluationMode -> evaluation_mode
              ahp_type: projectData.ahpType,
              status: 'draft' as const,
              workflow_stage: 'creating' as const
            };

            if (onCreateProject) {
              const result = await onCreateProject(convertedData);
              return result;
            } else {
              const result = await dataService.createProject(convertedData);
              return result;
            }
          }}
        />
      </div>
    </div>
  );

  const renderProjectCreation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">새 프로젝트 생성</h3>
      
      {/* 템플릿 선택 */}
      <Card title="프로젝트 템플릿 선택">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(projectTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setProjectTemplate(key as 'blank' | 'business' | 'technical' | 'academic')}
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

      <Card title="프로젝트 생성 단계">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 border-2 rounded-lg transition-all ${
              newProjectStep === 1 ? 'border-blue-500 bg-blue-50 shadow-md' : 
              newProjectStep > 1 ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="text-2xl mb-2">
                {newProjectStep > 1 ? '✅' : '📋'}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">1. 기본 정보</h4>
              <p className="text-xs text-gray-600">프로젝트명, 설명, 목적</p>
              {newProjectStep === 1 && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              )}
            </div>
            <div className={`text-center p-4 border-2 rounded-lg transition-all ${
              newProjectStep === 2 ? 'border-blue-500 bg-blue-50 shadow-md' : 
              newProjectStep > 2 ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="text-2xl mb-2">
                {newProjectStep > 2 ? '✅' : '🎯'}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">2. 기준 설정</h4>
              <p className="text-xs text-gray-600">평가 기준 정의</p>
              {newProjectStep === 2 && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              )}
            </div>
            <div className={`text-center p-4 border-2 rounded-lg transition-all ${
              newProjectStep === 3 ? 'border-blue-500 bg-blue-50 shadow-md' : 
              newProjectStep > 3 ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="text-2xl mb-2">
                {newProjectStep > 3 ? '✅' : '📊'}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">3. 대안 설정</h4>
              <p className="text-xs text-gray-600">선택 대안 정의</p>
              {newProjectStep === 3 && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              )}
            </div>
            <div className={`text-center p-4 border-2 rounded-lg transition-all ${
              newProjectStep === 4 ? 'border-blue-500 bg-blue-50 shadow-md' : 
              newProjectStep > 4 ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="text-2xl mb-2">
                {newProjectStep > 4 ? '✅' : '👥'}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">4. 평가자 배정</h4>
              <p className="text-xs text-gray-600">평가자 초대 및 관리</p>
              {newProjectStep === 4 && (
                <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              )}
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
                <select 
                  value={projectForm.evaluation_method}
                  onChange={(e) => setProjectForm({...projectForm, evaluation_method: e.target.value as 'pairwise' | 'direct' | 'mixed'})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="pairwise">쌍대비교 (권장)</option>
                  <option value="direct">직접입력</option>
                  <option value="mixed">혼합 방식</option>
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
                  {loading ? '생성 중...' : '다음: 기준 설정'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: 기준 설정 */}
          {newProjectStep === 2 && newProjectId && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold mb-2">평가 기준 설정</h3>
                <p className="text-gray-600 mb-4">프로젝트에서 사용할 평가 기준을 설정하세요.</p>
              </div>
              
              {/* 기준 관리 컴포넌트 */}
              <CriteriaManagement
                projectId={newProjectId}
                onComplete={() => {
                  // 자동으로 다음 단계로 이동하지 않고 사용자가 버튼을 클릭하도록 함
                }}
                onCriteriaChange={() => {
                  // criteria count change handled by parent
                }}
              />
              
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setNewProjectStep(1)}>
                  이전: 기본정보
                </Button>
                <Button 
                  variant="primary" 
                  onClick={async () => {
                    // 기준이 설정되었는지 확인
                    try {
                      const criteriaResponse = await dataService.getCriteria(newProjectId);
                      const criteriaCount = criteriaResponse?.length || 0;
                      
                      if (criteriaCount === 0) {
                        showActionMessage('error', '최소 1개 이상의 평가 기준을 추가해주세요.');
                        return;
                      }

                      setNewProjectStep(3);
                    } catch (error) {
                      setNewProjectStep(3);
                    }
                  }}
                >
                  다음: 대안 설정
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 대안 설정 */}
          {newProjectStep === 3 && newProjectId && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold mb-2">대안 설정</h3>
                <p className="text-gray-600 mb-4">비교할 대안들을 설정하세요.</p>
              </div>
              
              {/* 대안 관리 컴포넌트 */}
              <AlternativeManagement
                projectId={newProjectId}
                onComplete={() => {
                  // 자동으로 다음 단계로 이동하지 않고 사용자가 버튼을 클릭하도록 함
                }}
                onAlternativesChange={() => {
                  // alternatives count change handled by parent
                }}
              />
              
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setNewProjectStep(2)}>
                  이전: 기준 설정
                </Button>
                <Button 
                  variant="primary" 
                  onClick={async () => {
                    // 대안이 설정되었는지 확인
                    try {
                      const alternativesResponse = await dataService.getAlternatives(newProjectId);
                      const alternativesCount = alternativesResponse?.length || 0;
                      
                      if (alternativesCount === 0) {
                        showActionMessage('error', '최소 2개 이상의 대안을 추가해주세요.');
                        return;
                      }

                      if (alternativesCount < 2) {
                        showActionMessage('error', 'AHP 분석을 위해 최소 2개 이상의 대안이 필요합니다.');
                        return;
                      }

                      setNewProjectStep(4);
                    } catch (error) {
                      setNewProjectStep(4);
                    }
                  }}
                >
                  다음: 평가자 배정
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: 평가자 배정 */}
          {newProjectStep === 4 && newProjectId && (
            <div className="space-y-4">
              <EvaluatorAssignment 
                projectId={newProjectId} 
                onComplete={() => {
                  handleTabChange('model-builder');
                  setNewProjectStep(1);
                  setNewProjectId(null);
                }} 
              />
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setNewProjectStep(3)}>
                  이전: 대안 설정
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      // 평가자 없이 진행 (본인만 평가)
                      setSelectedProjectId(newProjectId || '');
                      handleTabChange('model-builder');
                      setNewProjectStep(1);
                      setNewProjectId(null);
                    }}
                  >
                    건너뛰기 (본인만 평가)
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={async () => {
                      // 평가자가 있는지 확인
                      try {
                        await dataService.getEvaluators(newProjectId);
                        setSelectedProjectId(newProjectId || '');
                        handleTabChange('model-builder');
                        setNewProjectStep(1);
                        setNewProjectId(null);
                      } catch (error) {
                        setSelectedProjectId(newProjectId || '');
                        handleTabChange('model-builder');
                        setNewProjectStep(1);
                        setNewProjectId(null);
                      }
                    }}
                  >
                    완료 및 모델 구축으로 이동
                  </Button>
                </div>
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
        onClose={() => handleTabChange('dashboard')}
      />
    );
  };

  const renderSurveyLinks = () => {
    // 선택된 프로젝트 정보 가져오기
    const currentProject = projects.find(p => p.id === selectedProjectId);
    
    // 평가자 목록 가져오기 (실제로는 API에서)
    const evaluators: unknown[] = [
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
                  <p className="text-gray-600 mt-2">연구 참여자의 기본 정보를 수집하는 설문조사입니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyFormBuilder
          onSave={(_questions, _metadata) => {
            // 실제 데이터 저장 로직
          }}
          onCancel={() => handleTabChange('dashboard')}
        />
      </div>
    </div>
  );

  const renderPersonalSettingsFullPage = () => (
    <PersonalSettings 
      user={user}
      onBack={() => handleTabChange('dashboard')}
      onUserUpdate={setUser}
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
                    <span className="text-4xl mr-3">⚙️</span>
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
                <div className="text-gray-400 text-6xl mb-4">⚙️</div>
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
        // 모든 역할에서 연구자 대시보드 표시 (관리자도 연구 플랫폼 모드에서는 연구자 뷰)
        return (
          <PersonalUserDashboard
            user={user}
            onTabChange={(tab) => {
              if (externalOnTabChange) {
                externalOnTabChange(tab);
              }
            }}
          />
        );
      case 'projects':
        return (
          <MyProjects
            refreshTrigger={projectRefreshTrigger}
            onCreateNew={() => {
              if (externalOnTabChange) {
                externalOnTabChange('project-workflow');
              } else {
                setActiveMenu('creation');
              }
            }}
            onProjectSelect={(project) => {
              setSelectedProjectId(project.id || '');
            }}
            onEditProject={(project) => {
              setProjectForm({
                title: project.title,
                description: project.description || '',
                objective: project.objective || '',
                evaluation_method: 'pairwise',
                evaluation_mode: project.evaluation_mode || 'practical',
                workflow_stage: project.workflow_stage || 'creating'
              });
            }}
            onDeleteProject={handleDeleteProject}
            onModelBuilder={(project) => {
              setSelectedProjectId(project.id || '');
              setActiveMenu('model-builder');
            }}
            onAnalysis={(project) => {
              setSelectedProjectId(project.id || '');
              setActiveMenu('analysis');
            }}
          />
        );
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
        return <PSDProgressMonitoringTab onTabChange={handleTabChange} />;
      case 'analysis':
        return <PSDResultsAnalysisTab />;
      case 'export':
        return (
          <PSDExportTab
            selectedProjectId={selectedProjectId}
            projects={projects}
            projectData={projectData}
            onTabChange={handleTabChange}
            showActionMessage={showActionMessage}
          />
        );
      case 'workshop':
        return renderWorkshopManagement();
      case 'decision-support':
        return renderDecisionSupportSystem();
      case 'evaluation-test':
        return <PSDEvaluationTestTab projects={projects} />;
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
      case 'dev-tools':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <span className="text-3xl mr-3">🛠️</span>
                개발자 도구
              </h2>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-yellow-800">
                  개발 및 디버깅 목적으로만 사용하세요. 실제 운영 환경에서는 비활성화됩니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title="API 연결 테스트"
                className="hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-4">백엔드 API 연결 상태를 확인하고 테스트합니다.</p>
                <div className="space-y-3">
                  <a
                    href="/test_api_connection.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    API 테스트 페이지 열기
                  </a>
                  <div className="text-xs text-gray-500">
                    • 백엔드 상태 확인<br/>
                    • 프로젝트 CRUD 테스트<br/>
                    • 평가자 추가 테스트
                  </div>
                </div>
              </Card>

              <Card
                title="텍스트 파서 테스트"
                className="hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-4">계층구조 텍스트 파싱 기능을 테스트합니다.</p>
                <div className="space-y-3">
                  <a
                    href="/test_parser.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    파서 테스트 페이지 열기
                  </a>
                  <div className="text-xs text-gray-500">
                    • 번호 형식 파싱<br/>
                    • 마크다운 형식 파싱<br/>
                    • 들여쓰기 형식 파싱
                  </div>
                </div>
              </Card>

              <Card
                title="데이터베이스 정보"
                className="hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-4">현재 연결된 데이터베이스 정보</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs">
                  <div className="space-y-1">
                    <p><strong>Type:</strong> PostgreSQL</p>
                    <p><strong>Host:</strong> Render Cloud</p>
                    <p><strong>Service:</strong> Basic-256mb</p>
                    <p><strong>ID:</strong> dpg-d2q8l5qdbo4c73bt3780-a</p>
                    <p><strong>Backend:</strong> ahp-django-backend.onrender.com</p>
                  </div>
                </div>
              </Card>

              <Card
                title="시스템 상태"
                className="hover:shadow-lg transition-shadow"
              >
                <p className="text-gray-600 mb-4">현재 시스템 상태 및 설정</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">스토리지 모드:</span>
                    <span className="font-medium">Online (PostgreSQL)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">로컬 스토리지:</span>
                    <span className="font-medium text-red-600">비활성화 ❌</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">API 버전:</span>
                    <span className="font-medium">v1.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">환경:</span>
                    <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">최근 수정 사항</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✅ 번호 형식 계층구조 파싱 수정 (1., 1.1., 2., 2.1.)</li>
                <li>✅ 평가자 추가 API 404 에러 해결 (PUT → PATCH)</li>
                <li>✅ 로컬 스토리지 의존성 제거</li>
                <li>✅ PostgreSQL 백엔드 연동 완료</li>
              </ul>
            </div>
          </div>
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
            
            <SurveyFormBuilder
              onSave={(_questions, _metadata) => {
                // 실제 데이터 저장 로직
              }}
              onCancel={() => handleTabChange('dashboard')}
            />
          </div>
        );
      
      // 전체 화면으로 렌더링되는 메뉴들은 여기서 null 반환
      case 'project-wizard':
      case 'demographic-setup':
      case 'evaluator-invitation':
        return null;

      default:
        return renderOverview();
    }
  };

  // 개별 메뉴 페이지들은 전체 화면을 사용
  // activeMenu와 externalActiveTab 둘 다 체크
  const currentTab = externalActiveTab || activeMenu;
  
  // 각 전체 화면 페이지들을 개별적으로 처리
  if (currentTab === 'project-wizard') {
    return (
      <EnhancedProjectCreationWizard 
        onTabChange={handleTabChange}
        onNavigate={() => handleTabChange('dashboard')}
      />
    );
  }
  
  if (currentTab === 'demographic-setup') {
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
                      <span className="text-4xl mr-3">📝</span>
                      인구통계 설문 설계
                    </h1>
                    <p className="text-gray-600 mt-2">평가자의 인구통계학적 정보를 수집할 설문을 설계합니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DemographicSurveyConfig
            config={{
              enabled: true,
              useAge: true,
              useGender: true,
              useEducation: true,
              useOccupation: true,
              useIndustry: true,
              useExperience: true,
              customQuestions: [],
              surveyTitle: '인구통계학적 기본 정보 조사',
              surveyDescription: '본 설문은 연구 참여자의 기본 정보를 수집하기 위한 것입니다.',
              estimatedTime: 2,
            }}
            onChange={(_config) => {
              // config change handled by child
            }}
          />
        </div>
      </div>
    );
  }

  if (currentTab === 'evaluator-invitation') {
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
                      <span className="text-4xl mr-3">👥</span>
                      평가자 초대
                    </h1>
                    <p className="text-gray-600 mt-2">QR코드와 링크를 통해 평가자를 초대합니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedProjectId ? (
            <EnhancedEvaluatorManagement 
              projectId={selectedProjectId}
              projectName={projects.find(p => p.id === selectedProjectId)?.title || '프로젝트'}
              onClose={() => handleTabChange('dashboard')}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📂</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">프로젝트를 선택해주세요</h2>
                <p className="text-gray-600 mb-6">평가자를 초대할 프로젝트를 먼저 선택해야 합니다</p>
                <button 
                  onClick={() => handleTabChange('projects')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  프로젝트 목록으로 이동
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 다른 전체 화면 페이지들
  if (currentTab === 'my-projects') return renderMyProjectsFullPage();
  if (currentTab === 'project-creation') return renderProjectCreationFullPage();
  if (currentTab === 'model-builder') return renderModelBuilderFullPage();
  if (currentTab === 'evaluator-management') return renderEvaluatorManagementFullPage();
  if (currentTab === 'progress-monitoring') return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={() => handleTabChange('dashboard')} className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl">←</button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">📈</span>진행률 모니터링
                  </h1>
                  <p className="text-gray-600 mt-2">평가자별 진행 상황을 실시간으로 추적합니다</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleTabChange('evaluators')}>👥 평가자 관리</Button>
                <Button variant="secondary" onClick={() => handleTabChange('analysis')}>📊 결과 분석</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PSDProgressMonitoringTab onTabChange={handleTabChange} />
      </div>
    </div>
  );
  if (currentTab === 'results-analysis') return renderResultsAnalysisFullPage();
  if (currentTab === 'ai-paper-assistant') return renderPaperManagementFullPage();
  if (currentTab === 'export-reports') return (
    <PSDExportFullPage
      selectedProjectId={selectedProjectId}
      projects={projects}
      projectData={projectData}
      onTabChange={handleTabChange}
      showActionMessage={showActionMessage}
    />
  );
  if (currentTab === 'workshop-management') return renderWorkshopManagementFullPage();
  if (currentTab === 'decision-support-system') return renderDecisionSupportSystemFullPage();
  if (currentTab === 'personal-settings') return renderPersonalSettingsFullPage();
  if (currentTab === 'demographic-survey') return renderDemographicSurveyFullPage();
  
  // 대시보드 컨텐츠 렌더링
  if (currentTab === 'personal-service' || currentTab === 'dashboard' || currentTab === 'admin-dashboard' || currentTab === 'user-home' || !currentTab) {
    return (
      <PersonalUserDashboard
        user={user}
        onTabChange={(tab) => {
          if (externalOnTabChange) {
            externalOnTabChange(tab);
          }
        }}
      />
    );
  }

  
  // 이외의 경우 메뉴 컨텐츠 렌더링
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {renderMenuContent()}
        </div>
      </div>

      {/* Project Selector Modal */}
      {showProjectSelector && projectSelectorConfig != null && (
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