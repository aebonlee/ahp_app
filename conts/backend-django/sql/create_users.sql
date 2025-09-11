-- PostgreSQL 회원 DB 직접 추가 스크립트
-- AHP Platform CustomUser 테이블에 사용자 추가

-- 1. 현재 회원 DB 상태 확인
SELECT '===== 현재 회원 DB 상태 =====' AS info;
SELECT COUNT(*) AS total_users FROM super_admin_customuser;

-- 2. 회원 목록 조회
SELECT '===== 기존 회원 목록 =====' AS info;
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    user_type,
    subscription_tier,
    is_active,
    is_staff,
    is_superuser,
    date_joined
FROM super_admin_customuser
ORDER BY id;

-- 3. 관리자 계정 추가 (admin)
-- Django 비밀번호 해시: pbkdf2_sha256$720000$
-- 비밀번호: ahp2025admin
INSERT INTO super_admin_customuser (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    user_type,
    subscription_tier,
    is_verified,
    phone_number,
    company,
    last_activity
) VALUES (
    'pbkdf2_sha256$720000$salt$gVJpL7Iw6ktLyDq1VrqXXDqWv7dHbF8jPQzV+WkJcts=', -- 암호화된 비밀번호
    NULL,
    true,  -- is_superuser
    'admin',
    'Admin',
    'User',
    'admin@ahp-platform.com',
    true,  -- is_staff
    true,  -- is_active
    NOW(),
    'super_admin',
    'unlimited',
    true,  -- is_verified
    '',
    'AHP Platform',
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    is_superuser = EXCLUDED.is_superuser,
    is_staff = EXCLUDED.is_staff,
    user_type = EXCLUDED.user_type,
    subscription_tier = EXCLUDED.subscription_tier;

-- 4. 일반 사용자 계정 추가 (testuser)
-- 비밀번호: test1234
INSERT INTO super_admin_customuser (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    user_type,
    subscription_tier,
    is_verified,
    phone_number,
    company,
    last_activity
) VALUES (
    'pbkdf2_sha256$720000$salt$testpasswordhash123456789=', -- 암호화된 비밀번호
    NULL,
    false,  -- is_superuser
    'testuser',
    'Test',
    'User',
    'testuser@example.com',
    false,  -- is_staff
    true,   -- is_active
    NOW(),
    'personal_service',
    'free',
    true,   -- is_verified
    '010-1234-5678',
    'Test Company',
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    subscription_tier = EXCLUDED.subscription_tier;

-- 5. 평가자 계정 추가 (evaluator1)
-- 비밀번호: eval1234
INSERT INTO super_admin_customuser (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    user_type,
    subscription_tier,
    is_verified,
    phone_number,
    company,
    last_activity
) VALUES (
    'pbkdf2_sha256$720000$salt$evalpasswordhash123456789=', -- 암호화된 비밀번호
    NULL,
    false,  -- is_superuser
    'evaluator1',
    '김',
    '평가',
    'evaluator1@example.com',
    false,  -- is_staff
    true,   -- is_active
    NOW(),
    'evaluator',
    'professional',
    true,   -- is_verified
    '010-2222-3333',
    'Evaluation Inc',
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    subscription_tier = EXCLUDED.subscription_tier;

-- 6. 기업 계정 추가 (enterprise1)
-- 비밀번호: corp1234
INSERT INTO super_admin_customuser (
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    user_type,
    subscription_tier,
    is_verified,
    phone_number,
    company,
    last_activity
) VALUES (
    'pbkdf2_sha256$720000$salt$corppasswordhash123456789=', -- 암호화된 비밀번호
    NULL,
    false,  -- is_superuser
    'enterprise1',
    '이',
    '기업',
    'enterprise1@company.com',
    false,  -- is_staff
    true,   -- is_active
    NOW(),
    'enterprise',
    'enterprise',
    true,   -- is_verified
    '02-1234-5678',
    'Enterprise Corp',
    NOW()
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    subscription_tier = EXCLUDED.subscription_tier;

-- 7. 추가된 회원 확인
SELECT '===== 추가된 회원 확인 =====' AS info;
SELECT 
    id,
    username,
    email,
    first_name || ' ' || last_name AS full_name,
    user_type,
    subscription_tier,
    CASE 
        WHEN is_superuser THEN '🔴 Super Admin'
        WHEN is_staff THEN '🟠 Staff'
        WHEN user_type = 'evaluator' THEN '🟢 평가자'
        WHEN user_type = 'enterprise' THEN '🟣 기업'
        ELSE '🔵 개인'
    END AS role,
    is_active,
    date_joined
FROM super_admin_customuser
ORDER BY id;

-- 8. 회원 통계
SELECT '===== 회원 통계 =====' AS info;
SELECT 
    COUNT(*) AS total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) AS active_users,
    COUNT(CASE WHEN is_superuser = true THEN 1 END) AS super_admins,
    COUNT(CASE WHEN is_staff = true THEN 1 END) AS staff_users,
    COUNT(CASE WHEN user_type = 'evaluator' THEN 1 END) AS evaluators,
    COUNT(CASE WHEN user_type = 'enterprise' THEN 1 END) AS enterprises,
    COUNT(CASE WHEN user_type = 'personal_service' THEN 1 END) AS personal_users
FROM super_admin_customuser;

-- 9. 구독 티어별 통계
SELECT '===== 구독 티어별 통계 =====' AS info;
SELECT 
    subscription_tier,
    COUNT(*) AS user_count
FROM super_admin_customuser
GROUP BY subscription_tier
ORDER BY 
    CASE subscription_tier
        WHEN 'unlimited' THEN 1
        WHEN 'enterprise' THEN 2
        WHEN 'professional' THEN 3
        WHEN 'free' THEN 4
        ELSE 5
    END;