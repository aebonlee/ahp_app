# AHP Platform 디자인 시스템

이 폴더는 AHP 플랫폼의 디자인 시스템, UI/UX 가이드라인, 그리고 관련 개발 문서들을 정리한 공간입니다.

## 📁 폴더 구조

```
design/
├── README.md                                          # 이 파일
├── design-system-overview.md                          # 전체 디자인 시스템 개요
├── color-palette.md                                   # 컬러 팔레트 가이드
├── typography.md                                      # 타이포그래피 가이드
├── component-library.md                               # 컴포넌트 라이브러리
└── development-reports/                               # 디자인 관련 개발 보고서들
    ├── 72-CSS-디자인-시스템-전면-개선-보고서.md
    ├── 73-글로벌-테마-시스템-분리-및-구현-가이드.md
    ├── 74-Particles.js-동적-배경-및-3x3-컬러-팔레트-구현-보고서.md
    ├── 53-Luxury-Gray-Gold-디자인-시스템-구현-보고서.md
    ├── 100-UI_UX_IMPROVEMENTS.md
    ├── 102-RESPONSIVE_DESIGN_GUIDE.md
    ├── 01-color-system-enhancement-development.md
    ├── 17-responsive-design-simplification.md
    ├── 11-border-color-readability-improvement.md
    └── 38-header-redesign-implementation-report.md
```

## 🎨 디자인 시스템 핵심 원칙

### 1. **컬러 시스템**
- **기본 팔레트**: Gray-Gold Luxury 테마
- **동적 테마**: 3x3 컬러 매트릭스 지원
- **접근성**: WCAG 2.1 AA 준수
- **다크모드**: 완전 지원

### 2. **타이포그래피**
- **주 폰트**: Inter, Pretendard (한글 최적화)
- **계층구조**: H1-H6, Body, Caption 스타일
- **가독성**: 적절한 행간과 자간 설정

### 3. **컴포넌트 시스템**
- **재사용성**: 모듈화된 컴포넌트 설계
- **일관성**: 통일된 디자인 패턴
- **반응형**: 모바일 퍼스트 접근

### 4. **사용자 경험**
- **직관성**: 명확한 정보 구조
- **피드백**: 적절한 상호작용 피드백
- **접근성**: 키보드 네비게이션 지원

## 📖 주요 문서 설명

### 디자인 시스템 기초
- **color-palette.md**: 전체 컬러 시스템과 사용 가이드라인
- **typography.md**: 폰트 체계 및 텍스트 스타일링 가이드
- **component-library.md**: 재사용 가능한 컴포넌트 라이브러리

### 개발 히스토리
- **72-CSS-디자인-시스템-전면-개선-보고서.md**: CSS 기반 디자인 시스템 구축
- **73-글로벌-테마-시스템-분리-및-구현-가이드.md**: 테마 시스템 아키텍처
- **74-Particles.js-동적-배경-및-3x3-컬러-팔레트-구현-보고서.md**: 동적 배경 및 컬러 시스템
- **53-Luxury-Gray-Gold-디자인-시스템-구현-보고서.md**: 고급 디자인 테마

## 🛠️ 디자인 도구 및 워크플로우

### 사용 중인 기술 스택
- **CSS**: Tailwind CSS + Custom CSS Variables
- **아이콘**: 이모지 기반 아이콘 시스템
- **애니메이션**: CSS Transitions + Particles.js
- **테마**: CSS Custom Properties 기반 동적 테마

### 개발 워크플로우
1. **디자인 요구사항 분석**
2. **컴포넌트 설계 및 프로토타이핑**
3. **테마 변수 정의**
4. **반응형 구현**
5. **접근성 검증**
6. **사용자 테스트 및 피드백 반영**

## 🎯 디자인 목표

### 단기 목표
- [ ] 컴포넌트 라이브러리 문서화 완성
- [ ] 디자인 토큰 체계 정립
- [ ] Storybook 도입 검토

### 장기 목표
- [ ] 디자인 시스템 자동화 도구 구축
- [ ] 브랜드 아이덴티티 강화
- [ ] 사용자 중심 디자인 연구 확대

---

**최종 업데이트**: 2025-09-02  
**관리자**: AHP Platform Design Team