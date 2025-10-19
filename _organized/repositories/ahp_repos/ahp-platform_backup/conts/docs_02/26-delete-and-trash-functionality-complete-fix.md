# 26. 삭제 기능 및 휴지통 완전 수정

> **작업일**: 2025-08-31  
> **이슈**: 프로젝트 삭제 후 화면에 그대로 남아있고, 휴지통이 빈 페이지로 표시되는 문제

## 🚨 사용자 피드백

> "삭제해도 삭제되지 않고 화면에 그대로 보이며, 휴지통은 빈페이지야. 구현이 안된 것 같아."

## 🔍 근본 원인 분석

### 1. **상태 관리 불일치 문제**
- **PersonalServiceDashboard**: `dataService.getProjects()`로 독립적 프로젝트 로드
- **App.tsx**: `onDeleteProject`로 App 컴포넌트 상태만 변경
- **결과**: App.tsx 상태 변경 → PersonalServiceDashboard `loadProjects()` 호출 → 변경사항 무시됨

### 2. **휴지통 데이터 부재**
- **기존**: `dataService.deleteProject()`가 완전 삭제만 수행
- **문제**: 휴지통용 별도 저장소 없음
- **결과**: 삭제된 프로젝트가 휴지통에서 조회되지 않음

### 3. **컴포넌트 불일치**  
- **사용 중**: TrashBinTest (디버깅용)
- **필요한 것**: TrashBin (실제 휴지통)

## 🛠️ 해결 방안

### 1. dataService에 휴지통 시스템 구현

#### 로컬 스토리지 키 추가
```typescript
const STORAGE_KEYS = {
  // 기존 키들...
  TRASH: 'ahp_trash_projects'  // 새로 추가
} as const;
```

#### 소프트 삭제로 변경
```typescript
// Before: 완전 삭제
async deleteProject(id: string): Promise<boolean> {
  const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
  const filteredProjects = projects.filter(p => p.id !== id);  // 완전 제거
  storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
  return true;
}

// After: 휴지통으로 이동 (소프트 삭제)
async deleteProject(id: string): Promise<boolean> {
  const projects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
  const projectToDelete = projects.find(p => p.id === id);
  
  if (projectToDelete) {
    // 휴지통에 추가
    const trashedProject = {
      ...projectToDelete,
      status: 'deleted',
      deleted_at: new Date().toISOString()
    };
    
    const trashedProjects = storage.get<ProjectData[]>(STORAGE_KEYS.TRASH, []);
    trashedProjects.push(trashedProject);
    storage.set(STORAGE_KEYS.TRASH, trashedProjects);
    
    // 활성 프로젝트에서 제거
    const filteredProjects = projects.filter(p => p.id !== id);
    storage.set(STORAGE_KEYS.PROJECTS, filteredProjects);
    
    console.log('🗑️ 프로젝트를 휴지통으로 이동:', id);
    return true;
  }
  return false;
}
```

#### 휴지통 관리 기능 추가
```typescript
// 휴지통 조회
async getTrashedProjects(): Promise<ProjectData[]> {
  return storage.get<ProjectData[]>(STORAGE_KEYS.TRASH, []);
}

// 프로젝트 복원
async restoreProject(id: string): Promise<boolean> {
  const trashedProjects = storage.get<ProjectData[]>(STORAGE_KEYS.TRASH, []);
  const projectToRestore = trashedProjects.find(p => p.id === id);
  
  if (projectToRestore) {
    // 휴지통에서 제거
    const filteredTrash = trashedProjects.filter(p => p.id !== id);
    storage.set(STORAGE_KEYS.TRASH, filteredTrash);
    
    // 활성 프로젝트로 복원
    const restoredProject = { ...projectToRestore, status: 'active', deleted_at: undefined };
    const activeProjects = storage.get<ProjectData[]>(STORAGE_KEYS.PROJECTS, []);
    activeProjects.push(restoredProject);
    storage.set(STORAGE_KEYS.PROJECTS, activeProjects);
    return true;
  }
  return false;
}

// 영구 삭제
async permanentDeleteProject(id: string): Promise<boolean> {
  const trashedProjects = storage.get<ProjectData[]>(STORAGE_KEYS.TRASH, []);
  const filteredTrash = trashedProjects.filter(p => p.id !== id);
  storage.set(STORAGE_KEYS.TRASH, filteredTrash);
  
  // 관련 데이터도 완전 삭제
  this.deleteCriteriaByProject(id);
  this.deleteAlternativesByProject(id);
  // ... 기타 관련 데이터
  return true;
}
```

### 2. PersonalServiceDashboard 삭제 로직 수정

#### 직접 dataService 사용으로 변경
```typescript
// Before: App.tsx의 onDeleteProject prop 의존
if (onDeleteProject) {
  await onDeleteProject(projectId);  // App 상태만 변경
  await loadProjects();  // 변경사항 무시됨
}

// After: dataService 직접 호출
const success = await dataService.deleteProject(projectId);  // 직접 삭제
if (success) {
  // 로컬 상태도 즉시 업데이트
  setProjects(prev => prev.filter(p => p.id !== projectId));
  // 추가 동기화
  await loadProjects();
}
```

