import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { useProjects } from '../hooks/useProjects';
import { useActionMessage } from '../hooks/useActionMessage';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { NavigationContext, type NavigationContextValue } from './NavigationContext';
import { ProjectContext, type ProjectContextValue } from './ProjectContext';
import { UIContext, type UIContextValue } from './UIContext';

/**
 * AppProviders: orchestration layer that wires all hooks together.
 *
 * Solves the cross-context dependency problem:
 * - Auth's handleLogin needs to set activeTab (Navigation)
 * - Navigation needs user (Auth) and selectedProjectId (Projects)
 * - Projects needs user (Auth)
 *
 * All hooks are called here at the top level, then distributed
 * to separate contexts for selective subscription.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const { actionMessage, showActionMessage } = useActionMessage();

  // Auth hook: onLoginSuccess sets the active tab, onLogout clears navigation + projects
  const auth = useAuth(
    // onLoginSuccess
    (_user, targetTab) => {
      nav.setActiveTab(targetTab);
    },
    // onLogout
    () => {
      nav.setActiveTab('home');
      proj.setSelectedProjectId(null);
      proj.setSelectedProjectTitle('');
      proj.setProjects([]);
    },
    // fetchProjects (called after login/register)
    () => proj.fetchProjects(),
  );

  // Projects hook: depends on auth.user
  const proj = useProjects(auth.user);

  // Navigation hook: depends on auth.user + project selection state
  const nav = useNavigation(
    auth.user,
    proj.selectedProjectId,
    proj.setSelectedProjectId,
    proj.setSelectedProjectTitle,
  );

  // Backend status hook: needs setUser for session restoration
  const backend = useBackendStatus(auth.setUser);

  // ── Context values (stabilized with useMemo) ──────────────────────────

  const authValue = useMemo<AuthContextValue>(() => ({
    user: auth.user,
    isAuthenticated: !!auth.user,
    loginLoading: auth.loginLoading,
    loginError: auth.loginError,
    registerMode: auth.registerMode,
    setUser: auth.setUser,
    setLoginError: auth.setLoginError,
    setRegisterMode: auth.setRegisterMode,
    handleLogin: auth.handleLogin,
    handleRegister: auth.handleRegister,
    handleLogout: auth.handleLogout,
    handleGoogleAuth: auth.handleGoogleAuth,
    handleKakaoAuth: auth.handleKakaoAuth,
    handleNaverAuth: auth.handleNaverAuth,
  }), [
    auth.user, auth.loginLoading, auth.loginError, auth.registerMode,
    auth.setUser, auth.setLoginError, auth.setRegisterMode,
    auth.handleLogin, auth.handleRegister, auth.handleLogout,
    auth.handleGoogleAuth, auth.handleKakaoAuth, auth.handleNaverAuth,
  ]);

  const navValue = useMemo<NavigationContextValue>(() => ({
    activeTab: nav.activeTab,
    viewMode: nav.viewMode,
    isNavigationReady: nav.isNavigationReady,
    protectedTabs: nav.protectedTabs,
    setActiveTab: nav.setActiveTab,
    changeTab: nav.changeTab,
    handleModeSwitch: nav.handleModeSwitch,
  }), [
    nav.activeTab, nav.viewMode, nav.isNavigationReady, nav.protectedTabs,
    nav.setActiveTab, nav.changeTab, nav.handleModeSwitch,
  ]);

  const projValue = useMemo<ProjectContextValue>(() => ({
    projects: proj.projects,
    loading: proj.loading,
    selectedProjectId: proj.selectedProjectId,
    selectedProjectTitle: proj.selectedProjectTitle,
    pendingDeleteProjectId: proj.pendingDeleteProjectId,
    trashOverflowData: proj.trashOverflowData,
    setSelectedProjectId: proj.setSelectedProjectId,
    setSelectedProjectTitle: proj.setSelectedProjectTitle,
    setPendingDeleteProjectId: proj.setPendingDeleteProjectId,
    setProjects: proj.setProjects,
    fetchProjects: proj.fetchProjects,
    createProject: proj.createProject,
    deleteProject: proj.deleteProject,
    fetchCriteria: proj.fetchCriteria,
    createCriteria: proj.createCriteria,
    fetchAlternatives: proj.fetchAlternatives,
    createAlternative: proj.createAlternative,
    saveEvaluation: proj.saveEvaluation,
    fetchTrashedProjects: proj.fetchTrashedProjects,
    restoreProject: proj.restoreProject,
    permanentDeleteProject: proj.permanentDeleteProject,
    handleTrashOverflow: proj.handleTrashOverflow,
    handleTrashOverflowCancel: proj.handleTrashOverflowCancel,
    createSampleProject: proj.createSampleProject,
    handleProjectSelect: proj.handleProjectSelect,
  }), [
    proj.projects, proj.loading, proj.selectedProjectId, proj.selectedProjectTitle,
    proj.pendingDeleteProjectId, proj.trashOverflowData,
    proj.setSelectedProjectId, proj.setSelectedProjectTitle,
    proj.setPendingDeleteProjectId, proj.setProjects,
    proj.fetchProjects, proj.createProject, proj.deleteProject,
    proj.fetchCriteria, proj.createCriteria,
    proj.fetchAlternatives, proj.createAlternative,
    proj.saveEvaluation, proj.fetchTrashedProjects,
    proj.restoreProject, proj.permanentDeleteProject,
    proj.handleTrashOverflow, proj.handleTrashOverflowCancel,
    proj.createSampleProject, proj.handleProjectSelect,
  ]);

  const uiValue = useMemo<UIContextValue>(() => ({
    actionMessage,
    showActionMessage,
    backendStatus: backend.backendStatus,
    showApiErrorModal: backend.showApiErrorModal,
    handleApiRetry: backend.handleApiRetry,
    handleCloseApiError: backend.handleCloseApiError,
  }), [
    actionMessage, showActionMessage,
    backend.backendStatus, backend.showApiErrorModal,
    backend.handleApiRetry, backend.handleCloseApiError,
  ]);

  return (
    <AuthContext.Provider value={authValue}>
      <NavigationContext.Provider value={navValue}>
        <ProjectContext.Provider value={projValue}>
          <UIContext.Provider value={uiValue}>
            {children}
          </UIContext.Provider>
        </ProjectContext.Provider>
      </NavigationContext.Provider>
    </AuthContext.Provider>
  );
}
