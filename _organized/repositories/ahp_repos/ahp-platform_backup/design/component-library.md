# AHP Platform 컴포넌트 라이브러리

## 🧩 컴포넌트 시스템 개요

AHP Platform의 UI 컴포넌트들은 재사용성, 일관성, 접근성을 중시하여 설계되었습니다.

## 🔘 기본 컴포넌트 (Atoms)

### 1. 버튼 (Buttons)

#### Primary Button
```typescript
// 사용법
<button className="btn-primary">저장</button>

// CSS 클래스
.btn-primary {
  @apply px-4 py-2 bg-primary-500 text-white rounded-lg font-medium
         hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
         disabled:bg-gray-300 disabled:cursor-not-allowed;
}
```

#### Secondary Button
```typescript
<button className="btn-secondary">취소</button>

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium
         hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}
```

#### Danger Button
```typescript
<button className="btn-danger">삭제</button>

.btn-danger {
  @apply px-4 py-2 bg-error-500 text-white rounded-lg font-medium
         hover:bg-error-600 focus:ring-2 focus:ring-error-500 focus:ring-offset-2;
}
```

### 2. 입력 필드 (Input Fields)

#### Text Input
```typescript
<input 
  type="text" 
  className="input-field" 
  placeholder="프로젝트 이름을 입력하세요"
/>

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
         placeholder-gray-400;
}
```

#### Textarea
```typescript
<textarea className="textarea-field" rows={4} />

.textarea-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}
```

### 3. 카드 (Cards)

#### 기본 카드
```typescript
<div className="card">
  <div className="card-header">
    <h3 className="card-title">카드 제목</h3>
  </div>
  <div className="card-content">
    카드 내용
  </div>
</div>

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-content {
  @apply px-6 py-4;
}
```

#### 통계 카드
```typescript
<div className="stat-card">
  <div className="stat-icon">📊</div>
  <div className="stat-content">
    <h4 className="stat-label">전체 진행률</h4>
    <p className="stat-value">85%</p>
    <p className="stat-description">26명 중 22명 완료</p>
  </div>
</div>

.stat-card {
  @apply bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow;
}

.stat-icon {
  @apply text-2xl mb-3;
}

.stat-label {
  @apply text-sm font-medium text-gray-600 mb-1;
}

.stat-value {
  @apply text-2xl font-bold text-primary-600 mb-1;
}

.stat-description {
  @apply text-sm text-gray-500;
}
```

## 🔗 복합 컴포넌트 (Molecules)

### 1. 네비게이션 (Navigation)

#### 탭 네비게이션
```typescript
const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="tab-navigation">
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
        onClick={() => onTabChange(tab.id)}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);

.tab-navigation {
  @apply flex border-b border-gray-200 mb-6;
}

.tab-item {
  @apply px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent
         hover:text-gray-700 hover:border-gray-300;
}

.tab-active {
  @apply text-primary-600 border-primary-600;
}
```

### 2. 모달 (Modals)

#### 확인 모달
```typescript
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  isOpen && (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>취소</button>
          <button className="btn-danger" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  )
);

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 bg-gray-50 flex justify-end space-x-3;
}
```

### 3. 페이지네이션 (Pagination)

```typescript
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button 
      className="pagination-btn"
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      이전
    </button>
    
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
        onClick={() => onPageChange(i + 1)}
      >
        {i + 1}
      </button>
    ))}
    
    <button 
      className="pagination-btn"
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      다음
    </button>
  </div>
);

.pagination {
  @apply flex items-center justify-center space-x-2 mt-6;
}

.pagination-btn {
  @apply px-3 py-2 text-sm font-medium text-gray-500 rounded-lg
         hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-number {
  @apply w-8 h-8 flex items-center justify-center text-sm font-medium
         text-gray-700 rounded-full hover:bg-gray-100;
}

.pagination-number.active {
  @apply bg-primary-500 text-white hover:bg-primary-600;
}
```

## 🎯 전문 컴포넌트 (Organisms)

### 1. 설문조사 카드

```typescript
const SurveyCard = ({ survey, onEdit, onDelete, onToggleStatus }) => (
  <div className="survey-card">
    <div className="survey-header">
      <h3 className="survey-title">{survey.title}</h3>
      <div className="survey-status-badge">
        <span className={`status-badge ${survey.status}`}>
          {survey.status === 'active' ? '활성' : '비활성'}
        </span>
      </div>
    </div>
    
    <p className="survey-description">{survey.description}</p>
    
    <div className="survey-stats">
      <div className="stat-item">
        <span className="stat-label">응답수</span>
        <span className="stat-value">{survey.responses}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">완료율</span>
        <span className="stat-value">{survey.completionRate}%</span>
      </div>
    </div>
    
    <div className="survey-actions">
      <button className="btn-secondary" onClick={() => onEdit(survey)}>편집</button>
      <button className="btn-danger" onClick={() => onDelete(survey)}>삭제</button>
    </div>
  </div>
);

.survey-card {
  @apply bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow;
}

.survey-header {
  @apply flex items-start justify-between mb-3;
}

.survey-title {
  @apply text-lg font-semibold text-gray-900;
}

.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.status-badge.active {
  @apply bg-green-100 text-green-800;
}

.status-badge.inactive {
  @apply bg-gray-100 text-gray-800;
}
```

