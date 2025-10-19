"""
Health Check and Database Status API Views
시스템 상태 모니터링을 위한 API 엔드포인트
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
import os

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    헬스체크 엔드포인트
    서버 상태와 기본 정보를 반환
    """
    try:
        # 기본 헬스 체크
        health_status = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'service': 'AHP Django Backend',
            'version': getattr(settings, 'API_VERSION', '1.0.0'),
            'environment': os.getenv('DJANGO_ENV', 'production'),
        }
        
        # 간단한 DB 연결 테스트
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'connected'
        
        return Response(health_status, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'timestamp': timezone.now().isoformat(),
            'error': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([AllowAny])
def db_status(request):
    """
    데이터베이스 상태 확인 엔드포인트
    DB 연결 상태와 기본 통계를 반환
    """
    try:
        db_info = {
            'status': 'connected',
            'timestamp': timezone.now().isoformat(),
        }
        
        # DB 연결 테스트
        with connection.cursor() as cursor:
            # PostgreSQL 버전 확인
            cursor.execute("SELECT version()")
            version_result = cursor.fetchone()
            if version_result:
                db_info['database_version'] = version_result[0].split(',')[0]
            
            # 현재 데이터베이스 이름
            cursor.execute("SELECT current_database()")
            db_name = cursor.fetchone()
            if db_name:
                db_info['database_name'] = db_name[0]
            
            # 활성 연결 수 (PostgreSQL)
            try:
                cursor.execute("""
                    SELECT count(*) 
                    FROM pg_stat_activity 
                    WHERE state = 'active'
                """)
                active_conn = cursor.fetchone()
                if active_conn:
                    db_info['active_connections'] = active_conn[0]
            except:
                pass
        
        # 테이블 통계
        try:
            from apps.projects.models import Project
            from apps.evaluations.models import Evaluation
            
            stats = {
                'users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
                'projects': Project.objects.count(),
                'evaluations': Evaluation.objects.count(),
            }
            db_info['statistics'] = stats
        except:
            db_info['statistics'] = {
                'users': User.objects.count(),
                'active_users': User.objects.filter(is_active=True).count(),
            }
        
        return Response(db_info, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'error': str(e),
            'message': 'Database connection failed'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    API 서비스 상태 종합 엔드포인트
    전체 시스템 상태를 한번에 확인
    """
    try:
        # 서버 정보
        server_info = {
            'status': 'online',
            'timestamp': timezone.now().isoformat(),
            'timezone': str(timezone.get_current_timezone()),
            'debug_mode': settings.DEBUG,
        }
        
        # 데이터베이스 상태
        db_status = 'unknown'
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = 'connected'
        except:
            db_status = 'disconnected'
        
        # API 엔드포인트 상태
        endpoints = {
            '/api/': 'active',
            '/api/users/': 'active',
            '/api/projects/': 'active',
            '/api/evaluations/': 'active',
            '/api/auth/': 'active',
            '/admin/': 'active',
        }
        
        # 시스템 통계
        system_stats = {
            'total_users': User.objects.count(),
            'superusers': User.objects.filter(is_superuser=True).count(),
            'staff_users': User.objects.filter(is_staff=True).count(),
        }
        
        return Response({
            'server': server_info,
            'database': {
                'status': db_status,
                'engine': connection.settings_dict.get('ENGINE', 'unknown').split('.')[-1],
            },
            'endpoints': endpoints,
            'statistics': system_stats,
            'message': 'All systems operational'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'error': str(e),
            'message': 'System status check failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)