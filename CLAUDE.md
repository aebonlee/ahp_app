# AHP Research Platform — 개발 가이드

**프로젝트**: Multi-Layer AHP Decision Support Platform
**완성도**: ~85% (2026-02-24 기준)
**마지막 작업일**: 2026-02-24
**다음 작업 예정**: 2026-02-26
**문서 폴더**: `Dev_md_2602/`
**이전 CLAUDE.md 백업**: `Dev_md_2602/CLAUDE_backup_20260224.md`

---

## 기술 스택

| 항목 | 값 |
|------|-----|
| Frontend | React 18.2 + TypeScript 4.9 (strict) + TailwindCSS 3.4 |
| Backend | Django REST Framework (Render.com) |
| DB | PostgreSQL (Render.com) |
| 배포 | GitHub Pages (`/ahp_app/`) via GitHub Actions |
| 번들 | main.js **162.34KB** (gzip) |
| 빌드 도구 | Create React App (react-scripts 5.0.1) |
| 리포 | https://github.com/aebonlee/ahp_app |
| 라이브 | https://aebonlee.github.io/ahp_app |

---

## 프로젝트 규모

- **299+ TypeScript/TSX 파일**, **~118,200줄**
- 컴포넌트 180+, 서비스 12개, 훅 10개, 유틸리티 26개, Context 5개
- 기능: AHP, Fuzzy AHP, Monte Carlo, 그룹 합의, 민감도 분석, AI 통합

---

## 아키텍처

```
Django REST API (Render.com)
  ↕
config/api.ts (API_ENDPOINTS, API_BASE_URL)
  ↕
services/api.ts (makeRequest + 10개 API 모듈 + 토큰 갱신)
  ↕
services/authService.ts (JWT, sessionStorage 전용)
  ↕
hooks/ (useAuth, useProjects, useNavigation, useBackendStatus...)
  ↕
contexts/ (AuthContext, ProjectContext, UIContext, NavigationContext)
  ↕
App.tsx (22줄) → AppProviders → AppContent → components/
```

### 핵심 서비스 (12개, 총 5,460줄)

| 서비스 | 줄 | 역할 |
|--------|-----|------|
| api.ts | 924 | HTTP 클라이언트 + projectApi/criteriaApi/alternativeApi/evaluatorApi/evaluationApi/resultsApi/exportApi/authApi/advancedAnalysisApi/directEvaluationAPI |
| authService.ts | 424 | JWT 토큰 관리, sessionStorage, 자동 갱신 (만료 5분 전) |
| anonymousEvaluationService.ts | 580 | 익명 평가 세션 (sessionStorage 전용) |
| dataService_clean.ts | 563 | 비즈니스 로직 래퍼 |
| fileUploadService.ts | 561 | 파일 업로드 |
| systemManagementService.ts | 460 | 시스템 관리 |
| djangoAdminService.ts | 453 | Django Admin 통합 |
| sessionService.ts | 345 | 세션 유효성 |
| aiService.ts | 362 | AI 통합 |
| twoFactorService.ts | 337 | 2FA TOTP |
| subscriptionService.ts | 310 | 구독 관리 |
| invitationService.ts | 146 | 평가자 초대 |

### 삭제된 파일 (Phase 3에서 제거)
- ~~apiService.ts~~ (376줄) — api.ts로 통합
- ~~apiService.test.ts~~ — 테스트 파일
- ~~dataService.ts~~ (241줄) — api.ts로 통합

---

## 완료 현황

### Phase 1: 기반 안정화 ✅ 7/7 완료
- 1a: React.lazy() 코드 스플리팅 (App.tsx 2,309→22줄)
- 1b: AppRouter → AppContent 분리
- 1c: 커스텀 훅 6개 추출
- 1d: 보안 취약점 5건 패치
- 1e: 라우트 맵 + 가드 컴포넌트
- 1f: Context API 5개 + AppProviders
- 1g: 프로덕션 console.* 13건 정리

### Phase 2: 핵심 기능 ✅ 완료
- 2a: 평가자 초대 시스템 FE 인프라
- 2c: 고급 분석 알고리즘 5개 (Monte Carlo, 민감도, 그룹 합의, Pareto, 강건성)

### Phase 2.5: 코드 품질 ✅ 7/7 완료
- npm audit fix, secureStorage, any→제네릭, PSD 분할(-41%), logger, React.memo(18개), ErrorBoundary(3개)

