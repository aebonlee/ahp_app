import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dataService from './services/dataService';
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
import { DEMO_USER } from './data/demoData';

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  // GitHub Pages 하위 경로 처리
  const basePath = process.env.NODE_ENV === 'production' ? '/ahp-platform' : '';
  const getFullPath = (path: string) => basePath + path;
  const [user, setUser] = useState<{
    id: string | number;  // 백엔드는 number로 보냄
    first_name: string;
    last_name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
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
      'decision-support-system', 'personal-settings', 'landing'
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
  
  // 평가자 설문조사 관련 상태
  const [isEvaluatorSurvey, setIsEvaluatorSurvey] = useState(false);
  const [surveyId, setSurveyId] = useState<string>('');
  const [surveyToken, setSurveyToken] = useState<string>('');


  // URL 파라미터 변경 감지 (로그인 후에만 적용)
  useEffect(() => {
    if (!user) return; // 로그인하지 않은 경우 URL 파라미터 무시
    
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
    const basePath = process.env.NODE_ENV === 'production' ? '/ahp-platform' : '';
    const cleanPath = currentPath.startsWith(basePath) ? currentPath : basePath + '/';
    const newPath = cleanPath + '?' + urlParams.toString();
    window.history.pushState(currentState, '', newPath);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedProjectId, selectedProjectTitle, user, isNavigationReady]);
  
  // 페이지 로드 시 세션 복구 시도
  useEffect(() => {
    const restoreSessionOnLoad = async () => {
      // 백엔드가 unavailable이면 로그인 화면 유지
      if (backendStatus === 'unavailable') {
        console.log('⚠️ 백엔드 연결 불가 - 로그인 화면 유지');
        return;
      }
      
      try {
        // 백엔드에서 현재 로그인 상태 확인
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔄 페이지 새로고침 - 세션 복구 성공');
          // admin 역할일 때 admin_type을 'personal'로 설정
          const userWithAdminType = {
            ...data.user,
            admin_type: data.user.role === 'admin' ? 'personal' : data.user.admin_type
          };
          setUser(userWithAdminType);
        } else {
          console.log('❌ 세션 만료 또는 로그인 필요');
          setUser(null);
        }
      } catch (error) {
        console.error('세션 복구 실패:', error);
        setUser(null);
      }
    };

    // 백엔드 초기화가 완료된 후에 세션 복구 실행
    if (isNavigationReady) {
      restoreSessionOnLoad();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigationReady]);

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
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
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

  const fallbackToDemoMode = () => {
    setBackendStatus('unavailable');
    // DB 설정 전까지 에러 모달 비활성화
    setShowApiErrorModal(false);
    setIsNavigationReady(true);
  };

  // API 연결 상태 체크 (백그라운드에서 실행)
  const checkApiConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5초 타임아웃
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // admin 역할일 때 admin_type을 'personal'로 설정
        const userWithAdminType = {
          ...data.user,
          admin_type: data.user.role === 'admin' ? 'personal' : data.user.admin_type
        };
        setUser(userWithAdminType);
        console.log('✅ 세션 복구 성공:', data.user.email);
      }
    } catch (error) {
      console.error('Session validation failed:', error);
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
      // 백엔드 회원가입 처리
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
      console.log('🔍 백엔드 로그인 시도:', { email });
      
      // 백엔드 로그인
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // admin 역할일 때 admin_type을 'personal'로 설정
        const userWithAdminType = {
          ...data.user,
          admin_type: data.user.role === 'admin' ? 'personal' : data.user.admin_type
        };
        setUser(userWithAdminType);
        
        // 기본 탭 설정
        let targetTab = '';
        if (data.user.role === 'evaluator') {
          targetTab = 'evaluator-dashboard';
        } else if (data.user.role === 'super_admin') {
          targetTab = 'super-admin';
        } else if (data.user.role === 'service_tester') {
          targetTab = 'personal-service';
        } else {
          targetTab = 'personal-service';
        }
        setActiveTab(targetTab);
        
        console.log('✅ 백엔드 로그인 성공');
        // 프로젝트 목록 로드
        await fetchProjects();
      } else {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
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

  // 보호된 탭 목록을 useMemo로 메모이제이션
  const protectedTabs = useMemo(() => [
    'welcome', 'super-admin', 'personal-service', 'my-projects', 
    'project-creation', 'model-builder', 'evaluation-test', 'evaluator-management', 
    'progress-monitoring', 'results-analysis', 'paper-management', 'export-reports', 
    'workshop-management', 'decision-support-system', 'personal-settings', 
    'user-guide', 'dashboard', 'users', 'projects', 'monitoring', 'database', 'audit', 
    'settings', 'backup', 'system', 'landing', 'home', 'model-building', 
    'evaluation-results', 'project-completion', 'personal-projects', 
    'personal-users', 'results', 'evaluator-dashboard', 'pairwise-evaluation', 
    'direct-evaluation', 'evaluator-status', 'evaluations', 'progress',
    'demographic-survey', 'evaluator-mode'
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
      
      // URL에 탭이 없으면 마지막 활성 탭 복원
      const lastTab = localStorage.getItem('lastActiveTab');
      if (lastTab && protectedTabs.includes(lastTab)) {
        setActiveTab(lastTab);
        return;
      }
      
      // 둘 다 없으면 기본 탭 설정 (자동 이동 최소화)
      if (user.role === 'super_admin') {
        setActiveTab('super-admin');
      } else if (user.role === 'evaluator') {
        setActiveTab('evaluator-dashboard');
      } else {
        setActiveTab('personal-service');
      }
      
      // 저장된 프로젝트 ID 복원
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


  const handleCloseApiError = () => {
    setShowApiErrorModal(false);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 프로젝트 생성 함수 (DB 저장)
  const createProject = async (projectData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 생성에 실패했습니다.');
    }

    const data = await response.json();
    await fetchProjects(); // 목록 새로고침
    return data.project;
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
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
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
    if (user && activeTab === 'personal-projects') {
      fetchProjects();
    } else if (user && activeTab === 'personal-users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, activeTab, fetchProjects, fetchUsers]);



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
        // 평가자 모드 - 로그인 필요
        if (!user) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
                <button
                  onClick={() => setActiveTab('login')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  로그인하기
                </button>
              </div>
            </div>
          );
        }

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

      case 'personal-service':
      case 'demographic-survey':
      case 'my-projects':
      case 'project-creation':
      case 'model-builder':
      case 'evaluator-management':
      case 'trash':
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
            setProjects([]);
            
            // 로딩 상태를 잠시 보여준 후 페이지 렌더링
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">설문조사 페이지를 준비하고 있습니다...</p>
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
                              ✏️
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
                              🏗️
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
                              📊
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
                              🗑️
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


  // 백엔드 연결 문제 시 임시로 데모 사용자로 메뉴 표시
  const needsLayout = (user && protectedTabs.includes(activeTab)) || activeTab === 'evaluation-test' || 
    (backendStatus === 'unavailable' && ['home', 'landing', 'personal-service'].includes(activeTab));

  if (needsLayout) {
    // 백엔드 연결 불가 시 임시 데모 사용자 생성
    const effectiveUser = user || (backendStatus === 'unavailable' ? {
      id: 'demo-offline-user',
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@ahp-system.com',
      role: 'admin' as const,
      admin_type: 'personal' as const
    } : null);

    return (
      <div className="min-h-screen bg-gray-50">
        <Layout
          user={effectiveUser}
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
      />
    </div>
  );
}

export default App;
