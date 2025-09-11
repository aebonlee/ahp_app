-- 다중 평가자 지원을 위한 데이터베이스 스키마 확장
-- 009_multi_evaluator_schema.sql

-- 워크숍 세션 테이블 생성 (26+ 평가자 지원)
CREATE TABLE IF NOT EXISTS workshop_sessions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_name VARCHAR(255) NOT NULL,
    session_description TEXT,
    facilitator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'collaborative' CHECK (session_type IN ('collaborative', 'individual', 'hybrid')),
    max_participants INTEGER DEFAULT 50,
    session_status VARCHAR(50) DEFAULT 'planning' CHECK (session_status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    evaluation_mode VARCHAR(50) DEFAULT 'pairwise' CHECK (evaluation_mode IN ('pairwise', 'direct_input', 'ranking', 'scoring', 'fuzzy', 'linguistic', 'interval', 'group_discussion')),
    consensus_method VARCHAR(50) DEFAULT 'geometric_mean' CHECK (consensus_method IN ('geometric_mean', 'arithmetic_mean', 'median', 'weighted_average')),
    minimum_consistency_ratio DECIMAL(5,3) DEFAULT 0.100,
    require_all_evaluations BOOLEAN DEFAULT FALSE,
    allow_partial_submissions BOOLEAN DEFAULT TRUE,
    session_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 워크숍 참가자 테이블 (다중 평가자 관리)
CREATE TABLE IF NOT EXISTS workshop_participants (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    participant_email VARCHAR(255),
    participant_name VARCHAR(255),
    participant_role VARCHAR(50) DEFAULT 'evaluator' CHECK (participant_role IN ('facilitator', 'evaluator', 'observer', 'expert')),
    invitation_status VARCHAR(50) DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'invited', 'accepted', 'declined', 'expired')),
    evaluation_status VARCHAR(50) DEFAULT 'not_started' CHECK (evaluation_status IN ('not_started', 'in_progress', 'completed', 'incomplete')),
    weight_multiplier DECIMAL(5,3) DEFAULT 1.000, -- 평가자별 가중치
    expertise_areas TEXT[], -- 전문 분야
    invited_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    consistency_ratio DECIMAL(5,3),
    participation_duration INTEGER DEFAULT 0, -- 초 단위
    last_activity TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workshop_session_id, participant_id),
    UNIQUE(workshop_session_id, participant_email)
);

-- 개별 평가자의 세부 평가 데이터
CREATE TABLE IF NOT EXISTS evaluator_assessments (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES workshop_participants(id) ON DELETE CASCADE,
    evaluation_step VARCHAR(100) NOT NULL, -- 'criteria_comparison', 'alternatives_comparison', 'direct_input', etc.
    step_status VARCHAR(50) DEFAULT 'pending' CHECK (step_status IN ('pending', 'in_progress', 'completed', 'skipped')),
    criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    evaluation_data JSONB NOT NULL DEFAULT '{}',
    individual_weights JSONB, -- 개별 평가자의 가중치
    individual_scores JSONB, -- 개별 평가자의 점수
    individual_ranking JSONB, -- 개별 평가자의 순위
    confidence_level INTEGER DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
    evaluation_method VARCHAR(50),
    consistency_ratio DECIMAL(5,3),
    evaluation_time INTEGER DEFAULT 0, -- 초 단위
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workshop_session_id, participant_id, evaluation_step, criteria_id)
);

