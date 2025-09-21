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