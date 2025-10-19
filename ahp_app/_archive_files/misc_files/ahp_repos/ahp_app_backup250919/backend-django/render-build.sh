#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting Render.com build process..."
echo "📅 Build Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "🔄 Triggering deployment after CSS Design System integration..."

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create logs directory
mkdir -p logs
chmod 755 logs

# Simplified database setup
echo "Setting up database..."

# Clean up any conflicting migrations
echo "Cleaning migrations..."
find simple_service/migrations -name "0002_*.py" -delete 2>/dev/null || true
find simple_service/migrations -name "0003_*.py" -delete 2>/dev/null || true
find simple_service/migrations -name "0004_*.py" -delete 2>/dev/null || true

# Create new migrations
echo "Creating migrations..."
python manage.py makemigrations simple_service --empty --name fix_schema

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

# Manual schema fix for SQLite
echo "Ensuring required columns exist..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.db import connection
with connection.cursor() as cursor:
    # Add columns if they don't exist (SQLite-safe approach)
    try:
        cursor.execute('ALTER TABLE simple_projects ADD COLUMN objective TEXT DEFAULT \"\";')
        print('✅ Added objective column')
    except:
        print('ℹ️ objective column already exists or add failed')
        
    try:
        cursor.execute('ALTER TABLE simple_projects ADD COLUMN visibility VARCHAR(20) DEFAULT \"private\";')
        print('✅ Added visibility column')
    except:
        print('ℹ️ visibility column already exists or add failed')

print('✅ Schema fix completed')
"

# Create required users
echo "Creating system users..."
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Create anonymous user
try:
    user, created = User.objects.get_or_create(
        username='anonymous',
        defaults={
            'email': 'anonymous@ahp.com',
            'first_name': '익명',
            'last_name': '사용자',
            'is_active': True,
        }
    )
    if hasattr(user, 'user_type'):
        user.user_type = 'personal'
        user.save()
    print('✅ Anonymous user ready')
except Exception as e:
    print(f'❌ Anonymous user setup failed: {e}')

print(f'👤 Total users: {User.objects.count()}')
"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Create superuser using Django shell (more reliable)
echo "Creating admin account with Django shell..."
python manage.py shell -c "
import os
import django
django.setup()

from super_admin.models import CustomUser as User

try:
    # Check if admin exists
    admin_email = 'admin@ahp.com'
    
    # Delete any existing admin accounts with old credentials
    old_admins = User.objects.filter(email__in=['admin@ahp-platform.com', 'admin@ahp.com'])
    if old_admins.exists():
        print('🗑️ Deleting old admin accounts...')
        old_admins.delete()
    
    if User.objects.filter(email=admin_email).exists():
        print('✅ Admin account already exists')
        admin = User.objects.get(email=admin_email)
        print(f'Username: {admin.username}, Email: {admin.email}')
        print(f'User Type: {admin.user_type}')
    else:
        # Create new admin with CustomUser model
        admin = User.objects.create_user(
            username='admin',
            email=admin_email,
            password='admin123',
            first_name='Admin',
            last_name='User',
            user_type='super_admin',
            is_superuser=True,
            is_staff=True,
            is_active=True,
            is_verified=True
        )
        print('✅ Admin account created successfully!')
        print(f'Username: {admin.username}')
        print(f'Email: {admin.email}') 
        print('Password: admin123')
        print(f'User Type: {admin.user_type}')
        print(f'Superuser: {admin.is_superuser}')
        print(f'Staff: {admin.is_staff}')
        
    # Print database info
    total_users = User.objects.count()
    admin_count = User.objects.filter(is_superuser=True).count()
    print(f'📊 Database Status: {total_users} users, {admin_count} admins')
    
except Exception as e:
    print(f'❌ Admin creation error: {e}')
    import traceback
    traceback.print_exc()
" || echo "Admin creation failed completely"

# Create superuser using management command (backup)
echo "Trying management command as backup..."
python manage.py create_admin || echo "Management command also failed"

echo "✅ Build completed successfully!"
echo "🎯 Version 2.1.0 - CSS Design System Integration"
echo "📅 Deployment completed at: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"