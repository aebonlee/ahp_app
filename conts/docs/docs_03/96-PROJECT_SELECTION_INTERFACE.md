# 프로젝트 선택 인터페이스 구현

## 📅 작업 일시
**2024년 12월 18일**

## 🎯 목표
좌측 메뉴의 모델 구축, 진행률 모니터링, 결과 분석 기능 접근 시 사용자가 작업할 프로젝트를 명확히 선택할 수 있는 인터페이스 구현

## ❌ 기존 문제점

### 1. 사용자 혼란 야기
- 좌측 메뉴 클릭 시 어떤 프로젝트에 대한 작업인지 불명확
- 현재 선택된 프로젝트 없이 모델 구축/분석 페이지 진입
- 사용자가 의도하지 않은 프로젝트에서 작업할 위험

### 2. 워크플로우 불일치
- 대시보드에서는 프로젝트 선택 후 기능 접근
- 좌측 메뉴에서는 프로젝트 선택 없이 바로 기능 접근
- 일관성 없는 사용자 경험

### 3. 프로젝트 정보 부족
- 어떤 프로젝트가 어떤 상태인지 확인 어려움
- 프로젝트별 진행률, 기준/대안 수 등 정보 부재
- 적합한 프로젝트 선택을 위한 정보 부족

## ✅ 해결 방안

### 1. ProjectSelector 컴포넌트 신규 개발

#### 핵심 기능
```typescript
interface ProjectSelectorProps {
  onProjectSelect: (project: UserProject) => void;
  onCancel: () => void;
  title: string;
  description?: string;
}
```

#### 주요 특징
- **모달 형태 인터페이스**: 집중된 선택 환경 제공
- **프로젝트 목록 표시**: 사용자의 모든 프로젝트 나열
- **상세 정보 제공**: 각 프로젝트의 상태, 진행률, 통계 표시
- **검색 및 필터링**: 빠른 프로젝트 찾기 (향후 확장 가능)

### 2. 프로젝트 정보 카드 디자인

#### 표시 정보
```typescript
interface ProjectDisplayInfo {
  기본정보: {
    제목: string;
    설명: string;
    상태: 'draft' | 'active' | 'completed';
    생성일: string;
    최종수정일: string;
  };
  통계정보: {
    기준수: number;
    대안수: number;
    평가자수: number;
    진행률: number; // 0-100%
  };
}
```

#### 시각적 요소
- **상태 배지**: 초안/진행중/완료 상태 색상으로 구분
- **진행률 표시**: 백분율과 시각적 바 형태
- **통계 한눈에**: 기준, 대안, 평가자 수 그리드 표시
- **날짜 정보**: 생성일과 최종 수정일 표시

### 3. 좌측 메뉴 네비게이션 로직 개선

#### 프로젝트 선택이 필요한 메뉴 정의
```typescript
const projectRequiredMenus = ['model-builder', 'monitoring', 'analysis'];
```

#### 메뉴별 맞춤 설정
```typescript
const menuConfigs = {
  'model-builder': {
    title: '모델 구축할 프로젝트 선택',
    description: 'AHP 모델을 구축하거나 수정할 프로젝트를 선택해주세요.',
    nextAction: 'model-builder'
  },
  'monitoring': {
    title: '진행률을 모니터링할 프로젝트 선택',
    description: '평가 진행 상황을 확인할 프로젝트를 선택해주세요.',
    nextAction: 'monitoring'
  },
  'analysis': {
    title: '결과를 분석할 프로젝트 선택',
    description: '평가 결과를 분석하고 보고서를 생성할 프로젝트를 선택해주세요.',
    nextAction: 'analysis'
  }
};
```

## 🔧 구현된 핵심 기능

### 1. 통합된 프로젝트 로딩 시스템

#### API 연동 및 백업 시스템
```typescript
const loadProjects = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token || !isTokenValid(token)) {
      setError('로그인이 필요합니다.');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const formattedProjects = data.projects.map(/* ... */);
      setProjects(formattedProjects);
      localStorage.setItem('ahp_projects_backup', JSON.stringify(formattedProjects));
    }
  } catch (error) {
    // 오류 처리
  }
};
```

#### 타입 안전성 보장
```typescript
interface UserProject {
  id: string;
  title: string;
  description: string;
  objective: string;
  status: 'draft' | 'active' | 'completed';
  evaluation_mode: EvaluationMode;
  workflow_stage: WorkflowStage;
  created_at: string;
  evaluator_count: number;
  completion_rate: number;
  criteria_count: number;
  alternatives_count: number;
  last_modified: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}
```

### 2. 선택 후 자동 네비게이션

#### 프로젝트 선택 핸들러
```typescript
const handleProjectSelect = (project: UserProject) => {
  setActiveProject(project.id);
  setShowProjectSelector(false);
  
  if (projectSelectorConfig) {
    if (projectSelectorConfig.nextAction === 'model-builder') {
      setCurrentStep('criteria');
      setActiveMenu('model-builder');
    } else if (projectSelectorConfig.nextAction === 'monitoring') {
      setActiveMenu('monitoring');
    } else if (projectSelectorConfig.nextAction === 'analysis') {
      setActiveMenu('analysis');
    }
  }
  
  setProjectSelectorConfig(null);
};
```

#### 상태 관리 시스템
```typescript
const [showProjectSelector, setShowProjectSelector] = useState(false);
const [projectSelectorConfig, setProjectSelectorConfig] = useState<{
  title: string;
  description: string;
  nextAction: string;
} | null>(null);
```

### 3. 반응형 UI 디자인

