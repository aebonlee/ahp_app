/**
 * useNavigation.ts - 탭 네비게이션 커스텀 Hook
 *
 * Phase 1c 분리 대상 (CLAUDE.md 참조)
 * - activeTab 상태 관리
 * - URL 파라미터 동기화 (window.history.pushState)
 * - 브라우저 뒤로가기/앞으로가기 처리
 * - GitHub Pages 호환: React Router DOM 사용 불가, 탭 기반 네비게이션 유지
 *
 * ⚠️ 중요: URL 파라미터 방식을 절대 변경하지 말 것
 * - ?tab=XXX&project=YYY 파라미터 방식 유지
 * - ?project=ID, ?eval=ID 평가자 직접 접근 방식 유지
 *
 * @담당 Claude Sonnet 4.6 (구현)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '../types';

// URL 파라미터에서 사용되는 짧은 이름 → 내부 탭 이름 매핑
const TAB_MAPPING: Record<string, string> = {
  evaluators: 'evaluator-management',
  monitoring: 'progress-monitoring',
  analysis: 'results-analysis',
  'ai-paper': 'ai-paper-assistant',
  export: 'export-reports',
  workshop: 'workshop-management',
  dss: 'decision-support-system',
  settings: 'personal-settings',
};

/**
 * URL 파라미터에서 초기 탭을 결정하는 헬퍼
 */
function getInitialTab(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const evalParam = urlParams.get('eval');
  const projectParam = urlParams.get('project');

  // 평가자 워크플로우 직접 접근
  if (evalParam || projectParam || window.location.pathname.includes('/evaluator')) {
    return 'evaluator-workflow';
  }

  // URL 파라미터를 내부 탭 이름으로 변환
  const mappedTab = tabParam && TAB_MAPPING[tabParam] ? TAB_MAPPING[tabParam] : tabParam;

  const validTabs = [
    'home', 'user-guide', 'researcher-guide', 'evaluator-guide', 'evaluator-mode',
    'evaluator-workflow', 'personal-service', 'demographic-survey',
    'my-projects', 'project-creation', 'project-workflow', 'model-builder',
    'evaluator-management', 'progress-monitoring', 'results-analysis',
    'ai-paper-assistant', 'export-reports', 'workshop-management',
    'decision-support-system', 'personal-settings', 'landing', 'ahp-analysis',
  ];

  if (mappedTab && validTabs.includes(mappedTab)) {
    return mappedTab;
  }

  return 'home';
}

interface UseNavigationOptions {
  user: User | null;
  selectedProjectId?: string | null;
  selectedProjectTitle?: string;
}

interface UseNavigationReturn {
  activeTab: string;
  isNavigationReady: boolean;
  protectedTabs: string[];
  setActiveTab: (tab: string) => void;
  changeTab: (newTab: string, projectId?: string, projectTitle?: string) => void;
  handleLoginClick: () => void;
  handleBackToLogin: () => void;
  handleGetStarted: () => void;
  handleModelFinalized: () => void;
  handleAdminEvaluationComplete: () => void;
  handleEvaluatorEvaluationComplete: (
    setSelectedProjectId: (id: string | null) => void,
    setSelectedProjectTitle: (title: string) => void
  ) => void;
  handleEvaluatorProjectSelect: (
    projectId: string,
    projectTitle: string,
    evaluationMethod: 'pairwise' | 'direct',
    setSelectedProjectId: (id: string | null) => void,
    setSelectedProjectTitle: (title: string) => void,
    setSelectedEvaluationMethod: (method: 'pairwise' | 'direct') => void
  ) => void;
}

/**
 * useNavigation - 탭 네비게이션과 URL 동기화를 제공하는 커스텀 Hook
 *
 * @example
 * const { activeTab, changeTab, handleLoginClick } = useNavigation({ user, selectedProjectId });
 */
