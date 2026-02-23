# Phase 1e: App.tsx 분해 설계서

**작성**: Claude Opus 4.6
**날짜**: 2026-02-23
**목표**: App.tsx 1,985줄 → 300줄 이하

---

## 1. 현재 App.tsx 구조 분석

### 책임 영역 (6가지 - SRP 위반)

| 영역 | 줄 범위 | 줄 수 | 책임 |
|------|---------|-------|------|
| Imports + Lazy | 1-79 | 79 | 40+ 컴포넌트 import, PageLoader |
| State 선언 | 81-177 | 96 | 20+ useState 훅 |
| Effects (8개) | 183-369 | 186 | 세션, URL 동기화, 자동 로그인, 탭 복원 |
| 백엔드/세션 | 372-492 | 120 | API 헬스체크, 세션 검증, 토큰 리프레시 |
| Auth 핸들러 | 494-623 | 129 | 로그인, 회원가입, 로그아웃, 소셜 인증 |
| CRUD + Nav | 626-984 | 358 | protectedTabs, 프로젝트/사용자 CRUD, 네비게이션 |
| renderContent | 988-1885 | 897 | **50+ case switch문** |
| 메인 렌더 | 1887-1984 | 97 | Layout 래핑, 모달, 토스트 |

### 핵심 문제점

1. **renderContent() 897줄** - 50+ case의 거대 switch문
2. **20+ useState** - 전역 상태를 단일 컴포넌트에서 관리
3. **8개 useEffect** - 복잡한 의존성 체인
4. **PersonalServiceDashboard 중복 인스턴스화** - 동일한 props로 6번 반복 (1148, 1421, 1448, 1487줄)
5. **"프로젝트를 먼저 선택해주세요" UI** - 5번 반복 (1522, 1546, 1572, 1754, 1778줄)

---

## 2. 분해 아키텍처

### 2.1 파일 구조

```
src/
├── App.tsx                          # 300줄 이하 (Provider 조합 + AppContent)
├── contexts/
│   ├── AuthContext.tsx               # 인증 상태 + 핸들러
│   ├── ProjectContext.tsx            # 프로젝트 CRUD + 선택 상태
│   ├── NavigationContext.tsx         # 탭 네비게이션 + URL 동기화
│   └── AppProviders.tsx             # Provider 합성 컴포넌트
├── routes/
│   ├── routeConfig.ts               # 라우트 맵 (switch문 대체)
│   ├── AppRouter.tsx                # 라우트 리졸버
│   ├── guards/
│   │   ├── AuthGuard.tsx            # 로그인 필수 라우트 보호
│   │   └── ProjectGuard.tsx         # 프로젝트 선택 필수 보호
│   └── publicRoutes.tsx             # 비로그인 라우트 정의
├── hooks/
│   ├── useAuth.ts                   # 인증 로직 (기존 App.tsx에서 추출)
│   ├── useProjects.ts              # 프로젝트 CRUD 로직
│   ├── useUsers.ts                 # 사용자 관리 로직
│   ├── useNavigation.ts            # 탭 네비게이션 + URL
│   ├── useBackendStatus.ts         # API 헬스체크
│   └── useActionMessage.ts         # 토스트 알림
└── components/
    └── common/
        └── PageLoader.tsx           # 로딩 인디케이터 (App.tsx에서 분리)
```

### 2.2 각 모듈 상세 설계

---

#### A. `hooks/useAuth.ts` (~120줄)

**추출 대상**: App.tsx 81-623줄 중 인증 관련

