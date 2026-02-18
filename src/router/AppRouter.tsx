import React from 'react';
import type { User, UserRole } from '../types';

// ─── Eager imports (항상 필요한 핵심 컴포넌트) ───────────────────────────────
import Card from '../components/common/Card';
import UIIcon from '../components/common/UIIcon';

// ─── Lazy imports (Code Splitting) ───────────────────────────────────────────
// Auth
const UnifiedAuthPage = React.lazy(() => import('../components/auth/UnifiedAuthPage'));
const RegisterForm = React.lazy(() => import('../components/auth/RegisterForm'));

// Home / Landing
const HomePage = React.lazy(() => import('../components/home/HomePage'));
const LandingPage = React.lazy(() => import('../components/admin/LandingPage'));

// Admin dashboards
const PersonalServiceDashboard = React.lazy(() => import('../components/admin/PersonalServiceDashboard'));
const EnhancedSuperAdminDashboard = React.lazy(() => import('../components/admin/EnhancedSuperAdminDashboard'));
const ModelBuilding = React.lazy(() => import('../components/admin/ModelBuilding'));
const EvaluationResults = React.lazy(() => import('../components/admin/EvaluationResults'));
const ProjectCompletion = React.lazy(() => import('../components/admin/ProjectCompletion'));
const ProjectWorkflow = React.lazy(() => import('../components/admin/ProjectWorkflow'));
const UserManagement = React.lazy(() => import('../components/admin/UserManagement'));
const RealUserManagement = React.lazy(() => import('../components/admin/RealUserManagement'));
const DatabaseManager = React.lazy(() => import('../components/admin/DatabaseManager'));
const DjangoAdminIntegration = React.lazy(() => import('../components/admin/DjangoAdminIntegration'));

// Super admin
const SuperAdminDashboard = React.lazy(() => import('../components/superadmin/SuperAdminDashboard'));
const RoleSwitcher = React.lazy(() => import('../components/superadmin/RoleSwitcher'));
const SystemReset = React.lazy(() => import('../components/superadmin/SystemReset'));
const AllProjectsManagement = React.lazy(() => import('../components/superadmin/AllProjectsManagement'));
const SystemInfo = React.lazy(() => import('../components/superadmin/SystemInfo'));
const SystemMonitoring = React.lazy(() => import('../components/superadmin/SystemMonitoring'));
const SystemSettings = React.lazy(() => import('../components/superadmin/SystemSettings'));
const PaymentOptionsPage = React.lazy(() => import('../components/superadmin/PaymentOptionsPage'));

// Evaluator
const ProjectSelection = React.lazy(() => import('../components/evaluator/ProjectSelection'));
const PairwiseEvaluation = React.lazy(() => import('../components/evaluator/PairwiseEvaluation'));
const DirectInputEvaluation = React.lazy(() => import('../components/evaluator/DirectInputEvaluation'));
const EvaluatorWorkflow = React.lazy(() => import('../components/evaluator/EvaluatorWorkflow'));

// Evaluation
const AnonymousEvaluator = React.lazy(() => import('../components/evaluation/AnonymousEvaluator'));
const HierarchicalEvaluationOrchestrator = React.lazy(() => import('../components/evaluation/HierarchicalEvaluationOrchestrator'));
const EvaluatorInvitationHandler = React.lazy(() => import('../components/evaluation/EvaluatorInvitationHandler'));
const EvaluationTest = React.lazy(() => import('../components/evaluation/EvaluationTest'));

// Guides
const ComprehensiveUserGuide = React.lazy(() => import('../components/guide/ComprehensiveUserGuide'));
const ResearcherGuidePage = React.lazy(() => import('../components/guide/ResearcherGuidePage'));
const EvaluatorGuidePage = React.lazy(() => import('../components/guide/EvaluatorGuidePage'));
const AIResearchGuidePage = React.lazy(() => import('../components/guide/AIResearchGuidePage'));

// Survey
const DemographicDashboard = React.lazy(() => import('../components/survey/DemographicDashboard'));

// AHP core
const PairwiseComparison = React.lazy(() => import('../components/comparison/PairwiseComparison'));
const ResultsDashboard = React.lazy(() => import('../components/results/ResultsDashboard'));
const AHPProjectManager = React.lazy(() => import('../components/ahp/AHPProjectManager'));

