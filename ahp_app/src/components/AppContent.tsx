import React, { useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { useUIContext } from '../contexts/UIContext';
import { useUsers } from '../hooks/useUsers';
import { getCachedEvaluatorToken, getCachedEvaluatorProjectId } from '../hooks/useNavigation';
// authService와 sessionService는 프론트엔드 전용 모드에서 최소화됨

import Layout from './layout/Layout';
import ErrorBoundary from './common/ErrorBoundary';
import UnifiedAuthPage from './auth/UnifiedAuthPage';
import RegisterForm from './auth/RegisterForm';
import HomePage from './home/HomePage';
import Card from './common/Card';
import Modal from './common/Modal';
import UIIcon, { EditIcon, DeleteIcon } from './common/UIIcon';
import ApiErrorModal from './common/ApiErrorModal';
import TrashOverflowModal from './common/TrashOverflowModal';
import LandingPage from './admin/LandingPage';
import EvaluatorWorkflow from './evaluator/EvaluatorWorkflow';
import AnonymousEvaluator from './evaluation/AnonymousEvaluator';
import ProjectGuard from './guards/ProjectGuard';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────
const PairwiseComparison        = lazy(() => import('./comparison/PairwiseComparison'));
const ResultsDashboard          = lazy(() => import('./results/ResultsDashboard'));
const AHPProjectManager         = lazy(() => import('./ahp/AHPProjectManager'));
const EnhancedSuperAdminDashboard = lazy(() => import('./admin/EnhancedSuperAdminDashboard'));
const PersonalServiceDashboard  = lazy(() => import('./admin/PersonalServiceDashboard'));
const ModelBuilding             = lazy(() => import('./admin/ModelBuilding'));
const EvaluationResults         = lazy(() => import('./admin/EvaluationResults'));
const ProjectCompletion         = lazy(() => import('./admin/ProjectCompletion'));
const ProjectWorkflow           = lazy(() => import('./admin/ProjectWorkflow'));
const UserManagement            = lazy(() => import('./admin/UserManagement'));
const RealUserManagement        = lazy(() => import('./admin/RealUserManagement'));
const DjangoAdminIntegration    = lazy(() => import('./admin/DjangoAdminIntegration'));
const ProjectSelection          = lazy(() => import('./evaluator/ProjectSelection'));
const PairwiseEvaluation        = lazy(() => import('./evaluator/PairwiseEvaluation'));
const DirectInputEvaluation     = lazy(() => import('./evaluator/DirectInputEvaluation'));
const EvaluatorDashboard        = lazy(() => import('./evaluator/EvaluatorDashboard'));
const ComprehensiveUserGuide    = lazy(() => import('./guide/ComprehensiveUserGuide'));
const ResearcherGuidePage       = lazy(() => import('./guide/ResearcherGuidePage'));
const EvaluatorGuidePage        = lazy(() => import('./guide/EvaluatorGuidePage'));
const AIResearchGuidePage       = lazy(() => import('./guide/AIResearchGuidePage'));
const EvaluationTest            = lazy(() => import('./evaluation/EvaluationTest'));
const ConnectionTestPage        = lazy(() => import('./demo/ConnectionTestPage'));
const RoleBasedDashboard        = lazy(() => import('./common/RoleBasedDashboard'));
const SuperAdminDashboard       = lazy(() => import('./superadmin/SuperAdminDashboard'));
const RoleSwitcher              = lazy(() => import('./superadmin/RoleSwitcher'));
const SystemReset               = lazy(() => import('./superadmin/SystemReset'));
const AllProjectsManagement     = lazy(() => import('./superadmin/AllProjectsManagement'));
const SystemInfo                = lazy(() => import('./superadmin/SystemInfo'));
const SystemMonitoring          = lazy(() => import('./superadmin/SystemMonitoring'));
const SystemSettings            = lazy(() => import('./superadmin/SystemSettings'));
const PaymentOptionsPage        = lazy(() => import('./superadmin/PaymentOptionsPage'));
const AHPMethodologyPage        = lazy(() => import('./methodology/AHPMethodologyPage'));
const FuzzyAHPMethodologyPage   = lazy(() => import('./methodology/FuzzyAHPMethodologyPage'));
const AIPaperGenerationPage     = lazy(() => import('./ai-paper/AIPaperGenerationPage'));
const AIResultsInterpretationPage = lazy(() => import('./ai-interpretation/AIResultsInterpretationPage'));
const AIQualityValidationPage   = lazy(() => import('./ai-quality/AIQualityValidationPage'));
const AIMaterialsGenerationPage = lazy(() => import('./ai-materials/AIMaterialsGenerationPage'));
const AIChatbotAssistantPage    = lazy(() => import('./ai-chatbot/AIChatbotAssistantPage'));
const TestPage                  = lazy(() => import('../pages/TestPage'));
const SystemHealthPage          = lazy(() => import('../pages/SystemHealthPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
           style={{ borderColor: 'var(--accent-primary)' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>페이지 로딩 중...</p>
    </div>
  </div>
);

export default function AppContent() {
  // ── Context consumption ─────────────────────────────────────────────────
  const {
    user, loginLoading, loginError, registerMode,
    setUser, setLoginError, setRegisterMode,
    handleLogin, handleRegister, handleLogout,
    handleGoogleAuth, handleKakaoAuth, handleNaverAuth,
  } = useAuthContext();

  const {
    activeTab, viewMode, protectedTabs, isNavigationReady,
    setActiveTab, changeTab, handleModeSwitch,
  } = useNavigationContext();

  const {
    projects, loading, selectedProjectId, selectedProjectTitle,
    pendingDeleteProjectId, trashOverflowData,
    setSelectedProjectId, setSelectedProjectTitle,
    setPendingDeleteProjectId,
    fetchProjects, deleteProject,
    permanentDeleteProject,
    handleTrashOverflow, handleTrashOverflowCancel,
    createSampleProject, handleProjectSelect,
  } = useProjectContext();

  const {
    actionMessage, showActionMessage,
    showApiErrorModal, handleApiRetry, handleCloseApiError,
  } = useUIContext();

  // Users hook (only used for admin user management)
  const { users, fetchUsers, createUser, updateUser, deleteUser } = useUsers(showActionMessage);

  // ── Auto-login on page load (프론트엔드 전용) ─────────────────────────
  useEffect(() => {
    if (user || !isNavigationReady) return;
    // sessionStorage에 저장된 사용자 정보로 세션 복원
    const storedUser = localStorage.getItem('ahp_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('ahp_user');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigationReady, user]);

  // ── Data fetching on tab change ─────────────────────────────────────────
  useEffect(() => {
    if (user && ['personal-projects', 'personal-service', 'welcome', 'my-projects', 'home'].includes(activeTab)) {
      fetchProjects();
    } else if (user && activeTab === 'personal-users' && (user.role === 'super_admin' || user.role === 'service_admin')) {
      fetchUsers();
    } else if (!user) {
      // Projects cleared by auth logout callback
    }
  }, [user, activeTab, fetchProjects, fetchUsers]);

  // ── Navigation handlers ─────────────────────────────────────────────────
  const handleLoginClick = useCallback(() => {
    changeTab('login');
    setRegisterMode(null);
  }, [changeTab, setRegisterMode]);

  const handleBackToLogin = useCallback(() => {
    changeTab('login');
    setRegisterMode(null);
    setLoginError('');
  }, [changeTab, setRegisterMode, setLoginError]);

  const handleGetStarted = useCallback(() => changeTab('personal-projects'), [changeTab]);
  const handleModelFinalized = useCallback(() => changeTab('evaluation-results'), [changeTab]);
  const handleAdminEvaluationComplete = useCallback(() => changeTab('project-completion'), [changeTab]);

  const handleProjectStatusChange = useCallback(() => {
    changeTab('personal-projects');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  }, [changeTab, setSelectedProjectId, setSelectedProjectTitle]);

  const handleEvaluatorProjectSelect = useCallback((projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    const targetTab = evaluationMethod === 'pairwise' ? 'pairwise-evaluation' : 'direct-evaluation';
    changeTab(targetTab, projectId, projectTitle);
  }, [changeTab, setSelectedProjectId, setSelectedProjectTitle]);

  const handleEvaluatorEvaluationComplete = useCallback(() => {
    changeTab('evaluator-dashboard');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  }, [changeTab, setSelectedProjectId, setSelectedProjectTitle]);

  // ── PersonalServiceDashboard (now consumes Context directly) ────────────
  const renderPSD = useCallback((tabOverride?: string) => (
    <PersonalServiceDashboard tabOverride={tabOverride} />
  ), []);

  // ── Auth form for unauthenticated protected tabs ────────────────────────
  const renderAuthPage = () => (
    <UnifiedAuthPage
      onLogin={handleLogin}
      onRegister={async (email: string, password: string, role?: string) => {
        await handleRegister({
          username: email, email, password, password2: password,
          first_name: '', last_name: '', role: role || 'user'
        });
      }}
      onGoogleAuth={handleGoogleAuth}
      onKakaoAuth={handleKakaoAuth}
      onNaverAuth={handleNaverAuth}
      loading={loginLoading}
      error={loginError}
    />
  );

  // ── Redirect authenticated users away from guest-only pages ──────────
  const redirectHandled = useRef(false);
  useEffect(() => {
    if (!user) { redirectHandled.current = false; return; }
    if (['home', 'register', 'welcome', 'login'].includes(activeTab)) {
      if (redirectHandled.current) return;
      redirectHandled.current = true;
      const redirectTab = user.role === 'super_admin' ? 'super-admin-dashboard'
        : user.role === 'evaluator' ? 'evaluator-dashboard' : 'personal-service';
      setActiveTab(redirectTab);
    } else {
      redirectHandled.current = false;
    }
  }, [user, activeTab, setActiveTab]);

  // ── renderContent: route switch ─────────────────────────────────────────
  const renderContent = () => {
    // ──────────── Unauthenticated routes ──────────────────────────────────
    if (!user) {
      switch (activeTab) {
        case 'home':
          return <HomePage onLoginClick={handleLoginClick} />;

        case 'login':
          return renderAuthPage();

        case 'register':
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

        case 'evaluator-workflow': {
          const evalProjectId = getCachedEvaluatorProjectId();
          const evalToken = getCachedEvaluatorToken();
          if (evalProjectId) {
            return <EvaluatorWorkflow projectId={evalProjectId} evaluatorToken={evalToken || undefined} />;
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

    // ──────────── Authenticated routes ────────────────────────────────────
    switch (activeTab) {
      // Guest-only pages: useEffect above will redirect, show loading briefly
      case 'home':
      case 'register':
      case 'welcome':
      case 'login':
        return <PageLoader />;

      // 연구자 대시보드 (모든 역할에서 "연구 플랫폼 모드"로 접근 가능)
      case 'personal-service':
      case 'admin-dashboard':
      case 'user-home':
        return renderPSD();

      case 'super-admin':
      case 'super-admin-dashboard':
        return <SuperAdminDashboard user={user} onTabChange={setActiveTab} />;

      case 'role-switch-admin':
        return (
          <RoleSwitcher currentUser={user} targetRole="service_admin"
            onRoleSwitch={(role) => {
              setUser({ ...user, role } as typeof user);
              localStorage.setItem('ahp_temp_role', role);
              setActiveTab('personal-service');
            }}
            onBack={() => setActiveTab('super-admin-dashboard')}
          />
        );

      case 'role-switch-user':
        return (
          <RoleSwitcher currentUser={user} targetRole="service_user"
            onRoleSwitch={(role) => {
              setUser({ ...user, role } as typeof user);
              localStorage.setItem('ahp_temp_role', role);
              setActiveTab('personal-service');
            }}
            onBack={() => setActiveTab('super-admin-dashboard')}
          />
        );

      case 'role-switch-evaluator':
        return (
          <RoleSwitcher currentUser={user} targetRole="evaluator"
            onRoleSwitch={(role) => {
              setUser({ ...user, role } as typeof user);
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
            onReset={() => { showActionMessage('success', '시스템 초기화가 완료되었습니다.'); }}
          />
        );

      case 'dashboard':
        return <RoleBasedDashboard user={user} onTabChange={setActiveTab} viewMode={viewMode} />;

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
        return <PaymentOptionsPage user={user} onTabChange={setActiveTab} />;

      case 'projects':
      case 'monitoring':
      case 'database':
      case 'audit':
      case 'settings':
      case 'backup':
      case 'system':
        return (
          <EnhancedSuperAdminDashboard
            user={{
              id: String(user.id) || '1',
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              email: user.email || '',
              role: 'super_admin' as const,
              subscription: undefined,
              parentAdminId: undefined,
              createdBy: undefined,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'evaluator-workflow': {
        const evalProjectId2 = getCachedEvaluatorProjectId();
        const evalToken2 = getCachedEvaluatorToken();
        if (evalProjectId2) {
          return <EvaluatorWorkflow projectId={evalProjectId2} evaluatorToken={evalToken2 || undefined} />;
        }
        return renderPSD();
      }

      case 'evaluator-survey':
        return renderPSD();

      case 'user-guide':
        return (
          <ComprehensiveUserGuide
            onNavigateToService={() => setActiveTab('personal-service')}
            onNavigateToEvaluator={() => setActiveTab('evaluator-mode')}
            userRole={user?.role}
            isLoggedIn={!!user}
          />
        );

      case 'researcher-guide':
        return <ResearcherGuidePage />;

      case 'evaluator-guide':
        return <EvaluatorGuidePage />;

      case 'ai-research-guide':
        return <AIResearchGuidePage />;

      case 'evaluation-test':
        return <EvaluationTest onBack={() => setActiveTab('personal-service')} />;

      case 'connection-test':
        return <ConnectionTestPage />;

      case 'integration-test':
        return <TestPage />;

      case 'system-health':
        return <SystemHealthPage />;

      case 'ai-ahp-methodology':
        return <AHPMethodologyPage />;

      case 'ai-fuzzy-methodology':
        return <FuzzyAHPMethodologyPage />;

      case 'ai-paper-generation':
        return <AIPaperGenerationPage user={user} />;

      case 'ai-results-interpretation':
        return <AIResultsInterpretationPage user={user} />;

      case 'ai-quality-validation':
        return <AIQualityValidationPage user={user} />;

      case 'ai-materials-generation':
        return <AIMaterialsGenerationPage user={user} />;

      case 'ai-chatbot-assistant':
        return <AIChatbotAssistantPage user={user} />;

      case 'django-admin-integration':
        if (user.role === 'super_admin' || user.role === 'service_admin') {
          return <DjangoAdminIntegration user={user} />;
        }
        return renderPSD();

      case 'evaluator-mode':
        return (
          <EvaluatorDashboard
            user={{
              id: String(user.id),
              firstName: user.first_name,
              lastName: user.last_name,
              email: user.email,
              role: 'evaluator'
            }}
            onSwitchToAdmin={() => setActiveTab('personal-service')}
            onLogout={user.role === 'evaluator' ? handleLogout : undefined}
          />
        );

      case 'demographic-survey':
        return renderPSD('demographic-survey');

      case 'my-projects':
      case 'project-creation':
      case 'project-wizard':
      case 'demographic-setup':
      case 'evaluator-invitation':
        return renderPSD();

      case 'project-workflow':
        return (
          <ProjectWorkflow
            onComplete={() => setActiveTab('my-projects')}
            onCancel={() => setActiveTab('my-projects')}
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
        return renderPSD();

      case 'ahp-analysis':
        return <AHPProjectManager />;

      case 'landing':
        return <LandingPage user={user} onGetStarted={handleGetStarted} />;

      case 'model-building':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="모델 구축"
            fallbackTab="personal-projects" onNavigate={setActiveTab}>
            <ModelBuilding
              projectId={selectedProjectId!}
              projectTitle={selectedProjectTitle}
              onModelFinalized={handleModelFinalized}
              onBack={() => setActiveTab('personal-projects')}
            />
          </ProjectGuard>
        );

      case 'evaluation-results':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="평가 결과"
            fallbackTab="personal-projects" onNavigate={setActiveTab}>
            <EvaluationResults
              projectId={selectedProjectId!}
              projectTitle={selectedProjectTitle}
              onBack={() => setActiveTab('model-building')}
              onComplete={handleAdminEvaluationComplete}
            />
          </ProjectGuard>
        );

      case 'project-completion':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="프로젝트 완료"
            fallbackTab="personal-projects" onNavigate={setActiveTab}>
            <ProjectCompletion
              projectId={selectedProjectId!}
              projectTitle={selectedProjectTitle}
              onBack={() => setActiveTab('evaluation-results')}
              onProjectStatusChange={handleProjectStatusChange}
            />
          </ProjectGuard>
        );

      case 'personal-projects':
        return (
          <Card title="프로젝트 관리">
            {loading ? (
              <div className="text-center py-4">데이터 로딩 중...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">내 프로젝트 ({projects.length}개)</h4>
                  <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('project-creation')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      새 프로젝트 생성
                    </button>
                    <button onClick={createSampleProject}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      샘플 프로젝트 생성
                    </button>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">프로젝트가 없습니다. 새 프로젝트를 생성해보세요.</div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div key={project.id ?? ''} className="border rounded-lg p-4 hover:bg-gray-50">
                        <h5 className="font-medium text-lg">{project.title}</h5>
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            평가자: {project.evaluator_count}명 | 상태: {project.status}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation();
                              handleProjectSelect(project.id ?? '', project.title); setActiveTab('model-building'); }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="편집" type="button">
                              <EditIcon preset="button" hover />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation();
                              handleProjectSelect(project.id ?? '', project.title); setActiveTab('model-building'); }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="모델 구축" type="button">
                              <UIIcon emoji="🏗️" preset="button" color="success" hover />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation();
                              handleProjectSelect(project.id ?? '', project.title); setActiveTab('results-analysis'); }}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="결과 분석" type="button">
                              <UIIcon emoji="📊" preset="button" color="info" hover />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation();
                              setPendingDeleteProjectId(project.id ?? null); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제" type="button">
                              <DeleteIcon preset="button" hover />
                            </button>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(project.created_at ?? '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );

      case 'personal-users':
        if (!user) return null;
        return user.role !== 'service_admin' && user.role !== 'super_admin' ? (
          <Card title="접근 권한 없음">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg mb-2">❌</div>
              <div className="text-red-600 font-medium">관리자만 접근 가능합니다.</div>
            </div>
          </Card>
        ) : (
          <UserManagement
            users={users as unknown as Parameters<typeof UserManagement>[0]['users']}
            loading={loading}
            onCreateUser={createUser as Parameters<typeof UserManagement>[0]['onCreateUser']}
            onUpdateUser={updateUser as Parameters<typeof UserManagement>[0]['onUpdateUser']}
            onDeleteUser={deleteUser}
            onRefresh={fetchUsers}
          />
        );

      case 'results':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="결과 대시보드"
            fallbackTab="personal-projects" fallbackLabel="프로젝트 목록으로 이동" onNavigate={setActiveTab}>
            <ResultsDashboard projectId={selectedProjectId!} projectTitle={'AHP 프로젝트'} demoMode={false} />
          </ProjectGuard>
        );

      case 'evaluator-dashboard':
        if (!user) return null;
        return (
          <ProjectSelection
            evaluatorId={user.first_name + user.last_name}
            onProjectSelect={handleEvaluatorProjectSelect}
          />
        );

      case 'pairwise-evaluation':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="쌍대비교 평가"
            fallbackTab="evaluator-dashboard" fallbackLabel="프로젝트 선택으로 이동" onNavigate={setActiveTab}>
            <PairwiseEvaluation
              projectId={selectedProjectId!}
              projectTitle={selectedProjectTitle}
              onComplete={handleEvaluatorEvaluationComplete}
              onBack={() => setActiveTab('evaluator-dashboard')}
            />
          </ProjectGuard>
        );

      case 'direct-evaluation':
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="직접입력 평가"
            fallbackTab="evaluator-dashboard" fallbackLabel="프로젝트 선택으로 이동" onNavigate={setActiveTab}>
            <DirectInputEvaluation
              projectId={selectedProjectId!}
              projectTitle={selectedProjectTitle}
              onComplete={handleEvaluatorEvaluationComplete}
              onBack={() => setActiveTab('evaluator-dashboard')}
            />
          </ProjectGuard>
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
                <p className="text-purple-700 text-sm mt-1">할당된 프로젝트의 평가 진행 상황을 확인합니다.</p>
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
        return (
          <ProjectGuard selectedProjectId={selectedProjectId} title="쌍대비교 평가"
            fallbackTab="personal-projects" onNavigate={setActiveTab}>
            <PairwiseComparison projectId={selectedProjectId!} criteria={[]} alternatives={[]} demoMode={false} />
          </ProjectGuard>
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
                <p className="text-indigo-700 text-sm mt-1">각 단계별 완료 상황을 추적합니다.</p>
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
        // 알 수 없는 탭은 연구자 대시보드로 fallback (useEffect로 리디렉트)
        return renderPSD();
    }
  };

  // ── Main render ─────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Layout
          user={user}
          viewMode={viewMode}
          activeTab={activeTab}
          onTabChange={changeTab}
          onLogout={handleLogout}
          onModeSwitch={handleModeSwitch}
        >
          <ErrorBoundary level="section">
            <Suspense fallback={<PageLoader />}>
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </Layout>
        <ApiErrorModal isVisible={showApiErrorModal} onClose={handleCloseApiError} onRetry={handleApiRetry} />
        {trashOverflowData && (
          <TrashOverflowModal
            trashedProjects={trashOverflowData.trashedProjects}
            projectToDelete={trashOverflowData.projectToDelete}
            onPermanentDelete={permanentDeleteProject}
            onCancel={handleTrashOverflowCancel}
            onDeleteAfterCleanup={handleTrashOverflow}
          />
        )}
        <Modal
          isOpen={!!pendingDeleteProjectId}
          onClose={() => setPendingDeleteProjectId(null)}
          title="프로젝트 삭제 확인"
          size="sm"
          footer={
            <div className="flex justify-end space-x-3">
              <button onClick={() => setPendingDeleteProjectId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                취소
              </button>
              <button
                onClick={async () => {
                  if (!pendingDeleteProjectId) return;
                  const idToDelete = pendingDeleteProjectId;
                  setPendingDeleteProjectId(null);
                  try { await deleteProject(idToDelete); }
                  catch { showActionMessage('error', '프로젝트 삭제에 실패했습니다.'); }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                삭제
              </button>
            </div>
          }
        >
          <p className="text-sm text-gray-600">정말로 이 프로젝트를 삭제하시겠습니까? 삭제된 프로젝트는 휴지통으로 이동합니다.</p>
        </Modal>
      </div>
    );
  }

  // Unauthenticated layout (no sidebar/header)
  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }`}>
          {actionMessage.text}
        </div>
      )}
      <ErrorBoundary level="section">
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      </ErrorBoundary>
      <ApiErrorModal isVisible={showApiErrorModal} onClose={handleCloseApiError} onRetry={handleApiRetry} />
      {trashOverflowData && (
        <TrashOverflowModal
          trashedProjects={trashOverflowData.trashedProjects}
          projectToDelete={trashOverflowData.projectToDelete}
          onPermanentDelete={permanentDeleteProject}
          onCancel={handleTrashOverflowCancel}
          onDeleteAfterCleanup={handleTrashOverflow}
        />
      )}
    </div>
  );
}
