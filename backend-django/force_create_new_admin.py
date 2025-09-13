#!/usr/bin/env python
"""
Force create new admin account with correct credentials
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from super_admin.models import CustomUser

def force_create_new_admin():
    """Force create new admin with updated credentials"""
    
    try:
        # Delete all existing admin accounts
        print("🗑️ Deleting all existing admin accounts...")
        CustomUser.objects.filter(email__contains='admin').delete()
        CustomUser.objects.filter(username='admin').delete()
        
        # Create new admin with correct credentials
        admin = CustomUser.objects.create_user(
            username='admin',
            email='admin@ahp.com',  # NEW EMAIL
            password='admin123',    # NEW PASSWORD
            first_name='Super',
            last_name='Admin',
            user_type='super_admin',
            is_superuser=True,
            is_staff=True,
            is_active=True,
            is_verified=True,
            subscription_tier='unlimited'
        )
        
        print("✅ New admin account created!")
        print(f"   Email: {admin.email}")
        print(f"   Password: admin123")
        print(f"   Username: {admin.username}")
        print(f"   User Type: {admin.user_type}")
        print(f"   Superuser: {admin.is_superuser}")
        
        # Verify the account works
        login_test = admin.check_password('admin123')
        print(f"   Password verification: {'✅ OK' if login_test else '❌ FAIL'}")
        
        # Database stats
        total_users = CustomUser.objects.count()
        super_admins = CustomUser.objects.filter(user_type='super_admin').count()
        
        print(f"\n📊 Database Status:")
        print(f"   Total users: {total_users}")
        print(f"   Super admins: {super_admins}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Force creating new admin account...")
    print("=" * 50)
    
    success = force_create_new_admin()
    
    if success:
        print("\n✅ SUCCESS!")
        print("New login credentials:")
        print("📧 Email: admin@ahp.com")
        print("🔑 Password: admin123")
        print("🌐 Login URL: https://aebonlee.github.io/ahp_app/public/login.html")
    else:
        print("\n❌ FAILED!")
        print("Check the error messages above.")