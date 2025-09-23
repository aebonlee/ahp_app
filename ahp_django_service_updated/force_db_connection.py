#!/usr/bin/env python3
"""
강제 데이터베이스 연결 테스트
환경변수 없이도 PostgreSQL 연결 확인
"""
import os
import sys
import django
from django.conf import settings

# Django 설정 강제 적용
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

# 강제 PostgreSQL 설정 - 유료 인스턴스 사용
DATABASE_CONFIG = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ahp_app_db',  # Render.com에서 확인 필요
        'USER': 'ahp_app_user',  # Render.com에서 확인 필요
        'PASSWORD': 'YOUR_PASSWORD',  # Render.com에서 확인 필요
        'HOST': 'dpg-d2q8l5qdbo4c73bt3780-a.oregon-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            'connect_timeout': 60,
        },
        'CONN_MAX_AGE': 600,
    }
}

def test_connection():
    """데이터베이스 연결 테스트"""
    try:
        django.setup()
        from django.db import connection
        
        print("🔧 Testing PostgreSQL connection...")
        print(f"📊 Database: {connection.settings_dict['NAME']}")
        print(f"🏠 Host: {connection.settings_dict['HOST']}")
        print(f"👤 User: {connection.settings_dict['USER']}")
        
        # 연결 테스트
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL Version: {version[0]}")
            
            # 테이블 목록 확인
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"📋 Tables found: {len(tables)}")
            for table in tables:
                print(f"  - {table[0]}")
                
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    # 환경변수 강제 설정
    os.environ['DATABASE_URL'] = 'postgresql://ahp_app_user:xEcCdn2WB32sxLYIPAncc9cHARXf1t6d@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app'
    
    success = test_connection()
    sys.exit(0 if success else 1)