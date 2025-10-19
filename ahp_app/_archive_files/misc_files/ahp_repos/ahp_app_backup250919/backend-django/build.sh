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

# 데이터베이스 상태 확인
echo "🔍 Checking database connection..."
python manage.py shell << EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ PostgreSQL Version: {version[0]}")
except Exception as e:
    print(f"❌ Database connection error: {e}")
EOF

# 마이그레이션 상태 확인
echo "📋 Checking migration status..."
python manage.py showmigrations

# 마이그레이션 생성 및 실행
echo "📝 Creating migrations..."
python manage.py makemigrations simple_service --verbosity=2

echo "🗄️ Running migrations..."
python manage.py migrate --verbosity=2

# 마이그레이션 후 테이블 확인
echo "🔍 Verifying tables after migration..."
python manage.py shell << EOF
from django.db import connection
tables_found = []
test_tables = ['simple_projects', 'simple_criteria', 'simple_comparisons', 'simple_results', 'simple_data']
for table in test_tables:
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            tables_found.append(f"{table} ({count} rows)")
            print(f"  ✓ {table}: {count} rows")
    except Exception as e:
        print(f"  ✗ {table}: Not found")
        
print(f"📊 Tables verified: {len(tables_found)}/{len(test_tables)}")
EOF

# 관리자 계정 생성 (1차 개발 호환성)
echo "👤 Creating admin user..."
python manage.py shell << EOF
from django.contrib.auth.models import User
try:
    # System user 생성
    system_user, created = User.objects.get_or_create(
        username='system',
        defaults={
            'email': 'system@ahp.com',
            'first_name': 'System',
            'last_name': 'User',
            'is_staff': True,
            'is_active': True
        }
    )
    if created:
        print('✅ System user created successfully!')
    else:
        print('ℹ️ System user already exists')
    
    # Admin user 생성 (이메일로도 로그인 가능)
    admin_user, created = User.objects.get_or_create(
        username='admin@ahp-platform.com',  # username을 이메일로 설정
        defaults={
            'email': 'admin@ahp-platform.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    
    # 기존 admin 사용자명으로도 접근 가능하도록 추가 계정 생성
    admin_user2, created2 = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin2@ahp-platform.com',
            'first_name': 'Admin',
            'last_name': 'Backup',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    # 첫 번째 관리자 계정 패스워드 설정
    if created:
        admin_user.set_password('ahp2025admin')
        admin_user.save()
        print('✅ Admin user (email) created successfully!')
    else:
        admin_user.set_password('ahp2025admin')
        admin_user.save()
        print('ℹ️ Admin user (email) already exists (password updated)')
    
    # 두 번째 관리자 계정 패스워드 설정    
    if created2:
        admin_user2.set_password('ahp2025admin')
        admin_user2.save()
        print('✅ Admin user (username) created successfully!')
    else:
        admin_user2.set_password('ahp2025admin')
        admin_user2.save()
        print('ℹ️ Admin user (username) already exists (password updated)')
        
    print(f'📊 Total users: {User.objects.count()}')
    
except Exception as e:
    print(f'⚠️ User creation error: {e}')
EOF

echo "✅ Django deployment completed!"