### Phase 3: 서비스 통합 ✅ 완료
- 토큰 갱신 일원화 (C1), dataService 삭제 (C2), apiService 삭제 (H1), axios→fetch (H3), localStorage→sessionStorage (C3)
- 순 코드 감소: **-870줄**, 삭제 파일 3개, 수정 파일 25개

### 주요 버그 수정 (28~39)
- API 엔드포인트 불일치 8건 수정
- 401 토큰 자동 갱신 추가
- SUPER_ADMIN_EMAIL 프로덕션 빌드 빈 문자열
- PUBLIC_URL 누락 (평가 테스트 404)
- Sidebar 역할 전환 버튼 6건 수정
- effectiveSuperAdminMode 일관성 복원

---

## 현재 코드 품질

| 지표 | 값 |
|------|-----|
| TypeScript 에러 | **0개** |
| any 타입 잔여 | **4개** (advancedAnalysisApi 제네릭, Phase 4 예정) |
| console.log 잔여 | **0개** (logger 유틸 사용) |
| TODO/FIXME | **5개** (설명성 코멘트) |
| npm 취약점 | 60개 (CRA 의존성, 런타임 무관) |
| axios 런타임 사용 | **0건** |

---

## 차기 Todo (Phase 4)

### 즉시 (2026-02-26 재개 시)
1. **불필요 의존성 정리** — pg, node-fetch, claude-agent-sdk 제거, QR 라이브러리 통합, axios 제거
2. **apiService 잔존 import 정리** — 13개 컴포넌트 확인 및 수정
3. **anonymousEvaluationService 중복 코드 정리** — sessionStorage 호출 중복 제거
4. **@types/* devDependencies 이동** — dependencies→devDependencies

### 단기
5. **대형 컴포넌트 분할** — 500줄+ 컴포넌트 식별 및 분할
6. **advancedAnalysisApi 타입 강화** — `<T = any>` 4건 → 구체적 타입
7. **ESLint 경고 정리** — 350건 → 100건 이하
8. **테스트 커버리지 구축** — 핵심 서비스/유틸리티 단위 테스트

### 중기
9. **CRA → Vite 마이그레이션** — npm 취약점 60건 근본 해결 + 빌드 속도
10. **Lint 차단 모드** — CI에서 경고 임계값 강제
11. **E2E 테스트** — Playwright 도입

---

## 개발 명령어

```bash
npm start              # 개발 서버 (포트 3000, 프록시: Render.com)
npm run build          # 프로덕션 빌드 (CI=false)
npx tsc --noEmit       # TypeScript 타입 체크
npm run lint           # ESLint (max-warnings 350)
npm test               # 테스트
npm run deploy         # gh-pages 수동 배포 (CI가 자동 처리)
```

---

## 주의사항

### 절대 변경 금지
- 평가자 URL 파라미터 처리 (`?project=`, `?eval=`, `?token=`, `?key=`)
- GitHub Pages 탭 기반 네비게이션 (`?tab=XXX&project=YYY`)
- sessionStorage 기반 토큰 저장 (localStorage 사용 금지 — 보안)

### 스토리지 정책
- **sessionStorage**: JWT 토큰, 익명 세션 (보안 데이터)
- **localStorage**: 업로드 진행률, 2FA 속도 제한, 테마 설정 (영속 데이터만)
- **secureStorage**: API 키 등 민감 데이터 (암호화 래핑)

### CI/CD
- Push to main → GitHub Actions 자동 빌드+배포
- 트리거 경로: src/**, public/**, package.json, tsconfig.json, .github/workflows/**
- Lint/Test는 현재 비차단 (continue-on-error)

---

## 개발 문서

```
Dev_md_2602/
├── README.md                        # 전체 개요
├── 개발일지_20260223.md             # 작업 기록 (#1~#41)
├── 점검보고서_20260223.md           # 초기 점검
├── 전체점검보고서_20260224.md       # 정밀 점검 (C/H/M/L 이슈 분류)
├── 평가보고서_20260224.md           # 개발 상태 평가 (이 세션)
├── DB구조_연동분석_20260224.md       # DB 구조 분석
├── plan_routing_fix.md              # 라우팅 수정 계획
├── CLAUDE_backup_20260224.md        # 이전 CLAUDE.md 백업
└── 작업지시서_20260226.md           # 다음 세션 작업 지시서
```

---

**마지막 업데이트**: 2026-02-24
**작성**: Claude Opus 4.6
**최신 커밋**: `90ee74d` docs: 개발일지 #40-#41
**빌드 상태**: ✅ 0 errors, 162.34KB gzip