### 2. 평가자 진행 카드

```typescript
const EvaluatorProgressCard = ({ evaluator }) => (
  <div className="evaluator-card">
    <div className="evaluator-avatar">
      {evaluator.name.charAt(0)}
    </div>
    <div className="evaluator-info">
      <h4 className="evaluator-name">{evaluator.name}</h4>
      <p className="evaluator-email">{evaluator.email}</p>
      <p className="evaluator-meta">
        {evaluator.department} • {evaluator.lastActivity}
      </p>
    </div>
    <div className="evaluator-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${evaluator.progress}%` }}
        />
      </div>
      <span className="progress-text">{evaluator.progress}%</span>
    </div>
    <div className={`status-badge ${evaluator.status}`}>
      {evaluator.status === 'completed' ? '완료' : 
       evaluator.status === 'in_progress' ? '진행중' : '대기'}
    </div>
  </div>
);

.evaluator-card {
  @apply flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg
         hover:bg-gray-50 transition-colors;
}

.evaluator-avatar {
  @apply w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600
         text-white font-bold rounded-full flex items-center justify-center;
}

.evaluator-info {
  @apply flex-1 min-w-0;
}

.evaluator-name {
  @apply text-sm font-semibold text-gray-900;
}

.evaluator-email {
  @apply text-sm text-gray-600;
}

.evaluator-meta {
  @apply text-xs text-gray-500;
}

.evaluator-progress {
  @apply flex items-center space-x-3;
}

.progress-bar {
  @apply w-24 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-primary-500 transition-all duration-300;
}

.progress-text {
  @apply text-xs font-medium text-gray-600 w-10 text-right;
}
```

## 🎨 테마 적용 컴포넌트

### 1. 다크모드 대응

```css
/* 다크모드 컴포넌트 스타일 */
[data-theme="dark"] .card {
  @apply bg-gray-800 border-gray-700;
}

[data-theme="dark"] .card-title {
  @apply text-gray-100;
}

[data-theme="dark"] .btn-secondary {
  @apply border-gray-600 text-gray-300 hover:bg-gray-700;
}

[data-theme="dark"] .input-field {
  @apply bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500;
}
```

### 2. 동적 테마 시스템

```typescript
// 테마별 컴포넌트 스타일 변경
const getThemeClass = (theme: string, component: string) => {
  const themeMap = {
    'luxury': {
      card: 'bg-gradient-to-br from-gray-50 to-yellow-50 border-yellow-200',
      button: 'bg-gradient-to-r from-gray-600 to-yellow-600'
    },
    'modern': {
      card: 'bg-white border-blue-200',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };
  
  return themeMap[theme]?.[component] || '';
};
```

## 📊 데이터 표시 컴포넌트

### 1. 진행률 표시

```typescript
const ProgressIndicator = ({ value, size = 'md', showText = true }) => (
  <div className={`progress-container ${size}`}>
    <div className="progress-track">
      <div 
        className="progress-fill"
        style={{ width: `${value}%` }}
      />
    </div>
    {showText && <span className="progress-label">{value}%</span>}
  </div>
);

.progress-container.sm .progress-track { @apply h-1; }
.progress-container.md .progress-track { @apply h-2; }
.progress-container.lg .progress-track { @apply h-3; }
```

### 2. 상태 뱃지

```typescript
const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    completed: { label: '완료', color: 'green' },
    in_progress: { label: '진행중', color: 'blue' },
    pending: { label: '대기', color: 'gray' },
    error: { label: '오류', color: 'red' }
  };

  const config = statusConfig[status];
  
  return (
    <span className={`badge badge-${config.color} badge-${size}`}>
      {config.label}
    </span>
  );
};

.badge {
  @apply inline-flex items-center font-medium rounded-full;
}

.badge-sm { @apply px-2 py-1 text-xs; }
.badge-md { @apply px-3 py-1 text-sm; }

