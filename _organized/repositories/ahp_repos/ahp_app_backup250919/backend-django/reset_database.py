#!/usr/bin/env python
"""
PostgreSQL 데이터베이스 완전 초기화 스크립트
2차 개발을 위한 안정화 버전
"""
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from django.core.management import call_command

def reset_database():
    """데이터베이스 완전 초기화"""
    print("=" * 60)
    print("PostgreSQL 데이터베이스 초기화 시작")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        try:
            # 1. 기존 테이블 삭제 (CASCADE로 의존성 해결)
            print("\n1. 기존 테이블 삭제 중...")
            cursor.execute("""
                DROP TABLE IF EXISTS 
                    simple_data,
                    simple_results,
                    simple_comparisons,
                    simple_criteria,
                    simple_projects
                CASCADE;
            """)
            print("✅ 기존 테이블 삭제 완료")
            
            # 2. Django 마이그레이션 테이블 초기화
            print("\n2. 마이그레이션 기록 초기화 중...")
            cursor.execute("""
                DELETE FROM django_migrations 
                WHERE app = 'simple_service';
            """)
            print("✅ 마이그레이션 기록 초기화 완료")
            
            # 3. 새로운 테이블 생성 (안정화된 스키마)
            print("\n3. 새로운 테이블 생성 중...")
            
            # SimpleProject 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS simple_projects (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    description TEXT DEFAULT '',
                    objective TEXT DEFAULT '',
                    visibility VARCHAR(20) DEFAULT 'private',
                    status VARCHAR(20) DEFAULT 'draft',
                    is_public BOOLEAN DEFAULT FALSE,
                    created_by_id INTEGER DEFAULT 1,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_projects_created_by 
                    ON simple_projects(created_by_id);
                CREATE INDEX IF NOT EXISTS idx_projects_created_at 
                    ON simple_projects(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_projects_status 
                    ON simple_projects(status);
            """)
            print("✅ simple_projects 테이블 생성 완료")
            
            # SimpleCriteria 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS simple_criteria (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
                    name VARCHAR(200) NOT NULL,
                    description TEXT DEFAULT '',
                    type VARCHAR(20) DEFAULT 'criteria',
                    parent_id INTEGER REFERENCES simple_criteria(id) ON DELETE CASCADE,
                    "order" INTEGER DEFAULT 0,
                    weight FLOAT DEFAULT 0.0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_criteria_project 
                    ON simple_criteria(project_id);
                CREATE INDEX IF NOT EXISTS idx_criteria_order 
                    ON simple_criteria("order");
                CREATE UNIQUE INDEX IF NOT EXISTS idx_criteria_unique 
                    ON simple_criteria(project_id, name);
            """)
            print("✅ simple_criteria 테이블 생성 완료")
            
            # SimpleComparison 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS simple_comparisons (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
                    criteria_a_id INTEGER NOT NULL REFERENCES simple_criteria(id) ON DELETE CASCADE,
                    criteria_b_id INTEGER NOT NULL REFERENCES simple_criteria(id) ON DELETE CASCADE,
                    value FLOAT DEFAULT 1.0,
                    created_by_id INTEGER DEFAULT 1,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_comparisons_project 
                    ON simple_comparisons(project_id);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_comparisons_unique 
                    ON simple_comparisons(project_id, criteria_a_id, criteria_b_id);
            """)
            print("✅ simple_comparisons 테이블 생성 완료")
            
            # SimpleResult 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS simple_results (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
                    criteria_id INTEGER NOT NULL REFERENCES simple_criteria(id) ON DELETE CASCADE,
                    weight FLOAT NOT NULL,
                    rank INTEGER NOT NULL,
                    created_by_id INTEGER DEFAULT 1,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_results_project 
                    ON simple_results(project_id);
                CREATE INDEX IF NOT EXISTS idx_results_rank 
                    ON simple_results(rank);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_results_unique 
                    ON simple_results(project_id, criteria_id);
            """)
            print("✅ simple_results 테이블 생성 완료")
            
            # SimpleData 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS simple_data (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
                    key VARCHAR(100) NOT NULL,
                    value TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_data_project 
                    ON simple_data(project_id);
                CREATE UNIQUE INDEX IF NOT EXISTS idx_data_unique 
                    ON simple_data(project_id, key);
            """)
            print("✅ simple_data 테이블 생성 완료")
            
            # 4. 시스템 사용자 생성
            print("\n4. 시스템 사용자 생성 중...")
            User = get_user_model()
            
            # auth_user 테이블에 시스템 사용자 생성
            cursor.execute("""
                INSERT INTO auth_user (
                    id, password, last_login, is_superuser, username, 
                    first_name, last_name, email, is_staff, is_active, date_joined
                )
                VALUES (
                    1, '', NULL, true, 'system', 
                    'System', 'User', 'system@ahp.com', true, true, NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    username = 'system',
                    email = 'system@ahp.com',
                    is_active = true;
            """)
            print("✅ 시스템 사용자 (ID=1) 생성 완료")
            
            # 5. 테스트 데이터 삽입
            print("\n5. 테스트 데이터 삽입 중...")
            cursor.execute("""
                INSERT INTO simple_projects (title, description, created_by_id)
                VALUES 
                    ('테스트 프로젝트', '2차 개발 테스트용 프로젝트입니다.', 1),
                    ('샘플 AHP 분석', '안정화 버전 테스트', 1);
            """)
            print("✅ 테스트 프로젝트 생성 완료")
            
            # 6. 권한 및 제약조건 설정
            print("\n6. 권한 및 제약조건 설정 중...")
            cursor.execute("""
                -- created_by_id를 선택적으로 만들기 (NULL 허용)
                ALTER TABLE simple_projects 
                    ALTER COLUMN created_by_id DROP NOT NULL;
                
                ALTER TABLE simple_comparisons 
                    ALTER COLUMN created_by_id DROP NOT NULL;
                
                ALTER TABLE simple_results 
                    ALTER COLUMN created_by_id DROP NOT NULL;
            """)
            print("✅ 제약조건 완화 완료")
            
            print("\n" + "=" * 60)
            print("✅ 데이터베이스 초기화 완료!")
            print("=" * 60)
            
            # 7. 상태 확인
            cursor.execute("SELECT COUNT(*) FROM simple_projects")
            project_count = cursor.fetchone()[0]
            print(f"\n📊 현재 프로젝트 수: {project_count}")
            
            cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'simple_%'")
            tables = cursor.fetchall()
            print("\n📋 생성된 테이블:")
            for table in tables:
                print(f"   - {table[0]}")
            
        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            raise

if __name__ == "__main__":
    if input("\n⚠️  경고: 모든 simple_service 데이터가 삭제됩니다. 계속하시겠습니까? (yes/no): ").lower() == 'yes':
        reset_database()
    else:
        print("취소되었습니다.")