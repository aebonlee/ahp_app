-- PostgreSQL 마이그레이션 테이블 완전 초기화
-- Render 데이터베이스 콘솔에서 실행하세요

-- 1. 모든 마이그레이션 기록 삭제
DELETE FROM django_migrations WHERE app IN ('projects', 'accounts', 'analysis', 'evaluations');

-- 2. 기존 테이블들 삭제 (있을 경우)
DROP TABLE IF EXISTS ahp_projects CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS criteria CASCADE;
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS analysis_criterion CASCADE;
DROP TABLE IF EXISTS analysis_alternative CASCADE;
DROP TABLE IF EXISTS evaluations_evaluationmatrix CASCADE;

-- 3. 마이그레이션 히스토리 확인
SELECT * FROM django_migrations WHERE app IN ('projects', 'accounts', 'analysis', 'evaluations');

-- 완료 후 Render에서 다시 배포하세요