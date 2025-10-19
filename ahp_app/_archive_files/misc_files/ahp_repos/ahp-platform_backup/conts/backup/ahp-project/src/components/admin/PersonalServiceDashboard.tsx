import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
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
import ValidityCheck from '../validity/ValidityCheck';
import dataService from '../../services/dataService';
import type { ProjectData } from '../../services/dataService';

interface PersonalServiceProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'evaluator';
    admin_type?: 'super' | 'personal';
  };
  activeTab?: string;
  onTabChange?: (tab: string) => void;
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
  'basic': { projects: 5, evaluators: 20 },
  'pro': { projects: 20, evaluators: 100 },
  'enterprise': { projects: 100, evaluators: 500 }
};

const PersonalServiceDashboard: React.FC<PersonalServiceProps> = ({ 
  user, 
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange
}) => {
  const [projects, setProjects] = useState<UserProject[]>([]);
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
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
    title: string;
    description: string;
    nextAction: string;
  } | null>(null);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'projects' | 'creation' | 'model-builder' | 'validity-check' | 'evaluators' | 'survey-links' | 'monitoring' | 'analysis' | 'paper' | 'export' | 'workshop' | 'decision-support' | 'settings' | 'payment' | 'demographic-survey'>(() => {
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
  const currentPlan = 'pro'; // 임시로 Pro Plan으로 설정
  const planLimits = PLAN_QUOTAS[currentPlan];
  
  // 사용량 계산
  const usedProjects = projects.length;
  const usedEvaluators = projects.reduce((sum, p) => sum + (p.evaluator_count || 0), 0);
  
  // 사용 가능한 옵션들 (플랜별로 다를 수 있음)
  const availableFeatures = {
    'basic': {
      'advanced-analysis': false,
      'group-ahp': false,
      'realtime-collab': false,
      'premium-support': false
    },
    'pro': {
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

  useEffect(() => {
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 활성 메뉴가 변경될 때 프로젝트 관련 탭이면 데이터를 다시 로드
  useEffect(() => {
    if (activeMenu === 'projects' || activeMenu === 'dashboard') {
      loadProjects();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 통합 데이터 서비스에서 프로젝트 로드');
      
      // 통합 데이터 서비스 사용 (자동으로 온라인/오프라인 모드 처리)
      const projectsData = await dataService.getProjects();
      
      // ProjectData를 UserProject로 변환
      const convertedProjects: UserProject[] = projectsData.map((project: ProjectData) => ({
        ...project,
        evaluator_count: 0, // TODO: 평가자 수 계산
        completion_rate: 0, // TODO: 완료율 계산  
        criteria_count: 0, // TODO: 기준 수 계산
        alternatives_count: 0, // TODO: 대안 수 계산
        last_modified: project.updated_at ? new Date(project.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        evaluation_method: 'pairwise' as const // 기본값
      }));
      
      // 빈 프로젝트 목록인 경우 샘플 프로젝트 생성
      if (convertedProjects.length === 0) {
        console.log('📝 샘플 프로젝트 생성');
        const sampleProject = await dataService.createProject({
          title: 'AI 개발 활용 방안 AHP 분석',
          description: '인공지능 기술의 개발 및 활용 방안에 대한 의사결정 분석',
          objective: 'AI 기술 도입의 최적 방안 선정',
          status: 'draft',
          evaluation_mode: 'practical',
          workflow_stage: 'creating'
        });
        
        if (sampleProject) {
          const sampleUserProject: UserProject = {
            ...sampleProject,
            evaluator_count: 0,
            completion_rate: 0,
            criteria_count: 0,
            alternatives_count: 0,
            last_modified: new Date().toISOString().split('T')[0],
            evaluation_method: 'pairwise' as const
          };
          setProjects([sampleUserProject]);
        } else {
          setProjects([]);
        }
      } else {
        setProjects(convertedProjects);
      }
      
      console.log(`✅ ${convertedProjects.length}개 프로젝트 로드 완료`);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError('프로젝트를 불러오는데 실패했습니다.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까? 모든 관련 데이터가 삭제됩니다.')) {
      try {
        // dataService를 사용하여 프로젝트 삭제 (자동으로 온라인/오프라인 모드 처리)
        console.log('🗑️ 프로젝트 삭제:', projectId);
        const success = await dataService.deleteProject(projectId);
        
        if (success) {
          const updatedProjects = projects.filter(p => p.id !== projectId);
          setProjects(updatedProjects);
          console.log('✅ Project deleted successfully:', projectId);
        } else {
          alert('프로젝트 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Project deletion error:', error);
        alert('프로젝트 삭제 중 오류가 발생했습니다.');
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
          
          const updatedProjects = projects.map(p => 
            p.id === editingProject.id ? updatedUserProject : p
          );
          setProjects(updatedProjects);
          console.log('✅ 프로젝트 수정 완료');
        } else {
          throw new Error('프로젝트 수정에 실패했습니다.');
        }
      } else {
        // 생성 모드 - 새 프로젝트 생성
        const newProject = await dataService.createProject({
          title: projectForm.title,
          description: projectForm.description,
          objective: projectForm.objective,
          status: 'draft', // 초기 상태는 draft
          evaluation_mode: projectForm.evaluation_mode,
          workflow_stage: projectForm.workflow_stage
        });
        
        if (newProject) {
          const newUserProject: UserProject = {
            ...newProject,
            evaluator_count: 0,
            completion_rate: 0,
            criteria_count: 0,
            alternatives_count: 0,
            last_modified: new Date().toISOString().split('T')[0],
            evaluation_method: projectForm.evaluation_method
          };
          
          const updatedProjects = [...projects, newUserProject];
          setProjects(updatedProjects);
          setSelectedProjectId(newProject.id || '');
          console.log('✅ 새 프로젝트 생성 완료');
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
      setProjects(prev => prev.map(project => 
        project.id === selectedProjectId 
          ? { ...project, criteria_count: count }
          : project
      ));
    }
  };

  // 프로젝트의 대안 개수 업데이트
  const handleAlternativesCountUpdate = (count: number) => {
    if (selectedProjectId) {
      setProjects(prev => prev.map(project => 
        project.id === selectedProjectId 
          ? { ...project, alternatives_count: count }
          : project
      ));
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
        evaluator_count: 0,
        completion_rate: 0,
        criteria_count: createdProject.criteria_count || 0,
        alternatives_count: createdProject.alternatives_count || 0,
        evaluation_method: projectForm.evaluation_method || 'pairwise'
      };

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      setSelectedProjectId(newProject.id || '');
      
      console.log('Project created successfully:', newProject);
      setError(null);
      
      // 템플렛에 따라 기본 데이터 설정
      if (projectTemplate !== 'blank') {
        setCurrentStep('criteria');
        handleTabChange('model-builder');
      } else {
        handleTabChange('projects');
      }

      resetProjectForm();
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
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-info-bg), var(--status-info-bg-light))', border: '1px solid var(--status-info-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-info-text)' }}>전체 프로젝트</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-info-text)' }}>
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-success-bg), var(--status-success-bg-light))', border: '1px solid var(--status-success-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-success-text)' }}>진행중</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-success-text)' }}>
              <span className="text-white text-xl">🚀</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--accent-light-2))', border: '1px solid var(--accent-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>완료됨</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'completed').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-warning-bg), var(--status-warning-bg-light))', border: '1px solid var(--status-warning-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-warning-text)' }}>평균 진행률</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion_rate || 0), 0) / projects.length) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 5개 인라인 배치 */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { id: 'creation', label: '새 프로젝트', icon: '🚀', color: 'from-blue-500 to-blue-600' },
          { id: 'projects', label: '내 프로젝트', icon: '📂', color: 'from-green-500 to-green-600' },
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

      {/* 📊 AHP 연구 플랫폼 종합 요금제 소개 */}
      <div 
        className="p-8 rounded-xl border-2 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, var(--bg-elevated), var(--accent-light))',
          borderColor: 'var(--accent-secondary)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div className="text-center mb-8">
          <h2 
            className="text-2xl lg:text-3xl font-bold mb-2 flex items-center justify-center"
            style={{ color: 'var(--accent-secondary)' }}
          >
            <span className="mr-3">📊</span>
            AHP 연구 플랫폼 종합 요금제
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            연구 규모와 목적에 맞는 최적의 플랜을 선택하세요
          </p>
        </div>

        {/* 정기 구독제 섹션 */}
        <div className="mb-10">
          <h3 
            className="text-xl font-bold mb-6 text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            🔄 정기 구독제 (Subscription Plans)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.subscription.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: plan.id === 'pro' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: plan.id === 'pro' ? 'var(--shadow-xl)' : 'var(--shadow-md)'
                }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h4 
                    className="text-xl font-bold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.name}
                  </h4>
                  <p 
                    className="text-sm mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    {typeof plan.monthly === 'number' ? (
                      <>
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          ${plan.monthly} <span className="text-sm font-normal">/월</span>
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          연간: ${plan.yearly} (2개월 할인)
                        </div>
                      </>
                    ) : (
                      <div 
                        className="text-xl font-bold"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {plan.monthly}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div 
                    className="flex justify-between text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>프로젝트 수:</span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {plan.projects}개
                    </span>
                  </div>
                  <div 
                    className="flex justify-between text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>평가자 인원:</span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {plan.evaluators}명
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h5 
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    포함 기능:
                  </h5>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li 
                        key={index}
                        className="text-xs flex items-start"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span className="mr-2 text-green-500">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleTabChange('payment')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    plan.id === 'pro' ? 'text-white' : ''
                  }`}
                  style={{
                    backgroundColor: plan.id === 'pro' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: plan.id === 'pro' ? 'white' : 'var(--text-primary)',
                    borderColor: plan.id === 'pro' ? 'var(--accent-primary)' : 'var(--border-light)'
                  }}
                  onMouseEnter={(e) => {
                    if (plan.id !== 'pro') {
                      e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.id !== 'pro') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                >
                  {plan.id === 'pro' ? '🌟 추천 플랜' : '플랜 선택'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 단회차 요금제 섹션 */}
        <div className="mb-8">
          <h3 
            className="text-xl font-bold mb-6 text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            💰 단회차 요금제 (One-Time Plans)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.oneTime.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h4 
                    className="text-lg font-bold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.name}
                  </h4>
                  <p 
                    className="text-sm mb-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {plan.description}
                  </p>
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    ${plan.price}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    사용 기간: {plan.duration}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div 
                    className="flex justify-between text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>프로젝트 수:</span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {plan.projects}개
                    </span>
                  </div>
                  <div 
                    className="flex justify-between text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>평가자 인원:</span>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {plan.evaluators}명
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 
                    className="text-sm font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    대상:
                  </h5>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {plan.target}
                  </p>
                </div>

                <button
                  onClick={() => handleTabChange('payment')}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-light)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  플랜 구매
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 옵션 */}
        <div className="text-center">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            🔧 추가 옵션 (Add-ons)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: '추가 평가자', price: '$20 (50명 단위)' },
              { label: '추가 프로젝트', price: '$30 (1개) / $120 (5개)' },
              { label: '데이터 보관 연장', price: '$50/년 (최대 5년)' },
              { label: '커스텀 보고서', price: '$100/회' }
            ].map((addon, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  color: 'var(--text-secondary)'
                }}
              >
                <div 
                  className="font-medium mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {addon.label}
                </div>
                <div className="text-xs">{addon.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 시작 및 빠른 접근 통합 - 하단에 크게 배치 */}
      <div 
        className="p-8 rounded-xl border-2 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light), var(--bg-elevated))',
          borderColor: 'var(--accent-primary)',
          boxShadow: 'var(--shadow-xl)'
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
                <span className="text-white text-xl">{item.icon}</span>
              </div>
              <span 
                className="text-sm font-medium text-center leading-tight"
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'projects':
        return (
          <Card title="프로젝트 설정">
            <div className="space-y-4">
              <p>프로젝트 기본 정보를 설정하는 단계입니다.</p>
              <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('criteria')}>
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
              <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('projects')}>
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
              <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('criteria')}>
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
              <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('alternatives')}>
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
              setProjects(prev => prev.map(p => 
                p.id === selectedProjectId ? { ...p, status: 'active' as const } : p
              ));
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
        'settings': 'personal-settings',
        'demographic-survey': 'demographic-survey'
      };
      const mappedTab = tabMap[tab] || 'personal-service';
      externalOnTabChange(mappedTab);
    } else {
      setActiveMenu(tab as any);
    }
  };

  const handleProjectSelect = (project: UserProject) => {
    setActiveProject(project.id || null);
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
                <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => handleTabChange('creation')}>
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
    const filteredProjects = projects.filter(project => {
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
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-info-bg), var(--status-info-bg-light))', border: '1px solid var(--status-info-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-info-text)' }}>전체 프로젝트</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-info-text)' }}>
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-success-bg), var(--status-success-bg-light))', border: '1px solid var(--status-success-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-success-text)' }}>진행중</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-success-text)' }}>
              <span className="text-white text-xl">🚀</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--accent-light-2))', border: '1px solid var(--accent-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>완료됨</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'completed').length}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, var(--status-warning-bg), var(--status-warning-bg-light))', border: '1px solid var(--status-warning-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--status-warning-text)' }}>평균 진행률</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.completion_rate || 0), 0) / projects.length) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-text)' }}>
              <span className="text-white text-xl">📈</span>
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

            <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setIsProjectFormOpen(true)}>
              ➕ 새 프로젝트
            </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      {projects.length === 0 ? (
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                          onClick={() => handleEditProject(project)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="편집"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProjectId(project.id || '');
                            handleTabChange('model-builder');
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="모델 구성"
                        >
                          🏗️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProjectId(project.id || '');
                            handleTabChange('analysis');
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="결과 분석"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id || '')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
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
                            onClick={() => handleEditProject(project)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="편집"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectId(project.id || '');
                              handleTabChange('model-builder');
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="모델 구성"
                          >
                            🏗️
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProjectId(project.id || '');
                              handleTabChange('analysis');
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="결과 분석"
                          >
                            📊
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id || '')}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
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

      <Card title="프로젝트 상세 정보">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900 mb-1">기본 정보</h4>
              <p className="text-xs text-gray-600">프로젝트명, 설명, 목적</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">목표 설정</h4>
              <p className="text-xs text-gray-600">의사결정 목표 및 범위</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-medium text-gray-900 mb-1">평가 방법</h4>
              <p className="text-xs text-gray-600">AHP 평가 방식 선택</p>
            </div>
          </div>

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
                {loading ? '생성 중...' : '프로젝트 생성'}
              </Button>
            </div>
          </form>
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

  const renderProgressMonitoring = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">진행률 모니터링</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="전체 진행률">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-gray-500 mt-1">26명 중 22명 완료</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </Card>

        <Card title="평균 소요 시간">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">12분</div>
            <div className="text-sm text-gray-500 mt-1">평가 완료까지</div>
            <div className="text-xs text-green-600 mt-2">🟢 목표 시간 내</div>
          </div>
        </Card>

        <Card title="일관성 품질">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">0.08</div>
            <div className="text-sm text-gray-500 mt-1">평균 CR 값</div>
            <div className="text-xs text-green-600 mt-2">🟢 우수</div>
          </div>
        </Card>
      </div>

      <Card title="평가자별 진행 현황">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {Array.from({ length: 26 }, (_, i) => {
            const progress = Math.floor(Math.random() * 101);
            const status = progress === 100 ? 'completed' : progress > 50 ? 'in_progress' : 'not_started';
            
            return (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                    P{String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="font-medium">평가자{i + 1}@company.com</div>
                    <div className="text-xs text-gray-500">
                      {status === 'completed' ? '평가 완료' :
                       status === 'in_progress' ? '평가 진행중' : '시작 전'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{progress}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status === 'completed' ? '완료' :
                     status === 'in_progress' ? '진행중' : '대기'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {projects.filter(p => p.status === 'active' || p.status === 'completed').map(project => (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    개인 설정
                  </h1>
                  <p className="text-gray-600 mt-2">계정 정보, 보안 설정, 개인 환경설정을 관리합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 개인 설정 */}
          {renderPersonalSettings()}
        </div>
      </div>
    </div>
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">개인 설정</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="계정 정보">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input type="text" defaultValue={`${user.first_name} ${user.last_name}`} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input type="email" defaultValue={user.email} className="w-full border border-gray-300 rounded px-3 py-2" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">조직/부서</label>
              <input type="text" placeholder="예: 개발팀" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl">
              정보 업데이트
            </Button>
          </div>
        </Card>

        <Card title="비밀번호 변경">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <input type="password" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl">
              비밀번호 변경
            </Button>
          </div>
        </Card>
      </div>

      <Card title="워크플로우 설정">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">기본 설정</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">자동 저장 간격</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>30초</option>
                <option selected>1분</option>
                <option>5분</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">기본 템플릿</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>기본</option>
                <option>간단</option>
                <option>상세</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">화면 레이아웃</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>컴팩트</option>
                <option selected>표준</option>
                <option>와이드</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">알림 설정</h4>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">평가 완료 알림</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span className="ml-2 text-sm">프로젝트 상태 변경</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">주간 진행률 리포트</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2 text-sm">시스템 업데이트</span>
            </label>
          </div>
        </div>
      </Card>
    </div>
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
                    <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => setCurrentStep('criteria')}>
                      🎯 기준 설정 시작
                    </Button>
                    <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('alternatives')}>
                      📋 대안 관리
                    </Button>
                    <Button variant="secondary" className="p-3 lg:p-4 text-base lg:text-lg" onClick={() => setCurrentStep('evaluators')}>
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
                <Button variant="primary" className="p-4 lg:p-5 text-lg lg:text-xl" onClick={() => handleTabChange('projects')}>
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
          <div className="space-y-3">
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
                  borderColor: 'var(--accent-light)',
                  backgroundColor: 'var(--accent-light)'
                }}
              >
                Pro Plan 🔵
              </span>
              <span 
                className="text-lg font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                $99/월
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 프로젝트 개수 박스 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">📋</span>
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  프로젝트 개수
                </h3>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-800 dark:text-blue-200">
                  {usedProjects}/{planLimits.projects}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  사용 중인 프로젝트
                </div>
                <div className="w-full max-w-40 mx-auto">
                  <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-3">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((usedProjects / planLimits.projects) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {planLimits.projects - usedProjects}개 남음
                </div>
              </div>
            </div>
          </div>

          {/* 평가자 인원수 박스 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">👥</span>
                <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
                  평가자 인원수
                </h3>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-800 dark:text-green-200">
                  {usedEvaluators}/{planLimits.evaluators}명
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  사용 중인 평가자
                </div>
                <div className="w-full max-w-40 mx-auto">
                  <div className="w-full bg-green-100 dark:bg-green-800 rounded-full h-3">
                    <div 
                      className="bg-green-600 dark:bg-green-400 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((usedEvaluators / planLimits.evaluators) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {planLimits.evaluators - usedEvaluators}명 남음
                </div>
              </div>
            </div>
          </div>

          {/* 사용 가능 옵션 박스 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span className="text-3xl">⚙️</span>
                  <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    사용 가능 옵션
                  </h3>
                </div>
              </div>
              {/* 체크박스 목록 - 왼쪽 정렬 및 가독성 개선 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
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
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
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
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
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
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
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
          className="p-6 rounded-xl border-2 transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-md)'
          }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                📂 최근 프로젝트
              </h3>
              {projects.length > 0 && (
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
                  모든 프로젝트 보기 ({projects.length}개) →
                </button>
              )}
            </div>
            
            {projects.length === 0 ? (
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
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'white'
                  }}
                >
                  ➕ 새 프로젝트 생성
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
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
          className="p-6 rounded-xl border-2 transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
            <h3 
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              📊 사용량 현황
            </h3>
            
            <div className="space-y-6">
              {/* 1. 프로젝트 관리 계열 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'var(--accent-primary)' }}
                  >
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      프로젝트 관리
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Projects & Elements
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      프로젝트 수
                    </span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {projects.length}/20
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((projects.length / 20) * 100, 100)}%`,
                        backgroundColor: 'var(--accent-primary)'
                      }}
                    ></div>
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    모델 요소: {projects.reduce((sum, p) => sum + p.criteria_count + p.alternatives_count, 0)}개
                  </div>
                </div>
              </div>

              {/* 2. 협업 관리 계열 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'var(--accent-secondary)' }}
                  >
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      협업 관리
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Evaluators & Teams
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      평가자 수
                    </span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--accent-secondary)' }}
                    >
                      12/100
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: '12%',
                        backgroundColor: 'var(--accent-secondary)'
                      }}
                    ></div>
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    활성 평가자: 8명
                  </div>
                </div>
              </div>

              {/* 3. 리소스 사용 계열 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: 'var(--status-success-bg)' }}
                  >
                    <span className="text-lg">💾</span>
                  </div>
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: 'var(--status-success-text)' }}
                    >
                      리소스 사용
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Storage & API
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-2">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      저장용량
                    </span>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--status-success-text)' }}
                    >
                      2.3GB/10GB
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-elevated)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: '23%',
                        backgroundColor: 'var(--status-success-bg)'
                      }}
                    ></div>
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    API 호출: 847/5000회
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
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-elevated))',
          boxShadow: 'var(--shadow-sm)'
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
          {/* First Row - Core Functions (6 items) */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'dashboard', label: '대시보드', icon: '🏠', tooltip: '프로젝트 현황과 통계를 한눈에 확인', priority: 'high' },
              { id: 'projects', label: '내 프로젝트', icon: '📂', tooltip: '생성한 모든 프로젝트 관리 및 편집', priority: 'high' },
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
                    backgroundColor: activeMenu === item.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    borderColor: activeMenu === item.id ? 'var(--accent-primary)' : 'var(--border-light)',
                    color: activeMenu === item.id ? 'var(--accent-secondary)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-light)';
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

          {/* Second Row - Advanced Functions (7 items) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { id: 'analysis', label: '결과 분석', icon: '📊', tooltip: 'AHP 분석 결과와 순위 확인' },
              { id: 'demographic-survey', label: '인구통계학적 설문조사', icon: '📋', tooltip: 'Google Forms 스타일 설문 생성 및 관리' },
              { id: 'export', label: '보고서', icon: '📤', tooltip: 'Excel, PDF, PPT 형식으로 내보내기' },
              { id: 'survey-links', label: '설문 링크', icon: '🔗', tooltip: '평가자별 설문 링크 생성 및 관리' },
              { id: 'workshop', label: '워크숍', icon: '🎯', tooltip: '협업 의사결정 워크숍 관리' },
              { id: 'decision-support', label: '의사결정 지원', icon: '🧠', tooltip: '과학적 의사결정 지원 도구' },
              { id: 'settings', label: '설정', icon: '⚙️', tooltip: '개인 계정 및 환경 설정' }
            ].map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  aria-label={item.label}
                  className="w-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-300 text-center hover:scale-[1.02] hover:shadow-xl transform"
                  style={{
                    backgroundColor: activeMenu === item.id ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    borderColor: activeMenu === item.id ? 'var(--accent-primary)' : 'var(--border-light)',
                    color: activeMenu === item.id ? 'var(--accent-secondary)' : 'var(--text-primary)',
                    transform: activeMenu === item.id ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activeMenu === item.id ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMenu !== item.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-light)';
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