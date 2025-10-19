# 반응형 디자인 가이드 - AHP Research Platform

## 📐 반응형 브레이크포인트 시스템

### 🎯 설계 철학
AHP Research Platform은 **데스크톱 중심의 반응형 설계**를 채택합니다. 주 사용자층인 연구자와 평가자의 사용 환경을 고려하여 대형 모니터부터 태블릿까지 최적화된 경험을 제공합니다.

### 📊 브레이크포인트 체계

| 구분 | 화면 크기 | 컨테이너 최대 너비 | 좌우 패딩 | 주요 사용자 |
|------|-----------|-------------------|----------|-------------|
| **Extra Large** | 1980px+ | 1880px | 4rem | 4K 모니터, 대형 디스플레이 |
| **Large Desktop** | 1680-1979px | 1880px | 3rem | 대형 데스크톱 모니터 |
| **Desktop** | 1024-1679px | 1600px | 2.5rem | 표준 데스크톱, 노트북 |
| **Tablet** | ~1023px | 1024px | 2rem | 태블릿, 소형 노트북 |

### 🔧 CSS 변수 시스템

#### 브레이크포인트 변수
```css
:root {
  --breakpoint-mobile: 768px;   /* Mobile/Tablet threshold */
  --breakpoint-tablet: 1024px;  /* Tablet/Desktop threshold */
  --breakpoint-desktop: 1280px; /* Standard Desktop */
  --breakpoint-large: 1680px;   /* Large Desktop */
  --breakpoint-xlarge: 1980px;  /* Extra Large Desktop */
}
```

#### 컨테이너 너비 변수
```css
:root {
  --container-max-width: 1880px;     /* Max desktop width (under 1980px) */
  --container-desktop-width: 1600px; /* Standard desktop content width */
  --container-tablet-width: 1024px;  /* Tablet optimized width */
  --container-mobile-width: 100%;    /* Mobile full width */
}
```

## 🎨 레이아웃 클래스 시스템

### 📦 기본 컨테이너 클래스

#### 1. `.container-adaptive`
모든 화면 크기에 자동으로 적응하는 기본 컨테이너입니다.

```css
.container-adaptive {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* 반응형 적용 */
@media (max-width: 1023px) {
  .container-adaptive {
    max-width: var(--container-tablet-width);
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) and (max-width: 1679px) {
  .container-adaptive {
    max-width: var(--container-desktop-width);
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}
```

**사용법:**
```tsx
<div className="container-adaptive">
  {/* 자동으로 반응형 적용 */}
</div>
```

### 🎯 전용 컨테이너 클래스

#### 1. `.content-width-evaluator`
설문평가자를 위한 전용 레이아웃 (1024px 고정)

```css
.content-width-evaluator {
  max-width: var(--container-tablet-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
```

**사용법:**
```tsx
<div className="content-width-evaluator">
  {/* 평가자 최적화 레이아웃 */}
</div>
```

#### 2. `.content-width-admin`
관리자 대시보드용 레이아웃 (1600px 고정)

```css
.content-width-admin {
  max-width: var(--container-desktop-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}
```

#### 3. `.content-width-full`
최대 너비 활용 레이아웃 (1880px)

```css
.content-width-full {
  max-width: var(--container-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: 3rem;
  padding-right: 3rem;
}
```

## 📄 페이지 레이아웃 시스템

### 🏗️ 페이지 구조 클래스

#### 1. `.page-wrapper`
페이지 전체를 감싸는 최외각 컨테이너

```css
.page-wrapper {
  min-height: calc(100vh - var(--header-height));
  background-color: var(--bg-primary);
  padding: 0;
}
```

#### 2. `.page-container`
페이지 콘텐츠 컨테이너

```css
.page-container {
  width: 100%;
  min-height: calc(100vh - var(--header-height));
  background-color: var(--bg-primary);
  padding: 2rem 1rem;
}
```

#### 3. `.page-content`
실제 콘텐츠 영역

```css
.page-content {
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  margin: 0 auto;
}
```

#### 4. `.section-padding`
섹션 패딩 및 배경 통일

```css
.section-padding {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  background-color: var(--bg-primary);
  transition: background-color 0.3s var(--transition-luxury);
}
```

### 🎭 전용 페이지 레이아웃

#### `.page-evaluator`
설문평가자 전용 페이지 레이아웃

```css
.page-evaluator {
  background-color: var(--bg-primary);
  min-height: calc(100vh - var(--header-height));
}

.page-evaluator .page-content {
  max-width: var(--container-tablet-width);
  margin: 0 auto;
  padding: 2rem;
}
```

**사용 예시:**
```tsx
// PairwiseEvaluation.tsx
return (
  <div className="page-evaluator">
    <div className="page-content content-width-evaluator">
      {/* 평가자 최적화 콘텐츠 */}
    </div>
  </div>
);
```

## 📐 반응형 구현 패턴

### 🎨 CSS-in-JS 패턴

#### 1. CSS 변수 활용
```tsx
// ❌ 하드코딩 방식
<div className="bg-blue-500 text-white max-w-6xl">

// ✅ CSS 변수 방식  
<div style={{
  backgroundColor: 'var(--accent-primary)',
  color: 'white',
  maxWidth: 'var(--container-max-width)'
}}>
```

