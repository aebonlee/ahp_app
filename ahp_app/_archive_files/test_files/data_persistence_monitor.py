#!/usr/bin/env python3
"""
데이터 영속성 모니터링 시스템
재배포 전후 데이터 상태를 추적하고 보고
"""

import os
import sys
import json
import sqlite3
from datetime import datetime
from pathlib import Path

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

import django
django.setup()

from django.db import connection
from django.conf import settings

class DataPersistenceMonitor:
    def __init__(self):
        self.persistent_base = '/opt/render/project/src/persistent_data'
        self.log_file = f'{self.persistent_base}/logs/persistence_monitor.json'
        self.status_file = f'{self.persistent_base}/logs/status.json'
        
    def ensure_directories(self):
        """필요한 디렉토리 생성"""
        directories = [
            self.persistent_base,
            f'{self.persistent_base}/logs',
            f'{self.persistent_base}/backups',
            f'{self.persistent_base}/media'
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            
    def get_database_stats(self):
        """데이터베이스 통계 수집"""
        try:
            with connection.cursor() as cursor:
                stats = {
                    'timestamp': datetime.now().isoformat(),
                    'database_engine': connection.vendor,
                    'database_path': str(settings.DATABASES['default']['NAME']),
                    'tables': [],
                    'table_counts': {},
                    'total_records': 0
                }
                
                # 테이블 목록 가져오기
                if 'sqlite' in connection.vendor:
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
                else:
                    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
                
                tables = [row[0] for row in cursor.fetchall()]
                stats['tables'] = tables
                
                # 각 테이블의 레코드 수 확인
                for table in tables:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table};")
                        count = cursor.fetchone()[0]
                        stats['table_counts'][table] = count
                        stats['total_records'] += count
                    except Exception as e:
                        stats['table_counts'][table] = f"Error: {str(e)}"
                
                return stats
                
        except Exception as e:
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'database_accessible': False
            }
    
    def check_file_persistence(self):
        """파일 영속성 확인"""
        db_path = settings.DATABASES['default']['NAME']
        
        file_status = {
            'database_file': {
                'path': db_path,
                'exists': os.path.exists(db_path),
                'size': os.path.getsize(db_path) if os.path.exists(db_path) else 0,
                'modified': datetime.fromtimestamp(os.path.getmtime(db_path)).isoformat() if os.path.exists(db_path) else None
            },
            'persistent_directory': {
                'path': self.persistent_base,
                'exists': os.path.exists(self.persistent_base),
                'contents': os.listdir(self.persistent_base) if os.path.exists(self.persistent_base) else []
            }
        }
        
        return file_status
    
    def save_status_report(self):
        """상태 보고서 저장"""
        self.ensure_directories()
        
        report = {
            'monitoring_time': datetime.now().isoformat(),
            'database_stats': self.get_database_stats(),
            'file_persistence': self.check_file_persistence(),
            'system_info': {
                'python_version': sys.version,
                'django_version': django.get_version(),
                'current_directory': os.getcwd(),
                'environment_variables': {
                    'DATABASE_URL': 'Set' if os.environ.get('DATABASE_URL') else 'Not set',
                    'DEBUG': os.environ.get('DEBUG', 'Not set'),
                    'POSTGRES_DB': 'Set' if os.environ.get('POSTGRES_DB') else 'Not set'
                }
            }
        }
        
        # 상태 파일 저장
        try:
            with open(self.status_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ Status report saved: {self.status_file}")
        except Exception as e:
            print(f"❌ Failed to save status report: {e}")
        
        # 로그 파일에 추가
        try:
            # 기존 로그 읽기
            logs = []
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r') as f:
                    logs = json.load(f)
            
            # 새 로그 추가
            logs.append(report)
            
            # 최근 10개만 유지
            logs = logs[-10:]
            
            # 로그 파일 저장
            with open(self.log_file, 'w') as f:
                json.dump(logs, f, indent=2)
            print(f"✅ Log updated: {self.log_file}")
            
        except Exception as e:
            print(f"❌ Failed to update log: {e}")
        
        return report
    
    def print_summary(self):
        """요약 정보 출력"""
        report = self.save_status_report()
        
        print("\n" + "="*60)
        print("📊 DATA PERSISTENCE MONITOR REPORT")
        print("="*60)
        
        db_stats = report.get('database_stats', {})
        if 'error' in db_stats:
            print(f"❌ Database Error: {db_stats['error']}")
        else:
            print(f"🗄️ Database Engine: {db_stats.get('database_engine', 'Unknown')}")
            print(f"📁 Database Path: {db_stats.get('database_path', 'Unknown')}")
            print(f"📋 Total Tables: {len(db_stats.get('tables', []))}")
            print(f"📊 Total Records: {db_stats.get('total_records', 0)}")
            
            if 'simple_projects' in db_stats.get('table_counts', {}):
                project_count = db_stats['table_counts']['simple_projects']
                print(f"🎯 Projects Table: {project_count} records")
            else:
                print("⚠️ Projects table not found")
        
        file_status = report.get('file_persistence', {})
        db_file = file_status.get('database_file', {})
        print(f"💾 Database File: {'✅ Exists' if db_file.get('exists') else '❌ Missing'}")
        print(f"📦 File Size: {db_file.get('size', 0)} bytes")
        
        persistent_dir = file_status.get('persistent_directory', {})
        print(f"📂 Persistent Directory: {'✅ Exists' if persistent_dir.get('exists') else '❌ Missing'}")
        
        print("="*60)

def main():
    """메인 실행 함수"""
    monitor = DataPersistenceMonitor()
    monitor.print_summary()

if __name__ == '__main__':
    main()