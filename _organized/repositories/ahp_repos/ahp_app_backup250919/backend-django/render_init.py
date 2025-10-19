#!/usr/bin/env python3
"""
Render.com Initialization Script
This script runs after deployment to set up initial data
"""
import os
import sys
import django
from pathlib import Path

# Add the backend-django directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.core.management import execute_from_command_line, call_command
from apps.accounts.models import User
from django.contrib.auth.hashers import make_password

def run_migrations():
    """Run Django migrations"""
    print("🔄 Running Django migrations...")
    try:
        call_command('migrate', verbosity=1)
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def create_initial_users():
    """Create initial users if they don't exist"""
    print("👥 Creating initial users...")
    
    # Check if admin user already exists
    if User.objects.filter(username='admin').exists():
        print("ℹ️ Admin user already exists, skipping user creation")
        return True
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@ahp-platform.com',
            'password': 'ahp2025admin',
            'full_name': 'AHP Admin',
            'is_superuser': True,
            'is_staff': True,
            'is_admin': True,
        },
        {
            'username': 'demo', 
            'email': 'demo@ahp-platform.com',
            'password': 'demo2025',
            'full_name': 'Demo User',
            'is_project_manager': True,
        },
        {
            'username': 'test',
            'email': 'test@ahp-platform.com', 
            'password': 'test2025',
            'full_name': 'Test User',
            'is_evaluator': True,
        }
    ]
    
    try:
        for user_data in users_data:
            user = User.objects.create(
                username=user_data['username'],
                email=user_data['email'], 
                full_name=user_data['full_name'],
                password=make_password(user_data['password']),
                is_superuser=user_data.get('is_superuser', False),
                is_staff=user_data.get('is_staff', False),
                is_admin=user_data.get('is_admin', False),
                is_project_manager=user_data.get('is_project_manager', False),
                is_evaluator=user_data.get('is_evaluator', True),
                language='ko'
            )
            print(f"✅ Created user: {user.username}")
            
        print("🎉 All initial users created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create users: {e}")
        return False

def collect_static():
    """Collect static files"""
    print("📦 Collecting static files...")
    try:
        call_command('collectstatic', '--noinput', verbosity=1)
        print("✅ Static files collected")
        return True
    except Exception as e:
        print(f"❌ Static collection failed: {e}")
        return False

def main():
    """Main initialization function"""
    print("🚀 Starting Render.com initialization...")
    print("=" * 50)
    
    success = True
    
    # Run migrations
    if not run_migrations():
        success = False
    
    # Create initial users  
    if not create_initial_users():
        success = False
        
    # Collect static files
    if not collect_static():
        success = False
    
    print("=" * 50)
    if success:
        print("🎉 Render.com initialization completed successfully!")
        print("\n📋 LOGIN CREDENTIALS:")
        print("Admin: admin / ahp2025admin")
        print("Demo:  demo  / demo2025")  
        print("Test:  test  / test2025")
    else:
        print("❌ Some initialization steps failed")
        sys.exit(1)

if __name__ == '__main__':
    main()