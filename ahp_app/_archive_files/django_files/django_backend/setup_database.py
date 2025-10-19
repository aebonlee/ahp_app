#!/usr/bin/env python
"""
PostgreSQL Database Setup Script for AHP Platform
자동으로 데이터베이스 테이블을 생성하고 초기 데이터를 설정합니다.
"""

import os
import sys
import django
from pathlib import Path

# Django 프로젝트 경로 설정
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Django 설정 로드
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection

def check_database_connection():
    """데이터베이스 연결 확인"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                print("✅ 데이터베이스 연결 성공")
                cursor.execute("SELECT current_database(), current_user, version()")
                db_info = cursor.fetchone()
                print(f"📊 Database: {db_info[0]}")
                print(f"👤 User: {db_info[1]}")
                print(f"🔧 PostgreSQL Version: {db_info[2].split(',')[0]}")
                return True
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

def run_migrations():
    """마이그레이션 실행"""
    try:
        print("\n🔄 마이그레이션 생성 중...")
        call_command('makemigrations', '--noinput')
        
        print("\n📝 마이그레이션 적용 중...")
        call_command('migrate', '--noinput')
        
        print("✅ 마이그레이션 완료")
        return True
    except Exception as e:
        print(f"❌ 마이그레이션 실패: {e}")
        return False

def create_superuser():
    """관리자 계정 생성"""
    User = get_user_model()
    
    # 기본 관리자 정보
    admin_username = 'admin'
    admin_email = 'admin@ahp-platform.com'
    admin_password = 'ahp2025admin'
    
    try:
        if User.objects.filter(username=admin_username).exists():
            print(f"ℹ️ 관리자 계정 '{admin_username}' 이미 존재")
            return True
            
        user = User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password
        )
        print(f"✅ 관리자 계정 생성 완료")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        return True
    except Exception as e:
        print(f"⚠️ 관리자 계정 생성 실패: {e}")
        return False

def create_test_data():
    """테스트 데이터 생성"""
    try:
        from apps.projects.models import Project
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        admin = User.objects.filter(is_superuser=True).first()
        
        if not admin:
            print("⚠️ 관리자 계정이 없어 테스트 데이터를 생성할 수 없습니다")
            return False
            
        # 샘플 프로젝트 생성
        if not Project.objects.exists():
            project = Project.objects.create(
                title="신제품 개발 의사결정",
                description="AHP를 활용한 신제품 개발 프로젝트 평가",
                objective="최적의 신제품 개발 방향 결정",
                owner=admin,
                status='active'
            )
            print(f"✅ 샘플 프로젝트 생성: {project.title}")
            
            # 기준 생성
            from apps.evaluations.models import Criteria
            
            criteria_data = [
                ("시장성", "시장 규모와 성장 가능성"),
                ("기술력", "기술적 실현 가능성과 우위"),
                ("수익성", "예상 수익과 ROI"),
                ("리스크", "개발 및 시장 리스크")
            ]
            
            for name, desc in criteria_data:
                Criteria.objects.create(
                    project=project,
                    name=name,
                    description=desc,
                    weight=0.25  # 초기 가중치
                )
            print(f"✅ 4개 기준 생성 완료")
            
            # 대안 생성
            alternatives_data = [
                ("제품 A", "혁신적 기능 중심"),
                ("제품 B", "가격 경쟁력 중심"),
                ("제품 C", "품질 우선 전략")
            ]
            
            for name, desc in alternatives_data:
                Criteria.objects.create(
                    project=project,
                    name=name,
                    description=desc,
                    is_alternative=True
                )
            print(f"✅ 3개 대안 생성 완료")
            
        else:
            print("ℹ️ 프로젝트가 이미 존재합니다")
            
        return True
    except Exception as e:
        print(f"⚠️ 테스트 데이터 생성 실패: {e}")
        return False

def check_tables():
    """생성된 테이블 확인"""
    try:
        with connection.cursor() as cursor:
            # PostgreSQL의 경우
            if connection.vendor == 'postgresql':
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name;
                """)
            else:
                # SQLite의 경우
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' 
                    ORDER BY name;
                """)
                
            tables = cursor.fetchall()
            print("\n📋 생성된 테이블 목록:")
            for table in tables:
                print(f"   - {table[0]}")
            
            # simple_projects 테이블 확인
            table_names = [t[0] for t in tables]
            if 'simple_projects' in table_names:
                print("✅ simple_projects 테이블 생성 확인")
            else:
                print("⚠️ simple_projects 테이블이 없습니다")
                
        return True
    except Exception as e:
        print(f"❌ 테이블 확인 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("AHP Platform - PostgreSQL 데이터베이스 설정")
    print("=" * 60)
    
    # 1. 데이터베이스 연결 확인
    if not check_database_connection():
        print("\n⚠️ 데이터베이스 연결 실패. 설정을 확인하세요.")
        return
    
    # 2. 마이그레이션 실행
    if not run_migrations():
        print("\n⚠️ 마이그레이션 실패. 오류를 확인하세요.")
        return
    
    # 3. 테이블 확인
    check_tables()
    
    # 4. 관리자 계정 생성
    create_superuser()
    
    # 5. 테스트 데이터 생성
    create_test_data()
    
    print("\n" + "=" * 60)
    print("✅ 데이터베이스 설정 완료!")
    print("=" * 60)
    
    print("\n📌 다음 단계:")
    print("1. Render.com 환경변수 설정")
    print("2. 백엔드 서버 재배포")
    print("3. API 엔드포인트 테스트")

if __name__ == "__main__":
    main()