# Dev_md_2602 - AHP 플랫폼 개발 기록 (2026년 02월~)

## 개요
- **프로젝트**: AHP Decision Support Platform
- **개발 재개**: 2026-02-18
- **현재 완성도**: 75% → 목표 100%
- **AI 협업**: Claude Opus 4.6 (설계/알고리즘/감사/구현) + Claude Sonnet 4.6 (구현/통합)

## 코드베이스 현황 (2026-02-23 기준)

| 항목 | 수치 |
|------|------|
| 총 컴포넌트 | 150+ |
| 서비스 파일 | 14 |
| 커스텀 훅 | 4 → **11** (7개 신규: 6 Phase 1 + useInvitations) |
| Context | 0 → **5** (신규 도입) |
| 분석 유틸리티 | 3 → **8** (5개 신규: MC/Tornado/Consensus/Pareto/Robustness) |
| 라우트 설정 | 80+ (routeConfig.ts) |
| Lazy 로딩 | 40+ |
| 종합 품질 점수 | 6.9/10 |

### 핵심 개선 대상
- ~~**App.tsx 1,985줄**~~ → ✅ **22줄로 축소 완료** (AppContent.tsx ~550줄)
- ~~**상태 관리**~~ → ✅ **Context API 5개 + AppProviders 적용 완료**
- ~~**보안 패치**~~ → ✅ **5건 패치 완료** (innerHTML XSS, XOR→AES-GCM, JWT sessionStorage, 전역변수 제거)

## 폴더 구조

```
Dev_md_2602/
├── README.md                          # 이 파일
├── 개발일지_20260223.md               # 품질감사 + 버그수정 + 구현
├── 설계문서_Opus/                      # Opus 설계 산출물
│   ├── 평가초대_시스템_설계.md          # Phase 2a ✅
│   ├── 실시간협업_아키텍처.md           # Phase 2b ✅
│   ├── 고급분석_알고리즘.md             # Phase 2c ✅
│   ├── 결제시스템_설계.md              # Phase 3a ✅
│   ├── App분해_설계.md                # Phase 1e ✅
│   ├── 상태관리_아키텍처.md            # Phase 1f ✅
│   └── AppRouter_재설계.md            # Phase 1b ✅
└── 평가보고서/                         # 단계별 평가
    ├── phase1_평가보고서.md
    ├── phase2_평가보고서.md
    └── 최종_평가보고서.md

src/ (신규 생성 파일)
├── hooks/
│   ├── useActionMessage.ts            # 토스트 메시지
│   ├── useAuth.ts                     # 인증 로직
│   ├── useBackendStatus.ts            # 백엔드 연결/세션
│   ├── useNavigation.ts               # 탭/URL/모드 전환
│   ├── useProjects.ts                 # 프로젝트 CRUD
│   └── useUsers.ts                    # 사용자 CRUD
├── contexts/
│   ├── AuthContext.tsx                 # 인증 상태 Context
│   ├── NavigationContext.tsx           # 네비게이션 Context
│   ├── ProjectContext.tsx              # 프로젝트 Context
│   ├── UIContext.tsx                   # UI/백엔드 Context
│   └── AppProviders.tsx               # 오케스트레이션
├── routes/
│   └── routeConfig.ts                 # 선언적 라우트 맵
├── components/guards/
│   ├── AuthGuard.tsx                   # 인증 필수 가드
│   └── ProjectGuard.tsx               # 프로젝트 선택 가드
├── types/
│   └── invitation.ts                   # 초대 시스템 타입 (Phase 2a)
├── services/
│   └── invitationService.ts           # 초대 API 서비스 (Phase 2a)
└── utils/  (Phase 2c 신규)
    ├── advancedMonteCarlo.ts          # 고급 MC 시뮬레이션
    ├── advancedSensitivity.ts         # 토네이도 차트 + 순위 역전
    ├── groupConsensus.ts              # AIJ/AIP/Fuzzy/Shannon
    ├── paretoAnalysis.ts              # 파레토 프론티어
    └── robustnessAnalysis.ts          # 복합 강건성 점수
```

## 로드맵 (2026-02-23 최종 갱신)

### Phase 1 - 리팩토링 & 안정화

| 작업 | 담당 | 상태 | 비고 |
|------|------|------|------|
| 1a React.lazy() 코드 스플리팅 | Sonnet | ✅ 100% | 40+ 컴포넌트 |
| 1b AppRouter 분리 | Opus | ✅ 인프라 구축 | routeConfig + guards |
| 1c 비즈니스 로직 Hook 분리 | Opus | ✅ 100% | 훅 6개 추출 |
| 1d 보안 취약점 패치 | Opus | ✅ 100% | innerHTML XSS, XOR→AES-GCM, JWT hardening, 전역변수 |
| 1e App.tsx 분해 | Opus | ✅ 100% | 1,985줄 → 22줄 완료 |
| 1f 상태 관리 도입 | Opus | ✅ 100% | Context 5개 + AppProviders 연결 완료 |
| 1g 프로덕션 로그 정리 | Opus | ✅ 100% | dataService 12건 + authService 1건 제거 |

### Phase 2 - 핵심 기능

| 작업 | Opus 설계 | 구현 | 비고 |
|------|-----------|------|------|
| 2a 평가자 초대 시스템 | ✅ 완료 | ✅ FE 완료 | 타입/서비스/훅 (백엔드 연동 대기) |
| 2b WebSocket 실시간 협업 | ✅ 완료 | ⏳ 대기 | Django Channels, Redis |
| 2c 고급 분석 기능 | ✅ 완료 | ✅ 알고리즘 완료 | MC/Tornado/AIJ·AIP/Shannon/Pareto/Robustness |

### Phase 3 - 수익화

| 작업 | Opus 설계 | 구현 | 비고 |
|------|-----------|------|------|
| 3a Stripe 결제 시스템 | ✅ 완료 | ⏳ 대기 | 4 플랜, Webhook |
| 3b 구독 플랜 관리 | ⏳ 대기 | ⏳ 대기 | 플랜 전환 로직 |
| 3c 청구서 생성 | ⏳ 대기 | ⏳ 대기 | PDF, 세금 계산 |

## 다음 작업 (우선순위 순)

1. ~~**App.tsx 실제 교체**~~ ✅ **완료** (1,985줄 → 22줄)
2. ~~**보안 패치**~~ ✅ **완료** (5건)
3. ~~**프로덕션 로그 정리**~~ ✅ **완료** (13건 제거)
4. ~~**소비자 마이그레이션**~~ ✅ **완료** (PSD 16 props → Context)
5. ~~**Phase 2c 고급 분석**~~ ✅ **완료** (5개 알고리즘 유틸리티)
6. ~~**Phase 2a 초대 FE**~~ ✅ **완료** (타입/서비스/훅)
7. **Phase 2b WebSocket 구현**: Django Channels 백엔드 필요
8. **Phase 3 수익화 구현**

## 참고 링크
- **프론트엔드**: https://aebonlee.github.io/ahp_app/
- **백엔드 API**: https://ahp-django-backend.onrender.com
- **리포지토리**: https://github.com/aebonlee/ahp_app
