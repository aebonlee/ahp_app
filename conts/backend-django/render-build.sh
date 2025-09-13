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

from super_admin.models import CustomUser as User

try:
    # Check if admin exists
    admin_email = 'admin@ahp.com'
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