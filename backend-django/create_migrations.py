#!/usr/bin/env python
"""
Django 마이그레이션 생성 스크립트
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.core.management import call_command

print("=== Django 마이그레이션 생성 ===\n")

try:
    # 마이그레이션 생성
    print("1. simple_service 앱 마이그레이션 생성...")
    call_command('makemigrations', 'simple_service', verbosity=2)
    
    print("\n2. 모든 앱 마이그레이션 확인...")
    call_command('makemigrations', verbosity=2)
    
    print("\n✅ 마이그레이션 생성 완료!")
    print("\n다음 단계:")
    print("1. git add .")
    print("2. git commit -m 'Add database optimizations and migrations'")
    print("3. git push")
    print("4. Render.com에서 자동 배포 및 마이그레이션 실행")
    
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()

print("\n=== 완료 ===")