#### 2. 반응형 호버 효과
```tsx
<button
  style={{
    backgroundColor: 'var(--interactive-primary-light)',
    color: 'var(--interactive-secondary)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--interactive-primary)';
    e.currentTarget.style.color = 'white';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--interactive-primary-light)';
    e.currentTarget.style.color = 'var(--interactive-secondary)';
  }}
>
  버튼 텍스트
</button>
```

### 📱 미디어 쿼리 활용

#### 1. 조건부 스타일링
```css
/* 데스크톱 전용 스타일 */
@media (min-width: 1024px) {
  .desktop-only {
    display: block;
  }
}

/* 태블릿 이하 숨김 */
@media (max-width: 1023px) {
  .desktop-only {
    display: none;
  }
}
```

#### 2. 반응형 그리드
```css
.card-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🎯 컴포넌트별 반응형 가이드

### 📊 PairwiseEvaluation 컴포넌트

#### 반응형 구조
```tsx
return (
  <div className="page-evaluator">
    <div className="page-content content-width-evaluator">
      <div className="page-header">
        <h1 className="page-title">단계 2 — 평가하기 / 쌍대비교</h1>
        <p className="page-subtitle">프로젝트: {projectTitle}</p>
      </div>
      
      {/* 반응형 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 메인 매트릭스 영역 */}
        </div>
        <div className="lg:col-span-1">
          {/* 사이드 패널 */}
        </div>
      </div>
    </div>
  </div>
);
```

#### 카드 컴포넌트 스타일링
```tsx
<div className="card-enhanced p-4 mb-6">
  <div className="flex justify-between items-center mb-2">
    <span style={{ color: 'var(--text-primary)' }}>전체 진행률</span>
    <span style={{ color: 'var(--text-secondary)' }}>
      {currentMatrixIndex + 1} / {matrices.length} 매트릭스
    </span>
  </div>
</div>
```

### 📋 Layout 컴포넌트

#### 적응형 마진 시스템
```tsx
<main 
  className="flex-1 transition-luxury" 
  style={{
    marginLeft: user ? (sidebarCollapsed ? '4rem' : 'var(--sidebar-width)') : '0',
    minHeight: 'calc(100vh - var(--header-height))',
    transition: 'margin-left 0.3s ease'
  }}>
  <div className="container-adaptive section-padding">
    {children}
  </div>
</main>
```

## 🔍 베스트 프랙티스

### ✅ 권장사항

#### 1. CSS 변수 우선 사용
```tsx
// ✅ 좋은 예
style={{ color: 'var(--text-primary)' }}

// ❌ 피해야 할 예
className="text-gray-900"
```

#### 2. 의미있는 클래스명 사용
```tsx
// ✅ 의미있는 클래스명
<div className="content-width-evaluator">

// ❌ 구체적인 수치
<div className="max-w-6xl">
```

#### 3. 점진적 향상 (Progressive Enhancement)
```css
/* 기본 스타일 */
.component {
  padding: 1rem;
}

/* 큰 화면에서 향상 */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
  }
}
```

### ❌ 주의사항

#### 1. 하드코딩된 브레이크포인트 사용 금지
```css
/* ❌ 피해야 할 방식 */
@media (min-width: 1024px) { }

/* ✅ 권장 방식 */
@media (min-width: var(--breakpoint-tablet)) { }
```

#### 2. 과도한 중첩 피하기
```tsx
// ❌ 과도한 중첩
<div className="container">
  <div className="wrapper">
    <div className="content">
      <div className="inner">
        콘텐츠
      </div>
    </div>
  </div>
</div>

// ✅ 간결한 구조
<div className="page-container">
  <div className="page-content">
    콘텐츠
  </div>
</div>
```

#### 3. 배경색 일관성 보장
```tsx
// ❌ 배경색 누락
<main className="flex-1">
  <div className="section-padding">

// ✅ 명시적 배경색 적용
<main style={{ backgroundColor: 'var(--bg-primary)' }}>
  <div className="section-padding"> // 자동으로 배경색 적용
```

## 🧪 테스트 가이드

### 📐 반응형 테스트 체크리스트

#### 브레이크포인트별 확인사항
- [ ] **1980px+**: 콘텐츠가 1880px를 초과하지 않는지 확인
- [ ] **1680-1979px**: 패딩이 3rem 적용되었는지 확인  
- [ ] **1024-1679px**: 데스크톱 레이아웃이 정상 동작하는지 확인
- [ ] **~1023px**: 태블릿 최적화가 적용되었는지 확인

#### 컴포넌트별 확인사항
- [ ] **PairwiseEvaluation**: 1024px 고정 너비 적용 확인
- [ ] **Layout**: 사이드바 상태에 따른 마진 조정 확인
- [ ] **Header**: 반응형 네비게이션 정상 동작 확인

### 🔍 디버깅 도구

#### 1. 브라우저 개발자 도구
```javascript
// 현재 적용된 CSS 변수 확인
getComputedStyle(document.documentElement)
  .getPropertyValue('--container-max-width');

// 현재 브레이크포인트 확인  
window.innerWidth;
```

#### 2. CSS 변수 오버라이드 테스트
```css
/* 임시 테스트용 */
:root {
  --container-max-width: 1200px !important;
}
```

---

**작성일**: 2025-08-23  
**버전**: 1.0.0  
**관리자**: Development Team  
**다음 업데이트**: 추가 컴포넌트 반응형 가이드 예정