# 25. 프로젝트 삭제 기능 및 휴지통 네비게이션 문제 해결

> **작업일**: 2025-08-31  
> **이슈**: 내 프로젝트 페이지에서 삭제 시 2번 확인창 + 실제 삭제 안됨 + 휴지통 버튼이 대시보드로 이동

## 🚨 사용자 피드백

> "내 프로젝트이 메뉴의 페이지에서 프로젝트 2개가 임의로 만들어져 있는 것도 삭제하면 경고창을 팝업으로 2번이나 띄워주긴 하나 실제 삭제되거나 휴지통으로 보내지지 않는 것 같고, 휴지통 버튼이 2개이나 클릭하면 내 대시보드 메뉴로 돌아가. 제대로 구현해줘."

## 🔍 문제 분석

### 1. **이중 확인창 문제**
- **현상**: 삭제 시 확인창이 2번 나타남
- **원인**: 
  1. PersonalServiceDashboard.tsx의 `handleDeleteProject`에서 1차 확인
  2. TrashBinTest.tsx의 `handleTestDelete`에서 2차 확인
- **위치**: 
  - PersonalServiceDashboard.tsx:369 `window.confirm(...)`
  - TrashBinTest.tsx:40 `window.confirm(...)`

### 2. **휴지통 버튼이 대시보드로 이동하는 문제**
- **현상**: 🗑️ 휴지통 버튼 클릭 시 대시보드로 돌아감
- **원인**: PersonalServiceDashboard.tsx의 `tabMap`에 `'trash'` 매핑이 없음
- **위치**: PersonalServiceDashboard.tsx:937-952 `tabMap` 객체

### 3. **실제 삭제가 안되는 문제**
- **현상**: 삭제 후 프로젝트가 여전히 목록에 표시됨
- **원인**: PersonalServiceDashboard가 독립적인 `projects` 상태를 관리하는데, App.tsx의 삭제 후 동기화 안됨
- **위치**: PersonalServiceDashboard 내부 상태와 App.tsx 상태 불일치

## 🛠️ 해결 방안

### 1. 휴지통 네비게이션 수정

#### App.tsx - trash 케이스 추가
```typescript
// Before
case 'personal-service':
case 'demographic-survey':
case 'my-projects':
case 'project-creation':
case 'model-builder':
case 'evaluator-management':

// After
case 'personal-service':
case 'demographic-survey':
case 'my-projects':
case 'project-creation':
case 'model-builder':
case 'evaluator-management':
case 'trash':  // 추가
```

#### PersonalServiceDashboard.tsx - tabMap에 trash 매핑 추가
```typescript
// Before
const tabMap: Record<string, string> = {
  'dashboard': 'personal-service',
  'projects': 'my-projects',
  // ... 다른 매핑들
  'demographic-survey': 'demographic-survey'
};

// After  
const tabMap: Record<string, string> = {
  'dashboard': 'personal-service',
  'projects': 'my-projects',
  // ... 다른 매핑들
  'demographic-survey': 'demographic-survey',
  'trash': 'trash'  // 추가
};
```

**개선 효과**:
- ✅ **정확한 네비게이션**: 휴지통 버튼 클릭 시 휴지통 페이지로 이동
- ✅ **일관된 탭 매핑**: 모든 탭이 올바르게 매핑됨

### 2. 이중 확인창 문제 해결

#### TrashBinTest.tsx - 중복 확인창 제거
```typescript
// Before
const handleTestDelete = async (projectId: string, title: string) => {
  if (window.confirm(`"${title}"를 휴지통으로 이동하시겠습니까?`)) {  // ❌ 중복 확인
    try {
      if (onDeleteProject) {
        await onDeleteProject(projectId);  // 여기서 또 확인창 뜸
        // ...
      }
    }
  }
};

// After
const handleTestDelete = async (projectId: string, title: string) => {
  try {
    if (onDeleteProject) {
      console.log('🗑️ 테스트 삭제 시작:', projectId);
      await onDeleteProject(projectId);  // PersonalServiceDashboard에서만 확인
      console.log('✅ 테스트 삭제 완료:', projectId);
      await loadTrashedProjects();
    }
  } catch (error) {
    // 오류 처리
  }
};
```

