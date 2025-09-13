#!/usr/bin/env bash
# Render.com 빌드 스크립트

set -o errexit  # 에러 발생 시 종료

echo "🚀 Starting Django deployment..."

# 의존성 설치
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Static 파일 수집
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# 마이그레이션 실행
echo "🗄️ Running migrations..."
python manage.py migrate --no-input

# 관리자 계정 생성
echo "👤 Creating admin user..."
python manage.py shell << EOF
from django.contrib.auth.models import User
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@ahp-platform.com',
            password='ahp2025admin'
        )
        print('✅ Admin user created successfully!')
    else:
        print('ℹ️ Admin user already exists')
except Exception as e:
    print(f'⚠️ Admin user creation error: {e}')
EOF

echo "✅ Django deployment completed!"