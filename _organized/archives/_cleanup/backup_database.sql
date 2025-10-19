-- AHP Application Database Backup Schema
-- Created: 2025-09-30
-- Purpose: Complete database structure backup for restoration

-- =============================================================================
-- DATABASE SETUP COMMANDS
-- =============================================================================

-- Create database (run as postgres superuser)
-- CREATE DATABASE ahp_database;
-- CREATE USER ahp_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE ahp_database TO ahp_user;

-- =============================================================================
-- CORE APPLICATION TABLES
-- =============================================================================

-- Users and Authentication
CREATE TABLE IF NOT EXISTS auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password VARCHAR(128) NOT NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_id INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft'
);

-- Criteria
CREATE TABLE IF NOT EXISTS criteria (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    order_index INTEGER DEFAULT 0
);

-- Alternatives
CREATE TABLE IF NOT EXISTS alternatives (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    order_index INTEGER DEFAULT 0
);

-- =============================================================================
-- SURVEY SYSTEM TABLES
-- =============================================================================

-- Demographic Surveys
CREATE TABLE IF NOT EXISTS demographic_surveys (
    id SERIAL PRIMARY KEY,
    evaluator_id INTEGER REFERENCES auth_user(id),
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Basic Information
    age VARCHAR(50),
    gender VARCHAR(50),
    education VARCHAR(100),
    occupation VARCHAR(255),
    
    -- Professional Information
    experience VARCHAR(50),
    department VARCHAR(255),
    position VARCHAR(255),
    project_experience VARCHAR(50),
    
    -- Decision Role
    decision_role VARCHAR(100),
    additional_info TEXT,
    
    -- Metadata
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_timestamp TIMESTAMP WITH TIME ZONE,
    completion_percentage DECIMAL(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(evaluator_id, project_id)
);

-- Survey Templates (for the 3-category system)
CREATE TABLE IF NOT EXISTS survey_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'standard', 'academic', 'business'
    description TEXT,
    questions JSONB NOT NULL, -- Stores question structure
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Custom Surveys (created from templates)
CREATE TABLE IF NOT EXISTS custom_surveys (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template_id INTEGER REFERENCES survey_templates(id),
    questions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'
    evaluator_link VARCHAR(500),
    total_responses INTEGER DEFAULT 0,
    completed_responses INTEGER DEFAULT 0,
    average_completion_time INTEGER, -- in minutes
    created_by_id INTEGER REFERENCES auth_user(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES custom_surveys(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES auth_user(id),
    responses JSONB NOT NULL, -- Stores all answers
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_time INTEGER, -- in minutes
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(survey_id, evaluator_id)
);

-- =============================================================================
-- EVALUATION SYSTEM TABLES
-- =============================================================================

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES auth_user(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(project_id, evaluator_id)
);

-- Pairwise Comparisons
CREATE TABLE IF NOT EXISTS pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_a_id INTEGER REFERENCES criteria(id),
    criteria_b_id INTEGER REFERENCES criteria(id),
    comparison_value DECIMAL(10, 6) NOT NULL,
    comparison_type VARCHAR(50) DEFAULT 'criteria', -- 'criteria', 'alternatives'
    alternative_a_id INTEGER REFERENCES alternatives(id),
    alternative_b_id INTEGER REFERENCES alternatives(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Evaluation Sessions (for tracking)
CREATE TABLE IF NOT EXISTS evaluation_sessions (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    session_data JSONB,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER -- in seconds
);

-- Evaluation Invitations
CREATE TABLE IF NOT EXISTS evaluation_invitations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES auth_user(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'opened', 'completed', 'expired'
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- RESULT TABLES
-- =============================================================================

-- AHP Results
CREATE TABLE IF NOT EXISTS ahp_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES auth_user(id),
    criteria_weights JSONB, -- Final criteria weights
    alternative_scores JSONB, -- Final alternative scores
    consistency_ratio DECIMAL(10, 6),
    calculation_method VARCHAR(50) DEFAULT 'eigenvector',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Group Results (aggregated)
CREATE TABLE IF NOT EXISTS group_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    aggregation_method VARCHAR(50) DEFAULT 'geometric_mean',
    group_criteria_weights JSONB,
    group_alternative_scores JSONB,
    group_consistency_ratio DECIMAL(10, 6),
    participant_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Core entity indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_criteria_project ON criteria(project_id);
CREATE INDEX IF NOT EXISTS idx_alternatives_project ON alternatives(project_id);

-- Survey system indexes
CREATE INDEX IF NOT EXISTS idx_demographic_surveys_evaluator ON demographic_surveys(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_demographic_surveys_project ON demographic_surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_demographic_surveys_completed ON demographic_surveys(is_completed);
CREATE INDEX IF NOT EXISTS idx_custom_surveys_project ON custom_surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_surveys_status ON custom_surveys(status);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_evaluator ON survey_responses(evaluator_id);

-- Evaluation indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_pairwise_evaluation ON pairwise_comparisons(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_invitations_project ON evaluation_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON evaluation_invitations(invitation_token);

-- Result indexes
CREATE INDEX IF NOT EXISTS idx_ahp_results_project ON ahp_results(project_id);
CREATE INDEX IF NOT EXISTS idx_ahp_results_evaluator ON ahp_results(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_group_results_project ON group_results(project_id);

-- =============================================================================
-- SAMPLE DATA INSERT COMMANDS (for testing)
-- =============================================================================

-- Insert sample survey templates
INSERT INTO survey_templates (name, category, description, questions) VALUES 
(
    '표준 인구통계 템플릿',
    'standard',
    '연구에서 가장 일반적으로 사용되는 기본 항목들',
    '[
        {
            "id": "1",
            "type": "radio",
            "question": "연령대를 선택해주세요",
            "options": ["20-29세", "30-39세", "40-49세", "50세 이상"],
            "required": true,
            "order": 1
        },
        {
            "id": "2",
            "type": "radio",
            "question": "성별을 선택해주세요",
            "options": ["남성", "여성"],
            "required": true,
            "order": 2
        },
        {
            "id": "3",
            "type": "radio",
            "question": "최종 학력을 선택해주세요",
            "options": ["고등학교 졸업", "전문대 졸업", "4년제 대학 졸업", "대학원 졸업 (석사)", "대학원 졸업 (박사)"],
            "required": true,
            "order": 3
        }
    ]'::jsonb
),
(
    '학술 연구용 템플릿',
    'academic',
    '학술 논문 및 연구 목적에 특화된 항목들',
    '[
        {
            "id": "1",
            "type": "radio",
            "question": "연령대를 선택해주세요",
            "options": ["20-29세", "30-39세", "40-49세", "50세 이상"],
            "required": true,
            "order": 1
        },
        {
            "id": "2",
            "type": "radio",
            "question": "전공 분야를 선택해주세요",
            "options": ["공학", "자연과학", "사회과학", "인문학", "예술", "의학", "경영학", "기타"],
            "required": true,
            "order": 2
        }
    ]'::jsonb
),
(
    '비즈니스 의사결정 템플릿',
    'business',
    '기업 및 조직의 의사결정 과정에 특화된 항목들',
    '[
        {
            "id": "1",
            "type": "radio",
            "question": "직급을 선택해주세요",
            "options": ["사원급", "대리급", "과장급", "차장급", "부장급", "임원급"],
            "required": true,
            "order": 1
        },
        {
            "id": "2",
            "type": "radio",
            "question": "부서를 선택해주세요",
            "options": ["경영기획", "마케팅", "영업", "개발", "생산", "인사", "재무", "기타"],
            "required": true,
            "order": 2
        }
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- BACKUP COMPLETION TIMESTAMP
-- =============================================================================

-- This schema was backed up on: 2025-09-30
-- Includes: Complete AHP application database structure
-- Features: Survey system, evaluation system, user management, results storage
-- Template system: 3-category survey templates (Standard/Academic/Business)