# 🚀 AHP 플랫폼 개발 가이드 - AI 역할 분담
## Multi-Layer AHP Decision Support Platform

**현재 완성도**: 75% → **목표: 100%** (2026.02.18 재개)
**개발 재개**: 2026-02-18
**AI 협업**: Claude Opus 4.6 (설계/알고리즘) + Claude Sonnet 4.6 (구현/통합)
**문서 폴더**: `Dev_md_2602/` (2026년 02월~ 개발 기록)

> ⚠️ **중요**: 작업 전 반드시 이 파일을 읽고 역할 분담을 확인할 것.
> Sonnet은 Opus 설계 기반으로 구현. 독단적 아키텍처 변경 금지.

---

## 🗺️ 전체 개발 로드맵

```
Phase 1: 기반 안정화 (현재 진행 - Sonnet 주도)
├── 1a. React.lazy() 코드 스플리팅 (2.8MB → 500KB)
├── 1b. App.tsx 분리 (AppRouter + 커스텀 Hook)
├── 1c. 비즈니스 로직 Hook 분리
└── 1d. 보안 취약점 30개 패치

Phase 2: 핵심 미완성 기능 (Opus 설계 → Sonnet 구현)
├── 2a. 평가자 초대 이메일 시스템 (현재 40%)
├── 2b. 실시간 협업 WebSocket (현재 35%)
└── 2c. 고급 분석 기능 (현재 30%)

Phase 3: 수익화 (Opus 설계 → Sonnet 구현)
├── 3a. Stripe 결제 시스템 (현재 0%)
├── 3b. 구독 플랜 관리
└── 3c. 청구서 생성
```

---

## 🤖 Sonnet 4.6 담당 영역 (구현 및 통합)

### ✅ Phase 1 - 현재 진행 중

#### 1a. 코드 스플리팅 (React.lazy)
```
변경 파일: src/App.tsx
작업 내용:
- 60+ 컴포넌트 import를 React.lazy()로 전환
- React.Suspense 경계 추가
- LoadingFallback 컴포넌트 생성
목표: 초기 번들 2.8MB → 500KB
```

#### 1b. AppRouter 분리
```
신규 파일: src/router/AppRouter.tsx
변경 파일: src/App.tsx (2309줄 → ~300줄)
작업 내용:
- renderContent() 함수를 AppRouter로 이전
- App.tsx를 순수 상태 컨테이너로 축소
```

#### 1c. 비즈니스 로직 Hook 분리
```
신규 파일:
- src/hooks/useAuth.ts     (로그인/로그아웃/세션/토큰)
- src/hooks/useProjects.ts (프로젝트 CRUD)
- src/hooks/useNavigation.ts (탭 네비게이션)
- src/hooks/useBackendStatus.ts (백엔드 상태)
```

#### 완료 기준
- [ ] npm run build 성공
- [ ] 번들 크기 500KB 이하
- [ ] 모든 탭 정상 동작
- [ ] GitHub Pages 배포 확인

### 📋 Sonnet 완료해야 할 작업 (Phase 2-3)
```
🔧 구현 작업:
├── Phase 2: Opus 설계 문서 기반 구현
│   ├── 평가자 초대 UI (이메일 발송 폼, 상태 추적 UI)
│   ├── WebSocket 연결 처리 (React 훅)
│   └── 고급 분석 대시보드 UI
└── Phase 3: 결제 UI
    ├── Stripe Elements 통합
    ├── 구독 관리 UI
    └── 청구서 뷰어
```

---

## 🧠 Opus 4.6 담당 영역 (설계 및 알고리즘)

### 📋 Phase 2 설계 필요 항목 (Sonnet 구현 전 필수)

#### 2a. 평가자 초대 시스템 설계 (현재 40%)
```
설계 산출물 위치: Dev_md_2602/설계문서_Opus/평가초대_시스템_설계.md

포함 내용:
├── 이메일 초대 토큰 생성 로직 (JWT 기반)
├── 만료/재발송/취소 상태 머신
├── 권한 관리 아키텍처
└── Django 백엔드 API 스펙
```

#### 2b. 실시간 협업 WebSocket 설계 (현재 35%)
```
설계 산출물 위치: Dev_md_2602/설계문서_Opus/실시간협업_아키텍처.md

포함 내용:
├── Django Channels WebSocket 설계
├── 이벤트 소싱 패턴
├── 충돌 해결 메커니즘
└── React 클라이언트 연결 방식
```

#### 2c. 고급 분석 알고리즘 (현재 30%)
```
설계 산출물 위치: Dev_md_2602/설계문서_Opus/고급분석_알고리즘.md

포함 내용:
├── Monte Carlo 시뮬레이션 (반복 횟수, 분포 설정)
├── 민감도 분석 고도화
├── 그룹 합의 알고리즘 (AIJ, AIP, Fuzzy)
└── Shannon Entropy 기반 합의도
```

