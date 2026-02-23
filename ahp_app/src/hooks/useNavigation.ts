import { useState, useCallback, useEffect, useMemo } from 'react';
import type { User } from '../types';

const TAB_MAPPING: Record<string, string> = {
  'evaluators': 'evaluator-management',
  'monitoring': 'progress-monitoring',
  'analysis': 'results-analysis',
  'ai-paper': 'ai-paper-assistant',
  'export': 'export-reports',
  'workshop': 'workshop-management',
  'dss': 'decision-support-system',
  'settings': 'personal-settings'
};

const VALID_TABS = [
  'home', 'login', 'register',
  'user-guide', 'researcher-guide', 'evaluator-guide', 'ai-research-guide',
  'evaluator-mode', 'evaluator-workflow', 'evaluator-dashboard',
  'personal-service', 'demographic-survey',
  'my-projects', 'project-creation', 'project-wizard', 'project-workflow',
  'demographic-setup', 'evaluator-invitation',
  'model-builder', 'evaluator-management', 'progress-monitoring', 'results-analysis',
  'ai-paper-assistant', 'export-reports', 'workshop-management',
  'decision-support-system', 'personal-settings', 'landing',
  'ahp-analysis', 'trash',
  'super-admin', 'super-admin-dashboard',
  'dashboard', 'users', 'all-projects',
  'system-monitoring', 'system-info', 'system-settings', 'system-health', 'system-reset',
  'projects', 'monitoring', 'database', 'audit', 'settings', 'backup', 'system',
  'connection-test', 'integration-test',
  'role-switch-admin', 'role-switch-user', 'role-switch-evaluator',
  'model-building', 'evaluation-results', 'project-completion',
  'personal-projects', 'personal-users', 'results',
  'pairwise-evaluation', 'direct-evaluation',
  'evaluator-status', 'evaluator-survey', 'evaluations', 'progress',
  'django-admin-integration', 'payment-options',
  'ai-ahp-methodology', 'ai-fuzzy-methodology',
  'ai-paper-generation', 'ai-results-interpretation',
  'ai-quality-validation', 'ai-materials-generation', 'ai-chatbot-assistant',
  'anonymous-evaluation', 'qr-evaluation',
  'welcome', 'admin-dashboard', 'user-home',
];

// Cache sensitive params before stripping from URL
let _cachedEvaluatorToken: string | null = null;
let _cachedEvaluatorProjectId: string | null = null;

function resolveInitialTab(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const evalParam = urlParams.get('eval');
  const projectParam = urlParams.get('project');

  // Cache sensitive params before they are stripped
  _cachedEvaluatorToken = urlParams.get('token') || urlParams.get('key');
  _cachedEvaluatorProjectId = evalParam || projectParam;

  if (evalParam || projectParam || window.location.pathname.includes('/evaluator')) {
    return 'evaluator-workflow';
  }

  const mappedTab = tabParam && TAB_MAPPING[tabParam] ? TAB_MAPPING[tabParam] : tabParam;
  if (mappedTab && VALID_TABS.includes(mappedTab)) {
    return mappedTab;
  }

  return 'home';
}

/**
 * Get cached evaluator token/key (preserved before URL stripping).
 */
export function getCachedEvaluatorToken(): string | null {
  return _cachedEvaluatorToken;
}

/**
 * Get cached evaluator project ID (preserved before URL stripping).
 */
export function getCachedEvaluatorProjectId(): string | null {
  return _cachedEvaluatorProjectId;
}

/**
 * Remove sensitive parameters (token, key) from the URL
 * to prevent exposure via browser history and Referrer headers.
 * Called once after initial tab resolution.
 */
function stripSensitiveParams(): void {
  const url = new URL(window.location.href);
  const hadSensitive = url.searchParams.has('token') || url.searchParams.has('key');
  if (!hadSensitive) return;

  url.searchParams.delete('token');
  url.searchParams.delete('key');
  window.history.replaceState(window.history.state, '', url.toString());
}

interface UseNavigationReturn {
  activeTab: string;
  viewMode: 'service' | 'evaluator';
  isNavigationReady: boolean;
  protectedTabs: string[];
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setViewMode: React.Dispatch<React.SetStateAction<'service' | 'evaluator'>>;
  setIsNavigationReady: React.Dispatch<React.SetStateAction<boolean>>;
  changeTab: (newTab: string, projectId?: string, projectTitle?: string) => void;
  handleModeSwitch: (targetMode: 'service' | 'evaluator') => void;
}

