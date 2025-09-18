"""
Database Migration API - 강제 마이그레이션 실행
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
from django.db import connection
import logging
import io
import sys

logger = logging.getLogger(__name__)

@csrf_exempt
def force_migrate_database(request):
    """강제 Django 마이그레이션 실행"""
    if request.method != 'POST':
        return JsonResponse({'message': 'POST only'})
    
    try:
        logger.info("Starting forced migration...")
        
        # 1. makemigrations 실행
        makemigrations_output = io.StringIO()
        try:
            call_command('makemigrations', 'simple_service', verbosity=2, stdout=makemigrations_output, stderr=makemigrations_output)
            makemigrations_result = makemigrations_output.getvalue()
        except Exception as e:
            makemigrations_result = f"makemigrations error: {e}"
        
        # 2. migrate 실행
        migrate_output = io.StringIO()
        try:
            call_command('migrate', verbosity=2, stdout=migrate_output, stderr=migrate_output)
            migrate_result = migrate_output.getvalue()
        except Exception as e:
            migrate_result = f"migrate error: {e}"
        
        # 3. 기본 사용자 생성
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # 시스템 사용자 (ID=1) 생성
        system_user, system_created = User.objects.get_or_create(
            id=1,
            defaults={
                'username': 'system',
                'email': 'system@ahp.com',
                'is_staff': True,
                'is_active': True,
                'is_superuser': True
            }
        )
        
        # 관리자 사용자 생성
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ahp-platform.com',
                'is_staff': True,
                'is_active': True,
                'is_superuser': True
            }
        )
        
        if admin_created:
            admin_user.set_password('ahp2025admin')
            admin_user.save()
        
        # 4. 결과 확인
        with connection.cursor() as cursor:
            simple_tables = []
            test_tables = ['simple_projects', 'simple_criteria', 'simple_comparisons', 'simple_results', 'simple_data']
            for table in test_tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    simple_tables.append({'table': table, 'count': count})
                except Exception as e:
                    simple_tables.append({'table': table, 'error': str(e)})
        
        return JsonResponse({
            'success': True,
            'message': '강제 마이그레이션 완료',
            'makemigrations_output': makemigrations_result,
            'migrate_output': migrate_result,
            'users_created': {
                'system_user': system_created,
                'admin_user': admin_created
            },
            'simple_tables': simple_tables,
            'users_count': User.objects.count()
        })
        
    except Exception as e:
        logger.error(f"Force migration failed: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': '강제 마이그레이션 실패'
        }, status=500)

@csrf_exempt
def check_database_status(request):
    """데이터베이스 상태 상세 확인"""
    try:
        with connection.cursor() as cursor:
            # 직접 테이블 확인 (PostgreSQL 메타데이터 테이블 회피)
            tables = []
            test_tables = ['auth_user', 'simple_projects', 'simple_criteria', 'simple_comparisons', 'simple_results', 'simple_data']
            for table in test_tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    tables.append({'name': table, 'count': count, 'exists': True})
                except Exception as e:
                    tables.append({'name': table, 'count': 0, 'exists': False, 'error': str(e)})
            
            # Django 마이그레이션 상태 확인
            migrations = []
            try:
                cursor.execute("""
                    SELECT app, name, applied 
                    FROM django_migrations 
                    ORDER BY applied DESC 
                    LIMIT 10
                """)
                migrations = [
                    {'app': row[0], 'name': row[1], 'applied': str(row[2])}
                    for row in cursor.fetchall()
                ]
            except Exception as e:
                migrations = [{'error': f'Migration table not accessible: {e}'}]
            
        # 사용자 정보
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users_info = {
            'total': User.objects.count(),
            'active': User.objects.filter(is_active=True).count(),
            'staff': User.objects.filter(is_staff=True).count(),
            'superuser': User.objects.filter(is_superuser=True).count()
        }
        
        # Simple Service 모델 확인
        from .models import SimpleProject
        projects_count = SimpleProject.objects.count()
        
        return JsonResponse({
            'success': True,
            'database_connected': True,
            'tables': tables,
            'migrations': migrations,
            'users': users_info,
            'projects_count': projects_count,
            'database_engine': connection.vendor
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'database_connected': False
        }, status=500)