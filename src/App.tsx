/**
 * App.tsx - AHP 플랫폼 루트 컴포넌트 (Phase 1c+ 리팩터링)
 *
 * 역할 분담:
 * - useAuth       : 인증/로그인/로그아웃
 * - useBackendStatus : 백엔드 연결 상태
 * - useProjects   : 프로젝트 CRUD, 휴지통, 기준/대안/평가
 * - App.tsx       : activeTab, viewMode, users CRUD, 네비게이션 핸들러, 렌더
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import './index.css';
import './App.css';
import sessionService from './services/sessionService';
import authService from './services/authService';
import { API_BASE_URL } from './config/api';
import type { UserRole } from './types';

import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useBackendStatus } from './hooks/useBackendStatus';

import LoadingFallback from './components/common/LoadingFallback';
import AppRouter from './router/AppRouter';
import Layout from './components/layout/Layout';
import ApiErrorModal from './components/common/ApiErrorModal';
import TrashOverflowModal from './components/common/TrashOverflowModal';

// ─── URL 파라미터에서 초기 탭 결정 ────────────────────────────────────────────
function getInitialTab(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const evalParam = urlParams.get('eval');
  const projectParam = urlParams.get('project');

  if (evalParam || projectParam || window.location.pathname.includes('/evaluator')) {
    return 'evaluator-workflow';
  }

  const tabMapping: Record<string, string> = {
    evaluators: 'evaluator-management',
    monitoring: 'progress-monitoring',
    analysis: 'results-analysis',
    'ai-paper': 'ai-paper-assistant',
    export: 'export-reports',
    workshop: 'workshop-management',
    dss: 'decision-support-system',
    settings: 'personal-settings',
  };

  const mappedTab = tabParam && tabMapping[tabParam] ? tabMapping[tabParam] : tabParam;

  const validTabs = [
    'home', 'user-guide', 'researcher-guide', 'evaluator-guide', 'evaluator-mode',
    'evaluator-workflow', 'personal-service', 'demographic-survey',
    'my-projects', 'project-creation', 'project-workflow', 'model-builder',
    'evaluator-management', 'progress-monitoring', 'results-analysis',
    'ai-paper-assistant', 'export-reports', 'workshop-management',
    'decision-support-system', 'personal-settings', 'landing', 'ahp-analysis',
  ];

  return mappedTab && validTabs.includes(mappedTab) ? mappedTab : 'home';
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  useColorTheme();
  useTheme();

  // activeTab은 useNavigation 대신 App.tsx에서 직접 관리 (Hook 순환 의존성 방지)
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [viewMode, setViewMode] = useState<'service' | 'evaluator'>('service');
  const [users, setUsers] = useState<any[]>([]);
  const [trashOverflowData, setTrashOverflowData] = useState<{
    trashedProjects: any[];
    projectToDelete: string;
    isVisible: boolean;
  } | null>(null);

  // ── 탭 전환 헬퍼 ──────────────────────────────────────────────────────────
  const changeTab = useCallback((newTab: string, _projectId?: string, _projectTitle?: string) => {
    setActiveTab(newTab);
  }, []);

  // ── 커스텀 Hooks ──────────────────────────────────────────────────────────
  const { backendStatus, showApiErrorModal, handleApiRetry, handleCloseApiError } =
    useBackendStatus();

  const {
    user, setUser, loginLoading, loginError, setLoginError, registerMode, setRegisterMode,
    handleLogin, handleRegister, handleLogout,
    handleGoogleAuth, handleKakaoAuth, handleNaverAuth,
  } = useAuth({
    onLoginSuccess: (u) => {
      // URL 탭 파라미터 우선, 없으면 역할별 기본 탭
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      const validTabsOnLogin = ['personal-service', 'my-projects', 'model-builder', 'evaluator-management', 'results-analysis'];
      const targetTab =
        (tabParam && validTabsOnLogin.includes(tabParam))
          ? tabParam
          : u.role === 'evaluator'
            ? 'evaluator-dashboard'
            : 'personal-service';
      setActiveTab(targetTab);
    },
    onLogoutSuccess: () => {
      setActiveTab('home');
      setUsers([]);
    },
  });

  const {
    projects, loading,
    selectedProjectId, selectedProjectTitle,
    setSelectedProjectId, setSelectedProjectTitle,
    fetchProjects, createProject, deleteProject, restoreProject,
    permanentDeleteProject, fetchTrashedProjects,
    fetchCriteria, createCriteria, fetchAlternatives, createAlternative,
    saveEvaluation, handleProjectSelect, handleProjectStatusChange, createSampleProject,
  } = useProjects(user, changeTab);

  // ── 보호된 탭 목록 ────────────────────────────────────────────────────────
  const protectedTabs = useMemo(() => [
    'welcome', 'super-admin', 'personal-service', 'my-projects',
    'project-creation', 'model-builder', 'evaluation-test', 'evaluator-management',
    'progress-monitoring', 'results-analysis', 'ai-paper-assistant', 'export-reports',
    'workshop-management', 'decision-support-system', 'personal-settings',
    'user-guide', 'researcher-guide', 'evaluator-guide', 'dashboard', 'users',
    'projects', 'monitoring', 'database', 'audit', 'settings', 'backup', 'system',
    'landing', 'home', 'model-building', 'evaluation-results', 'project-completion',
    'personal-projects', 'personal-users', 'results', 'evaluator-dashboard',
    'pairwise-evaluation', 'direct-evaluation', 'evaluator-status', 'evaluations',
    'progress', 'demographic-survey', 'evaluator-mode', 'ahp-analysis',
    'django-admin-integration', 'connection-test', 'integration-test',
  ], []);

  // ── 세션 서비스 초기화 ────────────────────────────────────────────────────
  useEffect(() => {
    sessionService.setLogoutCallback(() => {
      setUser(null as any);
      setActiveTab('home');
      localStorage.removeItem('ahp_temp_role');
    });
  }, [setUser]);

  // ── 임시 역할(ahp_temp_role) 적용 ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const tempRole = localStorage.getItem('ahp_temp_role');
    if (tempRole && user.role === 'super_admin') {
      setUser((prev: any) => prev ? { ...prev, role: tempRole as UserRole } : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── 백엔드 연결 성공 시 세션 검증 ────────────────────────────────────────
  useEffect(() => {
    if (backendStatus !== 'available') return;
    const validateSession = async () => {
      const token = authService.getAccessToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/service/auth/profile/`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          sessionService.startSession();
        } else if (response.status === 401) {
          authService.clearTokens();
        }
      } catch { /* 세션 검증 실패는 무시 */ }
    };
    validateSession();
  }, [backendStatus, setUser]);

  // ── URL 동기화 (GitHub Pages 호환) ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('tab', activeTab);
    if (selectedProjectId) urlParams.set('project', selectedProjectId);
    else urlParams.delete('project');
    window.history.pushState(
      { tab: activeTab, projectId: selectedProjectId },
      '',
      window.location.pathname + '?' + urlParams.toString()
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedProjectId, user]);

  // ── 브라우저 뒤로가기/앞으로가기 처리 ───────────────────────────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.tab) setActiveTab(e.state.tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── 탭/사용자 변경 시 데이터 로드 ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      fetchProjects(); // useProjects 내부에서 projects = [] 처리
      return;
    }
    const projectTabs = ['personal-projects', 'personal-service', 'welcome', 'my-projects', 'home'];
    if (projectTabs.includes(activeTab)) {
      fetchProjects();
    } else if (activeTab === 'personal-users' && ['super_admin', 'service_admin'].includes(user.role || '')) {
      fetchUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // ── 사용자 관리 (users CRUD - 별도 Hook 미생성) ──────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) { console.error('fetchUsers 실패:', e); }
  }, []);

  const createUser = useCallback(async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || '사용자 생성 실패'); }
    await fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId: string, userData: any) => {
    const res = await fetch(`${API_BASE_URL}/api/accounts/${userId}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || '사용자 수정 실패'); }
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/accounts/${userId}`, {
      method: 'DELETE', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || '사용자 삭제 실패'); }
    await fetchUsers();
  }, [fetchUsers]);

  // ── 휴지통 오버플로우 처리 ────────────────────────────────────────────────
  const handleTrashOverflow = useCallback(async (projectToDeleteAfterCleanup: string) => {
    setTrashOverflowData(null);
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectToDeleteAfterCleanup}`, {
      method: 'DELETE', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('프로젝트 삭제 실패');
    await fetchProjects();
    return res.json();
  }, [fetchProjects]);

  const handleTrashOverflowCancel = useCallback(() => setTrashOverflowData(null), []);

  // ── 모드 전환 (서비스 ↔ 평가자) ──────────────────────────────────────────
  const handleModeSwitch = useCallback((targetMode: 'service' | 'evaluator') => {
    if (!user) return;
    if (user.role === 'service_admin' || user.role === 'service_user') {
      setViewMode(targetMode);
      setActiveTab(targetMode === 'evaluator' ? 'evaluator-mode' : 'personal-service');
    }
  }, [user]);

  // ── 네비게이션 핸들러 ─────────────────────────────────────────────────────
  const handleLoginClick = useCallback(() => {
    setActiveTab('login');
    setRegisterMode(null);
  }, [setRegisterMode]);

  const handleBackToLogin = useCallback(() => {
    setActiveTab('login');
    setRegisterMode(null);
    setLoginError('');
  }, [setRegisterMode, setLoginError]);

  const handleGetStarted = useCallback(() => setActiveTab('personal-projects'), []);
  const handleModelFinalized = useCallback(() => setActiveTab('evaluation-results'), []);
  const handleAdminEvaluationComplete = useCallback(() => setActiveTab('project-completion'), []);

  const handleEvaluatorProjectSelect = useCallback((
    projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct'
  ) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    setActiveTab(evaluationMethod === 'pairwise' ? 'pairwise-evaluation' : 'direct-evaluation');
  }, [setSelectedProjectId, setSelectedProjectTitle]);

  const handleEvaluatorEvaluationComplete = useCallback(() => {
    setActiveTab('evaluator-dashboard');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  }, [setSelectedProjectId, setSelectedProjectTitle]);

  // ── AppRouter props ───────────────────────────────────────────────────────
  const routerProps = {
    user, activeTab, viewMode, loginLoading, loginError, registerMode,
    projects, users, loading, selectedProjectId, selectedProjectTitle, protectedTabs,
    setUser, setActiveTab, setSelectedProjectId, setSelectedProjectTitle,
    handleLogin, handleRegister, handleGoogleAuth, handleKakaoAuth, handleNaverAuth,
    handleLoginClick, handleBackToLogin, changeTab, handleGetStarted,
    handleModelFinalized, handleAdminEvaluationComplete, handleProjectStatusChange,
    handleProjectSelect, handleEvaluatorProjectSelect, handleEvaluatorEvaluationComplete,
    createProject, deleteProject, restoreProject, fetchTrashedProjects, fetchProjects,
    createCriteria, createAlternative, saveEvaluation, fetchCriteria, fetchAlternatives,
    createUser, updateUser, deleteUser, fetchUsers, createSampleProject, permanentDeleteProject,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const PageFallback = <LoadingFallback message="페이지 로딩 중..." />;

  const modals = (
    <>
      <ApiErrorModal
        isVisible={showApiErrorModal}
        onClose={handleCloseApiError}
        onRetry={handleApiRetry}
      />
      {trashOverflowData && (
        <TrashOverflowModal
          trashedProjects={trashOverflowData.trashedProjects}
          projectToDelete={trashOverflowData.projectToDelete}
          onPermanentDelete={permanentDeleteProject}
          onCancel={handleTrashOverflowCancel}
          onDeleteAfterCleanup={handleTrashOverflow}
        />
      )}
    </>
  );

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
          <Suspense fallback={PageFallback}>
            <AppRouter {...routerProps} />
          </Suspense>
        </Layout>
        {modals}
      </div>
    );
  }

  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Suspense fallback={<LoadingFallback message="로딩 중..." fullScreen />}>
        <AppRouter {...routerProps} />
      </Suspense>
      {modals}
    </div>
  );
}

export default App;
