# Phase 1b 보완: AppRouter 재설계

**작성**: Claude Opus 4.6
**날짜**: 2026-02-23
**목표**: 50+ case switch문 → 선언적 라우트 맵 전환

---

## 1. 현재 문제

### renderContent() 897줄의 switch문 분석

```
renderContent() {
  if (!user) {
    switch (activeTab) {      ← 비로그인 라우트 (6 case)
      case 'home': ...
      case 'login': ...
      case 'register': ...
      case 'evaluator-workflow': ...
      case 'anonymous-evaluation': ...
      default: ...              ← 보호된 탭이면 로그인 페이지 표시
    }
  }

  switch (activeTab) {         ← 로그인 라우트 (44 case)
    case 'home': ...            ← 리다이렉트
    case 'personal-service': ...← PersonalServiceDashboard (16 props)
    case 'my-projects': ...     ← PersonalServiceDashboard (16 props) ← 중복!
    case 'model-builder': ...   ← PersonalServiceDashboard (16 props) ← 중복!
    ... (44개 더)
    default: ...                ← personal-service로 리다이렉트
  }
}
```

### 패턴별 분류

| 패턴 | case 수 | 특징 |
|------|---------|------|
| PersonalServiceDashboard 위임 | 17 | 동일한 16개 props 반복 |
| 프로젝트 필수 + fallback UI | 6 | 동일한 "프로젝트 선택" UI 반복 |
| 단순 컴포넌트 렌더링 | 12 | `<Component />` 또는 `<Component user={user} />` |
| 슈퍼관리자 전용 | 8 | EnhancedSuperAdminDashboard 또는 개별 컴포넌트 |
| 리다이렉트 | 4 | setActiveTab 호출 후 null/로딩 반환 |
| 인라인 UI | 3 | JSX 직접 렌더링 (evaluator-status, progress) |

---

## 2. 설계: 선언적 라우트 시스템

### 2.1 라우트 타입 정의

**파일**: `src/routes/types.ts`

```typescript
import { ComponentType, LazyExoticComponent } from 'react';

export type RouteComponent = LazyExoticComponent<ComponentType<any>> | ComponentType<any>;

export interface RouteDefinition {
  /** 렌더링할 컴포넌트 */
  component: RouteComponent;

  /** 로그인 필수 여부 */
  auth: boolean;

  /** 프로젝트 선택 필수 여부 */
  project?: boolean;

  /** 허용 역할 (미지정 시 모든 역할) */
  roles?: string[];

  /** PersonalServiceDashboard에 activeTab으로 위임 */
  delegate?: 'personal-service';

  /** 컴포넌트에 전달할 정적 props */
  staticProps?: Record<string, unknown>;

  /** props 매핑 함수 (동적 props 생성) */
  getProps?: (ctx: RouteContext) => Record<string, unknown>;

  /** 로그인 후 리다이렉트 대상 */
  redirectWhenAuth?: string;

  /** 프로젝트 미선택 시 돌아갈 탭 */
  projectFallbackTab?: string;
}

export interface RouteContext {
  user: User;
  activeTab: string;
  selectedProjectId: string | null;
  selectedProjectTitle: string;
  changeTab: (tab: string) => void;
}
```

### 2.2 라우트 맵

**파일**: `src/routes/routeMap.ts`