```typescript
interface UseAuthReturn {
  user: User | null;
  loginLoading: boolean;
  loginError: string;
  registerMode: 'service' | 'admin' | null;
  setRegisterMode: (mode: 'service' | 'admin' | null) => void;
  handleLogin: (username: string, password: string, role?: string) => Promise<void>;
  handleRegister: (data: RegisterData) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleGoogleAuth: () => Promise<void>;
  handleKakaoAuth: () => Promise<void>;
  handleNaverAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(getInitialUser());
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMode, setRegisterMode] = useState<'service' | 'admin' | null>(null);

  // 세션 서비스 초기화 (기존 184-206줄)
  useEffect(() => { ... }, [user]);

  // 자동 로그인 (기존 332-351줄)
  useEffect(() => { ... }, []);

  // handleLogin (기존 526-565줄)
  // handleRegister (기존 494-524줄)
  // handleLogout (기존 567-589줄)
  // handleGoogleAuth, handleKakaoAuth, handleNaverAuth (기존 592-623줄)

  return { user, loginLoading, loginError, ... };
}
```

---

#### B. `hooks/useNavigation.ts` (~100줄)

**추출 대상**: App.tsx 111-369줄 중 네비게이션 관련

```typescript
interface UseNavigationReturn {
  activeTab: string;
  viewMode: 'service' | 'evaluator';
  isNavigationReady: boolean;
  changeTab: (tab: string, projectId?: string, projectTitle?: string) => void;
  handleModeSwitch: (targetMode: 'service' | 'evaluator') => void;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function useNavigation(user: User | null): UseNavigationReturn {
  const [activeTab, setActiveTab] = useState(() => getInitialTab());
  const [viewMode, setViewMode] = useState<'service' | 'evaluator'>('service');
  const [isNavigationReady, setIsNavigationReady] = useState(true);

  // URL 파라미터 변경 감지 (기존 209-259줄)
  useEffect(() => { ... }, [user]);

  // 브라우저 내비게이션 처리 (기존 283-303줄)
  useEffect(() => { ... }, [isNavigationReady]);

  // 탭 변경 시 URL 업데이트 (기존 306-329줄)
  useEffect(() => { ... }, [activeTab, selectedProjectId, user, isNavigationReady]);

  // changeTab (기존 916-922줄)
  const changeTab = useCallback((newTab: string, projectId?: string, projectTitle?: string) => {
    setActiveTab(newTab);
    if (projectId) { ... }
  }, []);

  return { activeTab, viewMode, isNavigationReady, changeTab, handleModeSwitch, setActiveTab };
}
```

---

#### C. `hooks/useProjects.ts` (~120줄)

**추출 대상**: App.tsx 696-856줄

```typescript
interface UseProjectsReturn {
  projects: UserProject[];
  loading: boolean;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedProjectTitle: (title: string) => void;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<ProjectData>) => Promise<ProjectData>;
  deleteProject: (id: string) => Promise<boolean>;
  fetchTrashedProjects: () => Promise<any[]>;
  restoreProject: (id: string) => Promise<boolean>;
  permanentDeleteProject: (id: string) => Promise<void>;
  fetchCriteria: (projectId: string) => Promise<CriteriaData[]>;
  createCriteria: (projectId: string, data: Record<string, unknown>) => Promise<any>;
  fetchAlternatives: (projectId: string) => Promise<AlternativeData[]>;
  createAlternative: (projectId: string, data: Record<string, unknown>) => Promise<any>;
  saveEvaluation: (projectId: string, data: Record<string, unknown>) => Promise<any>;
  handleProjectSelect: (id: string, title: string) => void;
}

export function useProjects(user: User | null): UseProjectsReturn {
  // 기존 App.tsx 160-164줄, 696-856줄의 모든 프로젝트 관련 로직
}
```

---

#### D. `hooks/useUsers.ts` (~50줄)

**추출 대상**: App.tsx 857-897줄

```typescript
interface UseUsersReturn {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (data: Record<string, unknown>) => Promise<void>;
  updateUser: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  // 기존 App.tsx 857-897줄
}
```

---

#### E. `hooks/useBackendStatus.ts` (~60줄)

**추출 대상**: App.tsx 261-423줄

