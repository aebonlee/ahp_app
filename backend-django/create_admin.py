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

from django.contrib.auth.models import User

# 관리자 계정 생성
try:
    if User.objects.filter(username='admin').exists():
        print("✅ 관리자 계정이 이미 존재합니다.")
    else:
        User.objects.create_superuser(
            username='admin',
            email='admin@ahp-platform.com',
            password='ahp2025admin'
        )
        print("✅ 관리자 계정 생성 완료!")
        print("Username: admin")
        print("Password: ahp2025admin")
except Exception as e:
    print(f"❌ 오류: {e}")