#!/usr/bin/env python3
"""
Create Django users for AHP Platform
This script creates initial users including superuser and test users
"""
import os
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from apps.accounts.models import User
from django.contrib.auth.hashers import make_password

def create_initial_users():
    """Create initial users for the AHP platform"""
    
    print("🚀 Creating initial users for AHP Platform...")
    
    users_to_create = [
        {
            'username': 'admin',
            'email': 'admin@ahp-platform.com',
            'password': 'ahp2025admin',
            'full_name': 'AHP Platform Administrator',
            'organization': 'AHP Platform',
            'department': 'System Administration',
            'position': 'Super Administrator',
            'is_superuser': True,
            'is_staff': True,
            'is_admin': True,
            'is_project_manager': True,
        },
        {
            'username': 'demo',
            'email': 'demo@ahp-platform.com', 
            'password': 'demo2025',
            'full_name': 'Demo User',
            'organization': 'Demo Organization',
            'department': 'Research',
            'position': 'Researcher',
            'is_project_manager': True,
        },
        {
            'username': 'test',
            'email': 'test@ahp-platform.com',
            'password': 'test2025',
            'full_name': 'Test User',
            'organization': 'Test Organization',
            'department': 'Testing',
            'position': 'Test Evaluator',
            'is_evaluator': True,
        }
    ]
    
    for user_data in users_to_create:
        username = user_data['username']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"   ⚠️ User '{username}' already exists, skipping...")
            continue
            
        # Create user
        user = User.objects.create(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            organization=user_data.get('organization', ''),
            department=user_data.get('department', ''),
            position=user_data.get('position', ''),
            is_superuser=user_data.get('is_superuser', False),
            is_staff=user_data.get('is_staff', False),
            is_admin=user_data.get('is_admin', False),
            is_project_manager=user_data.get('is_project_manager', False),
            is_evaluator=user_data.get('is_evaluator', True),
            language='ko',
            password=make_password(user_data['password'])
        )
        
        user_type = "SUPERUSER" if user.is_superuser else ("ADMIN" if user.is_admin else "USER")
        print(f"   ✅ Created {user_type}: {username} ({user.email})")
    
    print("\n🎉 User creation complete!")
    print("\n📋 LOGIN CREDENTIALS:")
    print("=" * 50)
    print("🔑 Super Administrator:")
    print("   Username: admin")
    print("   Password: ahp2025admin")
    print("   Email: admin@ahp-platform.com")
    print()
    print("🔑 Demo User (Project Manager):")
    print("   Username: demo") 
    print("   Password: demo2025")
    print("   Email: demo@ahp-platform.com")
    print()
    print("🔑 Test User (Evaluator):")
    print("   Username: test")
    print("   Password: test2025")
    print("   Email: test@ahp-platform.com")
    print("=" * 50)
    
    return True

def test_login(username, password):
    """Test login functionality"""
    print(f"\n🧪 Testing login for user: {username}")
    
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            print(f"   ✅ Login test successful for {username}")
            return True
        else:
            print(f"   ❌ Login test failed for {username} - wrong password")
            return False
    except User.DoesNotExist:
        print(f"   ❌ User {username} does not exist")
        return False

if __name__ == '__main__':
    try:
        # Create users
        create_initial_users()
        
        # Test logins
        print("\n🔍 Testing login functionality...")
        test_login('admin', 'ahp2025admin')
        test_login('demo', 'demo2025') 
        test_login('test', 'test2025')
        
        print(f"\n📊 Total users in database: {User.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()