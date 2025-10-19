@echo off
REM =====================================================
REM Django API를 통한 회원 추가 스크립트 (Windows)
REM =====================================================

set API_URL=https://ahp-django-backend.onrender.com
REM set API_URL=http://localhost:8000

echo =====================================
echo AHP Platform 회원 추가 스크립트
echo =====================================

REM 1. 관리자 계정 생성
echo.
echo 1. 관리자 계정 생성 중...
curl -X POST %API_URL%/api/create-admin/ -H "Content-Type: application/json"

REM 2. 일반 사용자 등록
echo.
echo 2. 일반 사용자 (testuser) 등록 중...
curl -X POST %API_URL%/api/register/ -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"test1234\",\"first_name\":\"테스트\",\"last_name\":\"사용자\"}"

REM 3. 평가자 계정 등록
echo.
echo 3. 평가자 (evaluator1) 등록 중...
curl -X POST %API_URL%/api/register/ -H "Content-Type: application/json" -d "{\"username\":\"evaluator1\",\"email\":\"evaluator@example.com\",\"password\":\"eval1234\",\"first_name\":\"김\",\"last_name\":\"평가\"}"

REM 4. 회원 DB 확인
echo.
echo =====================================
echo 회원 DB 확인
echo =====================================
curl -X GET %API_URL%/users-info/ -H "Accept: application/json"

echo.
echo =====================================
echo 회원 추가 완료!
echo =====================================
echo.
echo 추가된 계정 정보:
echo 1. admin / ahp2025admin (관리자)
echo 2. testuser / test1234 (일반)
echo 3. evaluator1 / eval1234 (평가자)
echo =====================================
pause