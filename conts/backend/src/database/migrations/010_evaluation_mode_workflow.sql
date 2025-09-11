-- 010_evaluation_mode_workflow.sql
-- 평가 방식 및 워크플로우 상태 관리를 위한 테이블 구조 확장

-- projects 테이블에 새로운 필드 추가
ALTER TABLE projects 
ADD COLUMN evaluation_mode VARCHAR(20) DEFAULT 'practical' CHECK (evaluation_mode IN ('practical', 'theoretical', 'direct_input')),
ADD COLUMN workflow_stage VARCHAR(20) DEFAULT 'creating' CHECK (workflow_stage IN ('creating', 'waiting', 'evaluating', 'completed'));

-- 기존 프로젝트에 기본값 설정
UPDATE projects 
SET evaluation_mode = 'practical', 
    workflow_stage = 'creating' 
WHERE evaluation_mode IS NULL OR workflow_stage IS NULL;

-- 직접 입력 데이터를 위한 새 테이블 생성
CREATE TABLE IF NOT EXISTS direct_input_data (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    element_id INTEGER NOT NULL,
    element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('criterion', 'alternative')),
    input_value DECIMAL(10,6) NOT NULL,
    input_method VARCHAR(20) NOT NULL DEFAULT 'weight' CHECK (input_method IN ('weight', 'score', 'rating')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, evaluator_id, criterion_id, element_id, element_type)
);

-- 평가 방식 설정 이력을 위한 테이블
CREATE TABLE IF NOT EXISTS evaluation_mode_history (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    previous_mode VARCHAR(20),
    new_mode VARCHAR(20) NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 워크플로우 상태 변경 이력을 위한 테이블
CREATE TABLE IF NOT EXISTS workflow_stage_history (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    previous_stage VARCHAR(20),
    new_stage VARCHAR(20) NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    change_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_projects_evaluation_mode ON projects(evaluation_mode);
CREATE INDEX IF NOT EXISTS idx_projects_workflow_stage ON projects(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_direct_input_data_project_evaluator ON direct_input_data(project_id, evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_mode_history_project ON evaluation_mode_history(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_history_project ON workflow_stage_history(project_id);

-- 트리거 함수: 평가 방식 변경 시 이력 기록
CREATE OR REPLACE FUNCTION record_evaluation_mode_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.evaluation_mode IS DISTINCT FROM NEW.evaluation_mode THEN
        INSERT INTO evaluation_mode_history (project_id, previous_mode, new_mode, changed_by)
        VALUES (NEW.id, OLD.evaluation_mode, NEW.evaluation_mode, NEW.admin_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 함수: 워크플로우 상태 변경 시 이력 기록
CREATE OR REPLACE FUNCTION record_workflow_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage THEN
        INSERT INTO workflow_stage_history (project_id, previous_stage, new_stage, changed_by)
        VALUES (NEW.id, OLD.workflow_stage, NEW.workflow_stage, NEW.admin_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_evaluation_mode_change ON projects;
CREATE TRIGGER trigger_evaluation_mode_change
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION record_evaluation_mode_change();

DROP TRIGGER IF EXISTS trigger_workflow_stage_change ON projects;
CREATE TRIGGER trigger_workflow_stage_change
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION record_workflow_stage_change();

-- 업데이트된 시간 자동 갱신을 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- direct_input_data 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS trigger_direct_input_data_updated_at ON direct_input_data;
CREATE TRIGGER trigger_direct_input_data_updated_at
    BEFORE UPDATE ON direct_input_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성: 프로젝트 상태 요약
CREATE OR REPLACE VIEW project_status_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.status,
    p.evaluation_mode,
    p.workflow_stage,
    p.created_at,
    p.updated_at,
    u.first_name || ' ' || u.last_name AS admin_name,
    COUNT(DISTINCT pe.evaluator_id) AS evaluator_count,
    COUNT(DISTINCT pc.id) AS comparison_count,
    COUNT(DISTINCT did.id) AS direct_input_count,
    CASE 
        WHEN p.workflow_stage = 'creating' THEN '모델 구축 중'
        WHEN p.workflow_stage = 'waiting' THEN '평가 대기 중'
        WHEN p.workflow_stage = 'evaluating' THEN '평가 진행 중'
        WHEN p.workflow_stage = 'completed' THEN '평가 완료'
        ELSE '알 수 없음'
    END AS stage_description,
    CASE 
        WHEN p.evaluation_mode = 'practical' THEN '쌍대비교 - 실용'
        WHEN p.evaluation_mode = 'theoretical' THEN '쌍대비교 - 이론'
        WHEN p.evaluation_mode = 'direct_input' THEN '직접 입력'
        ELSE '알 수 없음'
    END AS mode_description
FROM projects p
LEFT JOIN users u ON p.admin_id = u.id
LEFT JOIN project_evaluators pe ON p.id = pe.project_id
LEFT JOIN pairwise_comparisons pc ON p.id = pc.project_id
LEFT JOIN direct_input_data did ON p.id = did.project_id
GROUP BY p.id, u.first_name, u.last_name;

-- 뷰 생성: 프로젝트별 진행률
CREATE OR REPLACE VIEW project_progress AS
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.workflow_stage,
    COUNT(DISTINCT c.id) AS criteria_count,
    COUNT(DISTINCT a.id) AS alternative_count,
    COUNT(DISTINCT pe.evaluator_id) AS evaluator_count,
    COUNT(DISTINCT pc.evaluator_id) AS active_evaluator_count,
    CASE 
        WHEN COUNT(DISTINCT pe.evaluator_id) = 0 THEN 0
        ELSE ROUND(
            (COUNT(DISTINCT pc.evaluator_id)::DECIMAL / COUNT(DISTINCT pe.evaluator_id) * 100), 2
        )
    END AS completion_percentage
FROM projects p
LEFT JOIN criteria c ON p.id = c.project_id
LEFT JOIN alternatives a ON p.id = a.project_id
LEFT JOIN project_evaluators pe ON p.id = pe.project_id
LEFT JOIN pairwise_comparisons pc ON p.id = pc.project_id
GROUP BY p.id, p.name, p.workflow_stage;

COMMENT ON TABLE evaluation_mode_history IS '평가 방식 변경 이력을 추적하는 테이블';
COMMENT ON TABLE workflow_stage_history IS '워크플로우 단계 변경 이력을 추적하는 테이블';
COMMENT ON TABLE direct_input_data IS '직접 입력 방식에서 사용되는 데이터를 저장하는 테이블';
COMMENT ON VIEW project_status_summary IS '프로젝트의 전반적인 상태 정보를 요약하는 뷰';
COMMENT ON VIEW project_progress IS '프로젝트별 진행률 정보를 제공하는 뷰';