#!/usr/bin/env python
"""
Django 데이터베이스 상태 확인 스크립트
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from simple_service.models import SimpleProject, SimpleData

print("=== Django 데이터베이스 상태 확인 ===\n")

# 사용자 정보
try:
    user_count = User.objects.count()
    admin_users = User.objects.filter(is_superuser=True)
    
    print(f"📊 총 사용자 수: {user_count}")
    print(f"👑 관리자 계정 수: {admin_users.count()}")
    
    if admin_users.exists():
        print("관리자 목록:")
        for admin in admin_users:
            print(f"  - {admin.username} ({admin.email})")
    else:
        print("⚠️  관리자 계정이 없습니다!")
    print()

except Exception as e:
    print(f"❌ 사용자 정보 조회 실패: {e}\n")

# 프로젝트 정보
try:
    project_count = SimpleProject.objects.count()
    projects = SimpleProject.objects.all()[:5]
    
    print(f"📁 총 프로젝트 수: {project_count}")
    if projects:
        print("최근 프로젝트:")
        for proj in projects:
            print(f"  - {proj.title} ({proj.status}) - {proj.created_at}")
    print()
    
except Exception as e:
    print(f"❌ 프로젝트 정보 조회 실패: {e}\n")

# 데이터 정보
try:
    data_count = SimpleData.objects.count()
    print(f"💾 총 데이터 항목 수: {data_count}")
    
    if data_count > 0:
        recent_data = SimpleData.objects.all()[:3]
        print("최근 데이터:")
        for data in recent_data:
            print(f"  - Project {data.project}: {data.key}")
    print()
    
except Exception as e:
    print(f"❌ 데이터 정보 조회 실패: {e}\n")

print("=== 확인 완료 ===")