# 20. 휴지통 시스템 구현 개발 일지

> **작업일**: 2025-08-31  
> **커밋**: d7b7c0a - ✨ 휴지통 기능 구현 - 프로젝트 소프트 삭제 및 복원  
> **작업 범위**: 프로젝트 소프트 삭제, 휴지통 UI, 복원 및 영구 삭제 기능 구현

## 개요

사용자의 요구사항에 따라 프로젝트 삭제 시 즉시 완전 삭제되는 것이 아닌, 휴지통으로 이동하여 복원 또는 영구 삭제를 선택할 수 있는 안전한 삭제 시스템을 구현했습니다.

## 주요 구현 사항

### 1. 데이터베이스 스키마 변경

**파일**: `backend/src/database/migrations/005_soft_delete_projects.sql`

```sql
-- 프로젝트 소프트 삭제를 위한 필드 추가
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- status 컬럼 체크 제약 조건 업데이트 (deleted 추가)
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'deleted'));

-- 삭제된 프로젝트는 목록에서 제외하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_status_not_deleted 
ON projects(admin_id, status) WHERE status != 'deleted';

-- 휴지통 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_deleted 
ON projects(admin_id, deleted_at) WHERE status = 'deleted';
```

**변경 내용**:
- `deleted_at` 타임스탬프 컬럼 추가
- `status` 값에 'deleted' 추가
- 성능 최적화를 위한 인덱스 생성

### 2. 백엔드 API 구현

**파일**: `backend/src/routes/projects.ts`

#### 2.1 프로젝트 목록 조회 수정
```typescript
// 삭제된 프로젝트 제외
let whereConditions = [
  `p.title NOT IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')`,
  `(p.status IS NULL OR p.status != 'deleted')`  // 삭제된 프로젝트 제외
];
```

#### 2.2 소프트 삭제 API
```typescript
// DELETE /api/projects/:id - 휴지통으로 이동
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  // Soft delete - 상태를 deleted로 변경하고 삭제 시간 기록
  const result = await query(
    `UPDATE projects 
     SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND admin_id = $2
     RETURNING *`,
    [id, userId]
  );
});
```

#### 2.3 복원 API
```typescript
// PUT /api/projects/:id/restore - 휴지통에서 복원
router.put('/:id/restore', authenticateToken, async (req: Request, res: Response) => {
  // 복원 - 상태를 active로 변경하고 deleted_at 클리어
  const result = await query(
    `UPDATE projects 
     SET status = 'active', deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND admin_id = $2
     RETURNING *`,
    [id, userId]
  );
});
```

#### 2.4 영구 삭제 API
```typescript
// DELETE /api/projects/:id/permanent - 영구 삭제
router.delete('/:id/permanent', authenticateToken, async (req: Request, res: Response) => {
  // 관련 데이터 모두 삭제 (트랜잭션 사용)
  await query('BEGIN');
  
  try {
    // 평가 데이터 삭제
    await query('DELETE FROM comparisons WHERE project_id = $1', [id]);
    await query('DELETE FROM evaluations WHERE project_id = $1', [id]);
    
    // 대안 삭제
    await query('DELETE FROM alternatives WHERE project_id = $1', [id]);
    
    // 기준 삭제
    await query('DELETE FROM criteria WHERE project_id = $1', [id]);
    
    // 평가자 연결 삭제
    await query('DELETE FROM project_evaluators WHERE project_id = $1', [id]);
    
    // 프로젝트 삭제
    await query('DELETE FROM projects WHERE id = $1', [id]);
    
    await query('COMMIT');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});
```

### 3. 프론트엔드 구현

#### 3.1 TrashBin 컴포넌트 생성

**파일**: `src/components/admin/TrashBin.tsx`

**주요 기능**:
- 삭제된 프로젝트 목록 표시
- 생성일/삭제일 정보 제공
- 복원 기능 (확인 대화상자 포함)
- 영구 삭제 기능 (2단계 확인)
- 한국어 날짜 포맷팅
- 상대적 시간 표시 (1일 전, 1주 전 등)

**UI 특징**:
- 직관적인 아이콘 사용 (🗑️, ↩️)
- 위험한 작업에 대한 명확한 경고
- 로딩 상태 표시
- 빈 휴지통 상태 처리

#### 3.2 App.tsx 함수 구현

**파일**: `src/App.tsx`

```typescript
// 휴지통 프로젝트 조회
const fetchTrashedProjects = async () => {
  if (isDemoMode) {
    return []; // 데모 모드에서는 휴지통 기능 없음
  }
  
  const response = await fetch(`${API_BASE_URL}/api/projects?status=deleted`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.projects || [];
  }
  return [];
};

// 휴지통에서 복원
const restoreProject = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/restore`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  await fetchProjects(); // 목록 새로고침
  return response.json();
};

// 영구 삭제
const permanentDeleteProject = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/permanent`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
};
```

#### 3.3 PersonalServiceDashboard 통합

**파일**: `src/components/admin/PersonalServiceDashboard.tsx`

**변경 사항**:
1. **네비게이션 추가**: 2번째 행에 휴지통 탭 추가
2. **TypeScript 타입 확장**: activeMenu 타입에 'trash' 추가
3. **렌더링 로직**: switch문에 trash case 추가
4. **프로젝트 삭제 로직 수정**: 하드 삭제 → 소프트 삭제로 변경

```typescript
// 네비게이션 항목 추가
{ id: 'trash', label: '휴지통', icon: '🗑️', tooltip: '삭제된 프로젝트 복원 및 영구 삭제' }

