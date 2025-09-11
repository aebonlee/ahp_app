-- API 시퀀스를 위한 추가 테이블들

-- AHP 결과 저장 테이블 (로컬 가중치)
CREATE TABLE IF NOT EXISTS ahp_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matrix_key VARCHAR(255) NOT NULL, -- 'criteria:level1', 'alternatives:criterion1' 등
    weights JSONB NOT NULL, -- 계산된 가중치 배열
    consistency_ratio DECIMAL(10, 6) NOT NULL,
    lambda_max DECIMAL(10, 6),
    is_consistent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_ahp_result UNIQUE (project_id, evaluator_id, matrix_key)
);

-- 글로벌 가중치 저장 테이블
CREATE TABLE IF NOT EXISTS global_weights (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    criteria_weights JSONB NOT NULL, -- 기준별 가중치
    alternative_weights JSONB NOT NULL, -- 기준별 대안 가중치
    global_weights JSONB NOT NULL, -- 최종 글로벌 가중치
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_global_weight UNIQUE (project_id, evaluator_id)
);

-- 그룹 집계 결과 저장 테이블
CREATE TABLE IF NOT EXISTS aggregated_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_weights JSONB NOT NULL, -- 평가자별 그룹 가중치
    final_ranking JSONB NOT NULL, -- 최종 순위 결과
    aggregated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_aggregated_result UNIQUE (project_id)
);

-- 평가자 진행상황 추적 테이블
CREATE TABLE IF NOT EXISTS evaluator_progress (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_evaluator_progress UNIQUE (project_id, evaluator_id)
);

-- 직접입력 평가 데이터 테이블
CREATE TABLE IF NOT EXISTS direct_entries (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_key VARCHAR(255) NOT NULL, -- 'criterion:1' 또는 'alternative:1:criterion:2' 형식
    value DECIMAL(10, 6) NOT NULL,
    is_benefit BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_direct_entry UNIQUE (project_id, evaluator_id, target_key)
);

-- 기존 pairwise_comparisons 테이블 구조 개선을 위한 새 테이블
CREATE TABLE IF NOT EXISTS pairwise_comparisons_v2 (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matrix_key VARCHAR(255) NOT NULL, -- 'criteria:level1', 'alternatives:criterion1' 등
    i_index INTEGER NOT NULL,
    j_index INTEGER NOT NULL,
    value DECIMAL(10, 6) NOT NULL CHECK (value >= 0.111111 AND value <= 9.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_comparison_v2 UNIQUE (project_id, evaluator_id, matrix_key, i_index, j_index),
    CONSTRAINT valid_indices CHECK (i_index < j_index) -- 상삼각 행렬만 저장
);

-- 인덱스 생성
CREATE INDEX idx_ahp_results_project_evaluator ON ahp_results(project_id, evaluator_id);
CREATE INDEX idx_ahp_results_matrix_key ON ahp_results(matrix_key);

CREATE INDEX idx_global_weights_project_evaluator ON global_weights(project_id, evaluator_id);

CREATE INDEX idx_aggregated_results_project_id ON aggregated_results(project_id);

CREATE INDEX idx_evaluator_progress_project_evaluator ON evaluator_progress(project_id, evaluator_id);
CREATE INDEX idx_evaluator_progress_completion ON evaluator_progress(completion_rate);

CREATE INDEX idx_direct_entries_project_evaluator ON direct_entries(project_id, evaluator_id);
CREATE INDEX idx_direct_entries_target_key ON direct_entries(target_key);

CREATE INDEX idx_pairwise_v2_project_evaluator ON pairwise_comparisons_v2(project_id, evaluator_id);
CREATE INDEX idx_pairwise_v2_matrix_key ON pairwise_comparisons_v2(matrix_key);

-- 트리거 추가
CREATE TRIGGER update_ahp_results_updated_at BEFORE UPDATE ON ahp_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_weights_updated_at BEFORE UPDATE ON global_weights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregated_results_updated_at BEFORE UPDATE ON aggregated_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluator_progress_updated_at BEFORE UPDATE ON evaluator_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_entries_updated_at BEFORE UPDATE ON direct_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pairwise_v2_updated_at BEFORE UPDATE ON pairwise_comparisons_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();