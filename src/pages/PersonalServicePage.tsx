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
import dataService from '../services/dataService';
import type { ProjectData } from '../services/api';
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

  // props에서 projects를 직접 사용하므로 useEffect 불필요

  // props의 user가 변경될 때 내부 상태도 업데이트
  useEffect(() => {
    console.log('👀 PersonalServiceDashboard: props user 변경 감지', {
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
    console.log('🔄 PersonalServiceDashboard: handleUserUpdate 호출!', {
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

  const handleTabChange = (tab: string) => {
    console.log('📋 PersonalServiceDashboard: handleTabChange 호출', tab);
    
    // 내부 상태 업데이트
    setActiveMenu(tab as any);
    
    // 외부로 전파
    if (externalOnTabChange) {
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
        'settings': 'personal-settings',
        'demographic-survey': 'demographic-survey'
      };
      const externalTab = tabMap[tab] || tab;
      console.log('🚀 외부로 전파:', tab, '->', externalTab);
      externalOnTabChange(externalTab);
    }
  };

  // Overview 대시보드 렌더링 함수
  const renderOverview = () => (
    <div className="space-y-6">

      {/* 프로젝트 현황 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-info-text)' }}>프로젝트</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{quotas.currentProjects}/{quotas.maxProjects}</p>
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
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{quotas.currentEvaluators}/{quotas.maxEvaluators}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-success-text)' }}>
              <span className="text-white text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--status-warning-text)' }}>완료된 평가</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>8</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ border: '1px solid var(--border-light)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>사용 가능</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>22일</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white text-2xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 기능 버튼들 */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'creation', label: '새 프로젝트', icon: '🚀', color: 'from-blue-500 to-blue-600' },
          { id: 'projects', label: '내 프로젝트', icon: '📂', color: 'from-green-500 to-green-600' },
          { id: 'model-builder', label: '모델 구성', icon: '🏗️', color: 'from-purple-500 to-purple-600' },
          { id: 'evaluators', label: '평가자 관리', icon: '👥', color: 'from-orange-500 to-orange-600' },
          { id: 'monitoring', label: '진행률 모니터링', icon: '📈', color: 'from-teal-500 to-teal-600' },
          { id: 'analysis', label: '결과 분석', icon: '📊', color: 'from-red-500 to-red-600' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-transparent transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, var(--${item.color.split(' ')[0].replace('from-', '')}), var(--${item.color.split(' ')[2].replace('to-', '')}))`,
              color: 'white'
            }}
          >
            <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mr-3`}>
              <span className="text-white text-lg">{item.icon}</span>
            </div>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 빠른 접근 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>최근 활동</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            최근 7일간 {projects.length}개의 프로젝트에서 활동이 있었습니다.
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>알림</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            완료되지 않은 평가가 3개 있습니다.
          </p>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>도움말</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AHP 분석 가이드를 확인해보세요.
          </p>
        </div>
      </div>
    </div>
  );

  // 메뉴 컨텐츠 렌더링
  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderOverview();
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>내 프로젝트</h2>
              <Button
                onClick={() => handleTabChange('creation')}
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                새 프로젝트 생성
              </Button>
            </div>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어보세요!
              </p>
            </div>
          </div>
        );
      case 'creation':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>새 프로젝트 생성</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                프로젝트 생성 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'model-builder':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>모델 구성</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                모델 구성 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'evaluators':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>평가자 관리</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                평가자 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'survey-links':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>설문 링크</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                설문 링크 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'monitoring':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>진행률 모니터링</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                진행률 모니터링 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>결과 분석</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                결과 분석 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'paper':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>논문 관리</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                논문 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'export':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>보고서 내보내기</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                보고서 내보내기 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'workshop':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>워크숍 관리</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                워크숍 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'decision-support':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>의사결정 지원</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                의사결정 지원 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'evaluation-test':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>평가 테스트</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                평가 테스트 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>개인 설정</h2>
            <PersonalSettings
              user={user}
              onUserUpdate={handleUserUpdate}
            />
          </div>
        );
      case 'usage-management':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>사용량 관리</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                사용량 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>결제 관리</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                결제 관리 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'demographic-survey':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>인구통계학적 설문조사</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                인구통계학적 설문조사 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>휴지통</h2>
            <div className="text-center py-8">
              <p style={{ color: 'var(--text-secondary)' }}>
                휴지통 기능을 구현 중입니다.
              </p>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  개인 서비스 💼
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  안녕하세요, {user.first_name}님! AHP 분석을 시작해보세요.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-right">
                  <div style={{ color: 'var(--text-primary)' }}>{quotas.planName}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    프로젝트 {quotas.currentProjects}/{quotas.maxProjects}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { id: 'dashboard', label: '대시보드', icon: '🏠', tooltip: '현황 및 빠른 작업' },
              { id: 'projects', label: '내 프로젝트', icon: '📂', tooltip: '프로젝트 관리 및 설정' },
              { id: 'creation', label: '새 프로젝트', icon: '🚀', tooltip: '새로운 AHP 프로젝트 생성' },
              { id: 'model-builder', label: '모델 구성', icon: '🏗️', tooltip: '기준과 대안 설정' },
              { id: 'evaluators', label: '평가자', icon: '👥', tooltip: '평가자 초대 및 관리' },
              { id: 'monitoring', label: '진행률', icon: '📈', tooltip: '평가 진행 상황 모니터링' },
              { id: 'analysis', label: '결과 분석', icon: '📊', tooltip: 'AHP 분석 결과 및 시각화' },
              { id: 'paper', label: '논문 관리', icon: '📑', tooltip: '연구 논문 및 문서 관리' },
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

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          {renderMenuContent()}
        </div>
      </div>
    </div>
  );
};

export default PersonalServicePage;