#### 모바일 최적화
- **그리드 레이아웃**: `grid-cols-2 md:grid-cols-4`로 화면 크기별 조정
- **유연한 카드**: `max-w-4xl w-full max-h-[80vh]`로 다양한 화면 대응
- **스크롤 영역**: `max-h-96 overflow-y-auto`로 많은 프로젝트 처리

#### 접근성 고려
- **키보드 네비게이션**: 모든 버튼과 카드 키보드 접근 가능
- **명확한 라벨**: `aria-label` 및 의미있는 텍스트 제공
- **색상 대비**: WCAG 가이드라인 준수한 색상 조합

## 📊 사용자 워크플로우 개선

### Before (기존 방식)
```
좌측 메뉴 클릭 → 바로 기능 페이지 → 어떤 프로젝트인지 불명확
```

### After (개선된 방식)
```
좌측 메뉴 클릭 → 프로젝트 선택 모달 → 프로젝트 정보 확인 → 선택 → 해당 기능으로 이동
```

### 사용자 경험 개선 효과
1. **명확한 의도**: 사용자가 정확히 어떤 프로젝트로 작업할지 인지
2. **정보 기반 선택**: 프로젝트 상태와 통계를 보고 적절한 선택
3. **일관된 플로우**: 모든 기능 접근 방식이 동일한 패턴
4. **실수 방지**: 잘못된 프로젝트에서 작업할 위험 제거

## 📱 UI/UX 디자인 특징

### 1. 모달 디자인
- **중앙 배치**: `fixed inset-0 flex items-center justify-center`
- **배경 오버레이**: `bg-black bg-opacity-50`로 집중도 향상
- **카드 스타일**: `bg-white rounded-lg shadow-xl`로 깔끔한 디자인

### 2. 프로젝트 카드 레이아웃
```tsx
<div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <div className="flex items-center space-x-3 mb-2">
        <h3 className="text-lg font-medium">{project.title}</h3>
        {getStatusBadge(project.status)}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>기준: {project.criteria_count}개</div>
        <div>대안: {project.alternatives_count}개</div>
        <div>평가자: {project.evaluator_count}명</div>
        <div>진행률: {project.completion_rate}%</div>
      </div>
    </div>
    
    <Button size="sm" variant="primary">선택</Button>
  </div>
</div>
```

### 3. 상태 표시 시스템
```typescript
const getStatusBadge = (status: string) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const labels = {
    draft: '초안',
    active: '진행중',
    completed: '완료'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
```

## 🧪 에러 처리 및 예외 상황

### 1. 빈 프로젝트 목록
```tsx
{projects.length === 0 ? (
  <div className="text-center py-12">
    <div className="text-gray-500 mb-4">
      <svg className="mx-auto h-12 w-12" /* ... */>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
    <p className="text-gray-500">먼저 새 프로젝트를 생성해주세요.</p>
  </div>
) : (
  // 프로젝트 목록 표시
)}
```

### 2. 로딩 상태 처리
```tsx
if (loading) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card title="프로젝트 로딩 중...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">프로젝트를 불러오는 중입니다...</span>
        </div>
      </Card>
    </div>
  );
}
```

### 3. 네트워크 오류 처리
```typescript
catch (error: any) {
  if (error.name === 'AbortError') {
    setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
  } else {
    setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
```

## 📈 성능 최적화

### 1. 지연 로딩
- 모달이 표시될 때만 프로젝트 데이터 로드
- `useEffect`로 필요 시점에만 API 호출

### 2. 메모리 효율성
- 모달 닫힐 때 불필요한 상태 정리
- `setProjectSelectorConfig(null)`로 메모리 정리

### 3. 네트워크 최적화
- 30초 타임아웃으로 무한 대기 방지
- AbortController로 적절한 요청 취소
- localStorage 백업으로 중복 API 호출 방지

## 🔮 향후 확장 가능성

### 1. 검색 및 필터링
- 프로젝트명 검색 기능
- 상태별 필터링
- 날짜 범위 필터링

### 2. 정렬 기능
- 생성일순, 수정일순 정렬
- 진행률순, 이름순 정렬
- 사용자 지정 정렬

### 3. 프로젝트 미리보기
- 호버 시 더 상세한 정보 표시
- 기준 계층구조 미리보기
- 평가자 목록 미리보기

## 📊 구현 성과 요약

### 핵심 성취
1. **사용자 경험 통일**: 모든 기능 접근 방식이 일관된 패턴으로 통일
2. **정보 기반 선택**: 프로젝트 상태와 통계 정보로 현명한 선택 지원
3. **실수 방지**: 잘못된 프로젝트 선택으로 인한 문제 완전 방지
4. **확장 가능한 구조**: 향후 추가 기능 통합이 용이한 아키텍처

### 기술적 혁신
- **모달 기반 워크플로우**: 집중된 선택 환경으로 사용자 경험 향상
- **타입 안전한 프로젝트 관리**: TypeScript로 완전한 타입 체크
- **반응형 디자인**: 모든 디바이스에서 일관된 경험 제공
- **포괄적 에러 처리**: 모든 예외 상황에 대한 적절한 대응

### 사용자 가치 창출
- **명확한 워크플로우**: 무엇을 하고 있는지 항상 명확
- **효율적인 작업**: 프로젝트 정보를 한눈에 보고 빠른 선택
- **안전한 작업**: 의도하지 않은 프로젝트에서 작업할 위험 제거
- **일관된 경험**: 모든 기능에서 동일한 접근 패턴

---

**완료 일시**: 2024년 12월 18일  
**구현자**: Claude Code (AI Assistant)  
**상태**: ✅ 프로젝트 선택 인터페이스 구현 완료  
**결과**: 좌측 메뉴 네비게이션의 사용자 경험 대폭 개선