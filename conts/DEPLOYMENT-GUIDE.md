# AHP Platform Django 배포 가이드

## 프로젝트 개요
Node.js 백엔드를 Django REST API로 완전히 교체한 AHP (Analytic Hierarchy Process) 의사결정 지원 플랫폼입니다.

## 시스템 아키텍처
```
[React Frontend] → [Django REST API] → [PostgreSQL Database]
     ↓                    ↓                    ↓
  GitHub Pages      Render.com            Render.com
```

## 배포 환경

### 프론트엔드 (React)
- **배포 플랫폼**: GitHub Pages
- **URL**: https://aebonlee.github.io/ahp_app/
- **빌드 도구**: Create React App
- **배포 방식**: GitHub Actions 자동 배포

### 백엔드 (Django)
- **배포 플랫폼**: Render.com
- **URL**: https://ahp-app-vuzk.onrender.com/
- **Python 버전**: 3.11
- **웹 서버**: Gunicorn
- **정적 파일**: WhiteNoise

### 데이터베이스 (PostgreSQL)
- **플랫폼**: Render.com PostgreSQL
- **연결 정보**: dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com
- **데이터베이스명**: ahp_app_vuzk

## 주요 기능

### Django 백엔드 앱 구조
```
apps/
├── accounts/          # 사용자 인증 및 관리
├── projects/          # AHP 프로젝트 관리
├── evaluations/       # 평가 및 쌍대비교
├── analysis/          # AHP 분석 및 계산
├── workshops/         # 워크숍 세션 관리
├── exports/           # 데이터 내보내기
└── common/            # 공통 유틸리티
```

### API 엔드포인트
- **인증**: `/api/v1/accounts/web/login/`, `/api/v1/accounts/web/register/`
- **평가자 관리**: `/api/v1/accounts/web/evaluators/`
- **프로젝트 관리**: `/api/v1/projects/`
- **평가 관리**: `/api/v1/evaluations/`
- **분석**: `/api/v1/analysis/`

## 배포 단계

### 1. 사전 준비
```bash
# 저장소 클론
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app
```

### 2. 환경 변수 설정

#### Render.com Django 환경변수
```
PYTHON_VERSION=3.11.0
DEBUG=False
SECRET_KEY=django-insecure-ahp2025-production-secret-key-change-me
DATABASE_URL=postgresql://ahp_app_vuzk_user:PASSWORD@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app_vuzk
```

#### React 환경변수 (선택사항)
```
REACT_APP_DJANGO_API_URL=https://ahp-app-vuzk.onrender.com/api/v1
```

### 3. Django 백엔드 배포

#### render.yaml 설정
```yaml
services:
  - type: web
    name: ahp-django-backend
    runtime: python
    rootDir: backend-django
    buildCommand: "sh render-build.sh"
    startCommand: "gunicorn ahp_backend.wsgi:application --bind 0.0.0.0:$PORT"
    plan: free
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DEBUG
        value: "False"
      - key: SECRET_KEY
        value: "django-insecure-ahp2025-production-secret-key-change-me"
      - key: DATABASE_URL
        value: "postgresql://ahp_app_vuzk_user:PASSWORD@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app_vuzk"
    healthCheckPath: /admin/login/
```

#### 빌드 스크립트 (render-build.sh)
```bash
#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### 4. 데이터베이스 마이그레이션

#### Django 모델 마이그레이션
```bash
cd backend-django
python manage.py makemigrations
python manage.py migrate
```

#### 기존 Node.js 데이터 마이그레이션 (선택사항)
```bash
python migrate_nodejs_data.py
```

### 5. React 프론트엔드 배포

#### GitHub Pages 설정
1. GitHub repository → Settings → Pages
2. Source: GitHub Actions
3. 자동 배포 워크플로우 실행

#### 배포 확인
- URL: https://aebonlee.github.io/ahp_app/
- Django API와의 연결 확인

## 핵심 구현사항

### 1. JWT 인증 시스템
- **라이브러리**: djangorestframework-simplejwt
- **토큰 수명**: Access 60분, Refresh 1일
- **자동 갱신**: React에서 토큰 만료 시 자동 갱신

### 2. CORS 설정
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://aebonlee.github.io",
]
CORS_ALLOW_CREDENTIALS = True
```

