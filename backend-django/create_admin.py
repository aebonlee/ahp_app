#!/usr/bin/env python
"""
간단한 관리자 계정 생성 스크립트
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# 관리자 계정들 생성
admin_accounts = [
    {
        'username': 'admin',
        'email': 'admin@ahp-platform.com',
        'password': 'ahp2025admin',
        'first_name': 'System',
        'last_name': 'Admin'
    },
    {
        'username': 'aebon',
        'email': 'aebon@example.com',
        'password': 'aebon2025',
        'first_name': 'aebon',
        'last_name': 'Super Admin'
    }
]

for account in admin_accounts:
    try:
        if User.objects.filter(username=account['username']).exists():
            print(f"✅ {account['username']} 계정이 이미 존재합니다.")
            # 기존 사용자 업데이트 (aebon을 super admin으로 보장)
            user = User.objects.get(username=account['username'])
            user.is_superuser = True
            user.is_staff = True
            user.first_name = account['first_name']
            user.last_name = account['last_name']
            user.save()
            print(f"👑 {account['username']} 계정 권한 업데이트 완료!")
        else:
            User.objects.create_superuser(
                username=account['username'],
                email=account['email'],
                password=account['password'],
                first_name=account['first_name'],
                last_name=account['last_name']
            )
            print(f"✅ {account['username']} 계정 생성 완료!")
            print(f"Username: {account['username']}")
            print(f"Password: {account['password']}")
            if account['username'] == 'aebon':
                print("👑 AEBON - ULTIMATE SUPER ADMIN 권한 부여!")
    except Exception as e:
        print(f"❌ {account['username']} 계정 생성 오류: {e}")