```typescript
import { lazy } from 'react';
import type { RouteDefinition } from './types';

// === Lazy Imports (App.tsx에서 이동) ===
const HomePage = lazy(() => import('../components/home/HomePage'));
const UnifiedAuthPage = lazy(() => import('../components/auth/UnifiedAuthPage'));
const EvaluatorWorkflow = lazy(() => import('../components/evaluator/EvaluatorWorkflow'));
const AnonymousEvaluator = lazy(() => import('../components/evaluation/AnonymousEvaluator'));
const PersonalServiceDashboard = lazy(() => import('../components/admin/PersonalServiceDashboard'));
const SuperAdminDashboard = lazy(() => import('../components/superadmin/SuperAdminDashboard'));
// ... (기존 App.tsx 29-68줄의 모든 lazy import)

export const routes: Record<string, RouteDefinition> = {

  // ╔══════════════════════════════════════════╗
  // ║          PUBLIC ROUTES (비로그인)          ║
  // ╚══════════════════════════════════════════╝

  'home': {
    component: HomePage,
    auth: false,
    redirectWhenAuth: 'personal-service', // 로그인 시 리다이렉트
  },

  'login': {
    component: UnifiedAuthPage,
    auth: false,
    redirectWhenAuth: 'personal-service',
  },

  'register': {
    component: RegisterForm,
    auth: false,
  },

  'evaluator-workflow': {
    component: EvaluatorWorkflow,
    auth: false, // 비로그인도 접근 가능
    getProps: (ctx) => {
      const params = new URLSearchParams(window.location.search);
      return {
        projectId: params.get('eval') || params.get('project') || '',
        evaluatorToken: params.get('token') || params.get('key') || undefined,
      };
    },
  },

  'anonymous-evaluation': {
    component: AnonymousEvaluator,
    auth: false,
  },

  // ╔══════════════════════════════════════════╗
  // ║   PERSONAL SERVICE DASHBOARD 위임 탭      ║
  // ╚══════════════════════════════════════════╝

  'personal-service':     { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'my-projects':          { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'project-creation':     { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'project-wizard':       { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'model-builder':        { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'evaluator-management': { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'trash':                { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'progress-monitoring':  { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'results-analysis':     { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'ai-paper-assistant':   { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'export-reports':       { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'workshop-management':  { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'decision-support-system': { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'personal-settings':    { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'demographic-survey':   { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'demographic-setup':    { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },
  'evaluator-invitation': { component: PersonalServiceDashboard, auth: true, delegate: 'personal-service' },

  // ╔══════════════════════════════════════════╗
  // ║          SUPER ADMIN ROUTES               ║
  // ╚══════════════════════════════════════════╝

  'super-admin':       { component: SuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'users':             { component: RealUserManagement, auth: true, roles: ['super_admin'] },
  'all-projects':      { component: AllProjectsManagement, auth: true, roles: ['super_admin'] },
  'system-info':       { component: SystemInfo, auth: true, roles: ['super_admin'] },
  'system-monitoring': { component: SystemMonitoring, auth: true, roles: ['super_admin'] },
  'system-settings':   { component: SystemSettings, auth: true, roles: ['super_admin'] },
  'payment-options':   { component: PaymentOptionsPage, auth: true, roles: ['super_admin'] },
  'django-admin-integration': {
    component: DjangoAdminIntegration,
    auth: true,
    roles: ['super_admin', 'service_admin'],
  },

  // EnhancedSuperAdminDashboard 위임 탭들
  'projects':  { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'monitoring':{ component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'database':  { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'audit':     { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'settings':  { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'backup':    { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },
  'system':    { component: EnhancedSuperAdminDashboard, auth: true, roles: ['super_admin'] },

  // 역할 전환
  'role-switch-admin':     { component: RoleSwitcher, auth: true, roles: ['super_admin'] },
  'role-switch-user':      { component: RoleSwitcher, auth: true, roles: ['super_admin'] },
  'role-switch-evaluator': { component: RoleSwitcher, auth: true, roles: ['super_admin'] },
  'system-reset':          { component: SystemReset, auth: true, roles: ['super_admin'] },

  // ╔══════════════════════════════════════════╗
  // ║       PROJECT-REQUIRED ROUTES             ║
  // ╚══════════════════════════════════════════╝

  'model-building': {
    component: ModelBuilding,
    auth: true,
    project: true,
    projectFallbackTab: 'personal-projects',
  },
  'evaluation-results': {
    component: EvaluationResults,
    auth: true,
    project: true,
    projectFallbackTab: 'model-building',
  },
  'project-completion': {
    component: ProjectCompletion,
    auth: true,
    project: true,
    projectFallbackTab: 'evaluation-results',
  },
  'pairwise-evaluation': {
    component: PairwiseEvaluation,
    auth: true,
    project: true,
    projectFallbackTab: 'evaluator-dashboard',
  },
  'direct-evaluation': {
    component: DirectInputEvaluation,
    auth: true,
    project: true,
    projectFallbackTab: 'evaluator-dashboard',
  },
  'results': {
    component: ResultsDashboard,
    auth: true,
    project: true,
    projectFallbackTab: 'personal-projects',
  },
  'evaluations': {
    component: PairwiseComparison,
    auth: true,
    project: true,
    projectFallbackTab: 'personal-projects',
  },

  // ╔══════════════════════════════════════════╗
  // ║         SIMPLE PAGE ROUTES                ║
  // ╚══════════════════════════════════════════╝

  'user-guide':              { component: ComprehensiveUserGuide, auth: true },
  'researcher-guide':        { component: ResearcherGuidePage, auth: true },
  'evaluator-guide':         { component: EvaluatorGuidePage, auth: true },
  'ai-research-guide':       { component: AIResearchGuidePage, auth: true },
  'ai-ahp-methodology':      { component: AHPMethodologyPage, auth: true },
  'ai-fuzzy-methodology':    { component: FuzzyAHPMethodologyPage, auth: true },
  'ai-paper-generation':     { component: AIPaperGenerationPage, auth: true },
  'ai-results-interpretation':{ component: AIResultsInterpretationPage, auth: true },
  'ai-quality-validation':   { component: AIQualityValidationPage, auth: true },
  'ai-materials-generation': { component: AIMaterialsGenerationPage, auth: true },
  'ai-chatbot-assistant':    { component: AIChatbotAssistantPage, auth: true },
  'ahp-analysis':            { component: AHPProjectManager, auth: true },
  'evaluation-test':         { component: EvaluationTest, auth: true },
  'connection-test':         { component: ConnectionTestPage, auth: true },
  'integration-test':        { component: TestPage, auth: true },
  'system-health':           { component: SystemHealthPage, auth: true },
  'landing':                 { component: LandingPage, auth: true },

  // ╔══════════════════════════════════════════╗
  // ║         EVALUATOR ROUTES                  ║
  // ╚══════════════════════════════════════════╝

  'evaluator-mode':      { component: EvaluatorDashboard, auth: true },
  'evaluator-dashboard': { component: ProjectSelection, auth: true },
  'dashboard':           { component: RoleBasedDashboard, auth: true },
};
```

