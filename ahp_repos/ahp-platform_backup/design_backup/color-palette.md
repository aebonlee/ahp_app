# AHP Platform 컬러 팔레트 가이드

## 🎨 기본 컬러 시스템

### Primary Colors (주색상)

```css
/* 블루 계열 - 신뢰감과 전문성 */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-200: #bfdbfe
--primary-300: #93c5fd
--primary-400: #60a5fa
--primary-500: #3b82f6    /* 메인 브랜드 컬러 */
--primary-600: #2563eb
--primary-700: #1d4ed8
--primary-800: #1e40af
--primary-900: #1e3a8a
```

### Secondary Colors (보조색상)

```css
/* 그린 계열 - 성공, 완료 상태 */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* 옐로우 계열 - 경고, 진행 상태 */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* 레드 계열 - 오류, 위험 상태 */
--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

/* 퍼플 계열 - 고급 기능, 특별 상태 */
--purple-50: #faf5ff
--purple-500: #a855f7
--purple-600: #9333ea
```

### Neutral Colors (중성색상)

```css
/* 그레이 계열 - 텍스트 및 배경 */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

## 🌙 다크모드 지원

### 다크모드 컬러 매핑

```css
/* 라이트 모드 */
:root {
  --bg-base: #ffffff
  --bg-elevated: #f9fafb
  --text-primary: #111827
  --text-secondary: #6b7280
  --border-default: #e5e7eb
}

/* 다크 모드 */
[data-theme="dark"] {
  --bg-base: #111827
  --bg-elevated: #1f2937
  --text-primary: #f9fafb
  --text-secondary: #9ca3af
  --border-default: #374151
}
```

## 🎭 테마 시스템

### 3x3 컬러 매트릭스

AHP Platform은 동적 테마 변경을 지원하며, 9가지 조합을 제공합니다:

| 배경 톤 | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| Light   | Blue    | Green     | Purple |
| Medium  | Indigo  | Teal      | Orange |
| Dark    | Slate   | Emerald   | Rose   |

### 상태별 컬러 사용

```css
/* 상태 표시 */
.status-draft { color: var(--gray-500); }
.status-active { color: var(--success-500); }
.status-completed { color: var(--primary-500); }
.status-error { color: var(--error-500); }

/* 진행률 표시 */
.progress-low { color: var(--error-500); }      /* 0-30% */
.progress-medium { color: var(--warning-500); } /* 31-70% */
.progress-high { color: var(--success-500); }   /* 71-100% */
```

## 🎯 컬러 사용 가이드라인

### 1. 브랜드 컬러
- **Primary Blue (#3b82f6)**: 주요 버튼, 링크, 중요 요소
- **Success Green (#22c55e)**: 완료, 성공, 긍정적 피드백
- **Warning Yellow (#f59e0b)**: 주의, 진행중, 정보 알림
- **Error Red (#ef4444)**: 오류, 삭제, 위험 작업

### 2. 텍스트 컬러
- **Primary Text**: 제목, 중요 정보
- **Secondary Text**: 부가 설명, 메타 정보
- **Muted Text**: 힌트, 플레이스홀더

### 3. 배경 컬러
- **Base Background**: 페이지 기본 배경
- **Elevated Background**: 카드, 모달 배경
- **Muted Background**: 비활성 영역

## 🔧 CSS 변수 사용법

### 기본 사용법
```css
.my-component {
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
```

### 호버 상태
```css
.button-primary {
  background-color: var(--primary-500);
}

.button-primary:hover {
  background-color: var(--primary-600);
}
```

### 반응형 컬러
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-base: #111827;
  }
}
```

## 📱 반응형 컬러 고려사항

### 1. 모바일 최적화
- 터치 인터페이스를 위한 충분한 대비
- 작은 화면에서의 가독성 확보

### 2. 웹 접근성
- 최소 4.5:1 대비율 유지
- 색맹 사용자를 위한 대체 표시 방법

### 3. 브랜드 일관성
- 모든 플랫폼에서 일관된 브랜드 경험
- 다양한 디바이스에서의 컬러 재현성

---

**최종 업데이트**: 2025-09-02  
**버전**: v2.3.2