-- 사용자 사용기간 및 할당량 관리 시스템
-- Created: 2025-08-30

-- 사용자 구독 정보 테이블
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK(plan_type IN ('trial', 'basic', 'premium', 'enterprise')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    trial_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    auto_renewal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 사용자 할당량 및 사용량 추적
CREATE TABLE user_quotas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    -- 할당량
    max_projects INTEGER DEFAULT 3,
    max_evaluators_per_project INTEGER DEFAULT 5,
    max_criteria_per_project INTEGER DEFAULT 10,
    max_alternatives_per_project INTEGER DEFAULT 10,
    max_storage_mb INTEGER DEFAULT 100,
    -- 현재 사용량
    current_projects INTEGER DEFAULT 0,
    current_storage_mb DECIMAL(10,2) DEFAULT 0.0,
    -- 기타 제한
    can_export BOOLEAN DEFAULT true,
    can_use_advanced_features BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 프로젝트 아카이브 테이블
CREATE TABLE project_archives (
    id SERIAL PRIMARY KEY,
    original_project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_data JSONB NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE,
    archive_reason VARCHAR(100) DEFAULT 'auto_archive'
);

-- 사용자 활동 로그
CREATE TABLE user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    action_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX idx_project_archives_user_id ON project_archives(user_id);
CREATE INDEX idx_project_archives_expiry ON project_archives(expiry_date);
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 사용자 등록 시 기본 구독 및 할당량 생성 함수
CREATE OR REPLACE FUNCTION create_default_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- 기본 trial 구독 생성 (30일)
    INSERT INTO user_subscriptions (user_id, plan_type, start_date, end_date, trial_days)
    VALUES (NEW.id, 'trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 30);
    
    -- 기본 할당량 설정
    INSERT INTO user_quotas (user_id, plan_type, max_projects, max_evaluators_per_project, max_criteria_per_project, max_alternatives_per_project)
    VALUES (NEW.id, 'trial', 3, 5, 10, 10);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 생성 시 트리거 설정
CREATE TRIGGER trigger_create_user_subscription
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_subscription();

-- 할당량 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_quota_usage()
RETURNS TRIGGER AS $$
DECLARE
    project_count INTEGER;
    storage_usage DECIMAL(10,2);
BEGIN
    -- 프로젝트 수 계산
    SELECT COUNT(*) INTO project_count
    FROM projects 
    WHERE admin_id = COALESCE(NEW.admin_id, OLD.admin_id)
    AND status != 'archived';
    
    -- 할당량 테이블 업데이트
    UPDATE user_quotas 
    SET current_projects = project_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = COALESCE(NEW.admin_id, OLD.admin_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 프로젝트 변경 시 할당량 업데이트 트리거
CREATE TRIGGER trigger_update_project_quota
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_user_quota_usage();

-- 만료된 trial 사용자 비활성화 함수
CREATE OR REPLACE FUNCTION deactivate_expired_trials()
RETURNS INTEGER AS $$
DECLARE
    affected_users INTEGER;
BEGIN
    -- 만료된 trial 사용자들을 비활성화
    UPDATE users 
    SET is_active = false
    WHERE id IN (
        SELECT us.user_id 
        FROM user_subscriptions us
        WHERE us.plan_type = 'trial' 
        AND us.end_date < CURRENT_TIMESTAMP
        AND us.is_active = true
    );
    
    GET DIAGNOSTICS affected_users = ROW_COUNT;
    
    -- 구독 정보도 비활성화
    UPDATE user_subscriptions 
    SET is_active = false
    WHERE plan_type = 'trial' 
    AND end_date < CURRENT_TIMESTAMP
    AND is_active = true;
    
    RETURN affected_users;
END;
$$ LANGUAGE plpgsql;

-- 프로젝트 자동 아카이브 함수
CREATE OR REPLACE FUNCTION archive_completed_projects()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- 90일 이상 완료된 프로젝트들을 아카이브로 이동
    WITH projects_to_archive AS (
        SELECT * FROM projects 
        WHERE status = 'completed' 
        AND updated_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
    )
    INSERT INTO project_archives (original_project_id, user_id, project_data, expiry_date, archive_reason)
    SELECT 
        id,
        admin_id,
        row_to_json(projects_to_archive.*),
        CURRENT_TIMESTAMP + INTERVAL '2 years',
        'auto_archive_90days'
    FROM projects_to_archive;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- 원본 프로젝트 삭제 (CASCADE로 관련 데이터도 삭제됨)
    DELETE FROM projects 
    WHERE status = 'completed' 
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 만료된 아카이브 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_expired_archives()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM project_archives 
    WHERE expiry_date < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 사용자 활동 로그 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 6개월 이상 된 활동 로그 삭제
    DELETE FROM user_activity_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 기본 플랜별 할당량 정의 뷰
CREATE VIEW plan_quotas AS
SELECT 
    'trial' as plan_type, 3 as max_projects, 5 as max_evaluators, 10 as max_criteria, 10 as max_alternatives, 100 as max_storage_mb, false as can_export, false as advanced_features
UNION ALL
SELECT 
    'basic' as plan_type, 10 as max_projects, 15 as max_evaluators, 20 as max_criteria, 20 as max_alternatives, 500 as max_storage_mb, true as can_export, false as advanced_features
UNION ALL
SELECT 
    'premium' as plan_type, 50 as max_projects, 100 as max_evaluators, 50 as max_criteria, 50 as max_alternatives, 2000 as max_storage_mb, true as can_export, true as advanced_features
UNION ALL
SELECT 
    'enterprise' as plan_type, -1 as max_projects, -1 as max_evaluators, -1 as max_criteria, -1 as max_alternatives, -1 as max_storage_mb, true as can_export, true as advanced_features;

-- 사용자 현황 종합 뷰
CREATE VIEW user_status_overview AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    us.plan_type,
    us.start_date as subscription_start,
    us.end_date as subscription_end,
    CASE 
        WHEN us.end_date > CURRENT_TIMESTAMP THEN 'active'
        WHEN us.end_date < CURRENT_TIMESTAMP THEN 'expired'
        ELSE 'unknown'
    END as subscription_status,
    uq.current_projects,
    uq.max_projects,
    uq.current_storage_mb,
    uq.max_storage_mb,
    ROUND(
        CASE 
            WHEN uq.max_projects > 0 THEN (uq.current_projects::DECIMAL / uq.max_projects) * 100
            ELSE 0
        END, 2
    ) as project_usage_percent
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN user_quotas uq ON u.id = uq.user_id;

-- 업데이트 트리거 함수 (할당량 테이블)
CREATE OR REPLACE FUNCTION update_quota_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quota_timestamp
    BEFORE UPDATE ON user_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_quota_timestamp();

CREATE TRIGGER trigger_update_subscription_timestamp
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입 (기존 사용자들을 위한)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- 기존 사용자들에게 기본 구독 및 할당량 생성
    FOR user_record IN SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
    LOOP
        INSERT INTO user_subscriptions (user_id, plan_type, start_date, end_date, trial_days)
        VALUES (user_record.id, 'premium', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', 365);
        
        INSERT INTO user_quotas (user_id, plan_type, max_projects, max_evaluators_per_project, max_criteria_per_project, max_alternatives_per_project, max_storage_mb, can_export, can_use_advanced_features)
        VALUES (user_record.id, 'premium', 50, 100, 50, 50, 2000, true, true);
    END LOOP;
END $$;