-- PostgreSQL 긴급 수정 SQL
-- 2차 개발을 위한 즉시 실행 가능한 스크립트

-- 1. 시스템 사용자 생성 (ID=1)
INSERT INTO auth_user (
    id, password, last_login, is_superuser, username, 
    first_name, last_name, email, is_staff, is_active, date_joined
)
VALUES (
    1, '', NULL, true, 'system', 
    'System', 'User', 'system@ahp.com', true, true, NOW()
)
ON CONFLICT (id) DO UPDATE SET
    is_active = true,
    is_staff = true,
    is_superuser = true;

-- 2. created_by_id 제약조건 완화
ALTER TABLE simple_projects 
    ALTER COLUMN created_by_id DROP NOT NULL,
    ALTER COLUMN created_by_id SET DEFAULT 1;

-- 3. 누락된 컬럼 추가 (없으면)
ALTER TABLE simple_projects 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. NULL인 created_by_id 수정
UPDATE simple_projects 
SET created_by_id = 1 
WHERE created_by_id IS NULL;

-- 5. 테스트 프로젝트 생성
INSERT INTO simple_projects (title, description, created_by_id)
VALUES ('2차 개발 테스트', '안정화 버전 테스트 프로젝트', 1)
ON CONFLICT DO NOTHING;

-- 실행 확인
SELECT 
    'Projects' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN created_by_id IS NULL THEN 1 END) as null_users
FROM simple_projects
UNION ALL
SELECT 
    'Users' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN id = 1 THEN 1 END) as system_user
FROM auth_user;