// Common (non-critical)
const RoleBasedDashboard = React.lazy(() => import('../components/common/RoleBasedDashboard'));

// Methodology
const AHPMethodologyPage = React.lazy(() => import('../components/methodology/AHPMethodologyPage'));
const FuzzyAHPMethodologyPage = React.lazy(() => import('../components/methodology/FuzzyAHPMethodologyPage'));

// AI features
const AIPaperGenerationPage = React.lazy(() => import('../components/ai-paper/AIPaperGenerationPage'));
const AIResultsInterpretationPage = React.lazy(() => import('../components/ai-interpretation/AIResultsInterpretationPage'));
const AIQualityValidationPage = React.lazy(() => import('../components/ai-quality/AIQualityValidationPage'));
const AIMaterialsGenerationPage = React.lazy(() => import('../components/ai-materials/AIMaterialsGenerationPage'));
const AIChatbotAssistantPage = React.lazy(() => import('../components/ai-chatbot/AIChatbotAssistantPage'));

// Pages
const TestPage = React.lazy(() => import('../pages/TestPage'));
const SubscriptionPage = React.lazy(() => import('../pages/SubscriptionPage'));

// Demo
const ConnectionTestPage = React.lazy(() => import('../components/demo/ConnectionTestPage'));

// ─── Props Interface ──────────────────────────────────────────────────────────
export interface AppRouterProps {
  // State
  user: User | null;
  activeTab: string;
  viewMode: 'service' | 'evaluator';
  loginLoading: boolean;
  loginError: string;
  registerMode: 'service' | 'admin' | null;
  projects: any[];
  users: any[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  protectedTabs: string[];

  // Setters
  setUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedProjectTitle: (title: string) => void;

  // Auth handlers
  handleLogin: (username: string, password: string, role?: string) => Promise<void>;
  handleRegister: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone?: string;
    organization?: string;
    role?: string;
  }) => Promise<void>;
  handleGoogleAuth: () => Promise<void>;
  handleKakaoAuth: () => Promise<void>;
  handleNaverAuth: () => Promise<void>;
  handleLoginClick: () => void;
  handleBackToLogin: () => void;

  // Navigation handlers
  changeTab: (newTab: string, projectId?: string, projectTitle?: string) => void;
  handleGetStarted: () => void;
  handleModelFinalized: () => void;
  handleAdminEvaluationComplete: () => void;
  handleProjectStatusChange: (status: 'terminated' | 'completed') => void;
  handleProjectSelect: (projectId: string, projectTitle: string) => void;
  handleEvaluatorProjectSelect: (projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => void;
  handleEvaluatorEvaluationComplete: () => void;

  // Data functions
  createProject: (projectData: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
  restoreProject: (projectId: string) => Promise<any>;
  fetchTrashedProjects: () => Promise<any[]>;
  fetchProjects: () => Promise<void>;
  createCriteria: (projectId: string, criteriaData: any) => Promise<any>;
  createAlternative: (projectId: string, alternativeData: any) => Promise<any>;
  saveEvaluation: (projectId: string, evaluationData: any) => Promise<any>;
  fetchCriteria: (projectId: string) => Promise<any[]>;
  fetchAlternatives: (projectId: string) => Promise<any[]>;
  createUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  createSampleProject: () => Promise<void>;
  permanentDeleteProject: (projectId: string) => Promise<any>;
}

// ─── AppRouter Component ──────────────────────────────────────────────────────
const AppRouter: React.FC<AppRouterProps> = ({
  user,
  activeTab,
  viewMode,
  loginLoading,
  loginError,
  registerMode,
  projects,
  users,
  loading,
  selectedProjectId,
  selectedProjectTitle,
  protectedTabs,
  setUser,
  setActiveTab,
  setSelectedProjectId,
  setSelectedProjectTitle,
  handleLogin,
  handleRegister,
  handleGoogleAuth,
  handleKakaoAuth,
  handleNaverAuth,
  handleLoginClick,
  handleBackToLogin,
  changeTab,
  handleGetStarted,
  handleModelFinalized,
  handleAdminEvaluationComplete,
  handleProjectStatusChange,
  handleProjectSelect,
  handleEvaluatorProjectSelect,
  handleEvaluatorEvaluationComplete,
  createProject,
  deleteProject,
  restoreProject,
  fetchTrashedProjects,
  fetchProjects,
  createCriteria,
  createAlternative,
  saveEvaluation,
  fetchCriteria,
  fetchAlternatives,
  createUser,
  updateUser,
  deleteUser,
  fetchUsers,
  createSampleProject,
  permanentDeleteProject,
}) => {

  // 공통 로그인 폼 (UnifiedAuthPage)
  const renderAuthPage = () => (
    <UnifiedAuthPage
      onLogin={handleLogin}
      onRegister={async (email: string, password: string, role?: string) => {
        await handleRegister({
          username: email,
          email: email,
          password: password,
          password2: password,
          first_name: '',
          last_name: '',
          role: role || 'user',
        });
      }}
      onGoogleAuth={handleGoogleAuth}
      onKakaoAuth={handleKakaoAuth}
      onNaverAuth={handleNaverAuth}
      loading={loginLoading}
      error={loginError}
    />
  );

  // ─── 비로그인 상태 라우팅 ──────────────────────────────────────────────────
  if (!user) {
    switch (activeTab) {
      case 'home':
        return <HomePage onLoginClick={handleLoginClick} />;

      case 'login':
        return renderAuthPage();

      case 'register': {
        if (!registerMode) return null;
        return (
          <RegisterForm
            onRegister={handleRegister}
            onBackToLogin={handleBackToLogin}
            loading={loginLoading}
            error={loginError}
            mode={registerMode}
          />
        );
      }

      case 'evaluator-workflow': {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('eval') || urlParams.get('project');
        const evaluatorToken = urlParams.get('token') || urlParams.get('key');

        if (projectId) {
          return (
            <EvaluatorWorkflow
              projectId={projectId}
              evaluatorToken={evaluatorToken || undefined}
            />
          );
        }
        return <HomePage onLoginClick={handleLoginClick} />;
      }

      case 'anonymous-evaluation':
      case 'qr-evaluation': {
        const qrUrlParams = new URLSearchParams(window.location.search);
        const qrProjectId = qrUrlParams.get('p');
        const sessionId = qrUrlParams.get('s');

        if (qrProjectId && sessionId) {
          return <AnonymousEvaluator />;
        }
        return <HomePage onLoginClick={handleLoginClick} />;
      }

      default:
        if (protectedTabs.includes(activeTab)) {
          return renderAuthPage();
        }
        return <HomePage onLoginClick={handleLoginClick} />;
    }
  }

  // ─── 로그인 상태 라우팅 ────────────────────────────────────────────────────
  switch (activeTab) {
    case 'home':
    case 'register':
    case 'welcome': {
      const redirectTab = user.role === 'evaluator' ? 'evaluator-dashboard' : 'personal-service';
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tab', redirectTab);
      window.history.replaceState(null, '', newUrl.toString());
      setActiveTab(redirectTab);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">대시보드로 이동 중...</p>
          </div>
        </div>
      );
    }

    case 'personal-service':
    case 'admin-dashboard':
    case 'user-home': {
      const storedUserStr = localStorage.getItem('ahp_user');
      const isSuperMode = localStorage.getItem('ahp_super_mode') === 'true';
      let isAdminEmail = false;

      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          isAdminEmail = storedUser.email === 'admin@ahp.com';
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }

      if ((user?.role === 'super_admin' || isAdminEmail) && isSuperMode) {
        return (
          <SuperAdminDashboard
            user={user}
            onTabChange={setActiveTab}
          />
        );
      }

      return (
        <PersonalServiceDashboard
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUserUpdate={setUser}
          projects={projects}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onFetchCriteria={fetchCriteria}
          onCreateCriteria={createCriteria}
          onFetchAlternatives={fetchAlternatives}
          onCreateAlternative={createAlternative}
          onSaveEvaluation={saveEvaluation}
          onFetchTrashedProjects={fetchTrashedProjects}
          onRestoreProject={restoreProject}
          onPermanentDeleteProject={permanentDeleteProject}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      );
    }

    case 'super-admin':
    case 'super-admin-dashboard':
      return (
        <SuperAdminDashboard
          user={user}
          onTabChange={setActiveTab}
        />
      );

    case 'role-switch-admin':
      return (
        <RoleSwitcher
          currentUser={user}
          targetRole="service_admin"
          onRoleSwitch={(role: UserRole) => {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem('ahp_temp_role', role);
            setActiveTab('personal-service');
          }}
          onBack={() => setActiveTab('super-admin-dashboard')}
        />
      );

    case 'role-switch-user':
      return (
        <RoleSwitcher
          currentUser={user}
          targetRole="service_user"
          onRoleSwitch={(role: UserRole) => {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem('ahp_temp_role', role);
            setActiveTab('personal-service');
          }}
          onBack={() => setActiveTab('super-admin-dashboard')}
        />
      );

    case 'role-switch-evaluator':
      return (
        <RoleSwitcher
          currentUser={user}
          targetRole="evaluator"
          onRoleSwitch={(role: UserRole) => {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem('ahp_temp_role', role);
            setActiveTab('evaluator-mode');
          }}
          onBack={() => setActiveTab('super-admin-dashboard')}
        />
      );

    case 'system-reset':
      return (
        <SystemReset
          onBack={() => setActiveTab('super-admin-dashboard')}
          onReset={(options: any) => {
            console.log('시스템 초기화 완료:', options);
            setActiveTab('super-admin-dashboard');
          }}
        />
      );

    case 'dashboard':
      return (
        <RoleBasedDashboard
          user={user}
          onTabChange={setActiveTab}
          viewMode={viewMode}
        />
      );

    case 'users':
      return <RealUserManagement />;

    case 'all-projects':
      return <AllProjectsManagement />;

    case 'system-info':
      return <SystemInfo />;

    case 'system-monitoring':
      return <SystemMonitoring />;

    case 'system-settings':
      return <SystemSettings />;

    case 'payment-options':
      return (
        <PaymentOptionsPage
          user={user!}
          onTabChange={setActiveTab}
        />
      );

    case 'subscription':
      return <SubscriptionPage />;

    case 'database':
      return <DatabaseManager />;

    case 'projects':
    case 'monitoring':
    case 'audit':
    case 'settings':
    case 'backup':
    case 'system':
      return (
        <EnhancedSuperAdminDashboard
          user={user as any}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      );

    case 'evaluator-workflow': {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('eval') || urlParams.get('project');
      const evaluatorToken = urlParams.get('token') || urlParams.get('key');

      if (projectId) {
        return (
          <EvaluatorWorkflow
            projectId={projectId}
            evaluatorToken={evaluatorToken || undefined}
          />
        );
      }
      return (
        <Card title="평가자 워크플로우">
          <div className="text-center py-8">
            <p className="text-gray-500">프로젝트 ID가 필요합니다.</p>
          </div>
        </Card>
      );
    }

    case 'evaluator-survey': {
      const urlParams = new URLSearchParams(window.location.search);
      const surveyProjectId = urlParams.get('project');
      const surveyToken = urlParams.get('token');

      if (surveyProjectId) {
        return (
          <EvaluatorWorkflow
            projectId={surveyProjectId}
            evaluatorToken={surveyToken || undefined}
          />
        );
      }
      return null;
    }

    case 'user-guide':
      return <ComprehensiveUserGuide />;

    case 'researcher-guide':
      return <ResearcherGuidePage />;

    case 'evaluator-guide':
      return <EvaluatorGuidePage />;

    case 'ai-research-guide':
      return <AIResearchGuidePage />;

    case 'evaluation-test':
      return <EvaluationTest />;

    case 'hierarchical-evaluation':
      if (!selectedProjectId) {
        return (
          <Card title="계층적 평가">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <HierarchicalEvaluationOrchestrator
          projectId={selectedProjectId}
          evaluatorId={String(user?.id || '')}
          onComplete={() => changeTab('results-analysis')}
        />
      );

    case 'invitation-handler':
      return (
        <EvaluatorInvitationHandler
          onEvaluationStart={(_projectId, _evaluatorId) => changeTab('evaluator-workflow')}
        />
      );

    case 'connection-test':
      return <ConnectionTestPage />;

    case 'integration-test':
      return <TestPage />;

    case 'ai-ahp-methodology':
      return <AHPMethodologyPage />;

    case 'ai-fuzzy-methodology':
      return <FuzzyAHPMethodologyPage />;

    case 'ai-paper-generation':
      if (!selectedProjectId) {
        return (
          <Card title="AI 논문 생성">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <AIPaperGenerationPage
          user={user ?? undefined}
        />
      );

    case 'ai-results-interpretation':
      if (!selectedProjectId) {
        return (
          <Card title="AI 결과 해석">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <AIResultsInterpretationPage user={user ?? undefined} />
      );

    case 'ai-quality-validation':
      if (!selectedProjectId) {
        return (
          <Card title="AI 품질 검증">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <AIQualityValidationPage user={user ?? undefined} />
      );

    case 'ai-materials-generation':
      if (!selectedProjectId) {
        return (
          <Card title="AI 자료 생성">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <AIMaterialsGenerationPage user={user ?? undefined} />
      );

    case 'ai-chatbot-assistant':
      return (
        <AIChatbotAssistantPage user={user ?? undefined} />
      );

    case 'django-admin-integration':
      return <DjangoAdminIntegration user={user as any} />;

    case 'evaluator-mode':
      return (
        <Card title="평가자 모드">
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h5 className="font-medium text-purple-800 flex items-center">
                <UIIcon emoji="👤" size="lg" color="#7C3AED" className="mr-2" />
                평가자 모드
              </h5>
              <p className="text-purple-700 text-sm mt-1">
                평가자로서 할당된 프로젝트를 평가할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('evaluator-dashboard')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              평가 시작하기
            </button>
          </div>
        </Card>
      );

    case 'demographic-survey':
      return (
        <Card title="인구통계 설문">
          <div className="text-center py-8">
            <p className="text-gray-500">설문 기능 준비 중입니다.</p>
          </div>
        </Card>
      );

    case 'demographic-dashboard':
      return <DemographicDashboard projectId={selectedProjectId || ''} />;

    case 'my-projects':
    case 'project-creation':
    case 'project-wizard':
    case 'demographic-setup':
    case 'evaluator-invitation':
      return (
        <PersonalServiceDashboard
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUserUpdate={setUser}
          projects={projects}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onFetchCriteria={fetchCriteria}
          onCreateCriteria={createCriteria}
          onFetchAlternatives={fetchAlternatives}
          onCreateAlternative={createAlternative}
          onSaveEvaluation={saveEvaluation}
          onFetchTrashedProjects={fetchTrashedProjects}
          onRestoreProject={restoreProject}
          onPermanentDeleteProject={permanentDeleteProject}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      );

    case 'project-workflow':
      if (!selectedProjectId) {
        return (
          <Card title="프로젝트 워크플로우">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('my-projects')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 목록으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <ProjectWorkflow
          onComplete={handleModelFinalized}
          onCancel={() => changeTab('personal-projects')}
        />
      );

    case 'model-builder':
    case 'evaluator-management':
    case 'trash':
    case 'progress-monitoring':
    case 'results-analysis':
    case 'ai-paper-assistant':
    case 'export-reports':
    case 'workshop-management':
    case 'decision-support-system':
    case 'personal-settings':
      return (
        <PersonalServiceDashboard
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUserUpdate={setUser}
          projects={projects}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onFetchCriteria={fetchCriteria}
          onCreateCriteria={createCriteria}
          onFetchAlternatives={fetchAlternatives}
          onCreateAlternative={createAlternative}
          onSaveEvaluation={saveEvaluation}
          onFetchTrashedProjects={fetchTrashedProjects}
          onRestoreProject={restoreProject}
          onPermanentDeleteProject={permanentDeleteProject}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      );

    case 'ahp-analysis':
      if (!selectedProjectId) {
        return (
          <Card title="AHP 분석">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return <AHPProjectManager projectId={selectedProjectId} />;

    case 'landing':
      return (
        <LandingPage
          user={user as any}
          onGetStarted={handleGetStarted}
        />
      );

    case 'model-building':
      if (!selectedProjectId) {
        return (
          <Card title="모델 구축">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('personal-projects')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 목록으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <ModelBuilding
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          onModelFinalized={handleModelFinalized}
          onBack={() => setActiveTab('personal-projects')}
        />
      );

    case 'evaluation-results':
      if (!selectedProjectId) {
        return (
          <Card title="평가 결과">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('personal-projects')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 목록으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <EvaluationResults
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          onComplete={handleAdminEvaluationComplete}
          onBack={() => setActiveTab('model-building')}
        />
      );

    case 'project-completion':
      if (!selectedProjectId) {
        return (
          <Card title="프로젝트 완료">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
            </div>
          </Card>
        );
      }
      return (
        <ProjectCompletion
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          onProjectStatusChange={handleProjectStatusChange}
          onBack={() => setActiveTab('evaluation-results')}
        />
      );

    case 'personal-projects':
      return (
        <PersonalServiceDashboard
          user={user}
          activeTab="my-projects"
          onTabChange={setActiveTab}
          onUserUpdate={setUser}
          projects={projects}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onFetchCriteria={fetchCriteria}
          onCreateCriteria={createCriteria}
          onFetchAlternatives={fetchAlternatives}
          onCreateAlternative={createAlternative}
          onSaveEvaluation={saveEvaluation}
          onFetchTrashedProjects={fetchTrashedProjects}
          onRestoreProject={restoreProject}
          onPermanentDeleteProject={permanentDeleteProject}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      );

    case 'personal-users':
      if (user.role !== 'service_admin' && user.role !== 'super_admin') {
        return (
          <Card title="접근 권한 없음">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <div className="text-red-600 font-medium">관리자만 접근 가능합니다.</div>
            </div>
          </Card>
        );
      }
      return (
        <UserManagement
          users={users}
          loading={loading}
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onRefresh={fetchUsers}
        />
      );

    case 'results':
      if (!selectedProjectId) {
        return (
          <Card title="결과 대시보드">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('personal-projects')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 목록으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <ResultsDashboard
          projectId={selectedProjectId}
          projectTitle={'AHP 프로젝트'}
          demoMode={false}
        />
      );

    case 'evaluator-dashboard':
      return (
        <ProjectSelection
          evaluatorId={user.first_name + user.last_name}
          onProjectSelect={handleEvaluatorProjectSelect}
        />
      );

    case 'pairwise-evaluation':
      if (!selectedProjectId) {
        return (
          <Card title="쌍대비교 평가">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('evaluator-dashboard')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 선택으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <PairwiseEvaluation
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          onComplete={handleEvaluatorEvaluationComplete}
          onBack={() => setActiveTab('evaluator-dashboard')}
        />
      );

    case 'direct-evaluation':
      if (!selectedProjectId) {
        return (
          <Card title="직접입력 평가">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('evaluator-dashboard')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 선택으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <DirectInputEvaluation
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          onComplete={handleEvaluatorEvaluationComplete}
          onBack={() => setActiveTab('evaluator-dashboard')}
        />
      );

    case 'evaluator-status':
      return (
        <Card title="평가자 대시보드">
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded p-4">
              <h5 className="font-medium text-purple-800 flex items-center">
                <UIIcon emoji="👤" size="lg" color="#7C3AED" className="mr-2" />
                내 평가 현황
              </h5>
              <p className="text-purple-700 text-sm mt-1">
                할당된 프로젝트의 평가 진행 상황을 확인합니다.
              </p>
            </div>
            <div className="text-gray-600">
              <p>평가자 기능:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>할당된 프로젝트 목록</li>
                <li>평가 완료율 확인</li>
                <li>미완료 쌍대비교 알림</li>
                <li>개인 평가 결과 미리보기</li>
              </ul>
            </div>
          </div>
        </Card>
      );

    case 'evaluations':
      if (!selectedProjectId) {
        return (
          <Card title="쌍대비교 평가">
            <div className="text-center py-8">
              <p className="text-gray-500">프로젝트를 선택해주세요.</p>
              <button
                onClick={() => setActiveTab('personal-projects')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                프로젝트 목록으로 이동
              </button>
            </div>
          </Card>
        );
      }
      return (
        <PairwiseComparison
          projectId={selectedProjectId}
          criteria={[]}
          alternatives={[]}
          demoMode={false}
        />
      );

    case 'progress':
      return (
        <Card title="진행 상황">
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
              <h5 className="font-medium text-indigo-800 flex items-center">
                <UIIcon emoji="📈" size="lg" color="#4F46E5" className="mr-2" />
                프로젝트 진행률
              </h5>
              <p className="text-indigo-700 text-sm mt-1">
                각 단계별 완료 상황을 추적합니다.
              </p>
            </div>
            <div className="text-gray-600">
              <p>추적 항목:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>모델 구축 완료율</li>
                <li>평가자별 응답률</li>
                <li>쌍대비교 완료 현황</li>
                <li>일관성 검증 상태</li>
                <li>최종 결과 생성 여부</li>
              </ul>
            </div>
          </div>
        </Card>
      );

    default:
      console.warn('⚠️ 처리되지 않은 activeTab:', activeTab);
      setActiveTab('personal-service');
      return null;
  }
};

export default AppRouter;
