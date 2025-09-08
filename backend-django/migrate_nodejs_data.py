#!/usr/bin/env python
"""
Node.js PostgreSQL 데이터를 Django로 마이그레이션하는 스크립트
사용자의 기존 데이터를 Django 모델로 이전합니다.
"""
import os
import sys
import django
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
django.setup()

from django.contrib.auth import get_user_model
from apps.projects.models import Project, Criterion, Alternative
from apps.evaluations.models import Evaluation, PairwiseComparison
from apps.workshops.models import Workshop
from django.db import transaction

User = get_user_model()

# 기존 Node.js PostgreSQL 연결 정보
NODEJS_DB_CONFIG = {
    'host': 'dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com',
    'database': 'ahp_app_vuzk',
    'user': 'ahp_app_vuzk_user',
    'password': 'YOUR_PASSWORD',  # 실제 비밀번호로 교체 필요
    'port': 5432
}

def get_nodejs_connection():
    """Node.js PostgreSQL 데이터베이스 연결"""
    try:
        conn = psycopg2.connect(**NODEJS_DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Node.js DB 연결 실패: {e}")
        return None

def migrate_users():
    """사용자 데이터 마이그레이션"""
    print("사용자 데이터 마이그레이션 시작...")
    
    conn = get_nodejs_connection()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Node.js users 테이블에서 데이터 조회
            cursor.execute("SELECT * FROM users ORDER BY created_at")
            nodejs_users = cursor.fetchall()
            
            migrated_count = 0
            for user_data in nodejs_users:
                try:
                    # Django User 모델로 생성
                    django_user, created = User.objects.get_or_create(
                        email=user_data['email'],
                        defaults={
                            'username': user_data['email'],
                            'full_name': f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                            'organization': user_data.get('organization', ''),
                            'is_evaluator': user_data.get('role') == 'evaluator',
                            'is_project_manager': user_data.get('role') in ['admin', 'project_manager'],
                            'is_active': user_data.get('is_active', True),
                            'date_joined': user_data.get('created_at', datetime.now()),
                        }
                    )
                    
                    if created:
                        # 비밀번호 설정 (해시된 상태로)
                        django_user.password = user_data.get('password_hash', '')
                        django_user.save()
                        migrated_count += 1
                        print(f"사용자 마이그레이션: {user_data['email']}")
                    
                except Exception as e:
                    print(f"사용자 마이그레이션 실패 ({user_data['email']}): {e}")
                    continue
            
            print(f"사용자 마이그레이션 완료: {migrated_count}명")
    
    except Exception as e:
        print(f"사용자 마이그레이션 오류: {e}")
    
    finally:
        conn.close()

def migrate_projects():
    """프로젝트 데이터 마이그레이션"""
    print("프로젝트 데이터 마이그레이션 시작...")
    
    conn = get_nodejs_connection()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM projects ORDER BY created_at")
            nodejs_projects = cursor.fetchall()
            
            migrated_count = 0
            for project_data in nodejs_projects:
                try:
                    # 프로젝트 소유자 찾기
                    owner = User.objects.filter(id=project_data.get('owner_id')).first()
                    if not owner:
                        print(f"프로젝트 소유자를 찾을 수 없음: {project_data.get('owner_id')}")
                        continue
                    
                    # Django Project 모델로 생성
                    django_project, created = Project.objects.get_or_create(
                        title=project_data['title'],
                        owner=owner,
                        defaults={
                            'description': project_data.get('description', ''),
                            'objective': project_data.get('objective', ''),
                            'status': project_data.get('status', 'draft'),
                            'created_at': project_data.get('created_at', datetime.now()),
                        }
                    )
                    
                    if created:
                        migrated_count += 1
                        print(f"프로젝트 마이그레이션: {project_data['title']}")
                    
                except Exception as e:
                    print(f"프로젝트 마이그레이션 실패 ({project_data['title']}): {e}")
                    continue
            
            print(f"프로젝트 마이그레이션 완료: {migrated_count}개")
    
    except Exception as e:
        print(f"프로젝트 마이그레이션 오류: {e}")
    
    finally:
        conn.close()

def migrate_criteria():
    """평가 기준 데이터 마이그레이션"""
    print("평가 기준 데이터 마이그레이션 시작...")
    
    conn = get_nodejs_connection()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM criteria ORDER BY project_id, created_at")
            nodejs_criteria = cursor.fetchall()
            
            migrated_count = 0
            for criteria_data in nodejs_criteria:
                try:
                    # 연결된 프로젝트 찾기
                    project = Project.objects.filter(id=criteria_data.get('project_id')).first()
                    if not project:
                        continue
                    
                    # Django Criterion 모델로 생성
                    django_criterion, created = Criterion.objects.get_or_create(
                        project=project,
                        name=criteria_data['name'],
                        defaults={
                            'description': criteria_data.get('description', ''),
                            'weight': criteria_data.get('weight', 0.0),
                            'order': criteria_data.get('order', 0),
                        }
                    )
                    
                    if created:
                        migrated_count += 1
                    
                except Exception as e:
                    print(f"평가 기준 마이그레이션 실패: {e}")
                    continue
            
            print(f"평가 기준 마이그레이션 완료: {migrated_count}개")
    
    except Exception as e:
        print(f"평가 기준 마이그레이션 오류: {e}")
    
    finally:
        conn.close()

def migrate_alternatives():
    """대안 데이터 마이그레이션"""
    print("대안 데이터 마이그레이션 시작...")
    
    conn = get_nodejs_connection()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM alternatives ORDER BY project_id, created_at")
            nodejs_alternatives = cursor.fetchall()
            
            migrated_count = 0
            for alternative_data in nodejs_alternatives:
                try:
                    # 연결된 프로젝트 찾기
                    project = Project.objects.filter(id=alternative_data.get('project_id')).first()
                    if not project:
                        continue
                    
                    # Django Alternative 모델로 생성
                    django_alternative, created = Alternative.objects.get_or_create(
                        project=project,
                        name=alternative_data['name'],
                        defaults={
                            'description': alternative_data.get('description', ''),
                            'order': alternative_data.get('order', 0),
                        }
                    )
                    
                    if created:
                        migrated_count += 1
                    
                except Exception as e:
                    print(f"대안 마이그레이션 실패: {e}")
                    continue
            
            print(f"대안 마이그레이션 완료: {migrated_count}개")
    
    except Exception as e:
        print(f"대안 마이그레이션 오류: {e}")
    
    finally:
        conn.close()

@transaction.atomic
def run_migration():
    """전체 마이그레이션 실행"""
    print("=== AHP Node.js → Django 데이터 마이그레이션 시작 ===")
    print(f"시작 시간: {datetime.now()}")
    
    try:
        # 순서대로 마이그레이션 실행
        migrate_users()
        migrate_projects()
        migrate_criteria()
        migrate_alternatives()
        
        print("\n=== 마이그레이션 완료 ===")
        print(f"완료 시간: {datetime.now()}")
        
        # 마이그레이션 결과 요약
        print("\n=== 마이그레이션 결과 요약 ===")
        print(f"사용자: {User.objects.count()}명")
        print(f"프로젝트: {Project.objects.count()}개")
        print(f"평가 기준: {Criterion.objects.count()}개")
        print(f"대안: {Alternative.objects.count()}개")
        
    except Exception as e:
        print(f"마이그레이션 실행 중 오류: {e}")
        raise

if __name__ == '__main__':
    print("Node.js 데이터를 Django로 마이그레이션합니다.")
    print("주의: 이 작업은 기존 Django 데이터를 덮어쓸 수 있습니다.")
    
    response = input("계속하시겠습니까? (y/N): ")
    if response.lower() == 'y':
        run_migration()
    else:
        print("마이그레이션이 취소되었습니다.")