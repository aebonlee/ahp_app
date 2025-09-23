# 🚨 Render.com 긴급 수정 가이드

## 📋 현재 문제
- **백엔드**: https://ahp-django-backend.onrender.com ✅ 작동
- **데이터베이스**: "Database unavailable" ❌ 연결 실패

## ⚡ 즉시 실행 필요

### 1. Render.com 환경변수 설정

**접속 경로:**
```
https://dashboard.render.com
→ Services 
→ "ahp-django-backend" 찾기
→ Settings 
→ Environment Variables
```

**추가할 환경변수:**
```
DATABASE_URL = postgresql://ahp_app_user:xEcCdn2WB32sxLYIPAncc9cHARXf1t6d@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app

SECRET_KEY = django-insecure-your-secret-key-here

DEBUG = False

ALLOWED_HOSTS = ahp-django-backend.onrender.com,127.0.0.1,localhost
```

### 2. 수동 재배포
```
Services → ahp-django-backend 
→ Manual Deploy 
→ "Deploy latest commit" 클릭
```

## 📊 예상 결과 (3-5분 후)

**성공 시:**
- https://ahp-django-backend.onrender.com/api/service/status/
- "Database unavailable" 메시지 사라짐
- PostgreSQL 연결 성공

**확인 API:**
- `/api/service/projects/` - 프로젝트 목록
- `/api/login/` - 로그인
- `/api/register/` - 회원가입

## 🔧 만약 서비스를 찾을 수 없다면

### 새 서비스 생성:
```
New + → Web Service
→ GitHub: aebonlee/ahp_app
→ Branch: main
→ Root Directory: ahp_django_service_updated
→ Build Command: ./render-build.sh
→ Start Command: gunicorn ahp_backend.wsgi:application
→ Python Version: 3.11
```

## 📞 참고 정보
- **PostgreSQL ID**: dpg-d2vgtg3uibrs738jk4i0-a
- **데이터베이스명**: ahp_app
- **사용자**: ahp_app_user

---
*긴급 수정 가이드 - 2025년 9월 23일*