```typescript
interface UseBackendStatusReturn {
  backendStatus: 'checking' | 'available' | 'unavailable';
  showApiErrorModal: boolean;
  handleApiRetry: () => void;
  handleCloseApiError: () => void;
}

export function useBackendStatus(): UseBackendStatusReturn {
  // checkBackendAndInitialize, checkApiConnection, validateSession
}
```

---

#### F. `hooks/useActionMessage.ts` (~20줄)

**추출 대상**: App.tsx 176-181줄

```typescript
export function useActionMessage() {
  const [actionMessage, setActionMessage] = useState<{type: 'success'|'error'|'info', text: string} | null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  return { actionMessage, showActionMessage };
}
```

---

### 2.3 라우트 맵 설계 (switch문 대체)

#### `routes/routeConfig.ts`

```typescript
import { lazy, ComponentType } from 'react';

export interface RouteConfig {
  component: ComponentType<any>;
  requiresAuth: boolean;
  requiresProject?: boolean;
  requiredRoles?: string[];
  // PersonalServiceDashboard로 위임할 탭 이름 (activeTab 전달)
  delegateTo?: 'personal-service' | 'super-admin' | 'evaluator';
  props?: Record<string, any>;
}

// Lazy imports (기존 App.tsx 29-68줄 이동)
const SuperAdminDashboard = lazy(() => import('../components/superadmin/SuperAdminDashboard'));
const PersonalServiceDashboard = lazy(() => import('../components/admin/PersonalServiceDashboard'));
// ... etc

export const routeMap: Record<string, RouteConfig> = {
  // === 비로그인 라우트 ===
  'home': {
    component: HomePage,
    requiresAuth: false,
  },
  'login': {
    component: UnifiedAuthPage,
    requiresAuth: false,
  },
  'evaluator-workflow': {
    component: EvaluatorWorkflow,
    requiresAuth: false,
  },

  // === PersonalServiceDashboard 위임 탭 (6개 중복 제거) ===
  'personal-service': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'my-projects': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'project-creation': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'model-builder': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'evaluator-management': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'results-analysis': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'trash': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'progress-monitoring': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'ai-paper-assistant': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'export-reports': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'workshop-management': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'decision-support-system': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'personal-settings': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'demographic-survey': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'evaluator-invitation': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'project-wizard': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },
  'demographic-setup': { delegateTo: 'personal-service', requiresAuth: true, component: PersonalServiceDashboard },

  // === 슈퍼관리자 탭 ===
  'super-admin': { component: SuperAdminDashboard, requiresAuth: true, requiredRoles: ['super_admin'] },
  'users': { component: RealUserManagement, requiresAuth: true, requiredRoles: ['super_admin'] },
  'all-projects': { component: AllProjectsManagement, requiresAuth: true, requiredRoles: ['super_admin'] },
  'system-info': { component: SystemInfo, requiresAuth: true, requiredRoles: ['super_admin'] },
  'system-monitoring': { component: SystemMonitoring, requiresAuth: true, requiredRoles: ['super_admin'] },
  'system-settings': { component: SystemSettings, requiresAuth: true, requiredRoles: ['super_admin'] },

  // === 프로젝트 필수 탭 ===
  'model-building': { component: ModelBuilding, requiresAuth: true, requiresProject: true },
  'evaluation-results': { component: EvaluationResults, requiresAuth: true, requiresProject: true },
  'project-completion': { component: ProjectCompletion, requiresAuth: true, requiresProject: true },
  'pairwise-evaluation': { component: PairwiseEvaluation, requiresAuth: true, requiresProject: true },
  'direct-evaluation': { component: DirectInputEvaluation, requiresAuth: true, requiresProject: true },
  'results': { component: ResultsDashboard, requiresAuth: true, requiresProject: true },

  // === 단순 페이지 ===
  'user-guide': { component: ComprehensiveUserGuide, requiresAuth: true },
  'researcher-guide': { component: ResearcherGuidePage, requiresAuth: true },
  'evaluator-guide': { component: EvaluatorGuidePage, requiresAuth: true },
  'ai-ahp-methodology': { component: AHPMethodologyPage, requiresAuth: true },
  'ai-fuzzy-methodology': { component: FuzzyAHPMethodologyPage, requiresAuth: true },
  'ai-paper-generation': { component: AIPaperGenerationPage, requiresAuth: true },
  'ai-results-interpretation': { component: AIResultsInterpretationPage, requiresAuth: true },
  'ai-quality-validation': { component: AIQualityValidationPage, requiresAuth: true },
  'ai-materials-generation': { component: AIMaterialsGenerationPage, requiresAuth: true },
  'ai-chatbot-assistant': { component: AIChatbotAssistantPage, requiresAuth: true },
  'connection-test': { component: ConnectionTestPage, requiresAuth: true },
  'integration-test': { component: TestPage, requiresAuth: true },
  'system-health': { component: SystemHealthPage, requiresAuth: true },
  'ahp-analysis': { component: AHPProjectManager, requiresAuth: true },
};
```