#### 3a. 결제 시스템 아키텍처 (현재 0%)
```
설계 산출물 위치: Dev_md_2602/설계문서_Opus/결제시스템_설계.md

포함 내용:
├── Stripe 구독 모델 설계
├── 결제 상태 머신
├── 환불 처리 로직
└── PCI 준수 사항
```

---

## 📊 현재 TODO 현황

### Phase 1 (Sonnet 주도)
| # | 작업 | 상태 | 완성도 |
|---|---|---|---|
| 1a | React.lazy() 코드 스플리팅 | ✅ 완료 | 100% |
| 1b | AppRouter 분리 | ✅ 완료 | 100% |
| 1c | Hook 분리 (파일 생성) | ✅ 완료 | 80% (App.tsx 적용 미완) |
| 1d | 보안 취약점 30개 패치 | ⏳ 대기 | 0% |

### Phase 2 (Opus 설계 → Sonnet 구현)
| # | 작업 | 설계 상태 | 구현 상태 |
|---|---|---|---|
| 2a | 평가자 초대 시스템 | ⏳ 미설계 | 40% |
| 2b | WebSocket 실시간 협업 | ⏳ 미설계 | 35% |
| 2c | 고급 분석 기능 | ⏳ 미설계 | 30% |

### Phase 3 (Opus 설계 → Sonnet 구현)
| # | 작업 | 설계 상태 | 구현 상태 |
|---|---|---|---|
| 3a | Stripe 결제 | ⏳ 미설계 | 0% |
| 3b | 구독 관리 | ⏳ 미설계 | 0% |
| 3c | 청구서 생성 | ⏳ 미설계 | 0% |

---

## 📁 파일 구조 및 규칙

### 개발 문서 위치
```
Dev_md_2602/
├── README.md                      # 전체 개요
├── README_backup_YYYYMMDD.md      # README.md 백업
├── CLAUDE_backup_YYYYMMDD.md      # CLAUDE.md 갱신 시 백업
├── 개발일지_YYYYMMDD.md           # 일별 작업 기록
├── phase1_코드스플리팅.md          # Phase 1 상세
├── phase2_미완성기능.md            # Phase 2 상세
├── phase3_수익화.md               # Phase 3 상세
├── 보안_취약점_추적.md             # 보안 이슈 추적
├── 설계문서_Opus/                  # Opus 설계 산출물
│   ├── 평가초대_시스템_설계.md
│   ├── 실시간협업_아키텍처.md
│   ├── 고급분석_알고리즘.md
│   └── 결제시스템_설계.md
└── 평가보고서/
    ├── phase1_평가보고서.md
    ├── phase2_평가보고서.md
    └── 최종_평가보고서.md
```

### 소스 코드 구조 (변경 후 목표)
```
src/
├── App.tsx                    # ~300줄 (상태 + 초기화만)
├── router/
│   └── AppRouter.tsx          # 라우팅 전담
├── hooks/
│   ├── useAuth.ts             # 인증 로직
│   ├── useProjects.ts         # 프로젝트 CRUD
│   ├── useNavigation.ts       # 탭 네비게이션
│   └── useBackendStatus.ts    # 백엔드 상태
└── components/
    └── common/
        └── LoadingFallback.tsx # Suspense fallback
```

---

## 🔧 개발 환경 및 명령어

```bash
# 로컬 개발
npm start            # 개발 서버 (포트 3000)

# 빌드 및 배포
npm run build        # 프로덕션 빌드
npm run deploy       # GitHub Pages 배포 (build 후 자동)

# 품질 검사
npm run lint         # ESLint 검사
npm test             # 단위 테스트

# 번들 크기 확인 (빌드 후)
# build/static/js/ 폴더의 파일 크기 확인
```

---

## ⚠️ 중요 주의사항

### GitHub Pages 배포 제약
- React Router DOM 사용 불가 → 탭 기반 네비게이션 유지
- `window.history.pushState` 로 URL 동기화
- `?tab=XXX&project=YYY` 파라미터 방식 유지

### 평가자 URL 처리
- `?project=ID` 또는 `?eval=ID` 파라미터로 로그인 없이 접근
- `?token=TOKEN` 또는 `?key=KEY` 로 인증
- 이 로직은 절대 변경하지 말 것

### localStorage 키 목록
- `ahp_user` - 로그인 사용자 정보
- `ahp_temp_role` - 임시 역할 전환
- `ahp_super_mode` - 슈퍼 관리자 모드

---

**마지막 업데이트**: 2026-02-18 (Phase 1 완료)
**Sonnet 완료 작업**: Phase 1a(코드스플리팅), 1b(AppRouter분리), 1c(Hook파일생성)
**Sonnet 다음 작업**: Phase 1c App.tsx Hook 적용 + Phase 1d 보안패치
**Opus 다음 작업**: Phase 2a 설계 (평가자 초대 시스템) → `Dev_md_2602/설계문서_Opus/`
