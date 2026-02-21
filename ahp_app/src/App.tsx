import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import './index.css';
import './App.css';
import sessionService from './services/sessionService';
import authService from './services/authService';
import cleanDataService from './services/dataService_clean';
import api from './services/api';
import type { ProjectData, CriteriaData, AlternativeData, PairwiseComparisonData } from './services/api';
import type { UserProject } from './types';
import { setAPIKeyDirectly } from './utils/aiInitializer';
import type { User, UserRole } from './types';
import Layout from './components/layout/Layout';
import UnifiedAuthPage from './components/auth/UnifiedAuthPage';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './components/home/HomePage';
import Card from './components/common/Card';
import Modal from './components/common/Modal';
import UIIcon, { EditIcon, DeleteIcon } from './components/common/UIIcon';
import ApiErrorModal from './components/common/ApiErrorModal';
import TrashOverflowModal from './components/common/TrashOverflowModal';
import LandingPage from './components/admin/LandingPage';
import EvaluatorWorkflow from './components/evaluator/EvaluatorWorkflow';
import AnonymousEvaluator from './components/evaluation/AnonymousEvaluator';
import { API_BASE_URL } from './config/api';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const PairwiseComparison        = lazy(() => import('./components/comparison/PairwiseComparison'));
const ResultsDashboard          = lazy(() => import('./components/results/ResultsDashboard'));
const AHPProjectManager         = lazy(() => import('./components/ahp/AHPProjectManager'));
const EnhancedSuperAdminDashboard = lazy(() => import('./components/admin/EnhancedSuperAdminDashboard'));
const PersonalServiceDashboard  = lazy(() => import('./components/admin/PersonalServiceDashboard'));
const ModelBuilding             = lazy(() => import('./components/admin/ModelBuilding'));
const EvaluationResults         = lazy(() => import('./components/admin/EvaluationResults'));
const ProjectCompletion         = lazy(() => import('./components/admin/ProjectCompletion'));
const ProjectWorkflow           = lazy(() => import('./components/admin/ProjectWorkflow'));
const UserManagement            = lazy(() => import('./components/admin/UserManagement'));
const RealUserManagement        = lazy(() => import('./components/admin/RealUserManagement'));
const DjangoAdminIntegration    = lazy(() => import('./components/admin/DjangoAdminIntegration'));
const ProjectSelection          = lazy(() => import('./components/evaluator/ProjectSelection'));
const PairwiseEvaluation        = lazy(() => import('./components/evaluator/PairwiseEvaluation'));
const DirectInputEvaluation     = lazy(() => import('./components/evaluator/DirectInputEvaluation'));
const EvaluatorDashboard        = lazy(() => import('./components/evaluator/EvaluatorDashboard'));
const ComprehensiveUserGuide    = lazy(() => import('./components/guide/ComprehensiveUserGuide'));
const ResearcherGuidePage       = lazy(() => import('./components/guide/ResearcherGuidePage'));
const EvaluatorGuidePage        = lazy(() => import('./components/guide/EvaluatorGuidePage'));
const AIResearchGuidePage       = lazy(() => import('./components/guide/AIResearchGuidePage'));
const EvaluationTest            = lazy(() => import('./components/evaluation/EvaluationTest'));
const ConnectionTestPage        = lazy(() => import('./components/demo/ConnectionTestPage'));
const RoleBasedDashboard        = lazy(() => import('./components/common/RoleBasedDashboard'));
const SuperAdminDashboard       = lazy(() => import('./components/superadmin/SuperAdminDashboard'));
const RoleSwitcher              = lazy(() => import('./components/superadmin/RoleSwitcher'));
const SystemReset               = lazy(() => import('./components/superadmin/SystemReset'));
const AllProjectsManagement     = lazy(() => import('./components/superadmin/AllProjectsManagement'));
const SystemInfo                = lazy(() => import('./components/superadmin/SystemInfo'));
const SystemMonitoring          = lazy(() => import('./components/superadmin/SystemMonitoring'));
const SystemSettings            = lazy(() => import('./components/superadmin/SystemSettings'));
const PaymentOptionsPage        = lazy(() => import('./components/superadmin/PaymentOptionsPage'));
const AHPMethodologyPage        = lazy(() => import('./components/methodology/AHPMethodologyPage'));
const FuzzyAHPMethodologyPage   = lazy(() => import('./components/methodology/FuzzyAHPMethodologyPage'));
const AIPaperGenerationPage     = lazy(() => import('./components/ai-paper/AIPaperGenerationPage'));
const AIResultsInterpretationPage = lazy(() => import('./components/ai-interpretation/AIResultsInterpretationPage'));
const AIQualityValidationPage   = lazy(() => import('./components/ai-quality/AIQualityValidationPage'));
const AIMaterialsGenerationPage = lazy(() => import('./components/ai-materials/AIMaterialsGenerationPage'));
const AIChatbotAssistantPage    = lazy(() => import('./components/ai-chatbot/AIChatbotAssistantPage'));
const TestPage                  = lazy(() => import('./pages/TestPage'));
const SystemHealthPage          = lazy(() => import('./pages/SystemHealthPage'));
// ───────────────────────────────────────────────────────────────────────────

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
           style={{ borderColor: 'var(--accent-primary)' }}></div>
      <p style={{ color: 'var(--text-secondary)' }}>페이지 로딩 중...</p>
    </div>
  </div>
);

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  // localStorage에서 초기 사용자 정보 복원
  const getInitialUser = (): User | null => {
    const storedUser = localStorage.getItem('ahp_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // admin@ahp.com은 무조건 슈퍼 관리자로 처리
        if (parsedUser.email === 'admin@ahp.com' || parsedUser.email?.toLowerCase() === 'admin@ahp.com') {
          parsedUser.role = 'super_admin';
          // 강제로 localStorage 업데이트
          localStorage.setItem('ahp_user', JSON.stringify(parsedUser));

          // 전역 변수로도 설정
          window.__SUPER_ADMIN__ = true;
        }
        return parsedUser;
      } catch {
        localStorage.removeItem('ahp_user');
      }
    }
    return null;
  };
  
  const [user, setUser] = useState<User | null>(getInitialUser());
  const [viewMode, setViewMode] = useState<'service' | 'evaluator'>('service');
  const [activeTab, setActiveTab] = useState(() => {
    // URL 파라미터에서 초기 탭 결정
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const evalParam = urlParams.get('eval'); // 평가자 모드 확인
    const projectParam = urlParams.get('project'); // 프로젝트 ID 확인
    
    // /evaluator 경로 또는 project 파라미터가 있으면 평가자 워크플로우로 이동
    if (evalParam || projectParam || window.location.pathname.includes('/evaluator')) {
      return 'evaluator-workflow';
    }
    
    // URL 파라미터 매핑 (URL에서 사용되는 짧은 이름 -> 내부 탭 이름)
    const tabMapping: { [key: string]: string } = {
      'evaluators': 'evaluator-management',  // evaluators -> evaluator-management 매핑
      'monitoring': 'progress-monitoring',
      'analysis': 'results-analysis',
      'ai-paper': 'ai-paper-assistant',
      'export': 'export-reports',
      'workshop': 'workshop-management',
      'dss': 'decision-support-system',
      'settings': 'personal-settings'
    };
    
    // URL 파라미터를 내부 탭 이름으로 변환
    const mappedTab = tabParam && tabMapping[tabParam] ? tabMapping[tabParam] : tabParam;
    
    // tab 파라미터가 있고 유효한 탭이면 해당 탭으로, 아니면 'home'
    const validTabs = [
      'home', 'user-guide', 'researcher-guide', 'evaluator-guide', 'evaluator-mode', 'evaluator-workflow',
      'personal-service', 'demographic-survey', 
      'my-projects', 'project-creation', 'project-workflow', 'model-builder',
      'evaluator-management', 'progress-monitoring', 'results-analysis',
      'ai-paper-assistant', 'export-reports', 'workshop-management',
      'decision-support-system', 'personal-settings', 'landing',
      'ahp-analysis'
    ];
    
    if (mappedTab && validTabs.includes(mappedTab)) {
      return mappedTab;
    }
    
    return 'home';
  });


  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMode, setRegisterMode] = useState<'service' | 'admin' | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  
  // 평가자 설문조사 관련 상태 (현재 미사용)
  // const [isEvaluatorSurvey, setIsEvaluatorSurvey] = useState(false);
  // const [surveyId, setSurveyId] = useState<string>('');
  // const [surveyToken, setSurveyToken] = useState<string>('');

  // 프로젝트 삭제 확인 모달 상태
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);

  // 휴지통 오버플로우 관리 상태
  const [trashOverflowData, setTrashOverflowData] = useState<{
    trashedProjects: { id: string; title: string; description: string; deleted_at: string }[];
    projectToDelete: string;
    isVisible: boolean;
  } | null>(null);

  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  // 세션 서비스 초기화
  useEffect(() => {
    sessionService.setLogoutCallback(() => {
      setUser(null);
      setActiveTab('home');
      localStorage.removeItem('ahp_temp_role');
    });
    
    // 이미 초기 상태에서 사용자 정보를 복원했으므로 여기서는 탭 설정만 처리
    if (user) {
      // 역할에 따른 초기 탭 설정
      if (user.role === 'super_admin' || user.role === 'service_admin') {
        setActiveTab('personal-service');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      }
    }
    
    // 임시 역할 체크
    const tempRole = localStorage.getItem('ahp_temp_role');
    if (tempRole && user && user.role === 'super_admin') {
      setUser(prevUser => prevUser ? { ...prevUser, role: tempRole as UserRole } : null);
    }
  }, [user]);

  // URL 파라미터 변경 감지 (로그인 여부와 관계없이 처리)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const projectParam = urlParams.get('project');
      const evalParam = urlParams.get('eval');
      
      // /evaluator 경로 또는 project/eval 파라미터가 있으면 평가자 워크플로우로
      if (window.location.pathname.includes('/evaluator') || projectParam || evalParam) {
        setActiveTab('evaluator-workflow');
        return;
      }
      
      // 로그인한 사용자의 경우에만 다른 탭 처리
      if (user) {
        // URL 파라미터 매핑 (URL에서 사용되는 짧은 이름 -> 내부 탭 이름)
        const tabMapping: { [key: string]: string } = {
          'evaluators': 'evaluator-management',  // evaluators -> evaluator-management 매핑
          'monitoring': 'progress-monitoring',
          'analysis': 'results-analysis',
          'ai-paper': 'ai-paper-assistant',
          'export': 'export-reports',
          'workshop': 'workshop-management',
          'dss': 'decision-support-system',
          'settings': 'personal-settings'
        };
        
        // URL 파라미터를 내부 탭 이름으로 변환
        const mappedTab = tabParam && tabMapping[tabParam] ? tabMapping[tabParam] : tabParam;
        
        const validTabs = [
          'home', 'user-guide', 'researcher-guide', 'evaluator-guide', 'personal-service', 'demographic-survey', 
          'my-projects', 'project-creation', 'project-workflow', 'model-builder',
          'evaluator-management', 'progress-monitoring', 'results-analysis',
          'ai-paper-assistant', 'export-reports', 'workshop-management',
          'decision-support-system', 'personal-settings'
        ];
        
        if (mappedTab && validTabs.includes(mappedTab)) {
          setActiveTab(mappedTab);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // 초기 로드 시에도 URL 파라미터 체크
    handlePopState();
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('unavailable');
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(true);

  // 초기 로딩 및 백엔드 연결 체크 (한 번만 실행)
  useEffect(() => {
    checkBackendAndInitialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 백엔드 연결 상태 모니터링 (별도 useEffect)
  useEffect(() => {
    if (backendStatus !== 'available') return;

    const intervalId = setInterval(() => {
      checkApiConnection();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [backendStatus]);
  
  // 브라우저 내비게이션 처리 (뒤로가기/앞으로가기)
  useEffect(() => {
    if (!isNavigationReady) return;
    
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.tab) {
        setActiveTab(state.tab);
        if (state.projectId) {
          setSelectedProjectId(state.projectId);
          setSelectedProjectTitle(state.projectTitle || '');
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigationReady]);
  
  // 탭 변경 시 URL 업데이트 (GitHub Pages 호환)
  useEffect(() => {
    if (!isNavigationReady || !user) return;
    
    const currentState = {
      tab: activeTab,
      projectId: selectedProjectId,
      projectTitle: selectedProjectTitle
    };
    
    // 상대 경로로 URL 처리 (GitHub Pages 호환)
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
  }, [activeTab, selectedProjectId, selectedProjectTitle, user, isNavigationReady]);
  
  // 페이지 로드 시 토큰 기반 자동 로그인
  useEffect(() => {
    const autoLogin = async () => {
      if (user) return;
      
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          sessionService.startSession();
        } catch {
          authService.clearTokens();
        }
      }
    };

    if (isNavigationReady) {
      autoLogin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigationReady, user]);

  // 페이지 새로고침 시 URL에서 상태 복원
  useEffect(() => {
    if (!user || !isNavigationReady) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const projectFromUrl = urlParams.get('project');
    
    if (tabFromUrl && protectedTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }

    if (projectFromUrl) {
      setSelectedProjectId(projectFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isNavigationReady]);


  const checkBackendAndInitialize = async () => {
    try {
      setBackendStatus('checking');

      const response = await api.get('/api/');

      if (response.success) {
        setBackendStatus('available');
        validateSession(); // 비동기로 세션 검증

        // AI 서비스 초기화 (고정 API 키 사용)
        try {
          // 환경변수에서 ChatGPT API 키 로드
          const FIXED_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

          // API 키를 로컬 스토리지에 저장하고 AI 서비스 초기화
          const aiService = FIXED_API_KEY ? setAPIKeyDirectly(FIXED_API_KEY, 'openai') : null;

          if (aiService) {
            // API 키 유효성 검증
            try {
              await aiService.validateAPIKey();
            } catch {
              // API key validation is non-critical; continue
            }
          }
        } catch {
          // AI service init is non-critical; backend status handles unavailability
        }
      } else {
        setBackendStatus('unavailable');
      }
    } catch (error) {
      setBackendStatus('unavailable');
    } finally {
      // 백엔드 연결 상태와 관계없이 앱 UI는 표시
      setIsNavigationReady(true);
    }
  };

  // DB 연결 실패 시 대체 모드는 현재 미사용
  // const fallbackToDemoMode = () => {
  //   setBackendStatus('unavailable');
  //   setShowApiErrorModal(false);
  //   setIsNavigationReady(true);
  // };

  // API 연결 상태 체크 (백그라운드에서 실행)
  const checkApiConnection = async () => {
    try {
      const response = await api.get('/api/');
      if (!response.success) {
        setBackendStatus('unavailable');
        setShowApiErrorModal(true);
      }
    } catch (error) {
      // 백그라운드 체크에서는 조용히 실패 처리
    }
  };

  const validateSession = async () => {
    try {
      let token = authService.getAccessToken();

      // access token이 없으면 refresh token으로 갱신 시도
      if (!token) {
        const refreshResult = await authService.refreshAccessToken();
        if (refreshResult.success) {
          token = authService.getAccessToken();
        } else {
          authService.clearTokens();
          setUser(null);
          localStorage.removeItem('ahp_user');
          return;
        }
      }

      if (!token) {
        setUser(null);
        localStorage.removeItem('ahp_user');
        return;
      }

      // 올바른 엔드포인트로 세션 검증
      const response = await api.get('/api/service/accounts/me/');

      if (response.success && response.data) {
        const restoredUser = {
          ...response.data,
          admin_type: undefined
        };
        // admin@ahp.com 슈퍼 관리자 처리
        if (restoredUser.email === 'admin@ahp.com') {
          restoredUser.role = 'super_admin';
        }
        setUser(restoredUser);
        localStorage.setItem('ahp_user', JSON.stringify(restoredUser));
        sessionService.startSession();
      } else if (response.error?.includes('인증이 필요')) {
        // access token 만료 → refresh 시도
        const refreshResult = await authService.refreshAccessToken();
        if (refreshResult.success) {
          const newToken = authService.getAccessToken();
          if (newToken) {
            // 새 토큰으로 한 번만 재검증 (재귀 방지)
            const retryRes = await api.get('/api/service/accounts/me/');
            if (retryRes.success && retryRes.data) {
              const retryUser = { ...retryRes.data, admin_type: undefined };
              if (retryUser.email === 'admin@ahp.com') retryUser.role = 'super_admin';
              setUser(retryUser);
              localStorage.setItem('ahp_user', JSON.stringify(retryUser));
              sessionService.startSession();
            } else {
              authService.clearTokens();
              setUser(null);
              localStorage.removeItem('ahp_user');
            }
          }
        } else {
          authService.clearTokens();
          setUser(null);
          localStorage.removeItem('ahp_user');
        }
      }
    } catch {
      // Session validation failure is handled by the outer logic
    }
  };

  const handleRegister = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone?: string;
    organization?: string;
    role?: string;
  }) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await authService.register(data);
      
      setUser(result.user);
      sessionService.startSession();
      
      const targetTab = result.user.role === 'evaluator' ? 'evaluator-dashboard' : 'personal-service';
      setActiveTab(targetTab);
      
      await fetchProjects();
      
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string, role?: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await authService.login(username, password);

      // admin@ahp.com은 슈퍼 관리자로 처리 (재확인)
      let finalUser = { ...result.user };
      if (result.user.email === 'admin@ahp.com') {
        finalUser.role = 'super_admin';
      }

      setUser(finalUser);
      // localStorage에 사용자 정보 저장 (수정된 finalUser 저장)
      localStorage.setItem('ahp_user', JSON.stringify(finalUser));
      sessionService.startSession();
      
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      let targetTab = '';
      if (tabParam && ['personal-service', 'my-projects', 'model-builder', 'evaluator-management', 'results-analysis'].includes(tabParam)) {
        targetTab = tabParam;
      } else if (result.user.role === 'evaluator') {
        targetTab = 'evaluator-dashboard';
      } else if (result.user.role === 'super_admin') {
        targetTab = 'personal-service'; // 슈퍼 관리자도 기본적으로 개인 서비스 화면으로
      } else {
        targetTab = 'personal-service';
      }
      
      setActiveTab(targetTab);
      await fetchProjects();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await sessionService.logout();
    
    try {
      await authService.logout();
    } catch {
      // Logout API failure is non-critical; local state is cleared regardless
    }
    
    // localStorage 정리
    localStorage.removeItem('ahp_user');
    localStorage.removeItem('ahp_temp_role');

    // 상태 초기화
    setUser(null);
    setActiveTab('home');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setProjects([]);
    setUsers([]);
    setLoginError('');
    setRegisterMode(null);
  };

  // 소셜 인증 핸들러들
  const handleGoogleAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.googleLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Google 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleKakaoAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.kakaoLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Kakao 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleNaverAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await authService.naverLogin();
    } catch (error: unknown) {
      setLoginError((error instanceof Error ? error.message : '') || 'Naver 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  // 보호된 탭 목록을 useMemo로 메모이제이션
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

  // 사용자 상태 저장 및 복원
  useEffect(() => {
    if (user) {
      // URL에서 탭 정보가 있으면 우선 사용
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      
      if (tabFromUrl && protectedTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
        return;
      }
      
      // URL에 탭이 없으면 기본 탭으로 설정 (localStorage 제거)
      // 이전 활성 탭 복원 기능은 서버 기반 사용자 설정으로 대체
      
      // 둘 다 없으면 기본 탭 설정 (자동 이동 최소화)
      if (user.role === 'super_admin') {
        setActiveTab('super-admin');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      } else {
        setActiveTab('personal-service');
      }
      
      // 프로젝트 ID 복원은 URL 파라미터 기반으로만 처리
      // localStorage 제거됨 - 서버 기반 사용자 설정으로 대체
    }
  }, [user, protectedTabs, selectedProjectId]);
  
  // 탭 변경 시 저장 (localStorage 제거)
  useEffect(() => {
    if (user && activeTab && protectedTabs.includes(activeTab)) {
      // TODO: 사용자 설정 API를 통해 마지막 활성 탭 저장
      // 현재는 세션 동안만 메모리에 유지
    }
  }, [activeTab, user, protectedTabs]);
  
  // 프로젝트 선택 시 저장 (localStorage 제거)
  useEffect(() => {
    if (selectedProjectId) {
      // TODO: 사용자 설정 API를 통해 선택된 프로젝트 저장
      // 현재는 세션 동안만 메모리에 유지
    }
  }, [selectedProjectId]);

  // 관리자 유형 선택 핸들러 (더 이상 사용하지 않음 - 통합 대시보드로 대체)
  // const handleAdminTypeSelect = (adminType: 'super' | 'personal') => {
  //   if (user) {
  //     setUser({
  //       ...user,
  //       admin_type: adminType
  //     });
  //     
  //     if (adminType === 'super') {
  //       setActiveTab('super-admin');
  //     } else {
  //       setActiveTab('personal-service');
  //     }
  //   }
  // };

  // 모드 전환 핸들러 (서비스 사용자 <-> 평가자)
  const handleModeSwitch = (targetMode: 'service' | 'evaluator') => {
    if (!user) return;
    
    // service_admin과 service_user는 모드 전환 가능
    if (user.role === 'service_admin' || user.role === 'service_user') {
      setViewMode(targetMode);
      
      if (targetMode === 'evaluator') {
        setActiveTab('evaluator-mode');
      } else {
        setActiveTab('personal-service');
      }
    }
  };

  // API 오류 모달 핸들러들
  const handleApiRetry = () => {
    setShowApiErrorModal(false);
    checkBackendAndInitialize();
  };


  const handleCloseApiError = () => {
    setShowApiErrorModal(false);
  };

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      // getProjects()가 이미 criteria_count, alternatives_count를 포함해 반환함
      const projectsData = await cleanDataService.getProjects();

      const projectsWithCounts: UserProject[] = projectsData.map((project) => {
        const criteriaCount = project.criteria_count ?? 0;
        const alternativesCount = project.alternatives_count ?? 0;
        // evaluators는 project.settings.evaluators 또는 evaluatorCount(member_count) 사용
        const settingsEvaluators = project.settings?.evaluators;
        const evaluatorCount =
          (Array.isArray(settingsEvaluators) ? settingsEvaluators.length : undefined) ??
          project.evaluatorCount ??
          0;
        // 진행률: 기준(40%) + 대안(40%) + 평가자(20%)
        const completion_rate =
          (criteriaCount >= 3 ? 40 : 0) +
          (alternativesCount >= 2 ? 40 : 0) +
          (evaluatorCount >= 1 ? 20 : 0);

        return {
          ...project,
          criteria_count: criteriaCount,
          alternatives_count: alternativesCount,
          evaluator_count: evaluatorCount,
          completion_rate,
          last_modified: project.updated_at ?? project.created_at ?? new Date().toISOString(),
          evaluation_method: (project as ProjectData & { evaluation_method?: 'pairwise' | 'direct' | 'mixed' }).evaluation_method ?? 'pairwise',
        } as UserProject;
      });

      setProjects(projectsWithCounts);
    } catch (error) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 프로젝트 생성 함수 (DB 저장 - dataService_clean 사용)
  // 에러는 re-throw하여 호출한 컴포넌트(ProjectCreation.tsx)에서 폼 내 메시지로 표시
  const createProject = async (projectData: Partial<ProjectData>) => {
    const newProject = await cleanDataService.createProject({
      title: projectData.title ?? '',
      description: projectData.description ?? '',
      objective: projectData.objective ?? '',
      status: projectData.status ?? 'draft',
      evaluation_mode: projectData.evaluation_mode ?? 'practical',
      workflow_stage: projectData.workflow_stage ?? 'creating',
      ahp_type: projectData.ahp_type ?? 'general',
      require_demographics: projectData.require_demographics ?? false,
      evaluation_flow_type: projectData.evaluation_flow_type ?? 'ahp_first'
    });

    if (newProject) {
      await fetchProjects(); // 목록 새로고침
      setSelectedProjectId(newProject.id || '');
      setActiveTab('project-workflow');
      return newProject;
    }

    throw new Error('프로젝트 생성에 실패했습니다. 다시 시도해주세요.');
  };

  // 기준(Criteria) CRUD 함수들
  const fetchCriteria = async (projectId: string) => {
    try {
      return await cleanDataService.getCriteria(projectId);
    } catch (error) {
      return [];
    }
  };

  const createCriteria = async (projectId: string, criteriaData: Record<string, unknown>) => {
    return await cleanDataService.createCriteria({
      ...criteriaData,
      project_id: projectId
    } as Omit<CriteriaData, 'id'>);
  };

  // 대안(Alternatives) CRUD 함수들
  const fetchAlternatives = async (projectId: string) => {
    try {
      return await cleanDataService.getAlternatives(projectId);
    } catch (error) {
      return [];
    }
  };

  const createAlternative = async (projectId: string, alternativeData: Record<string, unknown>) => {
    return await cleanDataService.createAlternative({
      ...alternativeData,
      project_id: projectId
    } as Omit<AlternativeData, 'id'>);
  };

  // 평가 데이터 저장
  const saveEvaluation = async (projectId: string, evaluationData: Record<string, unknown>) => {
    return await cleanDataService.saveEvaluation({
      project_id: projectId,
      ...evaluationData
    } as PairwiseComparisonData);
  };

  // 프로젝트 삭제 (휴지통으로 이동)
  const deleteProject = async (projectId: string) => {
    try {
      // dataService_clean.ts의 deleteProject 사용 (정확한 API 엔드포인트 사용)
      const success = await cleanDataService.deleteProject(projectId);

      if (success) {
        await fetchProjects(); // 목록 새로고침
        return true;
      } else {
        throw new Error('프로젝트 삭제에 실패했습니다.');
      }
    } catch (error) {
      // 에러를 다시 throw하여 호출자가 처리하도록 함
      throw error;
    }
  };

  // 휴지통 프로젝트 조회
  const fetchTrashedProjects = async () => {
    try {
      return await cleanDataService.getTrashedProjects();
    } catch (error) {
      return [];
    }
  };

  // 휴지통에서 복원
  const restoreProject = async (projectId: string) => {
    const success = await cleanDataService.restoreProject(projectId);
    if (success) {
      await fetchProjects();
      return true;
    }
    throw new Error('프로젝트 복원에 실패했습니다.');
  };

  // 영구 삭제
  const permanentDeleteProject = async (projectId: string): Promise<void> => {
    const success = await cleanDataService.permanentDeleteProject(projectId);
    if (!success) {
      throw new Error('영구 삭제에 실패했습니다.');
    }
  };

  // 휴지통 오버플로우 처리
  const handleTrashOverflow = async (projectToDeleteAfterCleanup: string) => {
    setTrashOverflowData(null);
    await cleanDataService.permanentDeleteProject(projectToDeleteAfterCleanup);
    await fetchProjects();
  };

  const handleTrashOverflowCancel = () => {
    setTrashOverflowData(null);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/service/accounts/');
      if (response.success && response.data) {
        const data = response.data;
        setUsers(Array.isArray(data) ? (data as User[]) : ((data.results || data.users || []) as User[]));
      } else if (!response.success) {
        showActionMessage('error', response.error || '사용자 목록을 불러오지 못했습니다.');
      }
    } catch (error) {
      showActionMessage('error', '사용자 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 관리 함수들
  const createUser = async (userData: Record<string, unknown>) => {
    const response = await api.post('/api/service/accounts/', userData);
    if (!response.success) {
      throw new Error(response.error || '사용자 생성에 실패했습니다.');
    }
    await fetchUsers();
  };

  const updateUser = async (userId: string, userData: Record<string, unknown>) => {
    const response = await api.patch(`/api/service/accounts/${userId}/`, userData);
    if (!response.success) {
      throw new Error(response.error || '사용자 수정에 실패했습니다.');
    }
    await fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    const response = await api.delete(`/api/service/accounts/${userId}/`);
    if (!response.success) {
      throw new Error(response.error || '사용자 삭제에 실패했습니다.');
    }
    await fetchUsers();
  };

  const createSampleProject = async () => {
    try {
      await cleanDataService.createProject({
        title: '샘플 AHP 프로젝트',
        description: 'AHP 의사결정 분석을 위한 샘플 프로젝트입니다.',
        objective: '최적의 대안을 선택하기 위한 다기준 의사결정',
        status: 'draft',
        evaluation_mode: 'practical',
        workflow_stage: 'creating'
      });
      fetchProjects();
    } catch (error) {
      // 샘플 프로젝트 생성 실패 무시
    }
  };

  // 효율적인 탭 전환 함수
  const changeTab = useCallback((newTab: string, projectId?: string, projectTitle?: string) => {
    setActiveTab(newTab);
    if (projectId) {
      setSelectedProjectId(projectId);
      setSelectedProjectTitle(projectTitle || '');
    }
  }, []);
  
  // Navigation handlers
  const handleLoginClick = () => {
    changeTab('login');
    setRegisterMode(null);
  };

  const handleBackToLogin = () => {
    changeTab('login');
    setRegisterMode(null);
    setLoginError('');
  };

  // Workflow handlers with improved navigation
  const handleGetStarted = () => {
    changeTab('personal-projects');
  };


  const handleModelFinalized = () => {
    changeTab('evaluation-results');
  };

  const handleAdminEvaluationComplete = () => {
    changeTab('project-completion');
  };

  const handleProjectStatusChange = (status: 'terminated' | 'completed') => {
    changeTab('personal-projects');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  const handleProjectSelect = (projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
  };

  // Evaluator workflow handlers
  const handleEvaluatorProjectSelect = (projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    
    const targetTab = evaluationMethod === 'pairwise' ? 'pairwise-evaluation' : 'direct-evaluation';
    changeTab(targetTab, projectId, projectTitle);
  };

  const handleEvaluatorEvaluationComplete = () => {
    changeTab('evaluator-dashboard');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  useEffect(() => {
    if (user && (activeTab === 'personal-projects' || activeTab === 'personal-service' || activeTab === 'welcome' || activeTab === 'my-projects' || activeTab === 'home')) {
      fetchProjects();
    } else if (user && activeTab === 'personal-users' && (user.role === 'super_admin' || user.role === 'service_admin')) {
      fetchUsers();
    } else if (!user) {
      setProjects([]);
    }
  }, [user, activeTab, fetchProjects, fetchUsers]);

  // 로그인 후 리다이렉트 처리를 렌더링 시점에서 직접 처리

  const renderContent = () => {
    // 로그인하지 않은 상태에서는 메인페이지와 관련 페이지만 렌더링
    if (!user) {
      
      switch (activeTab) {
        case 'home':
          return <HomePage onLoginClick={handleLoginClick} />;
        
        case 'login':
          // 직접 통합 인증 페이지로 이동 (단계 완전 간소화)
          return (
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
                  role: role || 'user'
                });
              }}
              onGoogleAuth={handleGoogleAuth}
              onKakaoAuth={handleKakaoAuth}
              onNaverAuth={handleNaverAuth}
              loading={loginLoading}
              error={loginError}
            />
          );

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

        case 'evaluator-workflow':
          // 평가자 워크플로우는 로그인 없이도 접근 가능
          const urlParams = new URLSearchParams(window.location.search);
          const projectId = urlParams.get('eval') || urlParams.get('project'); // eval 또는 project 파라미터 지원
          const evaluatorToken = urlParams.get('token') || urlParams.get('key'); // token 또는 key 파라미터 지원
          
          if (projectId) {
            return (
              <EvaluatorWorkflow 
                projectId={projectId}
                evaluatorToken={evaluatorToken || undefined}
              />
            );
          } else {
            // 프로젝트 ID가 없으면 홈으로 리다이렉트
            return <HomePage onLoginClick={handleLoginClick} />;
          }
        
        case 'anonymous-evaluation':
        case 'qr-evaluation':
          // QR 코드 기반 익명 평가 (로그인 불필요)
          const qrUrlParams = new URLSearchParams(window.location.search);
          const qrProjectId = qrUrlParams.get('p');
          const sessionId = qrUrlParams.get('s');
          
          if (qrProjectId && sessionId) {
            return (
              <AnonymousEvaluator />
            );
          } else {
            return <HomePage onLoginClick={handleLoginClick} />;
          }
        
        default:
          // 로그인하지 않은 상태에서 보호된 페이지 접근 시 직접 로그인 페이지로 이동
          if (protectedTabs.includes(activeTab)) {
            return (
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
                    role: role || 'user'
                  });
                }}
                onGoogleAuth={handleGoogleAuth}
                onKakaoAuth={handleKakaoAuth}
                onNaverAuth={handleNaverAuth}
                loading={loginLoading}
                error={loginError}
              />
            );
          }
          // 그 외의 경우만 홈으로 리다이렉트
          return <HomePage onLoginClick={handleLoginClick} />;
      }
    }
    
    // 로그인한 상태에서의 라우팅
    switch (activeTab) {
      case 'home':
      case 'register':
      case 'welcome':
        // 로그인된 사용자가 home에 접근하면 적절한 대시보드로 자동 리다이렉트
        // 사용자 역할에 따라 적절한 대시보드로 리다이렉트
        const redirectTab = user.role === 'evaluator' ? 'evaluator-dashboard' : 'personal-service';
        
        // URL도 함께 업데이트하여 주소창의 ?tab=home을 제거
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('tab', redirectTab);
        window.history.replaceState(null, '', newUrl.toString());
        
        // activeTab을 즉시 변경
        setActiveTab(redirectTab);
        
        // 변경된 탭으로 다시 렌더링하기 위해 임시 로딩 표시
        return <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">대시보드로 이동 중...</p>
          </div>
        </div>;
        
      case 'personal-service':
      case 'admin-dashboard':  
      case 'user-home':
        // 개인 서비스 모드 대시보드 (일반 사용자, 서비스 관리자)
        const storedUserStr = localStorage.getItem('ahp_user');
        const isSuperMode = localStorage.getItem('ahp_super_mode') === 'true';
        let isAdminEmail = false;
        
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            isAdminEmail = storedUser.email === 'admin@ahp.com';
          } catch {
            // corrupted localStorage data, skip
          }
        }
        
        // 슈퍼 관리자 모드가 켜져 있으면 슈퍼 관리자 대시보드로
        if ((user?.role === 'super_admin' || isAdminEmail) && isSuperMode) {
          return (
            <SuperAdminDashboard 
              user={user}
              onTabChange={setActiveTab}
            />
          );
        }
        
        // 아니면 개인 서비스 대시보드로
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

      case 'super-admin':
      case 'super-admin-dashboard':
        // 슈퍼 관리자 대시보드
        return (
          <SuperAdminDashboard 
            user={user}
            onTabChange={setActiveTab}
          />
        );
      
      case 'role-switch-admin':
        // 서비스 관리자로 전환
        return (
          <RoleSwitcher
            currentUser={user}
            targetRole="service_admin"
            onRoleSwitch={(role) => {
              // 역할 전환
              const updatedUser = { ...user, role };
              setUser(updatedUser);
              // localStorage에 저장하여 새로고침 후에도 유지
              localStorage.setItem('ahp_temp_role', role);
              setActiveTab('personal-service');
            }}
            onBack={() => setActiveTab('super-admin-dashboard')}
          />
        );
      
      case 'role-switch-user':
        // 서비스 사용자로 전환
        return (
          <RoleSwitcher
            currentUser={user}
            targetRole="service_user"
            onRoleSwitch={(role) => {
              const updatedUser = { ...user, role };
              setUser(updatedUser);
              localStorage.setItem('ahp_temp_role', role);
              setActiveTab('personal-service');
            }}
            onBack={() => setActiveTab('super-admin-dashboard')}
          />
        );
      
      case 'role-switch-evaluator':
        // 평가자로 전환
        return (
          <RoleSwitcher
            currentUser={user}
            targetRole="evaluator"
            onRoleSwitch={(role) => {
              const updatedUser = { ...user, role };
              setUser(updatedUser);
              localStorage.setItem('ahp_temp_role', role);
              setActiveTab('evaluator-mode');
            }}
            onBack={() => setActiveTab('super-admin-dashboard')}
          />
        );
      
      case 'system-reset':
        // 시스템 초기화
        return (
          <SystemReset
            onBack={() => setActiveTab('super-admin-dashboard')}
            onReset={(options) => {
                // TODO: 실제 초기화 API 호출
              showActionMessage('success', '시스템 초기화가 완료되었습니다.');
            }}
          />
        );

      case 'dashboard':
        // 역할별 대시보드 자동 라우팅
        return (
          <RoleBasedDashboard 
            user={user}
            onTabChange={setActiveTab}
            viewMode={viewMode}
          />
        );

      case 'users':
        // 슈퍼 관리자 사용자 관리 페이지 - Django 백엔드 연동
        return <RealUserManagement />;
        
      case 'all-projects':
        // 전체 프로젝트 관리
        return <AllProjectsManagement />;
      
      case 'system-info':
        // 시스템 정보
        return <SystemInfo />;
      
      case 'system-monitoring':
        // 시스템 모니터링
        return <SystemMonitoring />;
      
      case 'system-settings':
        // 시스템 설정
        return <SystemSettings />;

      case 'payment-options':
        // 결제 옵션 관리
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

      case 'evaluator-workflow':
        // 로그인한 상태에서도 평가자 워크플로우 접근 가능
        const urlParams2 = new URLSearchParams(window.location.search);
        const projectId2 = urlParams2.get('eval') || urlParams2.get('project'); // eval 또는 project 파라미터 지원
        const evaluatorToken2 = urlParams2.get('token') || urlParams2.get('key'); // token 또는 key 파라미터 지원
        
        if (projectId2) {
          return (
            <EvaluatorWorkflow 
              projectId={projectId2}
              evaluatorToken={evaluatorToken2 || undefined}
            />
          );
        } else {
          // 프로젝트 ID가 없으면 개인 서비스로 리다이렉트
          setActiveTab('personal-service');
          return null;
        }

      case 'evaluator-survey':
        // 평가자 전용 설문조사 페이지 (현재 미사용)
        // if (isEvaluatorSurvey && surveyId && surveyToken) {
        //   return (
        //     <EvaluatorSurveyPage 
        //       surveyId={surveyId}
        //       token={surveyToken}
        //     />
        //   );
        // }
        // 평가자 설문 정보가 없으면 대시보드로
        setActiveTab('personal-service');
        return null;

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
        // Django 관리자 페이지 연동은 super_admin, service_admin만 접근 가능
        if (user.role === 'super_admin' || user.role === 'service_admin') {
          return <DjangoAdminIntegration user={user} />;
        }
        // 권한이 없는 경우 대시보드로 리다이렉트
        setActiveTab('dashboard');
        return null;

      case 'evaluator-mode':
        // 로그인한 사용자의 경우
        if (user.role === 'evaluator') {
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
              onLogout={handleLogout}
            />
          );
        } else {
          // 관리자가 평가자 모드를 체험하는 경우
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
            />
          );
        }

      case 'demographic-survey':
        return (
          <PersonalServiceDashboard
            user={user}
            activeTab="demographic-survey"
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
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        );
        
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
        return <AHPProjectManager />;

      case 'landing':
        return (
          <LandingPage 
            user={user}
            onGetStarted={handleGetStarted}
          />
        );

      case 'model-building':
        if (!selectedProjectId) {
          return (
            <Card title="모델 구축">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
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
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
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
            onBack={() => setActiveTab('model-building')}
            onComplete={handleAdminEvaluationComplete}
          />
        );

      case 'project-completion':
        if (!selectedProjectId) {
          return (
            <Card title="프로젝트 완료">
              <div className="text-center py-8">
                <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
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
          <ProjectCompletion
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
            onBack={() => setActiveTab('evaluation-results')}
            onProjectStatusChange={handleProjectStatusChange}
          />
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
                    <button
                      onClick={() => setActiveTab('project-creation')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      새 프로젝트 생성
                    </button>
                    <button
                      onClick={createSampleProject}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      샘플 프로젝트 생성
                    </button>
                  </div>
                </div>
                
                {projects.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    프로젝트가 없습니다. 새 프로젝트를 생성해보세요.
                  </div>
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
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleProjectSelect(project.id ?? '', project.title);
                                setActiveTab('model-building');
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="편집"
                              type="button"
                            >
                              <EditIcon preset="button" hover />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleProjectSelect(project.id ?? '', project.title);
                                setActiveTab('model-building');
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="모델 구축"
                              type="button"
                            >
                              <UIIcon emoji="🏗️" preset="button" color="success" hover />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleProjectSelect(project.id ?? '', project.title);
                                setActiveTab('results-analysis');
                              }}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="결과 분석"
                              type="button"
                            >
                              <UIIcon emoji="📊" preset="button" color="info" hover />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPendingDeleteProjectId(project.id ?? null);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                              type="button"
                            >
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
        if (!user) return null;
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
        // personal-service로 리다이렉트
        setActiveTab('personal-service');
        return null;
    }
  };


  // 로그인한 사용자만 Layout과 함께 렌더링
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
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
        </Layout>
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
        <Modal
          isOpen={!!pendingDeleteProjectId}
          onClose={() => setPendingDeleteProjectId(null)}
          title="프로젝트 삭제 확인"
          size="sm"
          footer={
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPendingDeleteProjectId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!pendingDeleteProjectId) return;
                  const idToDelete = pendingDeleteProjectId;
                  setPendingDeleteProjectId(null);
                  try {
                    await deleteProject(idToDelete);
                  } catch {
                    showActionMessage('error', '프로젝트 삭제에 실패했습니다.');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
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

  // 로그인하지 않은 사용자는 Layout 없이 렌더링 (홈페이지, 로그인, 회원가입)
  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      <Suspense fallback={<PageLoader />}>
        {renderContent()}
      </Suspense>
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
    </div>
  );
}

export default App;
