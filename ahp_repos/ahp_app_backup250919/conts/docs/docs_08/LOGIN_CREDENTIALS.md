# 🔑 AHP Platform 로그인 정보

## 🌐 플랫폼 접속 정보

### 프론트엔드 (React)
- **URL**: https://aebonlee.github.io/ahp_app
- **설명**: AHP 플랫폼 메인 인터페이스

### 백엔드 (Django API)  
- **URL**: https://ahp-django-backend-new.onrender.com
- **API Root**: https://ahp-django-backend-new.onrender.com/api/v1/
- **Django Admin**: https://ahp-django-backend-new.onrender.com/admin/

## 👥 사용자 계정 정보

### 🔑 Super Administrator (슈퍼 관리자)
```
Username: admin
Password: ahp2025admin
Email: admin@ahp-platform.com
권한: 모든 시스템 관리 권한
```

### 🔑 Demo User (데모 사용자 - 프로젝트 매니저)
```
Username: demo  
Password: demo2025
Email: demo@ahp-platform.com
권한: 프로젝트 생성 및 관리
```

### 🔑 Test User (테스트 사용자 - 평가자)
```
Username: test
Password: test2025  
Email: test@ahp-platform.com
권한: 평가 참여
```

## 📋 로그인 테스트 방법

### 1. React 프론트엔드에서 로그인
1. https://aebonlee.github.io/ahp_app 접속
2. 로그인 버튼 클릭
3. 위의 계정 정보로 로그인 시도

### 2. Django Admin에서 로그인
1. https://ahp-django-backend-new.onrender.com/admin/ 접속
2. admin 계정으로 로그인 (ahp2025admin)
3. Django 관리자 인터페이스 확인

### 3. API로 직접 로그인 테스트
```bash
# JWT 토큰 발급 테스트
curl -X POST https://ahp-django-backend-new.onrender.com/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo2025"}'
```

## 🛠️ 백엔드 연동 문제 해결

### 백엔드 상태 확인
```bash
# 헬스 체크
curl https://ahp-django-backend-new.onrender.com/health/
# 응답: {"status": "healthy"}

# API 루트 확인
curl https://ahp-django-backend-new.onrender.com/api/v1/
# 응답: 인증 오류 (정상 - 로그인 필요)
```

### 일반적인 연동 문제들

#### 1. CORS 오류
- **증상**: 브라우저에서 "CORS policy" 오류
- **해결**: Django 설정에서 CORS_ALLOWED_ORIGINS에 프론트엔드 URL 포함됨
- **설정**: `https://aebonlee.github.io` 허용됨

#### 2. 인증 토큰 문제
- **증상**: "Authentication credentials were not provided" 
- **해결**: 로그인 후 JWT 토큰을 Authorization 헤더에 포함
- **형식**: `Authorization: Bearer <access_token>`

#### 3. API 엔드포인트 오류
- **증상**: 404 Not Found 오류
- **해결**: API 엔드포인트 경로 확인
- **올바른 형식**: `/api/v1/accounts/`, `/api/v1/projects/` 등

## 🔧 백엔드 연동 확인 체크리스트

### ✅ 기본 연결성
- [ ] 백엔드 Health Check: https://ahp-django-backend-new.onrender.com/health/
- [ ] API Root 응답: https://ahp-django-backend-new.onrender.com/api/v1/

### ✅ 인증 시스템
- [ ] 로그인 API: POST `/api/v1/auth/token/`
- [ ] 토큰 갱신: POST `/api/v1/auth/token/refresh/`
- [ ] 토큰 검증: POST `/api/v1/auth/token/verify/`

### ✅ 사용자 계정
- [ ] admin 계정으로 Django Admin 접속
- [ ] demo 계정으로 React 프론트엔드 로그인
- [ ] test 계정으로 평가자 권한 확인

### ✅ API 기능
- [ ] 사용자 프로필 조회: GET `/api/v1/accounts/profile/`
- [ ] 프로젝트 목록: GET `/api/v1/projects/`
- [ ] 각 앱별 기본 CRUD 작업

## 🚨 문제 발생 시 대응 방안

### 1. 백엔드 연결 실패
```bash
# 백엔드 상태 확인
curl -I https://ahp-django-backend-new.onrender.com/health/

# Render.com 서비스 상태 확인
# https://status.render.com/ 접속하여 서비스 상태 점검
```

### 2. 로그인 실패
- 사용자 계정이 생성되어 있는지 확인
- 비밀번호 정확성 확인  
- Django Admin에서 사용자 상태 확인

### 3. API 권한 오류
- JWT 토큰 만료 확인 (60분 유효)
- 리프레시 토큰으로 새로운 액세스 토큰 발급
- 사용자 권한 레벨 확인

## 📞 지원 연락처

**기술 지원**:
- GitHub Issues: https://github.com/aebonlee/ahp_app/issues
- 개발 문서: `docs/docs_08/` 디렉토리

**플랫폼 정보**:
- 개발 현황: Django 4.2.7 + React 18
- 배포 환경: Render.com + GitHub Pages
- 데이터베이스: PostgreSQL

---

**마지막 업데이트**: 2025-01-09  
**플랫폼 버전**: v1.0.0 Production Ready