-- 그룹 합의 결과 테이블
CREATE TABLE IF NOT EXISTS group_consensus_results (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    result_type VARCHAR(50) NOT NULL CHECK (result_type IN ('criteria_weights', 'alternative_scores', 'final_ranking', 'sensitivity_analysis')),
    consensus_method VARCHAR(50) NOT NULL,
    group_weights JSONB,
    group_scores JSONB,
    group_ranking JSONB,
    individual_results JSONB, -- 개별 평가자 결과 요약
    consensus_level DECIMAL(5,3), -- 합의 수준 (0-1)
    disagreement_matrix JSONB, -- 의견 불일치 매트릭스
    outlier_participants INTEGER[], -- 이상치 평가자 ID들
    confidence_interval JSONB, -- 신뢰 구간
    sensitivity_data JSONB, -- 민감도 분석 데이터
    calculation_metadata JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 실시간 진행 상황 추적 테이블
CREATE TABLE IF NOT EXISTS real_time_progress (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES workshop_participants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('login', 'logout', 'step_start', 'step_complete', 'data_save', 'session_pause', 'session_resume')),
    event_data JSONB DEFAULT '{}',
    current_step VARCHAR(100),
    progress_percentage DECIMAL(5,2),
    session_duration INTEGER DEFAULT 0, -- 초 단위
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 이메일 알림 기록 테이블
CREATE TABLE IF NOT EXISTS email_notifications (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES workshop_participants(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('invitation', 'reminder', 'deadline_warning', 'completion_confirmation', 'results_sharing')),
    template_id VARCHAR(100),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    personalization_data JSONB DEFAULT '{}',
    delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    smtp_response TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 워크숍 템플릿 테이블
CREATE TABLE IF NOT EXISTS workshop_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_category VARCHAR(100),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    default_settings JSONB DEFAULT '{}',
    criteria_template JSONB DEFAULT '[]',
    alternatives_template JSONB DEFAULT '[]',
    evaluation_flow JSONB DEFAULT '{}',
    email_templates JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 민감도 분석 시나리오 테이블
CREATE TABLE IF NOT EXISTS sensitivity_scenarios (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,
    scenario_description TEXT,
    scenario_type VARCHAR(50) CHECK (scenario_type IN ('conservative', 'aggressive', 'custom', 'threshold')),
    weight_changes JSONB NOT NULL, -- 가중치 변화 정의
    enabled BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 민감도 분석 결과 테이블
CREATE TABLE IF NOT EXISTS sensitivity_results (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    scenario_id INTEGER REFERENCES sensitivity_scenarios(id) ON DELETE CASCADE,
    alternative_id INTEGER NOT NULL REFERENCES alternatives(id) ON DELETE CASCADE,
    original_rank INTEGER NOT NULL,
    new_rank INTEGER NOT NULL,
    rank_change INTEGER NOT NULL,
    original_score DECIMAL(10,6) NOT NULL,
    new_score DECIMAL(10,6) NOT NULL,
    score_change DECIMAL(10,6) NOT NULL,
    stability_level VARCHAR(50) CHECK (stability_level IN ('stable', 'moderate', 'sensitive', 'very_sensitive')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Excel 내보내기 기록 테이블
CREATE TABLE IF NOT EXISTS export_history (
    id SERIAL PRIMARY KEY,
    workshop_session_id INTEGER REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    exported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('basic', 'advanced', 'dashboard', 'sensitivity', 'detailed')),
    export_format VARCHAR(20) DEFAULT 'xlsx' CHECK (export_format IN ('xlsx', 'csv', 'pdf', 'json')),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_path TEXT,
    export_config JSONB DEFAULT '{}',
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 설정 테이블 (다중 평가자 관련)
CREATE TABLE IF NOT EXISTS multi_evaluator_settings (
    id SERIAL PRIMARY KEY,
    setting_category VARCHAR(100) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(50) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_system_setting BOOLEAN DEFAULT FALSE,
    requires_restart BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(setting_category, setting_key)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_project_id ON workshop_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_facilitator ON workshop_sessions(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_status ON workshop_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_dates ON workshop_sessions(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_workshop_participants_session_id ON workshop_participants(workshop_session_id);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_participant_id ON workshop_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_email ON workshop_participants(participant_email);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_status ON workshop_participants(evaluation_status);

CREATE INDEX IF NOT EXISTS idx_evaluator_assessments_session_participant ON evaluator_assessments(workshop_session_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_evaluator_assessments_step ON evaluator_assessments(evaluation_step);
CREATE INDEX IF NOT EXISTS idx_evaluator_assessments_criteria ON evaluator_assessments(criteria_id);

CREATE INDEX IF NOT EXISTS idx_group_consensus_session_type ON group_consensus_results(workshop_session_id, result_type);
CREATE INDEX IF NOT EXISTS idx_group_consensus_calculated ON group_consensus_results(calculated_at);

CREATE INDEX IF NOT EXISTS idx_real_time_progress_session ON real_time_progress(workshop_session_id);
CREATE INDEX IF NOT EXISTS idx_real_time_progress_participant ON real_time_progress(participant_id);
CREATE INDEX IF NOT EXISTS idx_real_time_progress_timestamp ON real_time_progress(timestamp);
CREATE INDEX IF NOT EXISTS idx_real_time_progress_event_type ON real_time_progress(event_type);

CREATE INDEX IF NOT EXISTS idx_email_notifications_session ON email_notifications(workshop_session_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_participant ON email_notifications(participant_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_scheduled ON email_notifications(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_sensitivity_scenarios_session ON sensitivity_scenarios(workshop_session_id);
CREATE INDEX IF NOT EXISTS idx_sensitivity_results_session_scenario ON sensitivity_results(workshop_session_id, scenario_id);

CREATE INDEX IF NOT EXISTS idx_export_history_session ON export_history(workshop_session_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created ON export_history(created_at);

-- 외래 키 제약 조건 추가 (기존에 없는 경우)
ALTER TABLE workshop_participants 
ADD CONSTRAINT fk_workshop_participants_participant 
FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE;

-- 트리거 추가 (updated_at 자동 업데이트)
CREATE TRIGGER update_workshop_sessions_updated_at BEFORE UPDATE ON workshop_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshop_participants_updated_at BEFORE UPDATE ON workshop_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluator_assessments_updated_at BEFORE UPDATE ON evaluator_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshop_templates_updated_at BEFORE UPDATE ON workshop_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multi_evaluator_settings_updated_at BEFORE UPDATE ON multi_evaluator_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 시스템 설정 삽입
INSERT INTO multi_evaluator_settings (setting_category, setting_key, setting_value, data_type, description, is_system_setting) VALUES
('workshop', 'max_participants', '50', 'number', '워크숍 최대 참가자 수', TRUE),
('workshop', 'default_deadline_days', '7', 'number', '기본 평가 마감일 (일수)', TRUE),
('workshop', 'auto_reminder_hours', '24,4,1', 'string', '자동 알림 시간 (시간 전)', TRUE),
('workshop', 'min_consistency_ratio', '0.100', 'number', '최소 일관성 비율', TRUE),
('workshop', 'enable_real_time_sync', 'true', 'boolean', '실시간 동기화 활성화', TRUE),
('email', 'smtp_host', '', 'string', 'SMTP 서버 호스트', FALSE),
('email', 'smtp_port', '587', 'number', 'SMTP 서버 포트', FALSE),
('email', 'smtp_secure', 'false', 'boolean', 'SMTP SSL/TLS 사용', FALSE),
('email', 'from_name', 'AHP Workshop System', 'string', '발신자 이름', FALSE),
('email', 'from_email', '', 'string', '발신자 이메일', FALSE),
('consensus', 'default_method', 'geometric_mean', 'string', '기본 합의 방법', TRUE),
('consensus', 'outlier_threshold', '2.0', 'number', '이상치 판정 임계값 (표준편차 배수)', TRUE),
('export', 'max_file_size_mb', '100', 'number', '최대 내보내기 파일 크기 (MB)', TRUE),
('export', 'file_retention_days', '30', 'number', '내보내기 파일 보관 기간 (일)', TRUE)
ON CONFLICT (setting_category, setting_key) DO NOTHING;

-- 기본 워크숍 템플릿 삽입
INSERT INTO workshop_templates (template_name, template_description, template_category, is_public, default_settings, criteria_template, evaluation_flow) VALUES
('기본 제품 평가 템플릿', '제품 선택을 위한 기본 AHP 템플릿', '제품평가', TRUE, 
'{"max_participants": 20, "evaluation_mode": "pairwise", "consensus_method": "geometric_mean"}',
'[{"name": "가격", "description": "구매 비용"}, {"name": "품질", "description": "제품 품질"}, {"name": "브랜드", "description": "브랜드 신뢰도"}]',
'{"steps": ["criteria_comparison", "alternatives_comparison", "consistency_check", "results_review"]}'),

('인사평가 템플릿', '직원 채용 및 평가를 위한 템플릿', '인사관리', TRUE,
'{"max_participants": 10, "evaluation_mode": "pairwise", "consensus_method": "arithmetic_mean"}',
'[{"name": "전문성", "description": "업무 전문 능력"}, {"name": "협업능력", "description": "팀워크 및 소통"}, {"name": "성장가능성", "description": "발전 잠재력"}]',
'{"steps": ["criteria_comparison", "alternatives_comparison", "individual_review", "group_discussion", "final_consensus"]}'),

('프로젝트 우선순위 템플릿', '프로젝트 선택 및 우선순위 결정 템플릿', '프로젝트관리', TRUE,
'{"max_participants": 15, "evaluation_mode": "scoring", "consensus_method": "weighted_average"}',
'[{"name": "전략적 중요성", "description": "조직 전략과의 부합도"}, {"name": "실현가능성", "description": "구현 가능성"}, {"name": "ROI", "description": "투자 대비 수익"}, {"name": "리스크", "description": "위험 요소"}]',
'{"steps": ["criteria_comparison", "alternatives_scoring", "risk_assessment", "sensitivity_analysis", "final_ranking"]}')
ON CONFLICT DO NOTHING;

-- 기존 프로젝트를 워크숍 세션으로 마이그레이션 (선택적)
DO $$
DECLARE
    proj RECORD;
    admin_user_id INTEGER;
BEGIN
    -- 관리자 사용자 확인
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- 기존 프로젝트들을 워크숍 세션으로 변환
        FOR proj IN SELECT * FROM projects WHERE status = 'active' LOOP
            INSERT INTO workshop_sessions (
                project_id, 
                session_name, 
                session_description, 
                facilitator_id, 
                session_type,
                max_participants,
                session_status,
                evaluation_mode,
                consensus_method
            ) VALUES (
                proj.id,
                proj.title || ' 워크숍',
                proj.description,
                COALESCE(proj.admin_id, admin_user_id),
                'collaborative',
                26,
                'active',
                'pairwise',
                'geometric_mean'
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- 완료 메시지
SELECT 'Multi-evaluator schema extension completed successfully!' as status;