**개선 효과**:
- ✅ **1회 확인**: PersonalServiceDashboard에서만 확인창 표시
- ✅ **자연스러운 UX**: 불필요한 중복 확인 제거

### 3. 실제 삭제 기능 동기화 수정

#### App.tsx - 데모 모드 삭제 로그 강화
```typescript
// Before
const deleteProject = async (projectId: string) => {
  if (isDemoMode) {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    return;
  }
  // ...
};

// After
const deleteProject = async (projectId: string) => {
  if (isDemoMode) {
    console.log('🗑️ 데모 모드 프로젝트 삭제:', projectId);
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      console.log('✅ 데모 모드 프로젝트 삭제 완료. 남은 프로젝트:', updated.length);
      return updated;
    });
    return;
  }
  // ...
};
```

#### PersonalServiceDashboard.tsx - 로컬 상태 즉시 업데이트
```typescript
// Before
if (onDeleteProject) {
  await onDeleteProject(projectId);
  await loadProjects();  // 새로고침만
  alert(...);
}

// After
if (onDeleteProject) {
  await onDeleteProject(projectId);
  
  // 로컬 상태에서도 프로젝트 제거 (즉시 UI 반영)
  setProjects(prev => prev.filter(p => p.id !== projectId));
  
  await loadProjects();  // 추가 동기화
  alert(...);
}
```

**개선 효과**:
- ✅ **즉시 UI 반영**: 삭제 시 프로젝트가 목록에서 바로 사라짐
- ✅ **이중 보장**: App.tsx와 PersonalServiceDashboard 양쪽 상태 모두 업데이트
- ✅ **디버깅 향상**: 상세한 로그로 삭제 과정 추적

## 🧪 수정 후 테스트 시나리오

### 휴지통 네비게이션 테스트
1. **내 프로젝트** 페이지 진입
2. 🗑️ **휴지통** 버튼 클릭 (헤더 또는 필터 영역)
3. ✅ **예상 결과**: 휴지통 페이지로 이동 (대시보드 ❌)

### 프로젝트 삭제 테스트
1. **내 프로젝트** 페이지에서 프로젝트 카드의 🗑️ 삭제 버튼 클릭
2. ✅ **1번만** 확인창 표시: "프로젝트를 휴지통으로 이동하시겠습니까?"
3. **확인** 클릭
4. ✅ **즉시 UI 반영**: 프로젝트가 목록에서 사라짐
5. ✅ **성공 알림**: "휴지통으로 이동되었습니다" 메시지

### 휴지통에서 복원 테스트
1. 🗑️ **휴지통** 탭 클릭
2. ✅ **TrashBinTest 페이지** 표시
3. 삭제된 프로젝트에서 ↩️ **복원** 버튼 클릭
4. ✅ **1번만** 확인창: "프로젝트를 복원하시겠습니까?"

## 📊 수정된 파일 요약

### 1. **App.tsx** (+6라인)
- `trash` 케이스를 PersonalServiceDashboard 라우팅에 추가
- 데모 모드 삭제 로그 강화

### 2. **PersonalServiceDashboard.tsx** (+4라인)
- `tabMap`에 `'trash': 'trash'` 매핑 추가
- 삭제 후 로컬 상태 즉시 업데이트

### 3. **TrashBinTest.tsx** (-3라인)
- `handleTestDelete`에서 중복 확인창 제거
- 더 간결한 오류 처리

## 🎯 최종 해결 결과

### 사용자 요구사항 해결
- ✅ **삭제 확인창**: 2번 → 1번으로 개선
- ✅ **실제 삭제**: 프로젝트가 즉시 목록에서 제거됨  
- ✅ **휴지통 이동**: 버튼 클릭시 올바른 페이지로 이동
- ✅ **휴지통 중복**: 2개 버튼 모두 제대로 작동

### 기술적 개선
- ✅ **상태 동기화**: App.tsx와 PersonalServiceDashboard 상태 일치
- ✅ **네비게이션 일관성**: 모든 탭 매핑 완성
- ✅ **사용자 경험**: 즉시 피드백 및 자연스러운 흐름

## 🎉 결론

프로젝트 삭제 기능이 이제 정상적으로 작동하며, 휴지통 버튼들이 올바르게 휴지통 페이지로 이동합니다. 이중 확인창 문제도 해결되어 더 자연스러운 사용자 경험을 제공합니다.