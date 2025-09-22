# Render.com 환경변수 설정 가이드

## 🚨 현재 문제: PostgreSQL 미연결로 인한 DB 테이블 누락

### 1. 필수 환경변수 설정

**Render.com 서비스 → Environment → Environment Variables**에서 다음 변수들을 추가:

```bash
# PostgreSQL 데이터베이스 연결
DATABASE_URL=postgresql://ahp_platform_user:your_password@dpg-xxxxx-a.oregon-postgres.render.com/ahp_platform_db

# Django 보안 설정
SECRET_KEY=your-super-secret-key-here-min-50-chars
DEBUG=False
ALLOWED_HOSTS=ahp-django-backend.onrender.com,.onrender.com

# CORS 설정 (개발용)
CORS_ALLOW_ALL_ORIGINS=True

# PostgreSQL 개별 설정 (백업용)
POSTGRES_DB=ahp_platform_db
POSTGRES_USER=ahp_platform_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_HOST=dpg-xxxxx-a.oregon-postgres.render.com
POSTGRES_PORT=5432
```

### 2. PostgreSQL 데이터베이스 생성

1. **Render.com Dashboard** 접속
2. **New** → **PostgreSQL** 선택
3. 데이터베이스 이름: `ahp_platform_db`
4. 생성 후 **External Database URL** 복사
5. 위의 `DATABASE_URL`에 붙여넣기

### 3. 빌드 스크립트 개선사항

```bash
# render-build.sh에 추가된 검증 로직:
- 데이터베이스 연결 체크
- 마이그레이션 상세 로그
- 테이블 생성 검증
- simple_projects 테이블 존재 확인
```

### 4. 배포 후 확인 방법

```bash
# 1. 데이터베이스 상태 확인
curl https://ahp-django-backend.onrender.com/db-status/

# 2. 프로젝트 API 테스트 (인증 필요)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://ahp-django-backend.onrender.com/api/service/projects/

# 3. 테이블 존재 확인
curl https://ahp-django-backend.onrender.com/test-projects/
```

### 5. CORS 설정 최종 확정

환경변수 설정 후:
```bash
CORS_ALLOW_ALL_ORIGINS=False  # 보안 강화
```

허용할 Origin만 명시:
```python
CORS_ALLOWED_ORIGINS = [
    "https://aebonlee.github.io",
    "https://aebonlee.github.io/ahp_app",
    "null"  # 로컬 테스트용
]
```

## 🎯 즉시 실행 단계

1. **Render.com PostgreSQL 생성** ← 최우선
2. **환경변수 설정** ← DATABASE_URL 포함
3. **수동 재배포** ← Settings → Deploy
4. **빌드 로그 확인** ← 마이그레이션 성공 여부
5. **API 테스트** ← CORS 및 DB 연결 확인

---
**⚠️ 핵심**: PostgreSQL 데이터베이스 없이는 지속적인 테이블 누락 발생
**📋 목표**: 완전한 데이터베이스 연결 + 정확한 CORS 설정