#### `routes/AppRouter.tsx` (~80줄)

```typescript
import { Suspense } from 'react';
import { routeMap } from './routeConfig';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { useProjects } from '../hooks/useProjects';
import AuthGuard from './guards/AuthGuard';
import ProjectGuard from './guards/ProjectGuard';
import PageLoader from '../components/common/PageLoader';

export default function AppRouter() {
  const { user } = useAuth();
  const { activeTab } = useNavigation();
  const { selectedProjectId } = useProjects();

  const route = routeMap[activeTab];

  if (!route) {
    // 기본 리다이렉트
    return user ? <Redirect to="personal-service" /> : <Redirect to="home" />;
  }

  // 인증 가드
  if (route.requiresAuth && !user) {
    return <AuthGuard />;
  }

  // 역할 가드
  if (route.requiredRoles && !route.requiredRoles.includes(user?.role || '')) {
    return <Redirect to="personal-service" />;
  }

  // 프로젝트 가드
  if (route.requiresProject && !selectedProjectId) {
    return <ProjectGuard fallbackTab={activeTab} />;
  }

  // PersonalServiceDashboard 위임 패턴
  if (route.delegateTo === 'personal-service') {
    return (
      <Suspense fallback={<PageLoader />}>
        <PersonalServiceDashboard activeTab={activeTab} {...commonProps} />
      </Suspense>
    );
  }

  // 일반 렌더링
  const Component = route.component;
  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...getPropsForRoute(activeTab, route)} />
    </Suspense>
  );
}
```

---

### 2.4 분해 후 App.tsx (~250줄)

```typescript
import React from 'react';
import { AppProviders } from './contexts/AppProviders';
import AppContent from './AppContent';

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
```

#### `AppContent.tsx` (~200줄)

```typescript
import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigation } from './hooks/useNavigation';
import { useBackendStatus } from './hooks/useBackendStatus';
import { useActionMessage } from './hooks/useActionMessage';
import Layout from './components/layout/Layout';
import AppRouter from './routes/AppRouter';
import ApiErrorModal from './components/common/ApiErrorModal';
import TrashOverflowModal from './components/common/TrashOverflowModal';
import DeleteProjectModal from './components/common/DeleteProjectModal';

export default function AppContent() {
  const { user, handleLogout } = useAuth();
  const { activeTab, viewMode, changeTab, handleModeSwitch } = useNavigation();
  const { showApiErrorModal, handleApiRetry, handleCloseApiError } = useBackendStatus();
  const { actionMessage } = useActionMessage();

  if (user) {
    return (
      <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Layout
          user={user}
          viewMode={viewMode}
          activeTab={activeTab}
          onTabChange={changeTab}
          onLogout={handleLogout}
          onModeSwitch={handleModeSwitch}
        >
          <AppRouter />
        </Layout>
        <ApiErrorModal ... />
        <TrashOverflowModal ... />
        <DeleteProjectModal ... />
      </div>
    );
  }

  return (
    <div className="App min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {actionMessage && <ActionToast message={actionMessage} />}
      <AppRouter />
      <ApiErrorModal ... />
    </div>
  );
}
```

