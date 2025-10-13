#!/usr/bin/env python3
"""
영구 데이터 보존 시스템 설정 스크립트
재배포 시에도 데이터가 유지되도록 보장
"""

import os
import sys
import shutil
import json
from pathlib import Path
from datetime import datetime

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

import django
django.setup()

from django.core.management import call_command
from django.db import connection
from django.conf import settings
from django.contrib.auth import get_user_model

def setup_persistent_directories():
    """영구 저장소 디렉토리 설정"""
    persistent_dirs = [
        '/opt/render/project/src/persistent_data',
        '/opt/render/project/src/persistent_data/backups',
        '/opt/render/project/src/persistent_data/media',
        '/opt/render/project/src/persistent_data/logs',
    ]
    
    for directory in persistent_dirs:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created persistent directory: {directory}")

def backup_existing_data():
    """기존 데이터 백업"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"/opt/render/project/src/persistent_data/backups/backup_{timestamp}"
    
    try:
        os.makedirs(backup_dir, exist_ok=True)
        
        # SQLite 백업
        sqlite_path = settings.DATABASES['default']['NAME']
        if os.path.exists(sqlite_path):
            backup_sqlite_path = f"{backup_dir}/db.sqlite3"
            shutil.copy2(sqlite_path, backup_sqlite_path)
            print(f"✓ Database backed up to: {backup_sqlite_path}")
        
        # 미디어 파일 백업
        if hasattr(settings, 'MEDIA_ROOT') and os.path.exists(settings.MEDIA_ROOT):
            backup_media_path = f"{backup_dir}/media"
            shutil.copytree(settings.MEDIA_ROOT, backup_media_path, dirs_exist_ok=True)
            print(f"✓ Media files backed up to: {backup_media_path}")
            
        return backup_dir
    except Exception as e:
        print(f"⚠️ Backup failed: {e}")
        return None

def restore_from_backup():
    """최신 백업에서 데이터 복원"""
    backup_base = "/opt/render/project/src/persistent_data/backups"
    
    if not os.path.exists(backup_base):
        print("ℹ️ No backup directory found, starting fresh")
        return False
    
    # 최신 백업 찾기
    backups = [d for d in os.listdir(backup_base) if d.startswith('backup_')]
    if not backups:
        print("ℹ️ No backups found, starting fresh")
        return False
    
    latest_backup = sorted(backups)[-1]
    backup_path = f"{backup_base}/{latest_backup}"
    
    try:
        # SQLite 복원
        backup_db_path = f"{backup_path}/db.sqlite3"
        if os.path.exists(backup_db_path):
            target_db_path = settings.DATABASES['default']['NAME']
            os.makedirs(os.path.dirname(target_db_path), exist_ok=True)
            shutil.copy2(backup_db_path, target_db_path)
            print(f"✓ Database restored from: {backup_db_path}")
            return True
            
    except Exception as e:
        print(f"⚠️ Restore failed: {e}")
        return False
    
    return False

def verify_database_integrity():
    """데이터베이스 무결성 검증"""
    try:
        with connection.cursor() as cursor:
            # 테이블 존재 확인
            if 'sqlite' in connection.vendor:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            else:
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
            
            tables = [row[0] for row in cursor.fetchall()]
            
            required_tables = ['simple_projects', 'auth_user', 'django_migrations']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                print(f"⚠️ Missing tables: {missing_tables}")
                return False
            
            print(f"✓ Database integrity verified. Tables: {len(tables)}")
            return True
            
    except Exception as e:
        print(f"❌ Database integrity check failed: {e}")
        return False

def setup_admin_user():
    """관리자 사용자 설정"""
    try:
        User = get_user_model()
        
        # 기존 관리자 확인
        if User.objects.filter(username='admin').exists():
            print("ℹ️ Admin user already exists")
            return
        
        # 새 관리자 생성
        User.objects.create_superuser(
            username='admin',
            email='admin@ahp-platform.com',
            password='AHP2025!Admin'
        )
        print("✓ Admin user created: admin / AHP2025!Admin")
        
    except Exception as e:
        print(f"⚠️ Admin user setup failed: {e}")

def create_sample_data():
    """샘플 데이터 생성 (기존 데이터 없을 경우)"""
    try:
        from apps.projects.models import Project, Criteria
        
        if Project.objects.exists():
            print("ℹ️ Existing project data found, skipping sample data creation")
            return
        
        # 샘플 프로젝트 생성
        User = get_user_model()
        admin_user = User.objects.get(username='admin')
        
        sample_project = Project.objects.create(
            title="샘플 AHP 프로젝트",
            description="재배포 테스트용 샘플 프로젝트",
            objective="시스템 안정성 검증",
            owner=admin_user,
            status='active'
        )
        
        # 샘플 기준 생성
        criteria_list = [
            {"name": "비용", "description": "총 소요 비용", "type": "criteria"},
            {"name": "품질", "description": "제품/서비스 품질", "type": "criteria"},
            {"name": "시간", "description": "소요 시간", "type": "criteria"},
        ]
        
        for i, criteria_data in enumerate(criteria_list):
            Criteria.objects.create(
                project=sample_project,
                name=criteria_data["name"],
                description=criteria_data["description"],
                type=criteria_data["type"],
                order=i
            )
        
        print(f"✓ Sample project created: {sample_project.title}")
        print(f"✓ Sample criteria created: {len(criteria_list)} items")
        
    except Exception as e:
        print(f"⚠️ Sample data creation failed: {e}")

def save_deployment_log():
    """배포 로그 저장"""
    try:
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'database_engine': settings.DATABASES['default']['ENGINE'],
            'database_path': str(settings.DATABASES['default']['NAME']),
            'tables_count': None,
            'status': 'unknown'
        }
        
        # 테이블 수 확인
        try:
            with connection.cursor() as cursor:
                if 'sqlite' in connection.vendor:
                    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
                else:
                    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
                log_data['tables_count'] = cursor.fetchone()[0]
                log_data['status'] = 'success'
        except:
            log_data['status'] = 'database_error'
        
        log_file = '/opt/render/project/src/persistent_data/logs/deployment.json'
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        print(f"✓ Deployment log saved: {log_file}")
        
    except Exception as e:
        print(f"⚠️ Deployment log save failed: {e}")

def main():
    """메인 실행 함수"""
    print("🚀 Starting persistent data setup...")
    
    # 1. 영구 디렉토리 설정
    setup_persistent_directories()
    
    # 2. 기존 데이터 백업
    backup_existing_data()
    
    # 3. 백업에서 복원 시도
    restored = restore_from_backup()
    
    # 4. 복원 실패 시 새로 마이그레이션
    if not restored:
        print("📋 Running fresh migrations...")
        call_command('makemigrations', verbosity=1, interactive=False)
        call_command('migrate', verbosity=1, interactive=False)
    
    # 5. 데이터베이스 무결성 검증
    if verify_database_integrity():
        print("✅ Database integrity verified")
    else:
        print("❌ Database integrity failed, running migrations...")
        call_command('migrate', verbosity=2, interactive=False)
    
    # 6. 관리자 사용자 설정
    setup_admin_user()
    
    # 7. 샘플 데이터 생성 (필요시)
    create_sample_data()
    
    # 8. 배포 로그 저장
    save_deployment_log()
    
    print("✅ Persistent data setup completed successfully!")

if __name__ == '__main__':
    main()