import React, { useState, useEffect, useCallback, useMemo } from 'react';
import sessionService from './services/sessionService';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './components/home/HomePage';
// import WelcomeDashboard from './components/admin/WelcomeDashboard'; // 더 이상 사용하지 않음
import Card from './components/common/Card';
import ApiErrorModal from './components/common/ApiErrorModal';
import PairwiseComparison from './components/comparison/PairwiseComparison';
import ResultsDashboard from './components/results/ResultsDashboard';
import LandingPage from './components/admin/LandingPage';
import EnhancedSuperAdminDashboard from './components/admin/EnhancedSuperAdminDashboard';
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import ModelBuilding from './components/admin/ModelBuilding';
import EvaluationResults from './components/admin/EvaluationResults';
import ProjectCompletion from './components/admin/ProjectCompletion';
import UserManagement from './components/admin/UserManagement';
import ProjectSelection from './components/evaluator/ProjectSelection';
import PairwiseEvaluation from './components/evaluator/PairwiseEvaluation';
import DirectInputEvaluation from './components/evaluator/DirectInputEvaluation';
import UserGuideOverview from './components/guide/UserGuideOverview';
import ComprehensiveUserGuide from './components/guide/ComprehensiveUserGuide';
import EvaluatorDashboard from './components/evaluator/EvaluatorDashboard';
import EvaluatorSurveyPage from './components/survey/EvaluatorSurveyPage';
import EvaluationTest from './components/evaluation/EvaluationTest';
import { API_BASE_URL } from './config/api';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
import { 
  DEMO_USER, 
  DEMO_PROJECTS, 
  DEMO_CRITERIA,
  DEMO_ALTERNATIVES
  // isBackendAvailable, DEMO_LOGIN_CREDENTIALS - 현재 미사용 (데모 모드 강제 활성화)
} from './data/demoData';

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();
  const [user, setUser] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'evaluator';
    admin_type?: 'super' | 'personal'; // 관리자 유형 구분
    canSwitchModes?: boolean; // 모드 전환 가능 여부
  } | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    // URL 파라미터에서 초기 탭 결정
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    // tab 파라미터가 있고 유효한 탭이면 해당 탭으로, 아니면 'home'
    const validTabs = [
      'home', 'user-guide', 'evaluator-mode',
      'personal-service', 'demographic-survey', 
      'my-projects', 'project-creation', 'model-builder',
      'evaluator-management', 'progress-monitoring', 'results-analysis',
      'paper-management', 'export-reports', 'workshop-management',
      'decision-support-system', 'personal-settings'
    ];
    
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    
    return 'home';
  });
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
  const [isDemoMode, setIsDemoMode] = useState(false); // 실제 서비스 모드로 운영
  
  // 평가자 설문조사 관련 상태
  const [isEvaluatorSurvey, setIsEvaluatorSurvey] = useState(false);
  const [surveyId, setSurveyId] = useState<string>('');
  const [surveyToken, setSurveyToken] = useState<string>('');

  // 평가자 설문조사 경로 확인
  useEffect(() => {
    // 먼저 sessionStorage에서 리다이렉트 정보 확인
    const surveyRedirect = sessionStorage.getItem('survey_redirect');
    if (surveyRedirect) {
      const data = JSON.parse(surveyRedirect);
      sessionStorage.removeItem('survey_redirect');
      
      // survey-001-token-abc123 형태를 파싱
      const parts = data.id.split('-token-');
      if (parts.length === 2) {
        setSurveyId(parts[0]);
        setSurveyToken(parts[1]);
        setIsEvaluatorSurvey(true);
        setActiveTab('evaluator-survey');
        return;
      }
    }
    
    // URL 파라미터에서 survey 확인
    const urlParams = new URLSearchParams(window.location.search);
    const surveyParam = urlParams.get('survey');
    if (surveyParam) {
      const parts = surveyParam.split('-token-');
      if (parts.length === 2) {
        setSurveyId(parts[0]);
        setSurveyToken(parts[1]);
        setIsEvaluatorSurvey(true);
        setActiveTab('evaluator-survey');
        return;
      }
    }
    
    // 직접 경로 확인 (개발 환경)
    const path = window.location.pathname;
    const surveyMatch = path.match(/\/survey\/eval\/(.+)/);
    
    if (surveyMatch) {
      const fullId = surveyMatch[1];
      const parts = fullId.split('-token-');
      if (parts.length === 2) {
        setSurveyId(parts[0]);
        setSurveyToken(parts[1]);
        setIsEvaluatorSurvey(true);
        setActiveTab('evaluator-survey');
      }
    }
  }, []);

  // URL 파라미터 변경 감지 및 자동 로그인 처리
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      const validTabs = [
        'home', 'personal-service', 'demographic-survey', 
        'my-projects', 'project-creation', 'model-builder',
        'evaluator-management', 'progress-monitoring', 'results-analysis',
        'paper-management', 'export-reports', 'workshop-management',
        'decision-support-system', 'personal-settings'
      ];
      
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // demographic-survey 직접 접근 시 자동 데모 로그인 처리
  useEffect(() => {
    console.log('🔍 현재 상태 체크:', { activeTab, user: !!user, isDemoMode });
    
    if (activeTab === 'demographic-survey' && !user && !isDemoMode) {
      console.log('🚀 설문조사 페이지 자동 데모 로그인 시작');
      
      // 데모 모드 활성화
      setIsDemoMode(true);
      setBackendStatus('unavailable');
      
      // 데모 사용자 설정
      const demoUser = {
        ...DEMO_USER,
        id: 'auto-demo-user',
        email: 'demo@ahp-system.com',
        role: 'admin' as const,
        admin_type: 'personal' as const
      };
      
      setUser(demoUser);
      setProjects(DEMO_PROJECTS);
      setIsNavigationReady(true);
      
      console.log('✅ 설문조사 페이지 자동 로그인 완료', demoUser);
    }
  }, [activeTab, user, isDemoMode]);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [showApiErrorModal, setShowApiErrorModal] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // 초기 로딩 및 백엔드 연결 체크
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🚀 앱 초기화:', { 
      nodeEnv: process.env.NODE_ENV,
      isProduction,
      currentUrl: window.location.href
    });
    
    if (isProduction) {
      console.log('🎯 프로덕션 환경 - 데모 모드 활성화');
      activateDemoMode();
      setIsNavigationReady(true);
    } else {
      console.log('🔧 개발 환경 - 백엔드 연결 확인');
      checkBackendAndInitialize();
    }
    
    if (!isProduction) {
      const intervalId = setInterval(() => {
        if (backendStatus === 'available') {
          checkApiConnection();
        }
      }, 5 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    const newPath = window.location.pathname + '?' + urlParams.toString();
    window.history.pushState(currentState, '', newPath);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedProjectId, selectedProjectTitle, user, isNavigationReady]);
  
  // 페이지 로드 시 세션 복구 시도
  useEffect(() => {
    const restoreSessionOnLoad = () => {
      const token = sessionService.getToken();
      
      if (token && sessionService.isSessionValid()) {
        console.log('🔄 페이지 새로고침 - 세션 복구 시도');
        
        // 데모 모드에서 세션 복구
        if (isDemoMode || process.env.NODE_ENV === 'production') {
          // 저장된 사용자 정보가 있는지 확인
          const savedUserData = localStorage.getItem('saved_user_data');
          
          if (savedUserData) {
            try {
              const userData = JSON.parse(savedUserData);
              setUser(userData);
              setProjects(DEMO_PROJECTS);
              setSelectedProjectId(DEMO_PROJECTS[0].id);
              
              // 저장된 탭 정보가 있으면 복원
              const savedTab = localStorage.getItem('current_tab');
              if (savedTab && protectedTabs.includes(savedTab)) {
                setActiveTab(savedTab);
                console.log(`✅ 세션 및 탭 복구 완료: ${savedTab}`);
              } else {
                // 사용자 역할에 따른 기본 탭
                if (userData.role === 'evaluator') {
                  setActiveTab('evaluator-dashboard');
                } else if (userData.role === 'super_admin') {
                  setActiveTab('super-admin');
                } else {
                  setActiveTab('personal-service');
                }
                console.log(`✅ 세션 복구 및 기본 탭 설정 완료`);
              }
              
              return;
            } catch (error) {
              console.error('사용자 데이터 파싱 오류:', error);
              localStorage.removeItem('saved_user_data');
            }
          }
        }
      } else {
        // 세션이 만료된 경우 저장된 데이터 정리
        localStorage.removeItem('saved_user_data');
        localStorage.removeItem('current_tab');
        console.log('⚠️ 세션 만료 - 저장된 데이터 정리');
      }
    };

    // 백엔드 초기화가 완료된 후에 세션 복구 실행
    if (isNavigationReady) {
      restoreSessionOnLoad();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, isNavigationReady]);

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

  const activateDemoMode = () => {
    console.log('🎯 데모 모드 강제 활성화 - AI 개발 활용 방안 AHP 분석');
    setBackendStatus('unavailable');
    setIsDemoMode(true);
    // 자동 로그인 제거 - 사용자가 직접 로그인하도록
    // setUser({
    //   ...DEMO_USER,
    //   id: '1',
    //   email: 'admin@ahp-system.com',
    //   admin_type: 'personal'
    // });
    setProjects(DEMO_PROJECTS);
    // setSelectedProjectId(DEMO_PROJECTS[0].id);
    // setActiveTab('personal-service'); // 자동 이동 제거
    setIsNavigationReady(true);
    console.log('✅ 데모 데이터 설정 완료');
  };

  const checkBackendAndInitialize = async () => {
    try {
      setBackendStatus('checking');
      console.log('🔍 백엔드 연결 확인 중...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ 백엔드 연결 성공');
        setBackendStatus('available');
        setIsDemoMode(false);
        setShowApiErrorModal(false);
        setIsNavigationReady(true);
        
        const token = localStorage.getItem('token');
        if (token) {
          validateToken(token);
        }
      } else {
        fallbackToDemoMode();
      }
    } catch (error) {
      fallbackToDemoMode();
    }
  };

  const fallbackToDemoMode = () => {
    setBackendStatus('unavailable');
    setShowApiErrorModal(false);
    activateDemoMode();
  };

  // API 연결 상태 체크 (백그라운드에서 실행)
  const checkApiConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log('⚠️ API 연결 끊김 - 데모 모드로 전환');
        fallbackToDemoMode();
      }
    } catch (error) {
      // 백그라운드 체크에서는 조용히 실패 처리
      console.log('❌ API 연결 체크 실패 (무시):', error instanceof Error ? error.message : error);
    }
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // 프로젝트 목록 로드
        fetchProjects();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  const handleRegister = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      if (isDemoMode) {
        // 데모 모드에서는 회원가입 후 바로 로그인 처리
        const newUser = {
          id: `user-${Date.now()}`,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: data.role === 'evaluator' ? 'admin' : 'super_admin',
          admin_type: data.role === 'evaluator' ? 'personal' : undefined,
        };

        setUser(newUser as any);
        setRegisterMode(null);
        
        // 회원가입 후 적절한 페이지로 리다이렉트
        if (data.role === 'evaluator') {
          setActiveTab('personal-service');
        } else {
          setActiveTab('personal-service'); // welcome에서 personal-service로 변경
        }
        
        console.log('✅ 회원가입 성공:', newUser);
        return;
      }

      // 실제 백엔드가 있을 때의 회원가입 처리
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.');
      }

      await response.json();
      
      // 회원가입 성공 후 자동 로그인
      await handleLogin(data.email, data.password, data.role);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setLoginError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string, role?: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('🔍 로그인 시도:', { 
        email, 
        password: password ? '***' : 'empty',
        isDemoMode,
        backendStatus,
        nodeEnv: process.env.NODE_ENV
      });
      
      // 프로덕션 환경이거나 백엔드가 불가능한 경우 데모 모드로 처리
      if (isDemoMode || process.env.NODE_ENV === 'production' || backendStatus === 'unavailable') {
        console.log('✅ 데모 모드에서 로그인 처리 중');
        
        // 실제 운영 계정 설정
        let authenticatedUser: any = null;
        
        // 시스템 관리자 계정 (숨김 처리) - 모드 전환 가능
        if (email === 'aebon@naver.com' && password === 'zzang31') {
          console.log('✅ 시스템 관리자 계정 인증 성공');
          authenticatedUser = {
            id: 'super-admin-1',
            first_name: '시스템',
            last_name: '관리자',
            email: 'aebon@naver.com',
            role: 'super_admin',
            admin_type: undefined, // 초기에는 모드 선택 필요
            canSwitchModes: true // 모드 전환 가능 플래그
          };
        }
        // 서비스 사용자 계정 (프로젝트 관리) - 바로 서비스 모드
        else if (email === 'test@ahp.com' && (password === 'ahptester' || password === 'tester@')) {
          console.log('✅ 서비스 사용자 계정 인증 성공');
          authenticatedUser = {
            id: 'service-user-1',
            first_name: 'AHP',
            last_name: '테스터',
            email: 'test@ahp.com',
            role: 'admin', // 서비스 계정은 바로 admin으로
            admin_type: 'personal', // 바로 개인 서비스로
            canSwitchModes: false // 모드 전환 불가
          };
        }
        // 데모 계정 (공개용)
        else if (email === 'demo@ahp-system.com' && password === 'demo123') {
          console.log('✅ 데모 계정 인증 성공');
          authenticatedUser = {
            ...DEMO_USER,
            role: role === 'admin' ? 'admin' : 'evaluator',
            admin_type: role === 'admin' ? 'personal' : undefined
          };
        } else {
          console.log('❌ 인증 실패 - 일치하는 계정이 없습니다');
          console.log('입력된 정보:', { email, password: password ? '***' : 'empty' });
          throw new Error(`인증 실패: 올바른 계정 정보를 입력하세요.\n사용 가능한 계정:\n- test@ahp.com / tester@ (또는 ahptester)\n- demo@ahp-system.com / demo123`);
        }
        
        if (authenticatedUser) {
          // 세션 시작 (토큰 생성)
          const demoToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionService.startSession(demoToken);
          
          // 사용자 데이터 저장 (새로고침 시 복구용)
          localStorage.setItem('saved_user_data', JSON.stringify(authenticatedUser));
          
          setUser(authenticatedUser);
          setProjects(DEMO_PROJECTS);
          setSelectedProjectId(DEMO_PROJECTS[0].id);
          
          // 로그인 성공 후 적절한 화면으로 전환
          let targetTab = '';
          if (authenticatedUser.role === 'evaluator') {
            targetTab = 'evaluator-dashboard';
          } else if (authenticatedUser.role === 'super_admin') {
            targetTab = 'super-admin';
          } else {
            targetTab = 'personal-service';
          }
          
          setActiveTab(targetTab);
          localStorage.setItem('current_tab', targetTab);
          
          console.log('✅ 로그인 성공 - 역할:', authenticatedUser.role, '탭:', targetTab);
          return;
        }
      } else {
        // PostgreSQL 백엔드 로그인
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
          // 백엔드 로그인 성공 시 세션 시작
          sessionService.startSession(data.token);
          
          // 사용자 데이터 저장 (새로고침 시 복구용)
          localStorage.setItem('saved_user_data', JSON.stringify(data.user));
          
          localStorage.setItem('token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          setUser(data.user);
          
          // 기본 탭 설정 및 저장
          let targetTab = '';
          if (data.user.role === 'evaluator') {
            targetTab = 'evaluator-dashboard';
          } else if (data.user.role === 'super_admin') {
            targetTab = 'super-admin';
          } else {
            targetTab = 'personal-service';
          }
          setActiveTab(targetTab);
          localStorage.setItem('current_tab', targetTab);
          
          console.log('✅ PostgreSQL 백엔드 로그인 성공');
          // 프로젝트 목록 로드
          await fetchProjects();
        } else {
          throw new Error(data.message || '로그인에 실패했습니다.');
        }
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    // 세션 서비스를 통한 로그아웃
    sessionService.logout();
    
    // 토큰 및 저장된 데이터 정리
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lastActiveTab');
    localStorage.removeItem('selectedProjectId');
    localStorage.removeItem('saved_user_data');
    localStorage.removeItem('current_tab');
    
    // 상태 초기화
    setUser(null);
    setActiveTab('home');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setProjects([]);
    setUsers([]);
    setLoginError('');
    setRegisterMode(null);
    
    console.log('✅ 로그아웃 완료 - 모든 상태 및 세션 데이터 정리됨');
  };

  // 보호된 탭 목록을 useMemo로 메모이제이션
  const protectedTabs = useMemo(() => [
    'welcome', 'super-admin', 'personal-service', 'my-projects', 
    'project-creation', 'model-builder', 'evaluation-test', 'evaluator-management', 
    'progress-monitoring', 'results-analysis', 'paper-management', 'export-reports', 
    'workshop-management', 'decision-support-system', 'personal-settings', 
    'user-guide', 'dashboard', 'users', 'projects', 'monitoring', 'database', 'audit', 
    'settings', 'backup', 'system', 'landing', 'model-building', 
    'evaluation-results', 'project-completion', 'personal-projects', 
    'personal-users', 'results', 'evaluator-dashboard', 'pairwise-evaluation', 
    'direct-evaluation', 'evaluator-status', 'evaluations', 'progress',
    'demographic-survey', 'evaluator-mode'
  ], []);

  // 사용자 상태 저장 및 복원 (자동 리다이렉션 제거)
  useEffect(() => {
    if (user) {
      // URL에서 탭 정보가 있으면 우선 사용
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      
      if (tabFromUrl && protectedTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
        return;
      }
      
      // URL에 탭이 없으면 마지막 활성 탭 복원
      const lastTab = localStorage.getItem('lastActiveTab');
      if (lastTab && protectedTabs.includes(lastTab)) {
        setActiveTab(lastTab);
        return;
      }
      
      // 둘 다 없으면 기본 탭 설정 (자동 이동 최소화)
      if (user.role === 'super_admin' && user.admin_type === 'super') {
        setActiveTab('super-admin');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      }
      // 다른 경우에는 현재 탭 유지 (자동 이동하지 않음)
      
      // 선택된 프로젝트 복원
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId && !selectedProjectId) {
        setSelectedProjectId(savedProjectId);
      }
    }
  }, [user, protectedTabs, selectedProjectId]);
  
  // 탭 변경 시 저장
  useEffect(() => {
    if (user && activeTab && protectedTabs.includes(activeTab)) {
      localStorage.setItem('lastActiveTab', activeTab);
    }
  }, [activeTab, user, protectedTabs]);
  
  // 프로젝트 선택 시 저장
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
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

  // 시스템 관리자 모드 전환 핸들러
  const handleModeSwitch = (targetMode: 'super' | 'personal') => {
    if (user && user.canSwitchModes) {
      setUser({
        ...user,
        admin_type: targetMode
      });
      
      if (targetMode === 'super') {
        setActiveTab('super-admin');
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

  const handleUseDemoMode = () => {
    setShowApiErrorModal(false);
    activateDemoMode();
  };

  const handleCloseApiError = () => {
    setShowApiErrorModal(false);
    // 기본적으로 데모 모드로 전환
    activateDemoMode();
  };

  const fetchProjects = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드에서는 이미 로드된 DEMO_PROJECTS 유지
      console.log('데모 모드: 샘플 프로젝트 데이터 사용 중');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out old sample projects on frontend as well
        const filteredProjects = (data.projects || []).filter((project: any) => 
          !['스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택'].includes(project.title)
        );
        setProjects(filteredProjects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const fetchUsers = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드에서는 샘플 사용자 데이터 사용
      const demoUsers = [
        {
          id: '1',
          email: 'admin@ahp-system.com',
          first_name: '관리자',
          last_name: '시스템',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          email: 'evaluator1@example.com',
          first_name: '평가자',
          last_name: '김',
          role: 'evaluator',
          created_at: '2024-01-02T00:00:00Z',
          last_login: '2024-01-14T15:20:00Z',
          status: 'active'
        },
        {
          id: '3',
          email: 'evaluator2@example.com',
          first_name: '평가자',
          last_name: '이',
          role: 'evaluator',
          created_at: '2024-01-03T00:00:00Z',
          status: 'inactive'
        }
      ];
      setUsers(demoUsers);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
  }, [isDemoMode]);

  // 사용자 관리 함수들
  const createUser = async (userData: any) => {
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태에 추가
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        last_login: undefined
      };
      setUsers(prev => [...prev, newUser]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태 업데이트
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    if (isDemoMode) {
      // 데모 모드에서는 로컬 상태에서 제거
      setUsers(prev => prev.filter(user => user.id !== userId));
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '사용자 삭제에 실패했습니다.');
    }

    await fetchUsers(); // 목록 새로고침
  };

  const createSampleProject = async () => {
    if (isDemoMode) {
      // 데모 모드에서는 이미 DEMO_PROJECTS가 로드되어 있음
      console.log('데모 모드에서 샘플 프로젝트가 이미 로드되어 있습니다.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      localStorage.setItem('selectedProjectId', projectId);
      localStorage.setItem('selectedProjectTitle', projectTitle || '');
    }
    localStorage.setItem('lastActiveTab', newTab);
    console.log(`📦 탭 전환: ${newTab}${projectId ? ` (프로젝트: ${projectTitle})` : ''}`);
  }, []);
  
  // Navigation handlers
  const handleLoginClick = () => {
    changeTab('login');
    setRegisterMode(null);
  };

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
    localStorage.removeItem('selectedProjectId');
    localStorage.removeItem('selectedProjectTitle');
  };

  const handleProjectSelect = (projectId: string, projectTitle: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    localStorage.setItem('selectedProjectId', projectId);
    localStorage.setItem('selectedProjectTitle', projectTitle);
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
    localStorage.removeItem('selectedProjectId');
    localStorage.removeItem('selectedProjectTitle');
    console.log('✅ 평가자 평가 완료');
  };

  useEffect(() => {
    if (user && activeTab === 'personal-projects') {
      if (isDemoMode) {
        // 데모 모드에서는 DEMO_PROJECTS 강제 설정
        console.log('🔧 프로젝트 탭 활성화 - 데모 데이터 강제 설정');
        setProjects(DEMO_PROJECTS);
      } else {
        fetchProjects();
      }
    } else if (user && activeTab === 'personal-users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, activeTab, isDemoMode, fetchProjects, fetchUsers]);



  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onLoginClick={handleLoginClick} />;
        
      case 'login':
        return (
          <LoginForm
            onLogin={handleLogin}
            onRegister={handleRegisterClick}
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

      case 'welcome':
        if (!user) return null;
        return (
          <PersonalServiceDashboard 
            user={user}
            activeTab='welcome'
            onTabChange={setActiveTab}
          />
        );

      case 'super-admin':
      case 'dashboard':
      case 'users':
      case 'projects':
      case 'monitoring':
      case 'database':
      case 'audit':
      case 'settings':
      case 'backup':
      case 'system':
        if (!user) return null;
        return (
          <EnhancedSuperAdminDashboard 
            user={{
              id: user.id || '1',
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
            activeTab={activeTab === 'super-admin' ? 'overview' : activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'evaluator-survey':
        // 평가자 전용 설문조사 페이지 (독립 페이지)
        if (isEvaluatorSurvey && surveyId && surveyToken) {
          return (
            <EvaluatorSurveyPage 
              surveyId={surveyId}
              token={surveyToken}
            />
          );
        }
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

      case 'evaluation-test':
        return <EvaluationTest />;

      case 'evaluator-mode':
        // 평가자 모드 - 로그인 상태에 따라 다르게 처리
        if (!user) {
          // 로그인하지 않은 경우 데모 사용자로 자동 설정
          const evaluatorUser = {
            id: 'demo-evaluator',
            firstName: '데모',
            lastName: '평가자',
            email: 'evaluator@demo.com',
            role: 'evaluator' as const
          };
          
          return (
            <EvaluatorDashboard 
              user={evaluatorUser}
              onSwitchToAdmin={() => setActiveTab('personal-service')}
              onLogout={() => {
                setUser(null);
                setActiveTab('home');
              }}
            />
          );
        }

        // 로그인한 사용자의 경우
        if (user.role === 'evaluator') {
          return (
            <EvaluatorDashboard 
              user={{
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: 'evaluator'
              }}
              onSwitchToAdmin={() => setActiveTab('personal-service')}
              onLogout={() => {
                setUser(null);
                setActiveTab('home');
              }}
            />
          );
        } else {
          // 관리자가 평가자 모드를 체험하는 경우
          return (
            <EvaluatorDashboard 
              user={{
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: 'evaluator'
              }}
              onSwitchToAdmin={() => setActiveTab('personal-service')}
            />
          );
        }

      case 'personal-service':
      case 'demographic-survey':
      case 'my-projects':
      case 'project-creation':
      case 'model-builder':
      case 'evaluator-management':
      case 'progress-monitoring':
      case 'results-analysis':
      case 'paper-management':
      case 'export-reports':
      case 'workshop-management':
      case 'decision-support-system':
      case 'personal-settings':
        if (!user) {
          // demographic-survey 직접 접근 시 자동 데모 로그인
          if (activeTab === 'demographic-survey') {
            console.log('🚀 설문조사 페이지 직접 접근 - 자동 데모 로그인 처리');
            
            // 즉시 데모 사용자 설정
            setUser({
              ...DEMO_USER,
              id: 'auto-demo-user',
              email: 'demo@ahp-system.com',
              role: 'admin',
              admin_type: 'personal'
            });
            setProjects(DEMO_PROJECTS);
            setIsDemoMode(true);
            
            // 로딩 상태를 잠시 보여준 후 페이지 렌더링
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h2 className="text-xl font-semibold mb-2">설문조사 페이지 로딩 중...</h2>
                  <p className="text-gray-600">잠시만 기다려주세요.</p>
                </div>
              </div>
            );
          }
          return null;
        }
        console.log('🎯 PersonalServiceDashboard 렌더링:', { activeTab, userId: user.id, userRole: user.role });
        return (
          <PersonalServiceDashboard 
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );

      case 'landing':
        if (!user) return null;
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
        console.log('📊 데모 모드:', isDemoMode, '프로젝트 수:', projects.length);
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
                    {!isDemoMode && (
                      <button
                        onClick={createSampleProject}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        샘플 프로젝트 생성
                      </button>
                    )}
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                handleProjectSelect(project.id, project.title);
                                setActiveTab('model-building');
                              }}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              모델 구성
                            </button>
                            <span className="text-xs text-gray-500">
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
        return user.role !== 'admin' ? (
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
            projectTitle={isDemoMode ? DEMO_PROJECTS[0].title : 'AHP 프로젝트'}
            demoMode={isDemoMode}
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
                <h5 className="font-medium text-purple-800">👤 내 평가 현황</h5>
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
            criteria={isDemoMode ? DEMO_CRITERIA : []}
            alternatives={isDemoMode ? DEMO_ALTERNATIVES : []}
            demoMode={isDemoMode}
          />
        );
        
      case 'progress':
        return (
          <Card title="진행 상황">
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                <h5 className="font-medium text-indigo-800">📈 프로젝트 진행률</h5>
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


  const needsLayout = (user && protectedTabs.includes(activeTab)) || activeTab === 'evaluation-test';

  if (needsLayout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Layout
          user={user}
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
          onUseDemoMode={handleUseDemoMode}
        />
      </div>
    );
  }

  // 홈페이지나 로그인 페이지는 Layout 없이 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
      <ApiErrorModal
        isVisible={showApiErrorModal}
        onClose={handleCloseApiError}
        onRetry={handleApiRetry}
        onUseDemoMode={handleUseDemoMode}
      />
    </div>
  );
}

export default App;