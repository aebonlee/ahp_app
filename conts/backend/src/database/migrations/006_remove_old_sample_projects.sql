-- Remove old sample projects and keep only AI development project
-- 006_remove_old_sample_projects.sql

-- Remove all existing sample data to clean up the database
DELETE FROM pairwise_comparisons WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM ahp_results WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM evaluation_sessions WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM project_settings WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM alternatives WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM criteria WHERE project_id IN (
  SELECT id FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택')
);

DELETE FROM projects WHERE title IN ('스마트폰 선택 평가', '직원 채용 평가', '투자 포트폴리오 선택');

-- Ensure AI development project is the only sample project
DO $$
DECLARE
    admin_user_id INTEGER;
    ai_project_count INTEGER;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Check if AI development project exists
    SELECT COUNT(*) INTO ai_project_count 
    FROM projects 
    WHERE title = 'AI 개발 활용 방안' OR title = '소프트웨어 개발자의 AI 활용 방안 중요도 분석';
    
    -- If no AI project exists and we have an admin user, log warning
    IF ai_project_count = 0 AND admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Warning: No AI development project found. Please ensure migration 005 has been run.';
    END IF;
    
    -- Log success
    RAISE NOTICE 'Old sample projects removed successfully. AI development project preserved.';
END $$;