export function useNavigation(
  user: User | null,
  selectedProjectId: string | null,
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>,
  setSelectedProjectTitle: React.Dispatch<React.SetStateAction<string>>,
): UseNavigationReturn {
  const [activeTab, setActiveTab] = useState<string>(resolveInitialTab);
  const [viewMode, setViewMode] = useState<'service' | 'evaluator'>('service');
  const [isNavigationReady, setIsNavigationReady] = useState(true);

  // Strip sensitive URL params on mount (after caching)
  useEffect(() => {
    stripSensitiveParams();
  }, []);

  const protectedTabs = useMemo(() => [
    'welcome', 'super-admin', 'personal-service', 'my-projects',
    'project-creation', 'model-builder', 'evaluation-test', 'evaluator-management',
    'progress-monitoring', 'results-analysis', 'ai-paper-assistant', 'export-reports',
    'workshop-management', 'decision-support-system', 'personal-settings',
    'user-guide', 'researcher-guide', 'evaluator-guide', 'dashboard', 'users', 'projects', 'monitoring', 'database', 'audit',
    'settings', 'backup', 'system', 'landing', 'home', 'model-building',
    'evaluation-results', 'project-completion', 'personal-projects',
    'personal-users', 'results', 'evaluator-dashboard', 'pairwise-evaluation',
    'direct-evaluation', 'evaluator-status', 'evaluations', 'progress',
    'demographic-survey', 'evaluator-mode', 'ahp-analysis', 'django-admin-integration',
    'connection-test', 'integration-test'
  ], []);

  const changeTab = useCallback((newTab: string, projectId?: string, projectTitle?: string) => {
    setActiveTab(newTab);
    if (projectId) {
      setSelectedProjectId(projectId);
      setSelectedProjectTitle(projectTitle || '');
    }
  }, [setSelectedProjectId, setSelectedProjectTitle]);

  const handleModeSwitch = useCallback((targetMode: 'service' | 'evaluator') => {
    if (!user) return;

    if (user.role === 'service_admin' || user.role === 'service_user') {
      setViewMode(targetMode);
      if (targetMode === 'evaluator') {
        setActiveTab('evaluator-mode');
      } else {
        setActiveTab('personal-service');
      }
    }
  }, [user]);

  // 브라우저 뒤로가기/앞으로가기 처리 (단일 popstate 핸들러)
  useEffect(() => {
    if (!isNavigationReady) return;

    const handlePopState = (event: PopStateEvent) => {
      // 1) history.state에 tab이 있으면 그것을 우선 사용
      const state = event.state;
      if (state && state.tab) {
        setActiveTab(state.tab);
        if (state.projectId) {
          setSelectedProjectId(state.projectId);
          setSelectedProjectTitle(state.projectTitle || '');
        }
        return;
      }

      // 2) URL 파라미터에서 탭 복원
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const mappedTab = tabParam && TAB_MAPPING[tabParam] ? TAB_MAPPING[tabParam] : tabParam;
      if (mappedTab && VALID_TABS.includes(mappedTab)) {
        setActiveTab(mappedTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigationReady]);

  // 탭 변경 시 URL 업데이트 (GitHub Pages 호환)
  useEffect(() => {
    if (!isNavigationReady || !user) return;

    const currentState = {
      tab: activeTab,
      projectId: selectedProjectId,
      projectTitle: '',
    };

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('tab', activeTab);
    if (selectedProjectId) {
      urlParams.set('project', selectedProjectId);
    } else {
      urlParams.delete('project');
    }

    const currentPath = window.location.pathname;
    const cleanPath = currentPath === '/' ? '/' : currentPath;
    const newPath = cleanPath + '?' + urlParams.toString();
    window.history.pushState(currentState, '', newPath);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedProjectId, user, isNavigationReady]);

  // 로그인 시 1회만 role 기반 홈 탭으로 이동 (이후 탭 변경을 덮어쓰지 않음)
  const [hasInitializedForUser, setHasInitializedForUser] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isNavigationReady) return;

    // 이미 이 사용자로 초기화했으면 스킵 (탭 변경 시 되돌아가는 문제 방지)
    const userId = String(user.id);
    if (hasInitializedForUser === userId) return;
    setHasInitializedForUser(userId);

    // URL에 유효한 탭이 있으면 그것을 사용
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const projectFromUrl = urlParams.get('project');

    if (projectFromUrl) {
      setSelectedProjectId(projectFromUrl);
    }

    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      return;
    }

    // URL에 유효한 탭이 없으면 role 기반 기본 탭
    if (user.role === 'super_admin') {
      setActiveTab('super-admin-dashboard');
    } else if (user.role === 'evaluator') {
      setActiveTab('evaluator-dashboard');
    } else {
      setActiveTab('personal-service');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isNavigationReady]);

  return {
    activeTab,
    viewMode,
    isNavigationReady,
    protectedTabs,
    setActiveTab,
    setViewMode,
    setIsNavigationReady,
    changeTab,
    handleModeSwitch,
  };
}
