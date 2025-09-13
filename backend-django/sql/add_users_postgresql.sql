-- =====================================================
-- PostgreSQL 회원 DB 직접 추가 스크립트
-- AHP Platform 회원 추가 및 확인
-- =====================================================

-- 1. 테이블 구조 확인
\d super_admin_customuser

-- 2. 현재 회원 수 확인
SELECT COUNT(*) AS "현재 회원 수" FROM super_admin_customuser;

-- 3. 시퀀스 현재 값 확인 (ID 자동 증가)
SELECT last_value FROM super_admin_customuser_id_seq;

-- =====================================================
-- 4. 관리자 계정 추가 (admin)
-- 아이디: admin
-- 비밀번호: ahp2025admin
-- =====================================================
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
    'pbkdf2_sha256$720000$xqkNmzYGqQKE$Uc8H1oFVPLTGcMmhYJg8nP5wL+tGp8QzV9kZxH3KLHM=',
    NULL,
    true,
    'admin',
    'Admin',
    'User',
    'admin@ahp-platform.com',
    true,
    true,
    CURRENT_TIMESTAMP,
    'super_admin',
    'unlimited',
    true,
    '',
    'AHP Platform',
    CURRENT_TIMESTAMP
) ON CONFLICT (username) 
DO UPDATE SET
    password = EXCLUDED.password,
    is_superuser = true,
    is_staff = true,
    user_type = 'super_admin';

-- =====================================================
-- 5. AEBON 특별 관리자 계정 추가
-- 아이디: aebon
-- 비밀번호: aebon2025
-- =====================================================
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
    'pbkdf2_sha256$720000$aebon$special+admin+password+hash+2025',
    NULL,
    true,
    'aebon',
    'Aebon',
    'Lee',
    'aebon@ahp-platform.com',
    true,
    true,
    CURRENT_TIMESTAMP,
    'super_admin',
    'unlimited',
    true,
    '010-0000-0000',
    'AHP Platform Admin',
    CURRENT_TIMESTAMP
) ON CONFLICT (username) 
DO UPDATE SET
    password = EXCLUDED.password,
    is_superuser = true,
    is_staff = true,
    user_type = 'super_admin';

-- =====================================================
-- 6. 테스트 일반 사용자 추가
-- 아이디: testuser
-- 비밀번호: test1234
-- =====================================================
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
    'pbkdf2_sha256$720000$test$user+password+hash+1234',
    NULL,
    false,
    'testuser',
    '테스트',
    '사용자',
    'test@example.com',
    false,
    true,
    CURRENT_TIMESTAMP,
    'personal_service',
    'free',
    true,
    '010-1234-5678',
    'Test Company',
    CURRENT_TIMESTAMP
) ON CONFLICT (username) 
DO UPDATE SET
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type;

-- =====================================================
-- 7. 평가자 계정 추가
-- 아이디: evaluator1
-- 비밀번호: eval1234
-- =====================================================
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
    'pbkdf2_sha256$720000$eval$password+hash+1234',
    NULL,
    false,
    'evaluator1',
    '김',
    '평가',
    'evaluator@example.com',
    false,
    true,
    CURRENT_TIMESTAMP,
    'evaluator',
    'professional',
    true,
    '010-2222-3333',
    'Evaluation Inc',
    CURRENT_TIMESTAMP
) ON CONFLICT (username) 
DO UPDATE SET
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type;

-- =====================================================
-- 8. 추가된 회원 목록 확인
-- =====================================================
SELECT 
    '===== 추가된 회원 목록 =====' AS "구분";

SELECT 
    id AS "ID",
    username AS "아이디",
    email AS "이메일",
    first_name || ' ' || last_name AS "이름",
    CASE 
        WHEN is_superuser THEN 'Super Admin'
        WHEN is_staff THEN 'Staff'
        WHEN user_type = 'evaluator' THEN '평가자'
        WHEN user_type = 'enterprise' THEN '기업'
        ELSE '개인'
    END AS "권한",
    subscription_tier AS "구독티어",
    is_active AS "활성",
    date_joined::date AS "가입일"
FROM super_admin_customuser
ORDER BY id;

-- =====================================================
-- 9. 회원 통계 확인
-- =====================================================
SELECT 
    '===== 회원 통계 =====' AS "구분";

SELECT 
    COUNT(*) AS "총 회원수",
    COUNT(CASE WHEN is_active THEN 1 END) AS "활성 회원",
    COUNT(CASE WHEN is_superuser THEN 1 END) AS "슈퍼관리자",
    COUNT(CASE WHEN user_type = 'evaluator' THEN 1 END) AS "평가자",
    COUNT(CASE WHEN user_type = 'personal_service' THEN 1 END) AS "개인회원"
FROM super_admin_customuser;

-- =====================================================
-- 10. 비밀번호 재설정이 필요한 경우 (Django 해시 없이)
-- 주의: 이 방법은 Django 로그인이 작동하지 않습니다
-- Django shell이나 API를 통해 비밀번호를 재설정해야 합니다
-- =====================================================
-- UPDATE super_admin_customuser 
-- SET password = 'temporary_password_needs_reset'
-- WHERE username = 'admin';

-- =====================================================
-- 11. 삭제가 필요한 경우
-- =====================================================
-- DELETE FROM super_admin_customuser WHERE username = 'testuser';

-- =====================================================
-- 추가 정보:
-- Django 비밀번호는 pbkdf2_sha256 알고리즘을 사용합니다
-- 형식: pbkdf2_sha256$iterations$salt$hash
-- 
-- PostgreSQL에서 직접 추가한 계정은 비밀번호가 작동하지 않을 수 있습니다.
-- Django API나 관리자 페이지를 통해 비밀번호를 재설정해야 합니다.
-- =====================================================