#!/usr/bin/env python
"""
PostgreSQL 데이터베이스 연결 테스트 스크립트
"""
import os
import sys
import django
from django.core.exceptions import ImproperlyConfigured

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

try:
    django.setup()
    print("✅ Django 설정 로드 성공")
except Exception as e:
    print(f"❌ Django 설정 로드 실패: {e}")
    sys.exit(1)

# 데이터베이스 연결 테스트
try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ PostgreSQL 연결 성공!")
        print(f"   버전: {version[0]}")
        
        # 데이터베이스 정보
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()
        print(f"   데이터베이스: {db_name[0]}")
        
        cursor.execute("SELECT current_user;")
        user = cursor.fetchone()
        print(f"   사용자: {user[0]}")
        
except Exception as e:
    print(f"❌ PostgreSQL 연결 실패: {e}")
    print("\n환경변수 확인:")
    print(f"   DATABASE_NAME: {os.environ.get('DATABASE_NAME', 'NOT SET')}")
    print(f"   DATABASE_USER: {os.environ.get('DATABASE_USER', 'NOT SET')}")
    print(f"   DATABASE_HOST: {os.environ.get('DATABASE_HOST', 'NOT SET')}")
    print(f"   DATABASE_PORT: {os.environ.get('DATABASE_PORT', 'NOT SET')}")
    print(f"   DATABASE_PASSWORD: {'SET' if os.environ.get('DATABASE_PASSWORD') else 'NOT SET'}")
    sys.exit(1)

print("\n=== 연결 테스트 완료 ===")