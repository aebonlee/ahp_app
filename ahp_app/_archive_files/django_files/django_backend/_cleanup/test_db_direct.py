#!/usr/bin/env python
"""
Direct database connection test script
"""

import os
import sys
import psycopg2
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Database connection details from settings
DATABASE_URL = os.environ.get('DATABASE_URL', 
    'postgresql://ahp_app_user:xEcCdn2WB32sxLYIPAncc9cHARXf1t6d@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app')

def test_database_connection():
    """Test direct PostgreSQL connection"""
    try:
        print("🔍 PostgreSQL 데이터베이스 연결 테스트...")
        print(f"📍 연결 대상: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Hidden'}")
        
        # Parse connection URL
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Test basic connection
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"✅ 기본 연결 테스트: {result[0]}")
        
        # Check database version
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        print(f"📊 PostgreSQL 버전: {version}")
        
        # List all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        print(f"📋 총 테이블 수: {len(tables)}")
        
        if tables:
            print("📄 테이블 목록:")
            for table in tables[:10]:  # Show first 10 tables
                cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
                count = cursor.fetchone()[0]
                print(f"   - {table[0]}: {count} 레코드")
            
            if len(tables) > 10:
                print(f"   ... 및 {len(tables) - 10}개 추가 테이블")
        
        # Check for Django-specific tables
        django_tables = ['django_migrations', 'auth_user', 'django_content_type']
        print(f"\n🔧 Django 시스템 테이블 확인:")
        for table in django_tables:
            cursor.execute(f"""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = '{table}' AND table_schema = 'public'
            """)
            exists = cursor.fetchone()[0] > 0
            if exists:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   ✅ {table}: {count} 레코드")
            else:
                print(f"   ❌ {table}: 테이블 없음")
        
        # Check for AHP-specific tables
        ahp_tables = ['accounts_user', 'projects_project', 'evaluations_evaluation']
        print(f"\n🎯 AHP 애플리케이션 테이블 확인:")
        for table in ahp_tables:
            cursor.execute(f"""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = '{table}' AND table_schema = 'public'
            """)
            exists = cursor.fetchone()[0] > 0
            if exists:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   ✅ {table}: {count} 레코드")
            else:
                print(f"   ⚠️ {table}: 테이블 없음 (마이그레이션 필요)")
        
        cursor.close()
        conn.close()
        
        print(f"\n🎉 데이터베이스 연결 테스트 완료!")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ PostgreSQL 오류: {e}")
        return False
    except Exception as e:
        print(f"❌ 연결 테스트 실패: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)