#!/usr/bin/env python
"""
프로젝트 생성 문제 해결 스크립트
- SimpleProject 모델 필드 추가 (objective, visibility)
- 익명 사용자 생성
- 마이그레이션 적용
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line

def main():
    print("🔧 프로젝트 생성 문제 해결 중...")
    
    # 1. 마이그레이션 생성
    print("📝 마이그레이션 생성 중...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'simple_service'])
        print("✅ 마이그레이션 생성 완료")
    except Exception as e:
        print(f"⚠️ 마이그레이션 생성 오류: {e}")
    
    # 2. 마이그레이션 적용
    print("🔄 마이그레이션 적용 중...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ 마이그레이션 적용 완료")
    except Exception as e:
        print(f"⚠️ 마이그레이션 적용 오류: {e}")
    
    # 3. 익명 사용자 생성
    print("👤 익명 사용자 생성 중...")
    User = get_user_model()
    try:
        anonymous_user, created = User.objects.get_or_create(
            username='anonymous',
            defaults={
                'email': 'anonymous@ahp.com',
                'first_name': '익명',
                'last_name': '사용자',
                'is_active': True
            }
        )
        if created:
            print("✅ 익명 사용자 생성 완료")
        else:
            print("ℹ️ 익명 사용자 이미 존재")
    except Exception as e:
        print(f"⚠️ 익명 사용자 생성 오류: {e}")
    
    print("🎉 프로젝트 생성 문제 해결 완료!")
    print("💡 이제 프론트엔드에서 프로젝트 생성을 테스트해보세요.")

if __name__ == '__main__':
    main()