---

## 3. 마이그레이션 순서

### Step 1: 커스텀 훅 추출 (비파괴적)
1. `useActionMessage.ts` 생성 → App.tsx에서 import로 교체
2. `useBackendStatus.ts` 생성 → App.tsx에서 import로 교체
3. `useUsers.ts` 생성 → App.tsx에서 import로 교체
4. `useProjects.ts` 생성 → App.tsx에서 import로 교체
5. `useNavigation.ts` 생성 → App.tsx에서 import로 교체
6. `useAuth.ts` 생성 → App.tsx에서 import로 교체

### Step 2: 라우트 맵 구축
7. `routeConfig.ts` 생성 (lazy imports 이동)
8. `ProjectGuard.tsx`, `AuthGuard.tsx` 생성
9. `AppRouter.tsx` 생성 → renderContent() 대체

### Step 3: Context 도입
10. `AuthContext.tsx` 생성
11. `ProjectContext.tsx` 생성
12. `NavigationContext.tsx` 생성
13. `AppProviders.tsx` 생성

### Step 4: App.tsx 최종 정리
14. App.tsx를 Provider 조합 + AppContent로 축소
15. AppContent.tsx 생성
16. 빌드 검증 및 기능 테스트

---

## 4. 코드 중복 제거 효과

| 패턴 | 현재 반복 횟수 | 분해 후 |
|------|----------------|---------|
| PersonalServiceDashboard 인스턴스화 | 6회 (16개 props 반복) | 1회 (routeMap 위임) |
| "프로젝트를 먼저 선택해주세요" UI | 5회 | 1회 (ProjectGuard) |
| UnifiedAuthPage 인스턴스화 | 2회 | 1회 (AuthGuard) |
| RoleSwitcher 인스턴스화 | 3회 | 1회 (props 매핑) |
| urlParams 파싱 | 4회 | 1회 (useNavigation) |

### 예상 줄 수 변화

| 파일 | Before | After |
|------|--------|-------|
| App.tsx | 1,985 | ~50 |
| AppContent.tsx | - | ~200 |
| useAuth.ts | - | ~120 |
| useNavigation.ts | - | ~100 |
| useProjects.ts | - | ~120 |
| useUsers.ts | - | ~50 |
| useBackendStatus.ts | - | ~60 |
| useActionMessage.ts | - | ~20 |
| routeConfig.ts | - | ~150 |
| AppRouter.tsx | - | ~80 |
| AuthGuard.tsx | - | ~30 |
| ProjectGuard.tsx | - | ~30 |
| AppProviders.tsx | - | ~30 |
| **합계** | **1,985** | **~1,040** (5개 이상 중복 제거로 실질 감소) |

---

## 5. 주의사항

### GitHub Pages 호환성
- React Router DOM은 사용하지 않음 (기존 정책 유지)
- URL 동기화는 `window.history.pushState`로 유지
- `?tab=XXX&project=YYY` 파라미터 방식 유지

### 평가자 URL 파라미터
- `?eval=`, `?project=`, `?token=`, `?key=` 파라미터 변경 금지
- EvaluatorWorkflow 컴포넌트의 props 인터페이스 유지

### 빌드 검증
- 각 Step 완료 후 `npm run build` 실행
- TypeScript 타입 에러 없어야 함
- 기존 동작 변경 없이 리팩토링만 수행

---

**구현 담당**: Claude Sonnet 4.6
**예상 작업량**: Step 1-4 순차 진행
**검증 기준**: 빌드 성공 + 모든 탭 정상 동작
