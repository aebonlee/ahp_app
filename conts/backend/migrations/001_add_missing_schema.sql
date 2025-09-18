-- 누락된 데이터베이스 스키마 추가
-- 생성일: 2025-01-14

-- 1. criteria 테이블에 eval_method 컬럼 추가
ALTER TABLE criteria ADD COLUMN IF NOT EXISTS eval_method VARCHAR(20) NOT NULL DEFAULT 'pairwise';
ALTER TABLE criteria ADD CONSTRAINT IF NOT EXISTS check_eval_method 
    CHECK (eval_method IN ('pairwise', 'direct'));

-- 2. 직접입력 데이터 저장 테이블 생성
CREATE TABLE IF NOT EXISTS direct_entries (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_key VARCHAR(100) NOT NULL, -- 'criterion:ID' or 'alternative:ID@criterion:ID'
    value NUMERIC(18,6) NOT NULL,
    is_benefit BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_direct_entry UNIQUE (project_id, evaluator_id, target_key),
    CONSTRAINT positive_value CHECK (value > 0)
);

-- 3. 평가자 진행상황 관리 테이블 생성
CREATE TABLE IF NOT EXISTS evaluator_progress (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_rate DECIMAL(5,2) DEFAULT 0.0, -- 0-100%
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_evaluator_progress UNIQUE (project_id, evaluator_id),
    CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100),
    CONSTRAINT valid_task_counts CHECK (completed_tasks >= 0 AND completed_tasks <= total_tasks)
);

-- 4. 평가자 그룹 가중치 테이블 생성
CREATE TABLE IF NOT EXISTS evaluator_weights (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight NUMERIC(10,6) NOT NULL DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_evaluator_weight UNIQUE (project_id, evaluator_id),
    CONSTRAINT positive_weight CHECK (weight > 0)
);

-- 5. 평가자 코드 지원을 위한 컬럼 추가
ALTER TABLE project_evaluators ADD COLUMN IF NOT EXISTS evaluator_code VARCHAR(50);
ALTER TABLE project_evaluators ADD COLUMN IF NOT EXISTS access_key VARCHAR(100);
ALTER TABLE project_evaluators ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 기존 제약조건이 있다면 삭제 후 새로 추가
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_evaluator_code_per_project' 
               AND table_name = 'project_evaluators') THEN
        ALTER TABLE project_evaluators DROP CONSTRAINT unique_evaluator_code_per_project;
    END IF;
END $$;

ALTER TABLE project_evaluators ADD CONSTRAINT unique_evaluator_code_per_project 
    UNIQUE (project_id, evaluator_code);

-- 6. 쌍대비교 테이블에 matrix_key 지원 추가
ALTER TABLE pairwise_comparisons ADD COLUMN IF NOT EXISTS matrix_key VARCHAR(100);
ALTER TABLE pairwise_comparisons ADD COLUMN IF NOT EXISTS i_index INTEGER;
ALTER TABLE pairwise_comparisons ADD COLUMN IF NOT EXISTS j_index INTEGER;

-- 기존 제약조건 업데이트
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'unique_comparison' 
               AND table_name = 'pairwise_comparisons') THEN
        ALTER TABLE pairwise_comparisons DROP CONSTRAINT unique_comparison;
    END IF;
END $$;

ALTER TABLE pairwise_comparisons ADD CONSTRAINT unique_matrix_comparison 
    UNIQUE (project_id, evaluator_id, matrix_key, i_index, j_index);

-- 7. 결과 저장을 위한 테이블 개선
CREATE TABLE IF NOT EXISTS ahp_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result_type VARCHAR(20) NOT NULL CHECK (result_type IN ('individual', 'group')),
    criteria_weights JSONB, -- 기준별 가중치
    alternative_scores JSONB, -- 대안별 점수
    final_ranking JSONB, -- 최종 순위
    consistency_ratio NUMERIC(10,6),
    calculation_method VARCHAR(50) DEFAULT 'geometric_mean',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_individual_result UNIQUE (project_id, evaluator_id, result_type)
);

-- 8. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_direct_entries_project_evaluator 
    ON direct_entries(project_id, evaluator_id);
CREATE INDEX IF NOT EXISTS idx_direct_entries_target_key 
    ON direct_entries(target_key);
CREATE INDEX IF NOT EXISTS idx_evaluator_progress_project 
    ON evaluator_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluator_weights_project 
    ON evaluator_weights(project_id);
CREATE INDEX IF NOT EXISTS idx_pairwise_comparisons_matrix_key 
    ON pairwise_comparisons(matrix_key);
CREATE INDEX IF NOT EXISTS idx_ahp_results_project_type 
    ON ahp_results(project_id, result_type);

-- 9. 업데이트 트리거 추가
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 업데이트 트리거 적용
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_direct_entries_modtime') THEN
        CREATE TRIGGER update_direct_entries_modtime 
            BEFORE UPDATE ON direct_entries 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_evaluator_progress_modtime') THEN
        CREATE TRIGGER update_evaluator_progress_modtime 
            BEFORE UPDATE ON evaluator_progress 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_evaluator_weights_modtime') THEN
        CREATE TRIGGER update_evaluator_weights_modtime 
            BEFORE UPDATE ON evaluator_weights 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ahp_results_modtime') THEN
        CREATE TRIGGER update_ahp_results_modtime 
            BEFORE UPDATE ON ahp_results 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

-- 10. 데이터 초기화 (기본값 설정)
-- 기존 criteria에 기본 eval_method 설정
UPDATE criteria SET eval_method = 'pairwise' WHERE eval_method IS NULL;

-- 기존 project_evaluators에 기본 access_key 생성
UPDATE project_evaluators 
SET access_key = CONCAT(COALESCE(evaluator_code, 'E' || evaluator_id), '-', UPPER(SUBSTRING(project_id::TEXT, 1, 8)))
WHERE access_key IS NULL;

COMMIT;