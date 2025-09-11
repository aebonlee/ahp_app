-- Complete evaluation data for Software Developer AI Utilization Analysis
-- 007_complete_evaluation_data.sql

-- First ensure clean database state
DELETE FROM pairwise_comparisons;
DELETE FROM ahp_results;
DELETE FROM evaluation_sessions;
DELETE FROM project_settings;
DELETE FROM alternatives;
DELETE FROM criteria;
DELETE FROM projects WHERE title != 'AI 개발 활용 방안' AND title != '소프트웨어 개발자의 AI 활용 방안 중요도 분석';

-- Update project title to match exact name
UPDATE projects SET 
    title = '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
    description = '개발 과정에서 AI 도구 활용의 우선순위를 결정하기 위한 AHP 분석',
    objective = 'AI 기반 개발 도구의 효과적인 활용 전략 수립'
WHERE title = 'AI 개발 활용 방안' OR title = '소프트웨어 개발자의 AI 활용 방안 중요도 분석';

-- Get project and admin IDs
DO $$
DECLARE
    project_id INTEGER;
    admin_user_id INTEGER;
    evaluator_ids INTEGER ARRAY DEFAULT ARRAY[]::INTEGER[];
    i INTEGER;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- Get or create project
    SELECT id INTO project_id FROM projects WHERE title = '소프트웨어 개발자의 AI 활용 방안 중요도 분석' LIMIT 1;
    
    IF project_id IS NULL THEN
        INSERT INTO projects (title, name, description, objective, admin_id, status) 
        VALUES (
            '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
            '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
            '개발 과정에서 AI 도구 활용의 우선순위를 결정하기 위한 AHP 분석',
            'AI 기반 개발 도구의 효과적인 활용 전략 수립',
            admin_user_id,
            'active'
        ) RETURNING id INTO project_id;
    END IF;

    -- Clear existing data for this project
    DELETE FROM criteria WHERE project_id = project_id;
    DELETE FROM alternatives WHERE project_id = project_id;

    -- Create main criteria (Level 1)
    INSERT INTO criteria (project_id, name, description, level, position, weight) VALUES
    (project_id, '개발 생산성 효율화', '개발 속도 및 생산성 향상에 기여하는 요소들', 1, 1, 0.40386),
    (project_id, '코딩 실무 품질 적합화', '코드 품질 및 실무 적합성 관련 요소들', 1, 2, 0.30101),
    (project_id, '개발 프로세스 자동화', '개발 프로세스의 자동화 및 최적화 요소들', 1, 3, 0.29513);

    -- Create sub-criteria under 개발 생산성 효율화
    INSERT INTO criteria (project_id, name, description, level, position, weight, parent_id) 
    SELECT project_id, name, description, 2, position, weight, c.id
    FROM (VALUES
        ('코딩 작성 속도 향상', '코딩 작성 시간 단축 및 속도 향상', 1, 0.16959),
        ('디버깅 시간 단축', '버그 발견 및 수정 시간 단축', 2, 0.10044),
        ('반복 작업 최소화', '반복적인 코딩 작업의 자동화', 3, 0.13382)
    ) AS sub(name, description, position, weight)
    CROSS JOIN criteria c 
    WHERE c.project_id = project_id AND c.name = '개발 생산성 효율화';

    -- Create sub-criteria under 코딩 실무 품질 적합화
    INSERT INTO criteria (project_id, name, description, level, position, weight, parent_id) 
    SELECT project_id, name, description, 2, position, weight, c.id
    FROM (VALUES
        ('코드 품질 개선 및 최적화', '코드 품질 향상 및 성능 최적화', 1, 0.15672),
        ('AI생성 코딩의 신뢰성', 'AI가 생성한 코드의 신뢰성 및 정확성', 2, 0.06706),
        ('신규 기술/언어 학습지원', '새로운 기술 및 언어 학습 지원', 3, 0.07723)
    ) AS sub(name, description, position, weight)
    CROSS JOIN criteria c 
    WHERE c.project_id = project_id AND c.name = '코딩 실무 품질 적합화';

    -- Create sub-criteria under 개발 프로세스 자동화
    INSERT INTO criteria (project_id, name, description, level, position, weight, parent_id) 
    SELECT project_id, name, description, 2, position, weight, c.id
    FROM (VALUES
        ('테스트 케이스 자동 생성', '자동화된 테스트 케이스 생성', 1, 0.08653),
        ('형상관리 및 배포 지원', '버전 관리 및 배포 프로세스 지원', 2, 0.11591),
        ('기술 문서/주석 자동화', '문서 및 주석 자동 생성', 3, 0.09270)
    ) AS sub(name, description, position, weight)
    CROSS JOIN criteria c 
    WHERE c.project_id = project_id AND c.name = '개발 프로세스 자동화';

    -- Create 26 evaluator users if they don't exist
    FOR i IN 1..25 LOOP
        INSERT INTO users (email, password_hash, first_name, last_name, role, status)
        VALUES (
            'p' || LPAD(i::text, 3, '0') || '@evaluator.com',
            '$2b$10$dummy.hash.for.evaluator.' || i,
            '평가자' || i,
            'P' || LPAD(i::text, 3, '0'),
            'evaluator',
            'active'
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- Add manager user
    INSERT INTO users (email, password_hash, first_name, last_name, role, status)
    VALUES (
        'manager@company.com',
        '$2b$10$dummy.hash.for.manager',
        '관리자',
        'Manager',
        'admin',
        'active'
    ) ON CONFLICT (email) DO NOTHING;

    -- Create evaluation sessions for all evaluators (100% completion)
    INSERT INTO evaluation_sessions (project_id, evaluator_id, session_name, status, completion_percentage, started_at, completed_at)
    SELECT 
        project_id,
        u.id,
        'AI 활용 방안 평가 - ' || u.first_name,
        'completed',
        100.0,
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    FROM users u 
    WHERE u.role = 'evaluator' OR u.email = 'manager@company.com';

    -- Create final AHP results with integrated weights
    INSERT INTO ahp_results (project_id, evaluator_id, result_type, criteria_weights, alternative_scores, final_ranking, consistency_ratio, calculation_method)
    VALUES (
        project_id,
        NULL, -- Integrated result
        'final',
        '{"개발 생산성 효율화": 0.40386, "코딩 실무 품질 적합화": 0.30101, "개발 프로세스 자동화": 0.29513, "코딩 작성 속도 향상": 0.16959, "코드 품질 개선 및 최적화": 0.15672, "반복 작업 최소화": 0.13382, "형상관리 및 배포 지원": 0.11591, "디버깅 시간 단축": 0.10044, "기술 문서/주석 자동화": 0.09270, "테스트 케이스 자동 생성": 0.08653, "신규 기술/언어 학습지원": 0.07723, "AI생성 코딩의 신뢰성": 0.06706}',
        '{"코딩 작성 속도 향상": 0.16959, "코드 품질 개선 및 최적화": 0.15672, "반복 작업 최소화": 0.13382, "형상관리 및 배포 지원": 0.11591, "디버깅 시간 단축": 0.10044, "기술 문서/주석 자동화": 0.09270, "테스트 케이스 자동 생성": 0.08653, "신규 기술/언어 학습지원": 0.07723, "AI생성 코딩의 신뢰성": 0.06706}',
        '["코딩 작성 속도 향상", "코드 품질 개선 및 최적화", "반복 작업 최소화", "형상관리 및 배포 지원", "디버깅 시간 단축", "기술 문서/주석 자동화", "테스트 케이스 자동 생성", "신규 기술/언어 학습지원", "AI생성 코딩의 신뢰성"]',
        0.00192, -- Overall consistency ratio
        'Geometric Mean Integration'
    );

    -- Add project settings
    INSERT INTO project_settings (project_id, setting_key, setting_value, data_type) VALUES
    (project_id, 'max_criteria', '15', 'number'),
    (project_id, 'max_alternatives', '20', 'number'),
    (project_id, 'evaluation_method', 'pairwise', 'string'),
    (project_id, 'consistency_threshold', '0.1', 'number'),
    (project_id, 'evaluator_count', '26', 'number'),
    (project_id, 'completion_rate', '100', 'number');

    RAISE NOTICE 'Complete evaluation data inserted successfully for project: %', project_id;
    RAISE NOTICE 'Project title: 소프트웨어 개발자의 AI 활용 방안 중요도 분석';
    RAISE NOTICE 'Evaluators: 26 (25 evaluators + 1 manager)';
    RAISE NOTICE 'Completion rate: 100%';

END $$;