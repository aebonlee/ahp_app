#!/usr/bin/env python
"""
Production에서 관리자 계정 생성 - PostgreSQL 전환용
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("=== Production Admin Account Creation ===\n")

try:
    # 기존 admin 계정 확인 및 삭제
    existing_admin = User.objects.filter(username='admin')
    if existing_admin.exists():
        print("Existing admin account found, deleting...")
        existing_admin.delete()
    
    # 새 관리자 계정 생성
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@ahp-platform.com',
        password='ahp2025admin',
        first_name='Admin',
        last_name='User'
    )
    
    print("✅ Admin account created successfully!")
    print(f"Username: {admin_user.username}")
    print(f"Email: {admin_user.email}")
    print("Password: ahp2025admin")
    print(f"Superuser: {admin_user.is_superuser}")
    print(f"Staff: {admin_user.is_staff}")
    
    # 데이터베이스 상태 확인
    total_users = User.objects.count()
    admin_count = User.objects.filter(is_superuser=True).count()
    
    print(f"\n📊 Database Status:")
    print(f"Total Users: {total_users}")
    print(f"Admin Users: {admin_count}")
    
except Exception as e:
    print(f"❌ Error occurred: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Completed ===")