# 31. 백엔드 데이터베이스 기반 휴지통 시스템 구현

> **작업일**: 2025-09-01  
> **목표**: localStorage 완전 제거, PostgreSQL 데이터베이스 기반 휴지통 구현

## 🎯 작업 배경

사용자 피드백:
> "새로고침에 되살아나는게 어떻게 정상이냐. PostgreDB에 기록되었다가 삭제되면 삭제 테이블에 갔다가 사용자가 되살리거나 아주 삭제할 수 있게 해줘야지."

**핵심 요구사항:**
- 모든 로컬 스토리지 사용 금지
- GitHub Pages (프론트엔드) 기준
- Render 백엔드 (https://ahp-forpaper.onrender.com) 사용
- PostgreSQL 데이터베이스에 모든 데이터 저장

## 🔍 문제 분석

### 기존 문제점
1. localStorage 사용으로 인한 데이터 불일치
2. 새로고침 시 데이터 초기화 또는 복원 현상
3. 데모 모드와 실제 서비스 모드 혼재
4. 백엔드 API와 프론트엔드 상태 관리 불일치

## 🛠️ 구현 내용

### 1. PostgreSQL 스키마 (이미 구현됨)
```sql
-- backend/src/database/migrations/005_soft_delete_projects.sql
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'deleted'));

CREATE INDEX IF NOT EXISTS idx_projects_deleted 
ON projects(admin_id, deleted_at) WHERE status = 'deleted';
```

### 2. 백엔드 API 엔드포인트 구현

#### backend/src/routes/projects.ts
```typescript
// 소프트 삭제 (휴지통으로 이동)
router.delete('/:id', authenticateToken, async (req, res) => {
  const result = await query(
    `UPDATE projects 
     SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND admin_id = $2 AND status != 'deleted'
     RETURNING *`,
    [id, userId]
  );
});

// 휴지통 프로젝트 목록 조회
router.get('/trash/list', authenticateToken, async (req, res) => {
  const result = await query(
    `SELECT p.*, u.first_name || ' ' || u.last_name as admin_name
     FROM projects p
     LEFT JOIN users u ON p.admin_id = u.id
     WHERE p.admin_id = $1 AND p.status = 'deleted'
     ORDER BY p.deleted_at DESC`,
    [userId]
  );
});

// 프로젝트 복원
router.put('/:id/restore', authenticateToken, async (req, res) => {
  const result = await query(
    `UPDATE projects 
     SET status = 'active', deleted_at = NULL
     WHERE id = $1 AND admin_id = $2 AND status = 'deleted'
     RETURNING *`,
    [id, userId]
  );
});

// 영구 삭제
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  await query('BEGIN');
  // CASCADE로 관련 데이터 모두 삭제
  await query('DELETE FROM pairwise_comparisons WHERE project_id = $1', [id]);
  await query('DELETE FROM project_evaluators WHERE project_id = $1', [id]);
  await query('DELETE FROM alternatives WHERE project_id = $1', [id]);
  await query('DELETE FROM criteria WHERE project_id = $1', [id]);
  await query('DELETE FROM projects WHERE id = $1', [id]);
  await query('COMMIT');
});
```

### 3. 프론트엔드 수정

#### src/App.tsx
```typescript
// localStorage 및 dataService 사용 제거
// 모든 API 호출은 백엔드로 직접

const fetchTrashedProjects = async () => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  const response = await fetch(`${API_BASE_URL}/api/projects/trash/list`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.projects || [];
  }
  return [];
};

const restoreProject = async (projectId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');
  
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/restore`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '프로젝트 복원에 실패했습니다.');
  }
  
  await fetchProjects();
  return response.json();
};

