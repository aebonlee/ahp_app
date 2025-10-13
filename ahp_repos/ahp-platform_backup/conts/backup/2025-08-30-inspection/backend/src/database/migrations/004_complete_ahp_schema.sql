-- 기존 스키마와 호환되는 AHP 시스템 업데이트
-- 004_complete_ahp_schema.sql

-- projects 테이블에 누락된 컬럼 추가
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS objective TEXT;

-- title이 null인 경우 name으로 설정
UPDATE projects SET title = name WHERE title IS NULL;

-- criteria 테이블 업데이트 (기존 order_index를 position으로 매핑)
ALTER TABLE criteria 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,6) DEFAULT 0;

-- position이 0인 경우 order_index 값으로 설정
UPDATE criteria SET position = COALESCE(order_index, 0) WHERE position = 0;

-- alternatives 테이블에 누락된 컬럼 추가
ALTER TABLE alternatives 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost DECIMAL(15,2) DEFAULT 0;

-- position이 0인 경우 order_index 값으로 설정
UPDATE alternatives SET position = COALESCE(order_index, 0) WHERE position = 0;

-- 새로운 pairwise_comparisons 구조로 변경
-- 기존 테이블 백업
CREATE TABLE IF NOT EXISTS pairwise_comparisons_backup AS 
SELECT * FROM pairwise_comparisons;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS pairwise_comparisons;

-- 새로운 pairwise_comparisons 테이블 생성
CREATE TABLE pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    comparison_type VARCHAR(50) NOT NULL CHECK (comparison_type IN ('criteria', 'alternatives')),
    element_a_id INTEGER NOT NULL,
    element_b_id INTEGER NOT NULL,
    value DECIMAL(10,6) NOT NULL CHECK (value >= 0.111111 AND value <= 9.0),
    consistency_ratio DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, evaluator_id, parent_criteria_id, comparison_type, element_a_id, element_b_id)
);

-- 평가 세션 테이블 생성
CREATE TABLE IF NOT EXISTS evaluation_sessions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AHP 계산 결과 테이블 생성
CREATE TABLE IF NOT EXISTS ahp_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    result_type VARCHAR(50) NOT NULL CHECK (result_type IN ('individual', 'group', 'final')),
    criteria_weights JSONB,
    alternative_scores JSONB,
    final_ranking JSONB,
    consistency_ratio DECIMAL(10,6),
    calculation_method VARCHAR(100),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 설정 테이블 생성
CREATE TABLE IF NOT EXISTS project_settings (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, setting_key)
);

-- 관리자 사용자가 존재하는지 확인하고 샘플 데이터 삽입
DO $$
DECLARE
    admin_user_id INTEGER;
BEGIN
    -- 관리자 사용자 확인
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- 샘플 프로젝트 데이터 삽입 (중복 방지)
        INSERT INTO projects (title, name, description, objective, admin_id, status) 
        SELECT '스마트폰 선택 평가', '스마트폰 선택 평가', '새로운 스마트폰 구매를 위한 다기준 의사결정', '가격, 성능, 디자인을 고려한 최적의 스마트폰 선택', admin_user_id, 'active'
        WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '스마트폰 선택 평가' OR name = '스마트폰 선택 평가');

        INSERT INTO projects (title, name, description, objective, admin_id, status) 
        SELECT '직원 채용 평가', '직원 채용 평가', '신입 개발자 채용을 위한 평가 시스템', '기술력, 커뮤니케이션, 성장 가능성을 종합 평가', admin_user_id, 'active'
        WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '직원 채용 평가' OR name = '직원 채용 평가');

        -- 스마트폰 프로젝트의 기준 데이터
        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '가격', '구매 비용 및 가성비', 1, 1
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '가격');

        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '성능', '처리 속도 및 기능', 1, 2
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '성능');

        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '디자인', '외관 및 사용성', 1, 3
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '디자인');

        -- 스마트폰 프로젝트의 대안 데이터
        INSERT INTO alternatives (project_id, name, description, cost, position)
        SELECT p.id, 'iPhone 15 Pro', '애플의 최신 프리미엄 스마트폰', 1200000, 1
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = 'iPhone 15 Pro');

        INSERT INTO alternatives (project_id, name, description, cost, position)
        SELECT p.id, 'Samsung Galaxy S24', '삼성의 플래그십 모델', 1100000, 2
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = 'Samsung Galaxy S24');

        INSERT INTO alternatives (project_id, name, description, cost, position)
        SELECT p.id, 'Google Pixel 8', '구글의 AI 기반 스마트폰', 800000, 3
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = 'Google Pixel 8');

        -- 직원 채용 프로젝트의 기준 데이터
        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '기술력', '프로그래밍 및 개발 능력', 1, 1
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '기술력');

        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '커뮤니케이션', '의사소통 및 협업 능력', 1, 2
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '커뮤니케이션');

        INSERT INTO criteria (project_id, name, description, level, position)
        SELECT p.id, '성장 가능성', '학습 의지 및 발전 잠재력', 1, 3
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM criteria c WHERE c.project_id = p.id AND c.name = '성장 가능성');

        -- 직원 채용 프로젝트의 대안 데이터
        INSERT INTO alternatives (project_id, name, description, position)
        SELECT p.id, '후보자 A', '5년 경력의 풀스택 개발자', 1
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = '후보자 A');

        INSERT INTO alternatives (project_id, name, description, position)
        SELECT p.id, '후보자 B', '신입 개발자, 컴퓨터공학 전공', 2
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = '후보자 B');

        INSERT INTO alternatives (project_id, name, description, position)
        SELECT p.id, '후보자 C', '3년 경력의 프론트엔드 개발자', 3
        FROM projects p 
        WHERE (p.title = '직원 채용 평가' OR p.name = '직원 채용 평가')
        AND NOT EXISTS (SELECT 1 FROM alternatives a WHERE a.project_id = p.id AND a.name = '후보자 C');

        -- 프로젝트 설정 초기값
        INSERT INTO project_settings (project_id, setting_key, setting_value, data_type)
        SELECT p.id, 'max_criteria', '10', 'number'
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM project_settings ps WHERE ps.project_id = p.id AND ps.setting_key = 'max_criteria');

        INSERT INTO project_settings (project_id, setting_key, setting_value, data_type)
        SELECT p.id, 'max_alternatives', '20', 'number'
        FROM projects p 
        WHERE (p.title = '스마트폰 선택 평가' OR p.name = '스마트폰 선택 평가')
        AND NOT EXISTS (SELECT 1 FROM project_settings ps WHERE ps.project_id = p.id AND ps.setting_key = 'max_alternatives');

    END IF;
END $$;

-- 새로운 인덱스 생성 (중복 방지)
CREATE INDEX IF NOT EXISTS idx_pairwise_comparisons_new_project_evaluator ON pairwise_comparisons(project_id, evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_project_evaluator ON evaluation_sessions(project_id, evaluator_id);
CREATE INDEX IF NOT EXISTS idx_ahp_results_project_id ON ahp_results(project_id);
CREATE INDEX IF NOT EXISTS idx_project_settings_project_key ON project_settings(project_id, setting_key);

-- 트리거 추가 (새 테이블들을 위한)
CREATE TRIGGER IF NOT EXISTS update_pairwise_comparisons_updated_at BEFORE UPDATE ON pairwise_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_evaluation_sessions_updated_at BEFORE UPDATE ON evaluation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_project_settings_updated_at BEFORE UPDATE ON project_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();