# Render.com 데이터베이스 마이그레이션 문제 해결

## 🚨 현재 문제 상황
- **에러**: `no such table: simple_projects`
- **원인**: Render.com에서 데이터베이스 마이그레이션이 제대로 실행되지 않음
- **결과**: 기준 추가 시 "Network error" 발생

## ✅ 해결 방법

### 1. Render.com 환경변수 설정 필요
Render.com 서비스 설정에서 다음 환경변수를 추가:

```bash
# PostgreSQL 연결 설정
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=ahp-django-backend.onrender.com

# AHP Platform 설정
CORS_ALLOWED_ORIGINS=https://aebonlee.github.io
CORS_ALLOW_CREDENTIALS=True
```

### 2. 수동 배포 트리거
Render.com 대시보드에서:
1. **Deploy Latest Commit** 클릭
2. 빌드 로그에서 마이그레이션 성공 확인
3. `python manage.py migrate` 실행 확인

### 3. 데이터베이스 상태 확인
배포 완료 후 다음 URL로 확인:
- https://ahp-django-backend.onrender.com/db-status/
- https://ahp-django-backend.onrender.com/setup-db/

### 4. 마이그레이션 스크립트 실행
로컬에서 실행하여 확인:
```bash
cd ahp_django_service_updated
python setup_database.py
```

## 🔧 추가 조치사항

### render-build.sh 스크립트 개선
```bash
#!/usr/bin/env bash
set -o errexit

echo "🚀 Starting Render.com build..."

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Database migrations with retry
echo "🔄 Running migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create superuser
echo "👤 Creating admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@ahp.com', 'ahp2025admin')
    print('✅ Admin user created')
"

# Collect static files
python manage.py collectstatic --noinput

echo "✅ Build completed!"
```

## 📊 프론트엔드 수정사항

### API 엔드포인트 경로 수정
- ❌ 기존: `/api/login/`
- ✅ 수정: `/api/service/auth/token/`

### 에러 처리 개선
- JWT 토큰 인증 방식으로 변경
- 401 에러 시 자동 토큰 새로고침
- Network error 시 재시도 로직

## 🎯 즉시 실행 단계

1. **Render.com 환경변수 설정**
2. **수동 재배포 실행**
3. **프론트엔드 API 경로 수정 (완료)**
4. **데이터베이스 연결 테스트**

---
*작성일: 2025-09-22*
*상태: 진행 중*