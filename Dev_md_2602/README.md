# AHP 플랫폼 개발 기록 - 2026년 02월~
> **개발 재개일**: 2026-02-18
> **목표**: 프로젝트 완성 (Phase 1~3 순차 진행)

---

## 📁 폴더 구조

```
Dev_md_2602/
├── README.md                    # 이 파일 - 전체 개요
├── 개발일지_20260218.md          # 일별 개발 기록
├── phase1_코드스플리팅.md        # Phase 1 계획 및 진행
├── phase2_미완성기능.md          # Phase 2 계획 및 진행
├── phase3_수익화.md              # Phase 3 계획 및 진행
├── 보안_취약점_추적.md            # 보안 이슈 추적
└── 평가보고서/
    ├── phase1_평가보고서.md
    ├── phase2_평가보고서.md
    └── 최종_평가보고서.md
```

---

## 🎯 개발 목표

### 현재 상태 (2026-02-18 기준)
| 항목 | 현재 | 목표 |
|---|---|---|
| 전체 완성도 | 75% | 100% |
| 번들 크기 | 2.8MB | 500KB 이하 |
| 보안 취약점 | 30개 | 0개 |
| 테스트 커버리지 | ~0% | 60% |
| ESLint 경고 | 350+ | 50 이하 |

### 주요 미완성 기능
- 평가자 초대 시스템 (40%)
- 고급 분석 기능 (30%)
- 실시간 협업 WebSocket (35%)
- 결제 시스템 Stripe (0%)

---

## 🗺️ 개발 로드맵

### Phase 1: 기반 안정화 (현재 진행)
- [x] 프로젝트 분석 및 문서화
- [ ] **Phase 1a**: React.lazy() 코드 스플리팅 (2.8MB → 500KB)
- [ ] **Phase 1b**: App.tsx 분리 (2309줄 → ~200줄)
- [ ] **Phase 1c**: 비즈니스 로직 Hook 분리
- [ ] 보안 취약점 30개 패치
- [ ] ESLint 경고 정리

### Phase 2: 핵심 미완성 기능
- [ ] 평가자 초대 이메일 시스템
- [ ] 실시간 협업 WebSocket
- [ ] 고급 분석 (Monte Carlo, 민감도)

### Phase 3: 수익화
- [ ] Stripe 결제 통합
- [ ] 구독 플랜 관리
- [ ] 청구서 생성

---

## 🤖 AI 협업 구조

| 역할 | AI 모델 | 담당 작업 |
|---|---|---|
| 구현/UI/통합 | **Claude Sonnet** (현재) | Code splitting, 컴포넌트 분리, Hook 추출, UI 구현 |
| 설계/알고리즘 | **Claude Opus** | AHP 알고리즘, 시스템 아키텍처, 보안 설계 |

---

## 📊 기술 스택

**Frontend**: React 18.2 + TypeScript 4.9 + Tailwind CSS 3
**Backend**: Django 4.2 + DRF + PostgreSQL 17
**배포**: GitHub Pages (FE) + Render.com (BE)
**CI/CD**: GitHub Actions

---

## 🔗 주요 링크

- **프론트엔드**: https://aebonlee.github.io/ahp_app
- **백엔드 API**: https://ahp-django-backend.onrender.com
- **GitHub FE**: https://github.com/aebonlee/ahp_app
- **GitHub BE**: https://github.com/aebonlee/ahp-django-service
