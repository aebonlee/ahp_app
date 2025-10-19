#!/usr/bin/env python
"""
Super Admin 계정 생성 스크립트
CustomUser 모델을 사용하여 관리자 계정 생성
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

print("=== AHP Platform Super Admin 계정 생성 ===\n")

def create_admin_user(username, email, password, first_name="Admin", last_name="User"):
    """관리자 계정 생성"""
    try:
        # 기존 계정 확인
        if User.objects.filter(username=username).exists():
            print(f"✅ 사용자명 '{username}'으로 된 계정이 이미 존재합니다.")
            user = User.objects.get(username=username)
        elif User.objects.filter(email=email).exists():
            print(f"✅ 이메일 '{email}'로 된 계정이 이미 존재합니다.")
            user = User.objects.get(email=email)
        else:
            # 새 관리자 계정 생성
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            print(f"✅ 새 관리자 계정이 생성되었습니다: {username}")
        
        # 관리자 권한 설정
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.is_verified = True
        user.user_type = 'super_admin'
        user.subscription_tier = 'unlimited'
        user.save()
        
        print(f"📊 계정 정보:")
        print(f"   - 사용자명: {user.username}")
        print(f"   - 이메일: {user.email}")
        print(f"   - 이름: {user.get_full_name()}")
        print(f"   - 사용자 유형: {user.get_user_type_display()}")
        print(f"   - 구독 티어: {user.get_subscription_tier_display()}")
        print(f"   - 스태프 권한: {'예' if user.is_staff else '아니오'}")
        print(f"   - 슈퍼유저 권한: {'예' if user.is_superuser else '아니오'}")
        print(f"   - 계정 활성화: {'예' if user.is_active else '아니오'}")
        print(f"   - 이메일 인증: {'예' if user.is_verified else '아니오'}")
        
        return user
        
    except ValidationError as e:
        print(f"❌ 계정 생성 중 검증 오류 발생: {e}")
        return None
    except Exception as e:
        print(f"❌ 계정 생성 중 오류 발생: {str(e)}")
        return None

try:
    # 주요 관리자 계정 생성
    print("🔧 관리자 계정 생성 중...\n")
    
    admin_accounts = [
        {
            'username': 'admin',
            'email': 'admin@ahp-platform.com',
            'password': 'ahp2025admin',
            'first_name': 'AHP',
            'last_name': 'Administrator'
        }
    ]
    
    for account in admin_accounts:
        print(f"👤 계정 생성: {account['username']}")
        user = create_admin_user(**account)
        if user:
            print(f"✅ 성공적으로 생성/업데이트됨\n")
        else:
            print(f"❌ 생성 실패\n")
    
    # 전체 사용자 통계
    print("📈 사용자 통계:")
    total_users = User.objects.count()
    admin_users = User.objects.filter(is_superuser=True).count()
    staff_users = User.objects.filter(is_staff=True).count()
    active_users = User.objects.filter(is_active=True).count()
    
    print(f"   - 전체 사용자: {total_users}명")
    print(f"   - 슈퍼 관리자: {admin_users}명")
    print(f"   - 스태프: {staff_users}명")
    print(f"   - 활성 사용자: {active_users}명")
    
    print(f"\n🎉 관리자 계정 설정이 완료되었습니다!")
    print(f"📍 Django Admin 로그인: https://ahp-django-backend.onrender.com/admin/")
    print(f"🔑 로그인 정보:")
    print(f"   - 사용자명: admin")
    print(f"   - 이메일: admin@ahp-platform.com")
    print(f"   - 비밀번호: ahp2025admin")
    
except Exception as e:
    print(f"💥 전체 프로세스 중 오류 발생: {str(e)}")
    sys.exit(1)