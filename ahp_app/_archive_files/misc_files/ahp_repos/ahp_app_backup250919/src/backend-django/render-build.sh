#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting Render.com build process..."
echo "📅 Build Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "🔄 Render deployment with Render backend directory fix..."
echo "📁 Current directory: $(pwd)"
echo "📂 Directory contents: $(ls -la)"

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create logs directory
mkdir -p logs
chmod 755 logs

# Run basic Django migrations only
echo "Running basic Django migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Create superuser using Django shell (more reliable)
echo "Creating admin account with Django shell..."
python manage.py shell -c "
import os
import django
django.setup()

from django.contrib.auth.models import User

try:
    # Check if admin exists
    if User.objects.filter(username='admin').exists():
        print('✅ Admin account already exists')
        admin = User.objects.get(username='admin')
        print(f'Username: {admin.username}, Email: {admin.email}')
    else:
        # Create new admin
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@ahp-platform.com',
            password='ahp2025admin',
            first_name='Admin',
            last_name='User'
        )
        print('✅ Admin account created successfully!')
        print(f'Username: {admin.username}')
        print(f'Email: {admin.email}') 
        print('Password: ahp2025admin')
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