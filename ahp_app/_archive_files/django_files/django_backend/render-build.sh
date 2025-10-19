#!/usr/bin/env bash
set -o errexit
# Force rebuild - 2025-10-16

# Change to the Django app directory  
cd "$(dirname "$0")"
echo "Current directory: $(pwd)"
echo "Listing directory contents:"
ls -la

echo "Installing dependencies..."
pip install -r requirements.txt

echo "========================================="
echo "Handling migrations..."
echo "FLUSH_DB environment variable: ${FLUSH_DB:-not set}"
echo "========================================="

# OPTION 1: Try to fix migration history (default)
# OPTION 2: If this fails, set FLUSH_DB=true in Render environment variables for complete reset

if [ "$FLUSH_DB" = "true" ]; then
    echo "⚠️  FLUSH_DB=true detected - Performing complete reset..."
    echo "This will DELETE ALL DATA and regenerate migrations!"
    
    # Step 1: Clear migration cache only (keep migration files)
    echo "🗑️  Clearing migration cache..."
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -path "*/migrations/*.pyc" -delete
    
    # Step 2: Use existing migration files
    echo "📝 Using existing migration files..."
    
    echo "📋 Generated migrations:"
    find . -name "*.py" -path "*/migrations/*" -not -name "__init__.py" | head -10
    
    # Step 4: Complete database cleanup (all tables and sequences)
    echo "🧹 Performing complete database cleanup..."
    python manage.py shell <<EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        # Get ALL tables in the public schema
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        """)
        all_tables = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(all_tables)} tables to drop")
        
        # Drop ALL tables with CASCADE (including Django system tables)
        for table in all_tables:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
                print(f"✅ Dropped table: {table}")
            except Exception as e:
                print(f"⚠️  Could not drop {table}: {e}")
        
        # Drop ALL sequences
        cursor.execute("""
            SELECT sequence_name FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
        """)
        all_sequences = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(all_sequences)} sequences to drop")
        
        for seq in all_sequences:
            try:
                cursor.execute(f'DROP SEQUENCE IF EXISTS "{seq}" CASCADE;')
                print(f"✅ Dropped sequence: {seq}")
            except Exception as e:
                print(f"⚠️  Could not drop sequence {seq}: {e}")
        
        # Drop ALL indexes
        cursor.execute("""
            SELECT indexname FROM pg_indexes 
            WHERE schemaname = 'public'
        """)
        all_indexes = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(all_indexes)} indexes to drop")
        
        for idx in all_indexes:
            try:
                cursor.execute(f'DROP INDEX IF EXISTS "{idx}" CASCADE;')
                print(f"✅ Dropped index: {idx}")
            except Exception as e:
                print(f"⚠️  Could not drop index {idx}: {e}")
                
    print("✅ Complete database cleanup finished")
except Exception as e:
    print(f"⚠️  Database cleanup error: {e}")
    print("Proceeding with migrations anyway...")
EOF
    
    # Step 5: Apply all migrations fresh
    echo "🚀 Applying all migrations from scratch..."
    python manage.py migrate
    
    # Create superuser with custom role
    echo "Creating superuser and test accounts..."
    python manage.py shell <<EOF
from apps.accounts.models import User
try:
    # 슈퍼 관리자 생성 (Django 표준 방식)
    if not User.objects.filter(email='admin@ahp.com').exists():
        admin_user = User.objects.create_superuser(
            username='admin_ahp',
            email='admin@ahp.com',
            password='admin123!',
            full_name='AHP Platform Administrator'
        )
        print(f"✅ 슈퍼 관리자 생성됨: {admin_user.email}")
    
    # 결제 회원 테스트 계정들 생성 (다양한 이메일 도메인)
    test_accounts = [
        ('test@gmail.com', 'gmail_user', '구글 이메일 테스트'),
        ('test@naver.com', 'naver_user', '네이버 이메일 테스트'), 
        ('test@kakao.com', 'kakao_user', '카카오 이메일 테스트'),
        ('test@test.com', 'basic_user', '기본 테스트')
    ]
    
    for email, username, description in test_accounts:
        if not User.objects.filter(email=email).exists():
            test_user = User.objects.create_user(
                username=username,
                email=email,
                password='test123!',
                full_name=description,
                is_project_manager=True
            )
            print(f"✅ {description} 계정 생성됨: {test_user.email}")
    
    # 일반 회원 테스트 계정
    if not User.objects.filter(email='evaluator@test.com').exists():
        eval_user = User.objects.create_user(
            username='evaluator_user',
            email='evaluator@test.com',
            password='eval123!',
            full_name='테스트 평가자',
            is_evaluator=True
        )
        print(f"✅ 일반 회원 계정 생성됨: {eval_user.email}")
        
    print("✅ 계정 생성 완료")
except Exception as e:
    print(f"⚠️  계정 생성 오류: {e}")
EOF
else
    # Standard migration fix (tries to preserve data)
    echo "========================================="
    echo "FLUSH_DB not set - Attempting to fix migration history without data loss..."
    echo "========================================="
    
    python manage.py shell <<EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM django_migrations WHERE app='admin' AND name='0001_initial';")
        cursor.execute("DELETE FROM django_migrations WHERE app='auth' AND name='0001_initial';")
        cursor.execute("DELETE FROM django_migrations WHERE app='contenttypes' AND name='0001_initial';")
        print("✅ Migration history cleaned successfully")
except Exception as e:
    print(f"⚠️  Could not clean migration history: {e}")
EOF
    
    # Check migration status
    echo "Current migration status:"
    python manage.py showmigrations || true
    
    # Apply migrations
    echo "Applying migrations..."
    python manage.py migrate accounts --fake-initial
    python manage.py migrate --fake-initial
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"