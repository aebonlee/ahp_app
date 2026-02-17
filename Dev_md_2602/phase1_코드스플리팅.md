# Phase 1: 코드 스플리팅 및 기반 안정화

**시작일**: 2026-02-18
**목표 완료일**: 2026-02-25
**담당**: Claude Sonnet 4.6

---

## 목표

| 지표 | 현재 | 목표 |
|---|---|---|
| 번들 크기 (JS) | ~2.8MB | ≤ 500KB (초기 로드) |
| App.tsx 라인 수 | 2,309줄 | ≤ 300줄 |
| Lazy 컴포넌트 | 0개 | 50+ 개 |
| 초기 로드 시간 | ~3초 | ≤ 1.5초 |

---

## Phase 1a: React.lazy() 코드 스플리팅

### 작업 내용
1. App.tsx의 모든 컴포넌트 import를 `React.lazy()`로 전환
2. `renderContent()` 를 `React.Suspense`로 감싸기
3. `LoadingFallback` 컴포넌트 생성

### 변경 파일
- `src/App.tsx`

### 변경 전/후

**Before:**
```typescript
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
// ... 60개 이상의 eager import
```

**After:**
```typescript
const PersonalServiceDashboard = React.lazy(
  () => import('./components/admin/PersonalServiceDashboard')
);
const SuperAdminDashboard = React.lazy(
  () => import('./components/superadmin/SuperAdminDashboard')
);
// ... Suspense로 감싸기
```

### 완료 기준
- [ ] 모든 페이지 컴포넌트 lazy 전환
- [ ] Suspense 경계 적용
- [ ] 빌드 성공 확인
- [ ] 각 탭 정상 동작 확인

---

## Phase 1b: AppRouter 분리

### 작업 내용
1. `src/router/AppRouter.tsx` 생성
2. `renderContent()` 함수 이전
3. App.tsx를 순수 상태/로직 컨테이너로 축소

### 변경 파일
- `src/App.tsx` (수정)
- `src/router/AppRouter.tsx` (신규)

### 완료 기준
- [ ] AppRouter.tsx 생성 완료
- [ ] App.tsx 300줄 이하
- [ ] 모든 탭 라우팅 정상 동작

---

## Phase 1c: 비즈니스 로직 Hook 분리

### 작업 내용
1. `src/hooks/useAuth.ts` - 인증 관련 로직
2. `src/hooks/useProjects.ts` - 프로젝트 CRUD
3. `src/hooks/useNavigation.ts` - 탭 네비게이션
4. `src/hooks/useBackendStatus.ts` - 백엔드 상태

### 완료 기준
- [ ] 4개 Hook 생성 완료
- [ ] App.tsx에서 해당 로직 제거
- [ ] Hook 단위 테스트 가능한 구조

---

## 검증 계획

```bash
# 빌드 후 번들 크기 확인
npm run build
# → build/static/js/*.js 크기 확인

# 개발 서버 실행 후 각 탭 테스트
npm start
```

### 테스트 체크리스트
- [ ] 비로그인: 홈, 랜딩 페이지
- [ ] 로그인: 개인 서비스 대시보드
- [ ] 슈퍼 관리자: super-admin 탭
- [ ] 평가자: evaluator-workflow
- [ ] AI 기능: ai-paper, ai-chatbot
- [ ] 분석: results-analysis
