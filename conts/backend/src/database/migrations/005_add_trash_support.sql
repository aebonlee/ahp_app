-- 휴지통 기능을 위한 스키마 추가
-- 005_add_trash_support.sql

-- projects 테이블에 deleted_at 컬럼 추가
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- status 값에 'deleted' 추가
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('draft', 'active', 'completed', 'deleted'));

-- 삭제된 프로젝트 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_status_deleted ON projects(status) WHERE status = 'deleted';

-- 휴지통 관련 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW trashed_projects AS
SELECT 
    p.*,
    u.first_name || ' ' || u.last_name as admin_name
FROM projects p
LEFT JOIN users u ON p.admin_id = u.id
WHERE p.status = 'deleted' AND p.deleted_at IS NOT NULL
ORDER BY p.deleted_at DESC;