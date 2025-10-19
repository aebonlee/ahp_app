# AHP Platform 타이포그래피 가이드

## 🔤 폰트 시스템

### 주 폰트 스택

```css
/* 한글 최적화 폰트 스택 */
font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Malgun Gothic', sans-serif;
```

### 웹폰트 설정

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

## 📏 텍스트 스케일

### 헤딩 스케일 (Heading Scale)

```css
/* H1 - 페이지 메인 제목 */
.text-h1 {
  font-size: 2.25rem;        /* 36px */
  line-height: 2.5rem;       /* 40px */
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* H2 - 섹션 제목 */
.text-h2 {
  font-size: 1.875rem;       /* 30px */
  line-height: 2.25rem;      /* 36px */
  font-weight: 600;
  letter-spacing: -0.025em;
}

/* H3 - 서브섹션 제목 */
.text-h3 {
  font-size: 1.5rem;         /* 24px */
  line-height: 2rem;         /* 32px */
  font-weight: 600;
}

/* H4 - 카드/컴포넌트 제목 */
.text-h4 {
  font-size: 1.25rem;        /* 20px */
  line-height: 1.75rem;      /* 28px */
  font-weight: 600;
}

/* H5 - 작은 제목 */
.text-h5 {
  font-size: 1.125rem;       /* 18px */
  line-height: 1.75rem;      /* 28px */
  font-weight: 600;
}

/* H6 - 최소 제목 */
.text-h6 {
  font-size: 1rem;           /* 16px */
  line-height: 1.5rem;       /* 24px */
  font-weight: 600;
}
```

### 본문 텍스트 (Body Text)

```css
/* Large Body - 중요한 본문 */
.text-lg {
  font-size: 1.125rem;       /* 18px */
  line-height: 1.75rem;      /* 28px */
  font-weight: 400;
}

/* Base Body - 기본 본문 */
.text-base {
  font-size: 1rem;           /* 16px */
  line-height: 1.5rem;       /* 24px */
  font-weight: 400;
}

/* Small Body - 부가 정보 */
.text-sm {
  font-size: 0.875rem;       /* 14px */
  line-height: 1.25rem;      /* 20px */
  font-weight: 400;
}

/* Extra Small - 캡션, 힌트 */
.text-xs {
  font-size: 0.75rem;        /* 12px */
  line-height: 1rem;         /* 16px */
  font-weight: 400;
}
```

### 특수 텍스트 스타일

```css
/* 강조 텍스트 */
.text-emphasis {
  font-weight: 600;
  color: var(--text-primary);
}

/* 설명 텍스트 */
.text-muted {
  color: var(--text-secondary);
  font-weight: 400;
}

/* 링크 텍스트 */
.text-link {
  color: var(--primary-600);
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  color: var(--primary-700);
}
```

## 📱 반응형 타이포그래피

### 모바일 최적화

```css
/* 모바일에서 폰트 크기 조정 */
@media (max-width: 640px) {
  .text-h1 { font-size: 1.875rem; line-height: 2.25rem; }
  .text-h2 { font-size: 1.5rem; line-height: 2rem; }
  .text-h3 { font-size: 1.25rem; line-height: 1.75rem; }
  .text-h4 { font-size: 1.125rem; line-height: 1.5rem; }
}
```

### 태블릿 최적화

```css
@media (min-width: 641px) and (max-width: 1024px) {
  .text-h1 { font-size: 2rem; line-height: 2.5rem; }
  .text-h2 { font-size: 1.75rem; line-height: 2.25rem; }
}
```

## 🎯 사용 가이드라인

### 1. 텍스트 계층구조

```html
<!-- 페이지 제목 -->
<h1 class="text-h1 text-gray-900">AHP 프로젝트 관리</h1>

<!-- 섹션 제목 -->
<h2 class="text-h2 text-gray-800">설문조사 관리</h2>

<!-- 카드 제목 -->
<h3 class="text-h3 text-gray-700">진행률 모니터링</h3>

<!-- 본문 -->
<p class="text-base text-gray-600">설문조사 생성 및 관리를 위한 인터페이스입니다.</p>

<!-- 부가 정보 -->
<span class="text-sm text-gray-500">최근 업데이트: 2025-09-02</span>
```

