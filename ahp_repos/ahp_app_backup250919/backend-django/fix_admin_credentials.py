#!/usr/bin/env python
"""
Fix admin credentials to match frontend expectations
admin@ahp.com / admin123
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from super_admin.models import CustomUser

def fix_admin_credentials():
    """Fix admin credentials to admin@ahp.com / admin123"""
    
    try:
        print("🔧 Fixing admin credentials...")
        
        # Delete any existing admin accounts
        old_admins = CustomUser.objects.filter(
            email__in=['admin@ahp-platform.com', 'admin@ahp.com']
        )
        
        if old_admins.exists():
            print(f"🗑️ Deleting {old_admins.count()} existing admin accounts:")
            for admin in old_admins:
                print(f"   - {admin.email} ({admin.username})")
            old_admins.delete()
        
        # Create new admin account with correct credentials
        admin = CustomUser.objects.create_user(
            username='admin',
            email='admin@ahp.com',          # NEW: Correct email
            password='admin123',            # NEW: Correct password  
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
        print(f"   📧 Email: {admin.email}")
        print(f"   🔑 Password: admin123")
        print(f"   👤 Username: {admin.username}")
        print(f"   🏷️ User Type: {admin.user_type}")
        print(f"   🔒 Superuser: {admin.is_superuser}")
        print(f"   👨‍💼 Staff: {admin.is_staff}")
        
        # Verify login works
        login_test = admin.check_password('admin123')
        print(f"   ✅ Password verification: {'OK' if login_test else 'FAIL'}")
        
        # Database stats
        total_users = CustomUser.objects.count()
        super_admins = CustomUser.objects.filter(user_type='super_admin').count()
        
        print(f"\n📊 Database Status:")
        print(f"   Total users: {total_users}")
        print(f"   Super admins: {super_admins}")
        
        print(f"\n🎯 Frontend Login Credentials:")
        print(f"   Email: admin@ahp.com")
        print(f"   Password: admin123")
        print(f"   Login URL: https://aebonlee.github.io/ahp_app/public/login.html")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🚀 Starting admin credentials fix...")
    print("=" * 60)
    
    success = fix_admin_credentials()
    
    if success:
        print("\n✅ SUCCESS! Admin credentials fixed.")
        print("Frontend and backend now use: admin@ahp.com / admin123")
    else:
        print("\n❌ FAILED! Check the error messages above.")