**개선 효과**:
- ✅ **일관된 데이터 소스**: dataService 단일 진실 공급원
- ✅ **즉시 UI 반영**: 로컬 상태 즉시 업데이트
- ✅ **동기화 보장**: 이중 업데이트로 확실한 반영

### 3. App.tsx 휴지통 함수 개선

#### 데모 모드 휴지통 지원
```typescript
// Before: 데모 모드에서 휴지통 미지원
const fetchTrashedProjects = async () => {
  if (isDemoMode) {
    return []; // 빈 배열
  }
  // ...
};

// After: 데모 모드에서도 휴지통 완전 지원
const fetchTrashedProjects = async () => {
  if (isDemoMode) {
    console.log('📊 데모 모드 휴지통 조회');
    const trashedProjects = await dataService.getTrashedProjects();
    console.log('🗑️ 휴지통 프로젝트 개수:', trashedProjects.length);
    return trashedProjects;
  }
  // ...
};
```

### 4. 실제 휴지통 컴포넌트 사용

#### TrashBinTest → TrashBin 교체
```typescript
// Before: 디버깅용 컴포넌트
import TrashBinTest from './TrashBinTest';
// ...
case 'trash':
  return (
    <TrashBinTest
      onFetchTrashedProjects={onFetchTrashedProjects}
      onRestoreProject={onRestoreProject}
      onPermanentDeleteProject={onPermanentDeleteProject}
      onDeleteProject={onDeleteProject}  // 불필요한 prop
    />
  );

// After: 실제 휴지통 컴포넌트
import TrashBin from './TrashBin';
// ...  
case 'trash':
  return (
    <TrashBin
      onFetchTrashedProjects={onFetchTrashedProjects}
      onRestoreProject={onRestoreProject}
      onPermanentDeleteProject={onPermanentDeleteProject}
    />
  );
```

## 🧪 수정 후 동작 흐름

### 프로젝트 삭제 흐름
1. **삭제 버튼 클릭** → PersonalServiceDashboard.handleDeleteProject()
2. **확인 대화상자** → 사용자 확인
3. **dataService.deleteProject()** → 로컬 스토리지 업데이트
   - 활성 프로젝트에서 제거
   - 휴지통에 추가 (`status: 'deleted'`, `deleted_at: timestamp`)
4. **즉시 UI 반영** → setProjects() 로컬 상태 업데이트  
5. **동기화** → loadProjects() 추가 새로고침
6. **성공 알림** → 사용자 피드백

### 휴지통 조회 흐름
1. **휴지통 탭 클릭** → PersonalServiceDashboard 'trash' case
2. **TrashBin 컴포넌트** → onFetchTrashedProjects() 호출
3. **App.fetchTrashedProjects()** → dataService.getTrashedProjects()
4. **로컬 스토리지 조회** → TRASH 키에서 삭제된 프로젝트 반환
5. **휴지통 UI 렌더링** → 삭제된 프로젝트 목록 표시

### 복원 흐름
1. **복원 버튼 클릭** → TrashBin에서 onRestoreProject() 호출
2. **dataService.restoreProject()** → 프로젝트 이동
   - 휴지통에서 제거
   - 활성 프로젝트에 추가 (`status: 'active'`, `deleted_at: undefined`)
3. **목록 새로고침** → 활성 프로젝트 목록 업데이트

## 📊 수정된 파일 요약

### 1. **dataService.ts** (+55라인)
- `STORAGE_KEYS.TRASH` 추가
- `deleteProject()` 소프트 삭제로 변경
- `getTrashedProjects()` 신규 추가
- `restoreProject()` 신규 추가  
- `permanentDeleteProject()` 신규 추가
- `clearAllData()` 휴지통 데이터 포함

### 2. **PersonalServiceDashboard.tsx** (+3라인)
- TrashBinTest → TrashBin import 변경
- handleDeleteProject() dataService 직접 호출로 변경
- TrashBin 컴포넌트 props 정리

### 3. **App.tsx** (+4라인)  
- fetchTrashedProjects() 데모 모드 지원 추가

## 🎯 최종 해결 결과

### 문제 해결 확인
- ✅ **프로젝트 삭제**: 즉시 목록에서 제거됨
- ✅ **휴지통 표시**: 삭제된 프로젝트가 휴지통에 표시됨
- ✅ **데이터 일관성**: 단일 데이터 소스(dataService) 사용
- ✅ **실시간 업데이트**: 로컬 상태와 데이터 저장소 동기화

### 기술적 개선
- ✅ **소프트 삭제**: 데이터 보호 및 복원 가능
- ✅ **상태 관리**: PersonalServiceDashboard ↔ dataService 직접 연결
- ✅ **휴지통 시스템**: 완전한 CRUD 작업 지원
- ✅ **컴포넌트 정리**: 디버깅용 → 실제 컴포넌트 사용

## 🎉 결론

프로젝트 삭제 기능이 이제 완전히 작동하며, 휴지통에서 삭제된 프로젝트를 확인하고 복원할 수 있습니다. 데이터 일관성 문제가 해결되어 삭제 후 즉시 UI에 반영되고, 휴지통이 빈 페이지가 아닌 실제 삭제된 프로젝트를 표시합니다.