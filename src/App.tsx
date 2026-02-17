import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import './index.css';
import './App.css';
import sessionService from './services/sessionService';
import authService from './services/authService';
import cleanDataService from './services/dataService_clean';
import { setAPIKeyDirectly } from './utils/aiInitializer';
import type { User, UserRole } from './types';
import { API_BASE_URL } from './config/api';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
import LoadingFallback from './components/common/LoadingFallback';
import AppRouter from './router/AppRouter';

// ─── Eager imports (항상 필요한 핵심 컴포넌트) ───────────────────────────────
import Layout from './components/layout/Layout';
import ApiErrorModal from './components/common/ApiErrorModal';
import TrashOverflowModal from './components/common/TrashOverflowModal';

// 라우팅은 AppRouter.tsx에서 담당 (코드 스플리팅 포함)

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

  // AppRouter에 전달할 공통 props 모음
  const routerProps = {
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
  };


  // ─── Suspense fallback (Code Splitting) ─────────────────────────────────────
  const PageFallback = <LoadingFallback message="페이지 로딩 중..." />;

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
          <Suspense fallback={PageFallback}>
            <AppRouter {...routerProps} />
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
      </div>
    );
  }

  // 로그인하지 않은 사용자는 Layout 없이 렌더링 (홈페이지, 로그인, 회원가입)
  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Suspense fallback={<LoadingFallback message="로딩 중..." fullScreen />}>
        <AppRouter {...routerProps} />
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
