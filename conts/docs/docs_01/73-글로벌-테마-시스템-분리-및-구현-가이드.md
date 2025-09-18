# CSS 테마 시스템 분리 가이드

## 개요
**작업일자**: 2025-08-28  
**목적**: 라이트/다크모드와 컬러 팔레트를 global.css로 분리  
**원칙**: UI/로직 변경 없이 테마 정의만 분리  

---

## 📁 새로운 CSS 구조

### 파일 구성
```
src/styles/
├── global.css           # 새로 생성 - 전역 테마 변수
├── design-system.css    # 수정 - 컴포넌트 스타일
└── (기타 컴포넌트별 CSS)

src/
├── index.css           # 수정 - global.css import 추가
├── App.css            # 기존 유지 - 앱 전용 스타일
└── ...
```

### Import 순서
```css
/* 1. Global theme variables first */
@import './styles/global.css';

/* 2. Tailwind base */
@tailwind base;
@tailwind components; 
@tailwind utilities;

/* 3. Component styles (optional) */
@import './styles/design-system.css';
```

---

## 🎨 global.css - 핵심 특징

### 1. 통합 컬러 시스템
```css
/* Brand Colors */
--brand-gold-primary: #C8A968;
--brand-gold-secondary: #A98C4B;
--brand-gray-primary: #848484;

/* Neutral Palette (12단계) */
--neutral-0: #ffffff;
--neutral-50: #fafafa;
/* ... */
--neutral-950: #0f0f0f;

/* Semantic Colors */
--semantic-info: #3B82F6;
--semantic-success: #10B981;
--semantic-warning: #F59E0B;
--semantic-danger: #EF4444;
```

### 2. 라이트/다크 테마
```css
/* Light Theme (Default) */
:root,
[data-theme="light"] {
  --bg-base: #ffffff;
  --text-primary: var(--neutral-950);
  /* ... */
}

/* Dark Theme */
[data-theme="dark"] {
  --bg-base: var(--neutral-950);
  --text-primary: var(--neutral-50);
  /* ... */
}

/* System Preference Support */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Auto dark mode */
  }
}
```

### 3. 디자인 토큰
```css
/* Typography */
--font-family-sans: 'Inter', ...;
--font-size-base: 1rem;
--line-height-normal: 1.5;

/* Spacing (8px 기반) */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */

/* Transitions */
--transition-all: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
--duration-150: 150ms;

/* Shadows */
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
```

---

## 🔧 컴포넌트 업데이트

### Button 컴포넌트 개선
**Before**:
```tsx
const variantClasses = {
  primary: 'bg-gradient-gold text-white shadow-luxury-gold'
};
```

**After**:
```tsx
const variantClasses = {
  primary: 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
};
```

### 테마 변수 활용 예시
```css
/* Components can now use semantic variables */
.card {
  background: var(--surface-base);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
}

.button-primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.status-success {
  background: var(--status-success-bg);
  border: 1px solid var(--status-success-border);
  color: var(--status-success-text);
}
```

---

## 📱 테마 전환 방법

### JavaScript에서 테마 변경
```javascript
// Light mode
document.documentElement.setAttribute('data-theme', 'light');

// Dark mode  
document.documentElement.setAttribute('data-theme', 'dark');

// System preference
document.documentElement.removeAttribute('data-theme');
```

### React Hook 예시 (기존 코드 활용)
```typescript
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  
  useEffect(() => {
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  return { theme, setTheme };
};
```

---

## ♿ 접근성 개선사항

### 1. WCAG 2.2 AA 준수
```css
/* 충분한 색상 대비 */
--text-primary: var(--neutral-950); /* 21:1 ratio */
--text-secondary: var(--neutral-800); /* 7:1 ratio */

/* Focus indicators */
--focus-ring-color: var(--brand-gold-primary);
:focus-visible {
  outline: 2px solid var(--focus-ring-color);
}
```

### 2. 모션 접근성
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. 고대비 모드 지원
```css
@media (prefers-contrast: high) {
  :root {
    --border-subtle: var(--neutral-400);
    --border-default: var(--neutral-500);
  }
}
```

---

## 🚀 성능 최적화

### 1. CSS 로드 최적화
```css
/* 폰트 최적화 */
@import url('...&display=swap');

/* 중복 제거 */
/* Before: 1,116줄 (index.css) */
/* After: 분리된 모듈 구조 */
```

### 2. 런타임 성능
- CSS 변수 사용으로 JS 계산 최소화
- 하드웨어 가속 트랜지션
- 불필요한 리페인트 방지

### 3. 번들 크기
- 중복 색상 정의 제거
- 사용하지 않는 CSS 변수 정리
- 트리 셰이킹 가능한 구조

---

## 📋 마이그레이션 체크리스트

### ✅ 완료된 작업
- [x] global.css 파일 생성 및 테마 변수 정의
- [x] index.css에서 global.css import 추가
- [x] design-system.css 테마 변수 업데이트  
- [x] Button 컴포넌트 글로벌 변수 적용
- [x] 중복 CSS 정의 제거

### 📝 향후 권장 작업
- [ ] 모든 컴포넌트에 글로벌 테마 변수 적용
- [ ] 인라인 스타일을 CSS 클래스로 전환
- [ ] 컴포넌트별 CSS 모듈화 검토
- [ ] 테마 전환 애니메이션 추가

---

## 💡 사용 가이드

### 1. 새 컴포넌트 개발 시
```css
/* ❌ 하드코딩된 색상 사용 금지 */
.my-component {
  background: #ffffff;
  color: #000000;
}

/* ✅ 글로벌 테마 변수 사용 */
.my-component {
  background: var(--surface-base);
  color: var(--text-primary);
}
```

### 2. Tailwind와 함께 사용
```tsx
// CSS 변수를 Tailwind arbitrary values로 사용
<div className="bg-[var(--surface-base)] text-[var(--text-primary)]">
  컨텐츠
</div>
```

### 3. 상태별 색상 사용
```css
/* 상태별 의미론적 색상 활용 */
.success-message {
  background: var(--status-success-bg);
  border: 1px solid var(--status-success-border);
  color: var(--status-success-text);
}
```

---

## 🔄 테마 확장 가능성

### 커스텀 테마 추가
```css
[data-theme="custom"] {
  --brand-gold-primary: #your-color;
  --bg-base: #your-bg;
  /* ... */
}
```

### 브랜드별 테마
```css
[data-brand="company-a"] {
  --brand-gold-primary: #company-a-primary;
}

[data-brand="company-b"] {  
  --brand-gold-primary: #company-b-primary;
}
```

---

## 🎯 핵심 장점

### 1. 개발 효율성
- 단일 소스에서 모든 테마 관리
- 일관된 디자인 시스템
- 빠른 테마 전환

### 2. 유지보수성
- 중앙화된 색상 관리
- 컴포넌트 독립성
- 확장 가능한 구조

### 3. 사용자 경험
- 부드러운 테마 전환
- 시스템 설정 자동 감지
- 접근성 기준 준수

---

## 📞 지원 및 문의

이 테마 시스템에 대한 질문이나 추가 개선사항이 있으시면 개발팀에 문의하세요.

**중요**: UI 컴포넌트나 로직은 변경하지 않고, 오직 테마 변수만 사용하여 스타일링하세요.

---

*작성자: AHP Research Platform Development Team*  
*최종 업데이트: 2025-08-28*