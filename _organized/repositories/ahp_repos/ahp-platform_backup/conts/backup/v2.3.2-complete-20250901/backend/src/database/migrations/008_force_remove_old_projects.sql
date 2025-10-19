-- Force remove all old sample projects and ensure only AI development project exists
-- 008_force_remove_old_projects.sql

-- First, list current projects for debugging
DO $$
DECLARE
    project_record RECORD;
BEGIN
    RAISE NOTICE 'Current projects in database:';
    FOR project_record IN 
        SELECT id, title, admin_id, status, created_at FROM projects ORDER BY created_at
    LOOP
        RAISE NOTICE 'Project ID: %, Title: %, Admin: %, Status: %, Created: %', 
            project_record.id, project_record.title, project_record.admin_id, 
            project_record.status, project_record.created_at;
    END LOOP;
END $$;

-- Remove all projects except the AI development one
DELETE FROM pairwise_comparisons WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

DELETE FROM ahp_results WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

DELETE FROM evaluation_sessions WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

DELETE FROM project_settings WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

DELETE FROM alternatives WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

DELETE FROM criteria WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

-- Remove project_evaluators for old projects
DELETE FROM project_evaluators WHERE project_id IN (
    SELECT id FROM projects 
    WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석')
);

-- Finally remove the projects themselves
DELETE FROM projects 
WHERE title NOT IN ('AI 개발 활용 방안', '소프트웨어 개발자의 AI 활용 방안 중요도 분석');

-- Verify cleanup
DO $$
DECLARE
    project_count INTEGER;
    project_record RECORD;
BEGIN
    SELECT COUNT(*) INTO project_count FROM projects;
    RAISE NOTICE 'Total projects remaining: %', project_count;
    
    FOR project_record IN 
        SELECT id, title, admin_id, status FROM projects ORDER BY id
    LOOP
        RAISE NOTICE 'Remaining Project: ID %, Title: %', project_record.id, project_record.title;
    END LOOP;
    
    IF project_count = 0 THEN
        RAISE NOTICE 'WARNING: No projects found! The AI development project may have been accidentally removed.';
    ELSIF project_count = 1 THEN
        RAISE NOTICE 'SUCCESS: Only the AI development project remains.';
    ELSE
        RAISE NOTICE 'WARNING: % projects still exist. Check if cleanup was complete.', project_count;
    END IF;
END $$;