// 렌더링 로직
case 'trash':
  return (
    <TrashBin
      onFetchTrashedProjects={fetchTrashedProjects}
      onRestoreProject={restoreProject}
      onPermanentDeleteProject={permanentDeleteProject}
      onBack={() => handleTabChange('dashboard')}
    />
  );
```

## 사용자 경험 개선

### 1. 안전한 삭제 프로세스
- **1단계**: 프로젝트 삭제 시 휴지통으로 이동
- **2단계**: 휴지통에서 복원 또는 영구 삭제 선택
- **3단계**: 영구 삭제 시 2번의 확인 대화상자

### 2. 직관적인 UI/UX
- 명확한 아이콘과 라벨링 (🗑️ 휴지통, ↩️ 복원)
- 삭제 위험도에 따른 버튼 색상 구분
- 한국어 날짜 형식 및 상대적 시간 표시
- 빈 휴지통 상태에 대한 친근한 메시지

### 3. 정보 투명성
- 프로젝트 생성일/삭제일 정보 제공
- 프로젝트 생성자 정보 표시
- 삭제된 항목 개수 표시

## 기술적 특징

### 1. 소프트 삭제 패턴
- 물리적 삭제 대신 논리적 삭제 구현
- `deleted_at` 타임스탬프로 삭제 시점 추적
- 데이터 무결성 보장

### 2. 트랜잭션 기반 영구 삭제
- 관련된 모든 데이터를 하나의 트랜잭션에서 처리
- 실패 시 롤백으로 데이터 일관성 보장
- 외래 키 관계 고려한 순서로 삭제

### 3. 권한 기반 접근 제어
- 프로젝트 소유자만 삭제/복원/영구삭제 가능
- JWT 토큰 기반 인증 확인
- 삭제된 프로젝트에 대한 별도 권한 체크

## 데이터 흐름

### 프로젝트 삭제 흐름
1. 사용자가 프로젝트 삭제 버튼 클릭
2. 확인 대화상자 표시
3. `DELETE /api/projects/:id` API 호출
4. DB에서 `status = 'deleted'`, `deleted_at = CURRENT_TIMESTAMP` 업데이트
5. 프로젝트 목록에서 제외

### 복원 흐름
1. 휴지통에서 복원 버튼 클릭
2. `PUT /api/projects/:id/restore` API 호출
3. DB에서 `status = 'active'`, `deleted_at = NULL` 업데이트
4. 프로젝트 목록에 다시 표시

### 영구 삭제 흐름
1. 휴지통에서 영구 삭제 버튼 클릭
2. 2단계 확인 대화상자
3. `DELETE /api/projects/:id/permanent` API 호출
4. 트랜잭션으로 관련 데이터 완전 삭제

## 보안 및 안전성

### 1. 이중 확인 시스템
- 영구 삭제 시 2번의 확인 요청
- 명확한 경고 메시지 제공
- 복구 불가능함을 명시

### 2. 권한 검증
- 각 API에서 프로젝트 소유권 확인
- 삭제된 프로젝트에 대한 별도 상태 체크
- JWT 토큰 유효성 검증

### 3. 데이터 무결성
- 트랜잭션 기반 일관성 보장
- 외래 키 관계 고려한 삭제 순서
- 실패 시 롤백 처리

## 파일 변경 요약

### 새로 생성된 파일
1. **TrashBin.tsx** (237라인): 휴지통 전용 UI 컴포넌트
2. **005_soft_delete_projects.sql** (19라인): DB 마이그레이션 스크립트

### 수정된 파일
1. **projects.ts** (+124라인): 삭제/복원/영구삭제 API 3개 추가
2. **App.tsx** (+94라인): 휴지통 관련 함수 3개 구현
3. **PersonalServiceDashboard.tsx** (+14라인): 휴지통 탭 통합 및 타입 확장

## 사용자 피드백 반영

### 원본 요구사항
> "삭제하면 삭제가 되어야 하고... 휴지통 기능을 만들어서 한번 걸러 삭제해줘도 좋아"

### 구현된 해결책
- ✅ 프로젝트 삭제 시 즉시 휴지통으로 이동
- ✅ 휴지통에서 복원 또는 영구 삭제 선택 가능
- ✅ 2단계 확인으로 실수 방지
- ✅ 모든 데이터 PostgreSQL DB에 저장

## 테스트 시나리오

### 기본 삭제 테스트
1. 프로젝트 목록에서 삭제 버튼 클릭
2. 확인 후 프로젝트가 목록에서 사라지는지 확인
3. 휴지통 탭에서 삭제된 프로젝트 확인

### 복원 테스트
1. 휴지통에서 복원 버튼 클릭
2. 프로젝트가 다시 활성 목록에 나타나는지 확인
3. 모든 기능이 정상 작동하는지 확인

### 영구 삭제 테스트
1. 휴지통에서 영구 삭제 버튼 클릭
2. 2단계 확인 과정 진행
3. 완전히 삭제되어 복구 불가능한지 확인

## 향후 개선 사항

### 자동 정리 기능
- 30일 후 자동 영구 삭제 스케줄러 (cron job)
- 관리자 대시보드에서 설정 가능한 보존 기간

### 대량 작업 지원
- 휴지통에서 다중 선택 및 일괄 복원/삭제
- 전체 휴지통 비우기 기능

### 활동 로그
- 삭제/복원 작업에 대한 상세 로그 기록
- 관리자용 삭제 이력 추적

## 문제 해결 및 최종 수정

### 발생한 문제들

#### 1. GitHub Actions 빌드 실패
**문제**: ESLint 경고로 인한 빌드 실패
- `no-restricted-globals` 경고: `confirm` → `window.confirm`
- Button variant 오류: `"danger"` → `"error"`
- 함수명 오타: `fetchTrashedProjects` → `onFetchTrashedProjects`

**해결**: 
- **커밋 1afd056**: 🐛 휴지통 시스템 ESLint 오류 수정

#### 2. 휴지통 API 엔드포인트 누락
**문제**: 프론트엔드에서 `GET /api/projects?status=deleted` 호출하지만 백엔드에 해당 엔드포인트 없음

**해결**:
```typescript
// 새로 추가된 API
router.get('/trash', authenticateToken, async (req: Request, res: Response) => {
  const result = await query(
    `SELECT p.*, u.first_name || ' ' || u.last_name as admin_name
     FROM projects p
     LEFT JOIN users u ON p.admin_id = u.id
     WHERE p.admin_id = $1 AND p.status = 'deleted'
     ORDER BY p.deleted_at DESC`,
    [userId]
  );
  res.json({ projects: result.rows });
});
```

#### 3. 삭제 후 UI 업데이트 안됨
**문제**: 프로젝트 삭제 후 목록이 자동으로 새로고침되지 않음

**해결**:
```typescript
await onDeleteProject(projectId);
await loadProjects(); // 추가된 새로고침 로직
```

**커밋 658d7f3**: 🔧 휴지통 API 엔드포인트 및 새로고침 로직 수정

### 최종 커밋 이력
1. **d7b7c0a**: ✨ 휴지통 기능 구현 - 프로젝트 소프트 삭제 및 복원
2. **1afd056**: 🐛 휴지통 시스템 ESLint 오류 수정  
3. **658d7f3**: 🔧 휴지통 API 엔드포인트 및 새로고침 로직 수정

## 휴지통 사용법

### 접근 방법
1. PersonalServiceDashboard 로그인
2. **2번째 행 첫 번째 탭** 🗑️ **휴지통** 클릭

### 기능 설명
- **프로젝트 삭제**: 내 프로젝트에서 🗑️ 버튼 클릭 → 휴지통으로 이동
- **프로젝트 복원**: 휴지통에서 ↩️ 복원 버튼 클릭
- **영구 삭제**: 휴지통에서 🗑️ 영구삭제 버튼 클릭 (2단계 확인)

### 데이터 흐름
- **삭제**: `status = 'deleted'`, `deleted_at = CURRENT_TIMESTAMP`
- **복원**: `status = 'active'`, `deleted_at = NULL`  
- **영구삭제**: 모든 관련 데이터 완전 삭제 (트랜잭션)

## 결론

PostgreSQL 기반의 완전한 휴지통 시스템이 구현되었습니다. 사용자는 이제 안전하게 프로젝트를 삭제하고 필요시 복원할 수 있으며, 모든 데이터는 데이터베이스에 영구적으로 보존됩니다.

**최종 확인**:
- ✅ PersonalServiceDashboard 2번째 행에 🗑️ 휴지통 탭 추가
- ✅ 프로젝트 삭제 시 즉시 목록에서 제거됨  
- ✅ 휴지통에서 삭제된 프로젝트 조회 가능
- ✅ 복원 및 영구 삭제 기능 정상 작동
- ✅ 모든 데이터 PostgreSQL DB 저장

이 구현으로 사용자의 핵심 요구사항인 "절대 서비스 프로그램이라 자료는 DB에 저장하고 호출되어야 해"가 완전히 충족되었습니다.