export function useNavigation({
  user,
  selectedProjectId,
  selectedProjectTitle,
}: UseNavigationOptions): UseNavigationReturn {
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [isNavigationReady, setIsNavigationReady] = useState(true);

  // 보호된 탭 목록 (로그인 필요)
  const protectedTabs = useMemo(
    () => [
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
    ],
    []
  );

  // URL popstate 처리 (뒤로가기/앞으로가기)
  useEffect(() => {
    if (!isNavigationReady) return;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.tab) {
        setActiveTab(state.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isNavigationReady]);

  // URL 파라미터 변경 감지
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const projectParam = urlParams.get('project');
      const evalParam = urlParams.get('eval');

      if (window.location.pathname.includes('/evaluator') || projectParam || evalParam) {
        setActiveTab('evaluator-workflow');
        return;
      }

      if (user && tabParam) {
        const mappedTab = TAB_MAPPING[tabParam] ?? tabParam;
        if (protectedTabs.includes(mappedTab)) {
          setActiveTab(mappedTab);
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [user, protectedTabs]);

  // 탭 변경 시 URL 업데이트 (GitHub Pages 호환)
  useEffect(() => {
    if (!isNavigationReady || !user) return;

    const currentState = {
      tab: activeTab,
      projectId: selectedProjectId,
      projectTitle: selectedProjectTitle,
    };

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('tab', activeTab);
    if (selectedProjectId) {
      urlParams.set('project', selectedProjectId);
    } else {
      urlParams.delete('project');
    }

    const currentPath = window.location.pathname;
    const newPath = currentPath + '?' + urlParams.toString();
    window.history.pushState(currentState, '', newPath);
  }, [activeTab, selectedProjectId, selectedProjectTitle, user, isNavigationReady]);

  // 효율적인 탭 전환 함수
  const changeTab = useCallback(
    (newTab: string, _projectId?: string, _projectTitle?: string) => {
      setActiveTab(newTab);
      console.log(`📦 탭 전환: ${newTab}`);
    },
    []
  );

  // 네비게이션 헬퍼들
  const handleLoginClick = useCallback(() => {
    setActiveTab('login');
  }, []);

  const handleBackToLogin = useCallback(() => {
    setActiveTab('login');
  }, []);

  const handleGetStarted = useCallback(() => {
    setActiveTab('personal-projects');
  }, []);

  const handleModelFinalized = useCallback(() => {
    setActiveTab('evaluation-results');
  }, []);

  const handleAdminEvaluationComplete = useCallback(() => {
    setActiveTab('project-completion');
  }, []);

  const handleEvaluatorEvaluationComplete = useCallback(
    (
      setSelectedProjectId: (id: string | null) => void,
      setSelectedProjectTitle: (title: string) => void
    ) => {
      setActiveTab('evaluator-dashboard');
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
      console.log('✅ 평가자 평가 완료');
    },
    []
  );

  const handleEvaluatorProjectSelect = useCallback(
    (
      projectId: string,
      projectTitle: string,
      evaluationMethod: 'pairwise' | 'direct',
      setSelectedProjectId: (id: string | null) => void,
      setSelectedProjectTitle: (title: string) => void,
      setSelectedEvaluationMethod: (method: 'pairwise' | 'direct') => void
    ) => {
      setSelectedProjectId(projectId);
      setSelectedProjectTitle(projectTitle);
      setSelectedEvaluationMethod(evaluationMethod);

      const targetTab = evaluationMethod === 'pairwise' ? 'pairwise-evaluation' : 'direct-evaluation';
      setActiveTab(targetTab);
    },
    []
  );

  return {
    activeTab,
    isNavigationReady,
    protectedTabs,
    setActiveTab,
    changeTab,
    handleLoginClick,
    handleBackToLogin,
    handleGetStarted,
    handleModelFinalized,
    handleAdminEvaluationComplete,
    handleEvaluatorEvaluationComplete,
    handleEvaluatorProjectSelect,
  };
}

export default useNavigation;