.badge-green { @apply bg-green-100 text-green-800; }
.badge-blue { @apply bg-blue-100 text-blue-800; }
.badge-gray { @apply bg-gray-100 text-gray-800; }
.badge-red { @apply bg-red-100 text-red-800; }
```

## 🖼️ 레이아웃 컴포넌트

### 1. 대시보드 그리드

```typescript
const DashboardGrid = ({ children, columns = 1 }) => (
  <div className={`dashboard-grid grid-cols-${columns}`}>
    {children}
  </div>
);

.dashboard-grid {
  @apply grid gap-6;
}

.grid-cols-1 { @apply grid-cols-1; }
.grid-cols-2 { @apply grid-cols-1 md:grid-cols-2; }
.grid-cols-3 { @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3; }
```

### 2. 섹션 헤더

```typescript
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="section-header">
    <div className="section-text">
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="section-action">{action}</div>}
  </div>
);

.section-header {
  @apply flex items-center justify-between mb-6;
}

.section-title {
  @apply text-xl font-semibold text-gray-900;
}

.section-subtitle {
  @apply text-sm text-gray-600 mt-1;
}
```

## 🎯 상호작용 컴포넌트

### 1. 드롭다운 메뉴

```typescript
const Dropdown = ({ trigger, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="dropdown-container">
      <button 
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {items.map(item => (
            <button
              key={item.id}
              className="dropdown-item"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

.dropdown-container {
  @apply relative;
}

.dropdown-menu {
  @apply absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10;
}

.dropdown-item {
  @apply w-full px-4 py-2 text-left text-sm text-gray-700 
         hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg;
}
```

### 2. 토글 스위치

```typescript
const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="toggle-container">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="toggle-input"
    />
    <span className="toggle-slider" />
    {label && <span className="toggle-label">{label}</span>}
  </label>
);

.toggle-container {
  @apply flex items-center space-x-3 cursor-pointer;
}

.toggle-input {
  @apply sr-only;
}

.toggle-slider {
  @apply relative inline-block w-11 h-6 bg-gray-200 rounded-full
         transition-colors duration-200;
}

.toggle-input:checked + .toggle-slider {
  @apply bg-primary-500;
}

.toggle-slider::before {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
         transition-transform duration-200;
  content: '';
}

.toggle-input:checked + .toggle-slider::before {
  @apply transform translate-x-5;
}
```

## 🔍 검색 및 필터 컴포넌트

### 1. 검색 입력

```typescript
const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="search-container">
    <div className="search-icon">🔍</div>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="search-input"
    />
  </div>
);

.search-container {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}
```

## 📱 반응형 가이드라인

### 1. 브레이크포인트

```css
/* 모바일 퍼스트 접근 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 2. 반응형 컴포넌트 패턴

```typescript
// 화면 크기에 따른 동적 레이아웃
const ResponsiveGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {children}
  </div>
);

// 모바일에서 숨김/표시
const DesktopOnly = ({ children }) => (
  <div className="hidden md:block">{children}</div>
);

const MobileOnly = ({ children }) => (
  <div className="block md:hidden">{children}</div>
);
```

## 🛠️ 개발 가이드라인

### 1. 컴포넌트 작성 원칙

- **단일 책임**: 각 컴포넌트는 하나의 명확한 목적
- **재사용성**: props를 통한 커스터마이징 지원
- **접근성**: ARIA 속성 및 키보드 네비게이션
- **타입 안정성**: TypeScript 인터페이스 정의

### 2. 성능 최적화

```typescript
// memo를 활용한 불필요한 리렌더링 방지
const OptimizedCard = memo(({ data }) => (
  <div className="card">
    {/* 컴포넌트 내용 */}
  </div>
));

// useMemo를 활용한 계산 최적화
const processedData = useMemo(() => 
  rawData.map(item => ({ ...item, processed: true })),
  [rawData]
);
```

### 3. 에러 처리

```typescript
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">문제가 발생했습니다</h3>
        <p className="error-message">{fallback}</p>
      </div>
    );
  }
  
  return children;
};
```

## 📚 컴포넌트 카탈로그

### 현재 구현된 컴포넌트

1. **PersonalServiceDashboard** - 관리자 대시보드
2. **SurveyManagementSystem** - 설문조사 관리
3. **SurveyFormBuilder** - 설문조사 생성/편집
4. **PaperManagement** - 논문 작성 관리
5. **ProjectCreator** - 프로젝트 생성
6. **AHPMatrixInput** - AHP 매트릭스 입력

### 공통 유틸리티 컴포넌트

- **LoadingSpinner** - 로딩 표시
- **ErrorMessage** - 에러 메시지 표시
- **ConfirmDialog** - 확인 대화상자
- **Toast** - 알림 메시지
- **Tooltip** - 도움말 툴팁

---

**최종 업데이트**: 2025-09-02  
**버전**: v2.3.2  
**관리 컴포넌트**: 28개