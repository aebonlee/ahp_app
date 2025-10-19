#!/usr/bin/env python
"""
관리자 계정 강제 재생성 스크립트
기존 관리자 계정이 있어도 새로 생성
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("=== 관리자 계정 강제 생성 ===\n")

try:
    # 기존 admin 사용자 삭제 (있다면)
    existing_admin = User.objects.filter(username='admin')
    if existing_admin.exists():
        existing_admin.delete()
        print("✅ 기존 admin 계정 삭제 완료")
    
    # 새 관리자 계정 생성
    admin_user = User.objects.create_superuser(
        username='admin',
        email='admin@ahp-platform.com',
        password='ahp2025admin',
        first_name='Admin',
        last_name='User'
    )
    
    print("✅ 새 관리자 계정 생성 완료!")
    print(f"Username: {admin_user.username}")
    print(f"Email: {admin_user.email}")
    print("Password: ahp2025admin")
    print(f"Superuser: {admin_user.is_superuser}")
    print(f"Staff: {admin_user.is_staff}")
    
    # 추가 테스트 사용자 생성
    if not User.objects.filter(username='testuser').exists():
        test_user = User.objects.create_user(
            username='testuser',
            email='test@ahp-platform.com',
            password='testpass123'
        )
        print(f"✅ 테스트 사용자도 생성: {test_user.username}")
    
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    
print("\n=== 계정 생성 완료 ===")