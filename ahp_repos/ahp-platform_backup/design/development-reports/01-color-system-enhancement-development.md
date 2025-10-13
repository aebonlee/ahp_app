# 컬러 시스템 통합 및 가독성 개선 개발 문서

## 작업 개요
- **작업 일자**: 2025-08-29
- **작업 유형**: 컬러 시스템 통합 및 UI/UX 개선
- **목표**: 통일된 컬러 시스템 구축 및 가독성 향상

## 1. 컬러 템플릿 확장 시스템

### 1.1 기본 컬러 팔레트 (3색)
```css
/* Primary Colors */
--color-primary: #3B82F6;      /* Blue */
--color-secondary: #10B981;    /* Green */
--color-tertiary: #F59E0B;     /* Amber */
```

### 1.2 확장 컬러 (다크 & 파스텔)
```css
/* Dark Variants */
--color-primary-dark: #1E40AF;
--color-secondary-dark: #047857;
--color-tertiary-dark: #D97706;

/* Pastel Variants */
--color-primary-pastel: #DBEAFE;
--color-secondary-pastel: #D1FAE5;
--color-tertiary-pastel: #FEF3C7;
```

### 1.3 그레이 스케일 시스템
```css
/* Unified Gray Scale */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

## 2. CSS 변수 시스템 구축

### 2.1 글로벌 변수 정의
```css
:root {
  /* Text Colors */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-tertiary: var(--gray-500);
  --text-disabled: var(--gray-400);
  
  /* Background Colors */
  --bg-primary: #FFFFFF;
  --bg-secondary: var(--gray-50);
  --bg-tertiary: var(--gray-100);
  
  /* Border Colors */
  --border-light: var(--gray-200);
  --border-default: var(--gray-300);
  --border-dark: var(--gray-400);
  
  /* Status Colors */
  --status-success: #10B981;
  --status-warning: #F59E0B;
  --status-error: #EF4444;
  --status-info: #3B82F6;
}

/* Dark Mode */
[data-theme="dark"] {
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-300);
  --text-tertiary: var(--gray-400);
  --text-disabled: var(--gray-600);
  
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --bg-tertiary: var(--gray-700);
  
  --border-light: var(--gray-700);
  --border-default: var(--gray-600);
  --border-dark: var(--gray-500);
}
```

## 3. 컴포넌트별 적용 가이드

### 3.1 Button 컴포넌트
```typescript
// 이모지 제거, 깔끔한 텍스트 기반 디자인
const Button = ({ variant, children }) => {
  const styles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: 'white',
      border: 'none'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)'
    }
  };
};
```

### 3.2 Card 컴포넌트
```typescript
const Card = ({ variant }) => {
  const styles = {
    default: {
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    elevated: {
      backgroundColor: 'var(--bg-primary)',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  };
};
```

## 4. 이모지 사용 최소화 가이드

### 4.1 제거 대상
- 메뉴 아이템의 불필요한 이모지
- 버튼 텍스트 내 장식용 이모지
- 상태 표시용 이모지 (아이콘으로 대체)

### 4.2 유지 대상
- 중요 알림/경고 메시지
- 프로세스 완료 표시
- 사용자 피드백 메시지

## 5. 구현 체크리스트

- [ ] index.css에 통합 CSS 변수 시스템 적용
- [ ] Button.tsx 컬러 시스템 적용 및 이모지 제거
- [ ] Card.tsx 컬러 시스템 적용
- [ ] CriteriaManagement.tsx 이모지 최소화
- [ ] PersonalServiceDashboard.tsx 컬러 통일
- [ ] 다크모드 지원 검증
- [ ] 접근성 테스트 (색상 대비)

## 6. 성능 최적화

### 6.1 CSS 변수 활용
- 런타임 스타일 계산 최소화
- 테마 전환 시 리렌더링 최적화

### 6.2 컴포넌트 메모이제이션
```typescript
import { memo } from 'react';

const Button = memo(({ ... }) => {
  // 컴포넌트 로직
});
```

## 7. 테스트 시나리오

1. **라이트/다크 모드 전환**
   - 모든 텍스트 가독성 확인
   - 배경색과 전경색 대비 확인

2. **컬러 팔레트 변경**
   - 3x3 컬러 선택기 동작 확인
   - 선택된 컬러의 일관된 적용 확인

3. **접근성 검증**
   - WCAG 2.1 AA 기준 충족
   - 색맹 사용자 고려

## 8. 향후 개선 계획

1. **컬러 테마 프리셋**
   - 기업용 테마
   - 교육용 테마
   - 의료용 테마

2. **사용자 커스텀 테마**
   - 개인 컬러 저장
   - 테마 공유 기능

3. **동적 테마 생성**
   - AI 기반 컬러 추천
   - 브랜드 컬러 자동 추출