### 3. Django REST API 구조
- **Serializer**: 데이터 직렬화/역직렬화
- **ViewSet**: CRUD 작업 처리
- **Permission**: 역할 기반 접근 제어
- **Pagination**: 페이지네이션 지원

### 4. React-Django 통합
- **API Service**: `djangoApiService.ts`
- **Auth Hook**: `useDjangoAuth.tsx`
- **컴포넌트**: Django API 연동 컴포넌트

## 주요 API 엔드포인트

### 인증
```
POST /api/v1/accounts/web/login/
POST /api/v1/accounts/web/register/
POST /api/v1/accounts/web/logout/
GET  /api/v1/accounts/web/profile/
```

### 평가자 관리
```
GET    /api/v1/accounts/web/evaluators/
POST   /api/v1/accounts/web/evaluators/create/
PUT    /api/v1/accounts/web/evaluators/{id}/
DELETE /api/v1/accounts/web/evaluators/{id}/delete/
GET    /api/v1/accounts/web/evaluators/statistics/
```

### 프로젝트 관리
```
GET    /api/v1/projects/
POST   /api/v1/projects/
PUT    /api/v1/projects/{id}/
DELETE /api/v1/projects/{id}/
```

## 모니터링 및 로그

### 로그 설정
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
        }
    }
}
```

### 상태 확인
- **백엔드 헬스체크**: `/admin/login/`
- **API 상태**: `/api/v1/health/` (구현 시)

## 보안 고려사항

### Django 설정
```python
# HTTPS 강제
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000

# CSRF 보호
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# 콘텐츠 보안
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
```

### 인증 토큰 관리
- JWT 토큰은 localStorage에 저장
- 자동 토큰 갱신으로 보안 강화
- 로그아웃 시 토큰 완전 삭제

## 성능 최적화

### Django 최적화
- **페이지네이션**: 대용량 데이터 처리
- **Select Related**: N+1 쿼리 방지
- **캐싱**: Redis 캐싱 (향후 구현)
- **압축**: Gzip 응답 압축

### React 최적화
- **코드 분할**: 동적 import 사용
- **메모이제이션**: React.memo, useMemo
- **상태 관리**: Context API 효율적 사용

## 확장성 고려사항

### 수평 확장
- **로드 밸런싱**: Render.com 자동 스케일링
- **데이터베이스**: 읽기 전용 복제본 추가 가능
- **CDN**: 정적 파일 배포 최적화

### 기능 확장
- **WebSocket**: 실시간 협업 기능
- **외부 API**: 타사 서비스 통합
- **모바일 앱**: React Native 확장

## 장애 대응

### 백업 전략
- **데이터베이스**: 일일 자동 백업
- **코드**: Git 버전 관리
- **환경설정**: 문서화된 설정 관리

### 롤백 절차
1. GitHub에서 이전 커밋으로 롤백
2. Render.com에서 이전 배포 버전으로 복원
3. 데이터베이스 스키마 마이그레이션 롤백

## 문제 해결

### 일반적인 문제들
1. **CORS 오류**: CORS_ALLOWED_ORIGINS 확인
2. **인증 실패**: JWT 토큰 만료 확인
3. **500 오류**: Django 로그 확인
4. **연결 오류**: 데이터베이스 연결 상태 확인

### 디버깅 도구
- Django Admin: `/admin/`
- API 문서: 향후 Swagger 구현
- 로그 파일: `logs/django.log`

## 연락처 및 지원
- **GitHub Repository**: https://github.com/aebonlee/ahp_app
- **이슈 리포팅**: GitHub Issues
- **문서 업데이트**: README.md, 본 가이드