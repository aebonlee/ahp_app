#!/usr/bin/env python
"""
데이터베이스 스키마 강제 수정 스크립트
- simple_projects 테이블에 objective, visibility 컬럼 추가
- 익명 사용자 생성
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.db import connection, transaction
from django.contrib.auth import get_user_model

def fix_database_schema():
    print("🔧 데이터베이스 스키마 수정 시작...")
    
    with connection.cursor() as cursor:
        try:
            # 1. 데이터베이스 타입 확인 후 적절한 쿼리 사용
            print("📊 simple_projects 테이블 구조 확인 중...")
            
            # SQLite와 PostgreSQL 모두 지원하는 방식
            try:
                # PostgreSQL 방식 시도
                cursor.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'simple_projects'
                """)
                columns = cursor.fetchall()
                existing_columns = [col[0] for col in columns]
                print(f"PostgreSQL 사용 중 - 기존 컬럼: {existing_columns}")
            except Exception as pg_error:
                print(f"PostgreSQL 쿼리 실패: {pg_error}")
                print("SQLite 쿼리로 전환...")
                
                # SQLite 방식으로 전환
                cursor.execute("PRAGMA table_info(simple_projects);")
                columns = cursor.fetchall()
                existing_columns = [col[1] for col in columns]
                print(f"SQLite 사용 중 - 기존 컬럼: {existing_columns}")
            
            # 2. objective 컬럼 추가 (없는 경우)
            if 'objective' not in existing_columns:
                print("➕ objective 컬럼 추가 중...")
                cursor.execute("ALTER TABLE simple_projects ADD COLUMN objective TEXT DEFAULT '';")
                print("✅ objective 컬럼 추가 완료")
            else:
                print("ℹ️ objective 컬럼 이미 존재")
            
            # 3. visibility 컬럼 추가 (없는 경우)
            if 'visibility' not in existing_columns:
                print("➕ visibility 컬럼 추가 중...")
                cursor.execute("ALTER TABLE simple_projects ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';")
                print("✅ visibility 컬럼 추가 완료")
            else:
                print("ℹ️ visibility 컬럼 이미 존재")
                
        except Exception as e:
            print(f"❌ 데이터베이스 스키마 수정 오류: {e}")
    
    # 4. 익명 사용자 생성
    print("👤 익명 사용자 생성 중...")
    User = get_user_model()
    try:
        anonymous_user, created = User.objects.get_or_create(
            username='anonymous',
            defaults={
                'email': 'anonymous@ahp.com',
                'first_name': '익명',
                'last_name': '사용자',
                'is_active': True,
                'user_type': 'personal'  # super_admin 모델의 경우
            }
        )
        if created:
            print("✅ 익명 사용자 생성 완료")
        else:
            print("ℹ️ 익명 사용자 이미 존재")
            
        print(f"👤 익명 사용자 ID: {anonymous_user.id}")
        print(f"📧 이메일: {anonymous_user.email}")
        
    except Exception as e:
        print(f"⚠️ 익명 사용자 생성 오류: {e}")
    
    print("🎉 데이터베이스 스키마 수정 완료!")

if __name__ == '__main__':
    fix_database_schema()