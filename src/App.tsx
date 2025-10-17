import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';
import './App.css';
import sessionService from './services/sessionService';
import authService from './services/authService';
import cleanDataService from './services/dataService_clean';
import { setAPIKeyDirectly } from './utils/aiInitializer';
import type { User, UserRole } from './types';
import Layout from './components/layout/Layout';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LoginForm from './components/auth/LoginForm';
import UnifiedAuthPage from './components/auth/UnifiedAuthPage';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './components/home/HomePage';
// import WelcomeDashboard from './components/admin/WelcomeDashboard'; // 더 이상 사용하지 않음
import Card from './components/common/Card';
import UIIcon, { EditIcon, DeleteIcon } from './components/common/UIIcon';
import ApiErrorModal from './components/common/ApiErrorModal';
import TrashOverflowModal from './components/common/TrashOverflowModal';
import PairwiseComparison from './components/comparison/PairwiseComparison';
import ResultsDashboard from './components/results/ResultsDashboard';
import AHPProjectManager from './components/ahp/AHPProjectManager';
import LandingPage from './components/admin/LandingPage';
import EnhancedSuperAdminDashboard from './components/admin/EnhancedSuperAdminDashboard';
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import ModelBuilding from './components/admin/ModelBuilding';
import EvaluationResults from './components/admin/EvaluationResults';
import ProjectCompletion from './components/admin/ProjectCompletion';
import ProjectWorkflow from './components/admin/ProjectWorkflow';
import UserManagement from './components/admin/UserManagement';
import RealUserManagement from './components/admin/RealUserManagement';
import ProjectSelection from './components/evaluator/ProjectSelection';
import PairwiseEvaluation from './components/evaluator/PairwiseEvaluation';
import DirectInputEvaluation from './components/evaluator/DirectInputEvaluation';
import ComprehensiveUserGuide from './components/guide/ComprehensiveUserGuide';
import ResearcherGuidePage from './components/guide/ResearcherGuidePage';
import EvaluatorGuidePage from './components/guide/EvaluatorGuidePage';
import AIResearchGuidePage from './components/guide/AIResearchGuidePage';
import EvaluatorDashboard from './components/evaluator/EvaluatorDashboard';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import EvaluatorSurveyPage from './components/survey/EvaluatorSurveyPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DemographicSurvey from './components/survey/DemographicSurvey';
import EvaluationTest from './components/evaluation/EvaluationTest';
import EvaluatorWorkflow from './components/evaluator/EvaluatorWorkflow';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import QRCodeEvaluatorAssignment from './components/evaluation/QRCodeEvaluatorAssignment';
import AnonymousEvaluator from './components/evaluation/AnonymousEvaluator';
import ConnectionTestPage from './components/demo/ConnectionTestPage';
import RoleBasedDashboard from './components/common/RoleBasedDashboard';
import DjangoAdminIntegration from './components/admin/DjangoAdminIntegration';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import RoleSwitcher from './components/superadmin/RoleSwitcher';
import SystemReset from './components/superadmin/SystemReset';
import AllProjectsManagement from './components/superadmin/AllProjectsManagement';
import SystemInfo from './components/superadmin/SystemInfo';
import SystemMonitoring from './components/superadmin/SystemMonitoring';
import SystemSettings from './components/superadmin/SystemSettings';
import PaymentOptionsPage from './components/superadmin/PaymentOptionsPage';
import AHPMethodologyPage from './components/methodology/AHPMethodologyPage';
import FuzzyAHPMethodologyPage from './components/methodology/FuzzyAHPMethodologyPage';
import AIPaperGenerationPage from './components/ai-paper/AIPaperGenerationPage';
import AIResultsInterpretationPage from './components/ai-interpretation/AIResultsInterpretationPage';
import AIQualityValidationPage from './components/ai-quality/AIQualityValidationPage';
import AIMaterialsGenerationPage from './components/ai-materials/AIMaterialsGenerationPage';
import AIChatbotAssistantPage from './components/ai-chatbot/AIChatbotAssistantPage';
import TestPage from './pages/TestPage';
import { API_BASE_URL } from './config/api';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
// DEMO 데이터 제거 - 실제 DB만 사용

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  // GitHub Pages 하위 경로 처리 - 현재는 루트에 배포되므로 빈 문자열
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const basePath = '';
  
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
          console.log('🔑🔑🔑 초기 복원 - 슈퍼 관리자 권한 강제 부여!');
          console.log('🔑 이메일:', parsedUser.email);
          console.log('🔑 역할:', parsedUser.role);
          
          // 전역 변수로도 설정
          (window as any).__SUPER_ADMIN__ = true;
        }
        console.log('🚀 초기 사용자 정보 복원:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('초기 사용자 정보 복원 실패:', error);
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
      console.log('🎯 평가자 워크플로우 탭 활성화:', { evalParam, projectParam, pathname: window.location.pathname });
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

  // activeTab 변경 추적을 위한 useEffect 추가
  useEffect(() => {
    console.log('🎯 App.tsx activeTab 변경됨:', activeTab);
  }, [activeTab]);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMode, setRegisterMode] = useState<'service' | 'admin' | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEvaluationMethod, setSelectedEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  
  // 평가자 설문조사 관련 상태 (현재 미사용)
  // const [isEvaluatorSurvey, setIsEvaluatorSurvey] = useState(false);
  // const [surveyId, setSurveyId] = useState<string>('');
  // const [surveyToken, setSurveyToken] = useState<string>('');

  // 휴지통 오버플로우 관리 상태
  const [trashOverflowData, setTrashOverflowData] = useState<{
    trashedProjects: any[];
    projectToDelete: string;
    isVisible: boolean;
  } | null>(null);

  // 세션 서비스 초기화
  useEffect(() => {
    sessionService.setLogoutCallback(() => {
      setUser(null);
      setActiveTab('home');
      localStorage.removeItem('ahp_temp_role');
    });
    
    // 이미 초기 상태에서 사용자 정보를 복원했으므로 여기서는 탭 설정만 처리
    if (user) {
      console.log('📌 사용자 역할 확인:', user.role);
      
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
        console.log('🔄 URL 변경으로 평가자 워크플로우 활성화:', { pathname: window.location.pathname, projectParam, evalParam });
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
    console.log('🚀 앱 초기화 - 백엔드 연결 확인');
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
        console.log(`🔙 브라우저 내비게이션: ${state.tab}`);
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
          console.log('🎯 토큰 기반 자동 로그인 시도...');
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          sessionService.startSession();
          console.log('✅ 자동 로그인 완료:', currentUser.email);
        } catch (error) {
          console.error('자동 로그인 실패:', error);
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
      console.log(`🔄 URL에서 탭 복원: ${tabFromUrl}`);
    }
    
    if (projectFromUrl) {
      setSelectedProjectId(projectFromUrl);
      console.log(`🔄 URL에서 프로젝트 복원: ${projectFromUrl}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isNavigationReady]);


  const checkBackendAndInitialize = async () => {
    try {
      console.log('🔍 백엔드 연결 확인 중...');
      setBackendStatus('checking');
      
      const response = await fetch(`${API_BASE_URL}/api/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        console.log('✅ 백엔드 연결 성공');
        setBackendStatus('available');
        validateSession(); // 비동기로 세션 검증
        
        // AI 서비스 초기화 (고정 API 키 사용)
        try {
          console.log('🤖 AI 서비스 초기화 중... (고정 API 키 사용)');
          
          // 환경변수에서 ChatGPT API 키 로드
          const FIXED_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
          
          // API 키를 로컬 스토리지에 저장하고 AI 서비스 초기화
          const aiService = FIXED_API_KEY ? setAPIKeyDirectly(FIXED_API_KEY, 'openai') : null;
          
          if (aiService) {
            console.log('✅ AI 서비스 초기화 성공 (고정 API 키)');
            // API 키 유효성 검증
            try {
              const isValid = await aiService.validateAPIKey();
              if (isValid) {
                console.log('✅ ChatGPT API 키 유효성 검증 완료');
              } else {
                console.warn('⚠️ ChatGPT API 키 유효성 검증 실패');
              }
            } catch (validationError) {
              console.error('❌ API 키 검증 중 오류:', validationError);
            }
          } else {
            console.warn('⚠️ 환경변수에 REACT_APP_OPENAI_API_KEY가 설정되지 않음');
          }
        } catch (error) {
          console.error('❌ AI 서비스 초기화 중 예외 발생:', error);
        }
      } else {
        console.log('⚠️ 백엔드 응답 오류');
        setBackendStatus('unavailable');
      }
    } catch (error) {
      console.log('⚠️ 백엔드 연결 실패:', error);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5초 타임아웃
      
      const response = await fetch(`${API_BASE_URL}/api/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log('⚠️ API 연결 끊김');
        setBackendStatus('unavailable');
        setShowApiErrorModal(true);
      }
    } catch (error) {
      // 백그라운드 체크에서는 조용히 실패 처리
      console.log('❌ API 연결 체크 실패 (무시):', error instanceof Error ? error.message : error);
    }
  };

  const validateSession = async () => {
    try {
      // authService가 이미 localStorage + sessionStorage에서 토큰을 자동 로드함
      const token = authService.getAccessToken();
      if (!token) {
        console.log('⚠️ 토큰이 없어 세션 검증 건너뜀');
        return;
      }

      console.log('🔄 세션 검증 중... (강력한 새로고침 대응)');
      
      const response = await fetch(`${API_BASE_URL}/api/service/auth/profile/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // admin 역할일 때 admin_type을 'personal'로 설정
        const userWithAdminType = {
          ...data.user,
          admin_type: undefined // admin_type은 더 이상 사용하지 않음
        };
        setUser(userWithAdminType);
        console.log('✅ 세션 복구 성공 (localStorage에서 복원):', data.user.email);
        
        // 세션 타이머 시작
        sessionService.startSession();
      } else if (response.status === 401) {
        console.log('⚠️ 토큰 만료 - 자동 로그아웃');
        authService.clearTokens();
      }
    } catch (error) {
      console.error('Session validation failed:', error);
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
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setLoginError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string, role?: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('🔍 백엔드 로그인 시도:', { username });
      
      const result = await authService.login(username, password);
      
      console.log('🎯 로그인 결과 전체:', result);
      console.log('🎯 사용자 역할:', result.user.role);
      console.log('🎯 사용자 이메일:', result.user.email);
      
      // admin@ahp.com은 슈퍼 관리자로 처리 (재확인)
      let finalUser = { ...result.user };
      if (result.user.email === 'admin@ahp.com') {
        finalUser.role = 'super_admin';
        console.log('🔑 App.tsx - 슈퍼 관리자 권한 강제 부여');
        console.log('🔑 변경 전 role:', result.user.role);
        console.log('🔑 변경 후 role:', finalUser.role);
      }
      
      setUser(finalUser);
      // localStorage에 사용자 정보 저장 (수정된 finalUser 저장)
      localStorage.setItem('ahp_user', JSON.stringify(finalUser));
      console.log('💾 localStorage에 저장된 user:', finalUser);
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
      
      console.log('🎯 로그인 후 타겟 탭:', targetTab, '(URL 파라미터:', tabParam, ')');
      setActiveTab(targetTab);
      
      console.log('✅ 백엔드 로그인 성공');
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
    } catch (error) {
      console.error('Logout API call failed:', error);
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
    
    console.log('✅ 로그아웃 완료');
  };

  // 소셜 인증 핸들러들
  const handleGoogleAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      console.log('🔍 Google 소셜 로그인 시도');
      await authService.googleLogin();
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      setLoginError(error.message || 'Google 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleKakaoAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      console.log('🔍 Kakao 소셜 로그인 시도');
      await authService.kakaoLogin();
    } catch (error: any) {
      console.error('❌ Kakao 로그인 실패:', error);
      setLoginError(error.message || 'Kakao 로그인에 실패했습니다.');
      setLoginLoading(false);
    }
  };

  const handleNaverAuth = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      console.log('🔍 Naver 소셜 로그인 시도');
      await authService.naverLogin();
    } catch (error: any) {
      console.error('❌ Naver 로그인 실패:', error);
      setLoginError(error.message || 'Naver 로그인에 실패했습니다.');
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
      
      console.log(`🔄 모드 전환: ${targetMode}`);
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
    // 로그인하지 않은 상태에서는 프로젝트 로드하지 않음
    if (!user) {
      console.log('⚠️ 로그인하지 않은 상태 - 프로젝트 로드 스킵');
      setProjects([]);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 App.tsx fetchProjects 시작... (사용자:', user.email, ')');
      
      // cleanDataService 사용 (자동 fallback 포함)
      const projectsData = await cleanDataService.getProjects();
      console.log('📊 fetchProjects 데이터:', projectsData);
      
      // 각 프로젝트의 실제 관련 데이터 수를 조회하여 정확한 정보 제공
      const projectsWithCounts = await Promise.all(
        projectsData.map(async (project: any) => {
          try {
            const [criteriaData, alternativesData, evaluatorsData] = await Promise.all([
              cleanDataService.getCriteria(project.id || ''),
              cleanDataService.getAlternatives(project.id || ''),
              cleanDataService.getEvaluators(project.id || '')
            ]);

            const criteriaCount = criteriaData?.length || 0;
            const alternativesCount = alternativesData?.length || 0;
            const evaluatorCount = evaluatorsData?.length || 0;

            // 진행률 계산: 기준(40%) + 대안(40%) + 평가자(20%)
            const progress = ((criteriaCount >= 3 ? 40 : 0) + (alternativesCount >= 2 ? 40 : 0) + (evaluatorCount >= 1 ? 20 : 0));

            return {
              ...project,
              criteria_count: criteriaCount,
              alternatives_count: alternativesCount,
              evaluator_count: evaluatorCount,
              completion_rate: progress
            };
          } catch (error) {
            console.error('❌ 프로젝트 관련 데이터 조회 실패:', project.id, error);
            return {
              ...project,
              criteria_count: 0,
              alternatives_count: 0,
              evaluator_count: 0,
              completion_rate: 0
            };
          }
        })
      );

      console.log('✅ 프로젝트 수:', projectsWithCounts.length);
      console.log('📋 프로젝트 목록:', projectsWithCounts);
      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('❌ fetchProjects 오류:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 프로젝트 생성 함수 (DB 저장 - dataService_clean 사용)
  const createProject = async (projectData: any) => {
    console.log('🚀 App.tsx createProject 호출됨:', projectData);
    
    try {
      // dataService_clean.ts의 createProject 사용 (자동 fallback 포함)
      const newProject = await cleanDataService.createProject({
        title: projectData.title,
        description: projectData.description || '',
        objective: projectData.objective || '',
        status: projectData.status || 'draft',
        evaluation_mode: projectData.evaluation_mode || 'practical',
        workflow_stage: projectData.workflow_stage || 'creating'
      });
      
      if (newProject) {
        console.log('✅ 프로젝트 생성 성공:', newProject.id);
        await fetchProjects(); // 목록 새로고침
        
        // 프로젝트 생성 후 자동으로 모델 구축 페이지로 이동
        setSelectedProjectId(newProject.id || '');
        setActiveTab('project-workflow');
        console.log('🎯 자동 이동: project-workflow 페이지, 프로젝트 ID:', newProject.id);
        
        return newProject;
      } else {
        throw new Error('프로젝트 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ createProject 실패:', error);
      // 에러를 다시 throw하지 않고 null 반환 (사용자에게 친화적)
      return null;
    }
  };

  // 기준(Criteria) CRUD 함수들
  const fetchCriteria = async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/criteria`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.criteria || [];
      }
    } catch (error) {
      console.error('Failed to fetch criteria:', error);
    }
    return [];
  };

  const createCriteria = async (projectId: string, criteriaData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/criteria`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...criteriaData, project_id: projectId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기준 추가에 실패했습니다.');
    }

    return response.json();
  };

  // 대안(Alternatives) CRUD 함수들
  const fetchAlternatives = async (projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/alternatives`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.alternatives || [];
      }
    } catch (error) {
      console.error('Failed to fetch alternatives:', error);
    }
    return [];
  };

  const createAlternative = async (projectId: string, alternativeData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/alternatives`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...alternativeData, project_id: projectId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '대안 추가에 실패했습니다.');
    }

    return response.json();
  };

  // 평가 데이터 저장
  const saveEvaluation = async (projectId: string, evaluationData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_id: projectId, ...evaluationData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '평가 저장에 실패했습니다.');
    }

    return response.json();
  };

  // 프로젝트 삭제 (휴지통으로 이동)
  const deleteProject = async (projectId: string) => {
    console.log('🗑️ App.tsx deleteProject 호출됨:', projectId);
    
    try {
      // dataService_clean.ts의 deleteProject 사용 (정확한 API 엔드포인트 사용)
      const success = await cleanDataService.deleteProject(projectId);
      
      if (success) {
        console.log('✅ 프로젝트 삭제 성공:', projectId);
        await fetchProjects(); // 목록 새로고침
        return true;
      } else {
        throw new Error('프로젝트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ deleteProject 실패:', error);
      // 에러를 다시 throw하여 호출자가 처리하도록 함
      throw error;
    }
  };

  // 휴지통 프로젝트 조회
  const fetchTrashedProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/trash/list`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.projects || [];
      }
    } catch (error) {
      console.error('Failed to fetch trashed projects:', error);
    }
    return [];
  };

  // 휴지통에서 복원
  const restoreProject = async (projectId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/restore`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 복원에 실패했습니다.');
    }

    await fetchProjects(); // 목록 새로고침
    return response.json();
  };

  // 영구 삭제
  const permanentDeleteProject = async (projectId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/permanent`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '영구 삭제에 실패했습니다.');
    }

    return response.json();
  };

  // 휴지통 오버플로우 처리
  const handleTrashOverflow = async (projectToDeleteAfterCleanup: string) => {
    try {
      // 오버플로우 상태 닫기
      setTrashOverflowData(null);
      
      // 선택된 프로젝트를 영구 삭제한 후 원래 프로젝트를 휴지통으로 이동
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectToDeleteAfterCleanup}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '프로젝트 삭제에 실패했습니다.');
      }

      await fetchProjects(); // 목록 새로고침
      return response.json();
    } catch (error) {
      console.error('휴지통 오버플로우 처리 실패:', error);
      throw error;
    }
  };

  const handleTrashOverflowCancel = () => {
    setTrashOverflowData(null);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 관리 함수들
  const createUser = async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 생성에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const updateUser = async (userId: string, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 수정에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const deleteUser = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 삭제에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const createSampleProject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '샘플 AHP 프로젝트',
          description: 'AHP 의사결정 분석을 위한 샘플 프로젝트입니다.',
          objective: '최적의 대안을 선택하기 위한 다기준 의사결정'
        }),
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to create sample project:', error);
    }
  };

  // 효율적인 탭 전환 함수
  const changeTab = useCallback((newTab: string, projectId?: string, projectTitle?: string) => {
    setActiveTab(newTab);
    if (projectId) {
      setSelectedProjectId(projectId);
      setSelectedProjectTitle(projectTitle || '');
    }
    console.log(`📦 탭 전환: ${newTab}${projectId ? ` (프로젝트: ${projectTitle})` : ''}`);
  }, []);
  
  // Navigation handlers
  const handleLoginClick = () => {
    changeTab('login');
    setRegisterMode(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRegisterClick = () => {
    setRegisterMode('service');
    changeTab('register');
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
    console.log(`📊 프로젝트 ${selectedProjectId} 상태 변경: ${status}`);
    changeTab('personal-projects');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
  };

  const handleProjectSelect = (projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    console.log(`📋 프로젝트 선택됨: ${projectTitle}`);
  };

  // Evaluator workflow handlers
  const handleEvaluatorProjectSelect = (projectId: string, projectTitle: string, evaluationMethod: 'pairwise' | 'direct') => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    setSelectedEvaluationMethod(evaluationMethod);
    
    const targetTab = evaluationMethod === 'pairwise' ? 'pairwise-evaluation' : 'direct-evaluation';
    changeTab(targetTab, projectId, projectTitle);
  };

  const handleEvaluatorEvaluationComplete = () => {
    changeTab('evaluator-dashboard');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    console.log('✅ 평가자 평가 완료');
  };

  useEffect(() => {
    if (user && (activeTab === 'personal-projects' || activeTab === 'personal-service' || activeTab === 'welcome' || activeTab === 'my-projects' || activeTab === 'home')) {
      console.log('🔄 사용자 로그인 확인됨 - 프로젝트 로드 시작 (탭:', activeTab, ')');
      fetchProjects();
    } else if (user && activeTab === 'personal-users' && (user.role === 'super_admin' || user.role === 'service_admin')) {
      fetchUsers();
    } else if (!user) {
      console.log('⚠️ 로그인하지 않은 상태 - 프로젝트 초기화');
      setProjects([]);
    }
  }, [user, activeTab, fetchProjects, fetchUsers]);

  // 로그인 후 리다이렉트 처리를 렌더링 시점에서 직접 처리

  const renderContent = () => {
    console.log('🎯 App.tsx renderContent 호출됨:', { 
      activeTab, 
      user: !!user, 
      userRole: user?.role,
      userEmail: user?.email 
    });

    // 로그인하지 않은 상태에서는 메인페이지와 관련 페이지만 렌더링
    if (!user) {
      console.log('❌ 로그인하지 않은 상태 - 기본 페이지 렌더링');
      
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
    console.log('✅ 로그인된 사용자 - 탭별 라우팅:', activeTab);
    switch (activeTab) {
      case 'home':
      case 'register':
      case 'welcome':
        // 로그인된 사용자가 home에 접근하면 적절한 대시보드로 자동 리다이렉트
        console.log('🔄 로그인된 사용자 home 접근 - 자동 리다이렉트 처리');
        
        // 사용자 역할에 따라 적절한 대시보드로 리다이렉트
        const redirectTab = user.role === 'evaluator' ? 'evaluator-dashboard' : 'personal-service';
        console.log(`🎯 ${user.role} 역할 → ${redirectTab}로 리다이렉트`);
        
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
          } catch (e) {
            console.error('Failed to parse user:', e);
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
              console.log('시스템 초기화 실행:', options);
              // TODO: 실제 초기화 API 호출
              alert('시스템 초기화가 완료되었습니다.');
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
        console.log('🎯 PersonalServiceDashboard_Enhanced 렌더링 (my-projects/project-creation/wizard):', { activeTab, userId: user.id, userRole: user.role });
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
        console.log('🎯 PersonalServiceDashboard_Enhanced 렌더링:', { activeTab, userId: user.id, userRole: user.role });
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
        console.log('🔍 프로젝트 관리 렌더링 - 현재 프로젝트:', projects);
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
                    {projects.map((project: any) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                                // TODO: 편집 기능 구현
                                console.log('편집:', project.id);
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
                                handleProjectSelect(project.id, project.title);
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
                                handleProjectSelect(project.id, project.title);
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
                                // TODO: 삭제 기능 구현
                                if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
                                  console.log('삭제:', project.id);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                              type="button"
                            >
                              <DeleteIcon preset="button" hover />
                            </button>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(project.created_at).toLocaleDateString()}
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
        return (
          <Card title="환영합니다">
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                AHP 의사결정 지원 시스템에 오신 것을 환영합니다!
              </h3>
              <p className="text-gray-600">
                다기준 의사결정 분석을 위한 전문 도구입니다.
              </p>
            </div>
          </Card>
        );
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
          {renderContent()}
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
      </div>
    );
  }

  // 로그인하지 않은 사용자는 Layout 없이 렌더링 (홈페이지, 로그인, 회원가입)
  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {renderContent()}
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
