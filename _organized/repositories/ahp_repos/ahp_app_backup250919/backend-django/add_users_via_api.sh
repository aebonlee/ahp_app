#!/bin/bash

# =====================================================
# Django API를 통한 회원 추가 스크립트
# =====================================================

API_URL="https://ahp-django-backend.onrender.com"
# API_URL="http://localhost:8000"  # 로컬 테스트용

echo "====================================="
echo "AHP Platform 회원 추가 스크립트"
echo "====================================="

# 1. 관리자 계정 생성 (특별 API 사용)
echo ""
echo "1. 관리자 계정 생성 중..."
curl -X POST ${API_URL}/api/create-admin/ \
  -H "Content-Type: application/json" \
  -s | python -m json.tool

# 2. 일반 사용자 등록
echo ""
echo "2. 일반 사용자 (testuser) 등록 중..."
curl -X POST ${API_URL}/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test1234",
    "first_name": "테스트",
    "last_name": "사용자"
  }' \
  -s | python -m json.tool

# 3. 평가자 계정 등록
echo ""
echo "3. 평가자 (evaluator1) 등록 중..."
curl -X POST ${API_URL}/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "evaluator1",
    "email": "evaluator@example.com",
    "password": "eval1234",
    "first_name": "김",
    "last_name": "평가"
  }' \
  -s | python -m json.tool

# 4. 기업 사용자 등록
echo ""
echo "4. 기업 사용자 (enterprise1) 등록 중..."
curl -X POST ${API_URL}/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "enterprise1",
    "email": "enterprise@company.com",
    "password": "corp1234",
    "first_name": "이",
    "last_name": "기업"
  }' \
  -s | python -m json.tool

# 5. AEBON 특별 계정 등록
echo ""
echo "5. AEBON 관리자 등록 중..."
curl -X POST ${API_URL}/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "aebon",
    "email": "aebon@ahp-platform.com",
    "password": "aebon2025",
    "first_name": "Aebon",
    "last_name": "Lee"
  }' \
  -s | python -m json.tool

# 6. 회원 DB 확인
echo ""
echo "====================================="
echo "회원 DB 확인"
echo "====================================="
curl -X GET ${API_URL}/users-info/ \
  -H "Accept: application/json" \
  -s | python -m json.tool

echo ""
echo "====================================="
echo "회원 추가 완료!"
echo "====================================="
echo ""
echo "추가된 계정 정보:"
echo "1. admin / ahp2025admin (관리자)"
echo "2. testuser / test1234 (일반)"
echo "3. evaluator1 / eval1234 (평가자)"
echo "4. enterprise1 / corp1234 (기업)"
echo "5. aebon / aebon2025 (특별관리자)"
echo "====================================="