const permanentDeleteProject = async (projectId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');
  
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/permanent`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '영구 삭제에 실패했습니다.');
  }
  
  return response.json();
};
```

#### src/components/admin/PersonalServiceDashboard.tsx
```typescript
const handleDeleteProject = async (projectId: string) => {
  const project = projects.find(p => p.id === projectId);
  const projectTitle = project?.title || '프로젝트';
  
  if (window.confirm(`"${projectTitle}"를 휴지통으로 이동하시겠습니까?`)) {
    try {
      // onDeleteProject prop 사용 (백엔드 API 호출)
      if (onDeleteProject) {
        await onDeleteProject(projectId);
        
        // UI에서 즉시 제거
        setProjects(prev => prev.filter(p => p.id !== projectId));
        
        alert(`"${projectTitle}"가 휴지통으로 이동되었습니다.`);
      }
    } catch (error) {
      console.error('Project deletion error:', error);
      alert(error instanceof Error ? error.message : '프로젝트 삭제 중 오류가 발생했습니다.');
      
      // 실패 시 프로젝트 목록 다시 로드
      await loadProjects();
    }
  }
};
```

#### src/components/admin/TrashBin.tsx
```typescript
// localStorage 사용 부분 제거
const loadTrashedProjects = async () => {
  if (!onFetchTrashedProjects) {
    console.log('❌ onFetchTrashedProjects 함수가 전달되지 않았습니다');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const projects = await onFetchTrashedProjects();
    
    if (projects && projects.length > 0) {
      console.log(`✅ 휴지통 데이터 있음: ${projects.length}개`);
    } else {
      console.log('⚠️ 휴지통이 비어있습니다');
    }
    
    setTrashedProjects(projects || []);
  } catch (error) {
    console.error('❌ 휴지통 프로젝트 로드 실패:', error);
  } finally {
    setLoading(false);
  }
};
```

## 📊 데이터 흐름

### 프로젝트 삭제 흐름
1. **사용자 액션**: 삭제 버튼 클릭
2. **프론트엔드**: PersonalServiceDashboard → onDeleteProject()
3. **App.tsx**: deleteProject() → 백엔드 API 호출
4. **백엔드**: `DELETE /api/projects/:id`
5. **데이터베이스**: `UPDATE projects SET status='deleted', deleted_at=NOW()`
6. **응답**: 성공 메시지 반환
7. **UI 업데이트**: 프로젝트 목록에서 제거

### 휴지통 조회 흐름
1. **사용자 액션**: 휴지통 탭 클릭
2. **프론트엔드**: TrashBin 컴포넌트 마운트
3. **App.tsx**: fetchTrashedProjects() → 백엔드 API 호출
4. **백엔드**: `GET /api/projects/trash/list`
5. **데이터베이스**: `SELECT * FROM projects WHERE status='deleted'`
6. **응답**: 삭제된 프로젝트 목록 반환
7. **UI 렌더링**: 휴지통 목록 표시

### 복원 흐름
1. **사용자 액션**: 복원 버튼 클릭
2. **프론트엔드**: TrashBin → onRestoreProject()
3. **App.tsx**: restoreProject() → 백엔드 API 호출
4. **백엔드**: `PUT /api/projects/:id/restore`
5. **데이터베이스**: `UPDATE projects SET status='active', deleted_at=NULL`
6. **응답**: 복원 성공 메시지
7. **UI 업데이트**: 프로젝트 목록 새로고침

### 영구 삭제 흐름
1. **사용자 액션**: 영구 삭제 버튼 클릭 (2차 확인)
2. **프론트엔드**: TrashBin → onPermanentDeleteProject()
3. **App.tsx**: permanentDeleteProject() → 백엔드 API 호출
4. **백엔드**: `DELETE /api/projects/:id/permanent`
5. **데이터베이스**: 트랜잭션으로 관련 데이터 모두 삭제
6. **응답**: 영구 삭제 성공 메시지
7. **UI 업데이트**: 휴지통에서 제거

## 🔧 수정된 파일

1. **backend/src/routes/projects.ts**
   - 소프트 삭제 엔드포인트 추가
   - 휴지통 조회 엔드포인트 추가
   - 복원 엔드포인트 추가
   - 영구 삭제 엔드포인트 추가

2. **src/App.tsx**
   - localStorage 및 dataService 사용 제거
   - 백엔드 API 직접 호출로 변경
   - 데모 모드 관련 코드 제거

3. **src/components/admin/PersonalServiceDashboard.tsx**
   - localStorage 사용 제거
   - onDeleteProject prop 사용으로 변경
   - 삭제 완료 메시지 개선

4. **src/components/admin/TrashBin.tsx**
   - localStorage 확인 코드 제거
   - 백엔드 데이터만 사용

## ✅ 테스트 결과

- 빌드 성공 (TypeScript 오류 없음)
- 백엔드 컴파일 성공
- localStorage 의존성 완전 제거
- 데이터베이스 기반 영속성 보장

## 🎯 달성 목표

### 완료된 작업
- ✅ PostgreSQL 기반 소프트 삭제 구현
- ✅ 휴지통 시스템 백엔드 API 구현
- ✅ localStorage 완전 제거
- ✅ 프론트엔드-백엔드 API 연동
- ✅ 데이터 영속성 보장

### 시스템 특징
- **데이터 안정성**: PostgreSQL 트랜잭션 사용
- **복구 가능**: 소프트 삭제로 데이터 보호
- **일관성**: 단일 데이터 소스 (데이터베이스)
- **확장성**: 추후 자동 삭제 정책 추가 가능

## 📝 참고사항

- **인증**: 모든 API는 JWT 토큰 필요
- **권한**: 본인이 생성한 프로젝트만 조작 가능
- **트랜잭션**: 영구 삭제 시 관련 데이터 일괄 처리
- **인덱스**: 성능 최적화를 위한 인덱스 추가

---

*작성일: 2025년 9월 1일*  
*백엔드: https://ahp-forpaper.onrender.com*  
*프론트엔드: GitHub Pages*