### 2. 다국어 지원

```css
/* 한글 텍스트 최적화 */
.text-korean {
  font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
  word-break: keep-all;
  line-height: 1.6;
}

/* 영문 텍스트 최적화 */
.text-english {
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}
```

### 3. 특수 상황 텍스트

```css
/* 에러 메시지 */
.text-error {
  color: var(--error-600);
  font-weight: 500;
}

/* 성공 메시지 */
.text-success {
  color: var(--success-600);
  font-weight: 500;
}

/* 경고 메시지 */
.text-warning {
  color: var(--warning-600);
  font-weight: 500;
}

/* 코드 텍스트 */
.text-code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  background-color: var(--gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
```

## 🌙 다크모드 타이포그래피

### 다크모드 텍스트 조정

```css
[data-theme="dark"] {
  /* 다크모드에서 가독성 향상을 위한 행간 증가 */
  --base-line-height: 1.6;
  
  /* 텍스트 컬러 재정의 */
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
}

[data-theme="dark"] .text-code {
  background-color: var(--gray-800);
  color: var(--gray-300);
}
```

## 📊 접근성 가이드라인

### 1. 대비율 요구사항

- **대제목 (H1-H2)**: 최소 7:1 대비율
- **본문 텍스트**: 최소 4.5:1 대비율  
- **작은 텍스트**: 최소 7:1 대비율

### 2. 가독성 최적화

```css
/* 긴 텍스트 가독성 향상 */
.text-readable {
  max-width: 65ch;           /* 적정 읽기 폭 */
  line-height: 1.7;          /* 충분한 행간 */
  word-spacing: 0.1em;       /* 적절한 어간 */
}
```

### 3. 포커스 상태

```css
/* 키보드 네비게이션을 위한 포커스 스타일 */
.focusable:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

## 🎨 실전 사용 예시

### 대시보드 카드

```html
<div class="bg-white p-6 rounded-lg shadow-sm">
  <h3 class="text-h4 text-gray-900 mb-2">전체 진행률</h3>
  <p class="text-2xl font-bold text-primary-600 mb-1">85%</p>
  <p class="text-sm text-gray-500">26명 중 22명 완료</p>
</div>
```

### 설문조사 카드

```html
<div class="border border-gray-200 rounded-lg p-4">
  <h4 class="text-h5 text-gray-800 mb-1">표준 인구통계 설문</h4>
  <p class="text-sm text-gray-600 mb-3">기본 인구통계학적 정보 수집</p>
  <div class="flex justify-between text-xs text-gray-500">
    <span>응답률: 72%</span>
    <span>평균 소요시간: 3분</span>
  </div>
</div>
```

### 진행률 표시

```html
<div class="flex items-center justify-between">
  <span class="text-sm font-medium text-gray-700">김철수</span>
  <div class="flex items-center space-x-2">
    <div class="w-32 bg-gray-200 rounded-full h-2">
      <div class="bg-blue-500 h-2 rounded-full" style="width: 75%"></div>
    </div>
    <span class="text-xs text-gray-500">75%</span>
  </div>
</div>
```

## 🔧 개발자 참고사항

### 1. CSS 클래스 네이밍

- `.text-{size}`: 폰트 크기 (`text-lg`, `text-sm`)
- `.font-{weight}`: 폰트 두께 (`font-bold`, `font-medium`)
- `.text-{color}`: 텍스트 색상 (`text-gray-600`, `text-primary-500`)

### 2. 동적 텍스트 스타일링

```typescript
const getTextStyle = (status: string) => {
  switch(status) {
    case 'completed': return 'text-success-600 font-medium';
    case 'in_progress': return 'text-warning-600 font-medium';
    case 'pending': return 'text-gray-500';
    default: return 'text-gray-600';
  }
};
```

### 3. 국제화 고려사항

```css
/* 한글과 영문이 혼재된 텍스트 */
.mixed-lang {
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
}
```

---

**최종 업데이트**: 2025-09-02  
**버전**: v2.3.2