### 2.3 라우트 리졸버

**파일**: `src/routes/AppRouter.tsx` (~120줄)

```typescript
import React, { Suspense, useMemo } from 'react';
import { routes } from './routeMap';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { useProjectContext } from '../contexts/ProjectContext';
import ProjectGuard from './guards/ProjectGuard';
import AuthGuard from './guards/AuthGuard';
import PageLoader from '../components/common/PageLoader';

export default function AppRouter() {
  const { user } = useAuthContext();
  const { activeTab, changeTab } = useNavigationContext();
  const { selectedProjectId, selectedProjectTitle } = useProjectContext();

  const routeDef = routes[activeTab];

  // 라우트 미등록 → 기본 페이지
  if (!routeDef) {
    const defaultTab = user ? 'personal-service' : 'home';
    changeTab(defaultTab);
    return <PageLoader />;
  }

  // 로그인 후 리다이렉트 (home → personal-service)
  if (user && routeDef.redirectWhenAuth) {
    changeTab(routeDef.redirectWhenAuth);
    return <PageLoader />;
  }

  // 인증 가드
  if (routeDef.auth && !user) {
    return <AuthGuard />;
  }

  // 역할 가드
  if (routeDef.roles && user && !routeDef.roles.includes(user.role)) {
    changeTab('personal-service');
    return null;
  }

  // 프로젝트 가드
  if (routeDef.project && !selectedProjectId) {
    return (
      <ProjectGuard
        fallbackTab={routeDef.projectFallbackTab || 'personal-projects'}
      />
    );
  }

  // 컴포넌트 렌더링
  const Component = routeDef.component;

  // PersonalServiceDashboard 위임 패턴
  if (routeDef.delegate === 'personal-service') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component activeTab={activeTab} />
        {/* Context에서 나머지 props 직접 가져옴 */}
      </Suspense>
    );
  }

  // 동적 props
  const dynamicProps = routeDef.getProps
    ? routeDef.getProps({ user: user!, activeTab, selectedProjectId, selectedProjectTitle, changeTab })
    : {};

  // 정적 props
  const allProps = { ...routeDef.staticProps, ...dynamicProps };

  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...allProps} />
    </Suspense>
  );
}
```

### 2.4 가드 컴포넌트

**파일**: `src/routes/guards/AuthGuard.tsx` (~30줄)

```typescript
// 비로그인 사용자가 보호된 페이지 접근 시 로그인 폼 표시
export default function AuthGuard() {
  const { login, register, googleAuth, kakaoAuth, naverAuth, loginLoading, loginError } = useAuthContext();

  return (
    <UnifiedAuthPage
      onLogin={login}
      onRegister={register}
      onGoogleAuth={googleAuth}
      onKakaoAuth={kakaoAuth}
      onNaverAuth={naverAuth}
      loading={loginLoading}
      error={loginError}
    />
  );
}
```

**파일**: `src/routes/guards/ProjectGuard.tsx` (~30줄)

```typescript
// 프로젝트 미선택 시 선택 안내 표시
export default function ProjectGuard({ fallbackTab }: { fallbackTab: string }) {
  const { changeTab } = useNavigationContext();

  return (
    <Card title="프로젝트 선택 필요">
      <div className="text-center py-8">
        <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
        <button
          onClick={() => changeTab(fallbackTab)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          프로젝트 목록으로 이동
        </button>
      </div>
    </Card>
  );
}
```

---

## 3. 효과

| 지표 | Before | After |
|------|--------|-------|
| switch 문 case 수 | 50+ | 0 |
| renderContent() 줄 수 | 897 | 0 (제거) |
| PersonalServiceDashboard 인스턴스 | 6 | 1 |
| "프로젝트 선택" UI 반복 | 5 | 1 (ProjectGuard) |
| 로그인 폼 반복 | 2 | 1 (AuthGuard) |
| 새 라우트 추가 | switch에 case 추가 | routeMap에 1줄 추가 |

### 새 라우트 추가 예시

```typescript
// Before: App.tsx의 switch에 10-20줄 추가
case 'new-feature':
  if (!selectedProjectId) {
    return (<Card title="..."><div>...</div></Card>);
  }
  return <NewFeature projectId={selectedProjectId} ... />;

// After: routeMap에 3줄 추가
'new-feature': {
  component: lazy(() => import('../components/NewFeature')),
  auth: true,
  project: true,
},
```

---

## 4. 구현 순서

1. `src/routes/types.ts` 생성
2. `src/routes/routeMap.ts` 생성 (lazy import 이동)
3. `src/routes/guards/AuthGuard.tsx` 생성
4. `src/routes/guards/ProjectGuard.tsx` 생성
5. `src/routes/AppRouter.tsx` 생성
6. App.tsx의 renderContent()를 `<AppRouter />` 호출로 교체
7. 빌드 검증 + 전체 탭 동작 테스트

**의존성**: 상태관리_아키텍처.md의 Context 도입 후 진행 (또는 props 유지하며 병행 가능)

---

**구현 담당**: Claude Sonnet 4.6
**검증 기준**: 모든 50+ 탭 정상 동작, 빌드 성공
