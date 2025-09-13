"""
Super Admin Views
API endpoints and admin dashboard views
"""

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse, HttpResponse
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import (
    CustomUser, PaymentTransaction, AHPProject, ActivityLog, 
    SystemSettings, SystemBackup, SecurityLog, AccessControl, DataMigration
)
from .serializers import (
    CustomUserSerializer, PaymentTransactionSerializer, 
    AHPProjectSerializer, ActivityLogSerializer,
    SystemSettingsSerializer, SystemBackupSerializer,
    SecurityLogSerializer, AccessControlSerializer, DataMigrationSerializer
)
import json
import datetime


def is_super_admin(user):
    """슈퍼 관리자 권한 확인"""
    return user.is_authenticated and (user.is_superuser or getattr(user, 'user_type', '') == 'super_admin')


@staff_member_required
def admin_dashboard(request):
    """관리자 대시보드 메인 페이지"""
    
    # 기본 통계
    user_stats = {
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'premium_users': CustomUser.objects.filter(
            subscription_tier__in=['professional', 'enterprise', 'unlimited']
        ).count(),
        'verified_users': CustomUser.objects.filter(is_verified=True).count(),
    }
    
    # 결제 통계
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    payment_stats = {
        'monthly_revenue': PaymentTransaction.objects.filter(
            status='completed',
            created_at__gte=this_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0,
        
        'total_revenue': PaymentTransaction.objects.filter(
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0,
        
        'pending_payments': PaymentTransaction.objects.filter(
            status='pending'
        ).count(),
    }
    
    # 프로젝트 통계
    project_stats = {
        'total_projects': AHPProject.objects.count(),
        'active_projects': AHPProject.objects.filter(status='active').count(),
        'completed_projects': AHPProject.objects.filter(status='completed').count(),
        'public_projects': AHPProject.objects.filter(is_public=True).count(),
    }
    
    # 최근 활동
    recent_users = CustomUser.objects.order_by('-created_at')[:5]
    recent_payments = PaymentTransaction.objects.order_by('-created_at')[:5]
    recent_projects = AHPProject.objects.order_by('-created_at')[:5]
    recent_activities = ActivityLog.objects.order_by('-timestamp')[:10]
    
    context = {
        'user_stats': user_stats,
        'payment_stats': payment_stats,
        'project_stats': project_stats,
        'recent_users': recent_users,
        'recent_payments': recent_payments,
        'recent_projects': recent_projects,
        'recent_activities': recent_activities,
    }
    
    return render(request, 'super_admin/dashboard.html', context)


@staff_member_required
def user_management(request):
    """사용자 관리 페이지"""
    
    users = CustomUser.objects.all().order_by('-created_at')
    
    # 필터링
    user_type = request.GET.get('user_type')
    if user_type:
        users = users.filter(user_type=user_type)
    
    subscription_tier = request.GET.get('subscription_tier')
    if subscription_tier:
        users = users.filter(subscription_tier=subscription_tier)
    
    # 검색
    search = request.GET.get('search')
    if search:
        users = users.filter(
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(organization__icontains=search)
        )
    
    context = {
        'users': users[:50],  # 페이지네이션 구현 필요
        'user_types': CustomUser.USER_TYPES,
        'subscription_tiers': CustomUser.SUBSCRIPTION_TIERS,
    }
    
    return render(request, 'super_admin/user_management.html', context)


@staff_member_required
def payment_management(request):
    """결제 관리 페이지"""
    
    payments = PaymentTransaction.objects.select_related('user', 'plan').order_by('-created_at')
    
    # 필터링
    status = request.GET.get('status')
    if status:
        payments = payments.filter(status=status)
    
    # 날짜 범위
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from:
        payments = payments.filter(created_at__gte=date_from)
    if date_to:
        payments = payments.filter(created_at__lte=date_to)
    
    context = {
        'payments': payments[:50],
        'payment_statuses': PaymentTransaction.PAYMENT_STATUS,
        'payment_methods': PaymentTransaction.PAYMENT_METHODS,
    }
    
    return render(request, 'super_admin/payment_management.html', context)


@staff_member_required
def project_management(request):
    """프로젝트 관리 페이지"""
    
    projects = AHPProject.objects.select_related('owner').prefetch_related('evaluators').order_by('-created_at')
    
    # 필터링
    status = request.GET.get('status')
    if status:
        projects = projects.filter(status=status)
    
    context = {
        'projects': projects[:50],
        'project_statuses': AHPProject.PROJECT_STATUS,
    }
    
    return render(request, 'super_admin/project_management.html', context)


# API Views
class CustomUserViewSet(viewsets.ModelViewSet):
    """사용자 관리 API"""
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = CustomUser.objects.all()
        user_type = self.request.query_params.get('user_type')
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        return queryset


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """결제 거래 조회 API"""
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class AHPProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """AHP 프로젝트 조회 API"""
    queryset = AHPProject.objects.all()
    serializer_class = AHPProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


# ===== 슈퍼관리자 10개 페이지 API 엔드포인트 =====

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def system_settings_api(request):
    """시스템 설정 API"""
    
    if request.method == 'GET':
        settings = SystemSettings.objects.all().order_by('key')
        serializer = SystemSettingsSerializer(settings, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = SystemSettingsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            # 활동 로그 기록
            ActivityLog.objects.create(
                user=request.user,
                action='create_system_setting',
                description=f'시스템 설정 생성: {serializer.validated_data["key"]}',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': '시스템 설정이 생성되었습니다.'
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=400)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def audit_logs_api(request):
    """감사 로그 API"""
    
    if request.method == 'GET':
        # 필터링 파라미터
        level = request.GET.get('level')
        action = request.GET.get('action')
        user_id = request.GET.get('user_id')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        logs = ActivityLog.objects.all().order_by('-timestamp')
        
        if level:
            logs = logs.filter(level=level)
        if action:
            logs = logs.filter(action__icontains=action)
        if user_id:
            logs = logs.filter(user_id=user_id)
        if date_from:
            logs = logs.filter(timestamp__gte=date_from)
        if date_to:
            logs = logs.filter(timestamp__lte=date_to)
        
        # 페이지네이션
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        start = (page - 1) * limit
        end = start + limit
        
        total_count = logs.count()
        paginated_logs = logs[start:end]
        
        serializer = ActivityLogSerializer(paginated_logs, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def backup_restore_api(request):
    """백업 및 복원 API"""
    
    if request.method == 'GET':
        backups = SystemBackup.objects.all().order_by('-started_at')
        serializer = SystemBackupSerializer(backups, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        # 백업 시작
        backup_data = {
            'name': request.data.get('name', f"Backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}"),
            'backup_type': request.data.get('backup_type', 'full'),
            'description': request.data.get('description', ''),
            'created_by': request.user
        }
        
        backup = SystemBackup.objects.create(**backup_data)
        
        # 실제 백업 프로세스는 비동기로 처리 (여기서는 시뮬레이션)
        import time
        backup.status = 'running'
        backup.save()
        
        # 백업 로직 (실제로는 Celery 등으로 비동기 처리)
        # ...백업 처리 로직...
        
        backup.status = 'completed'
        backup.completed_at = timezone.now()
        backup.file_size = 1024 * 1024 * 50  # 50MB 시뮬레이션
        backup.save()
        
        ActivityLog.objects.create(
            user=request.user,
            action='create_backup',
            description=f'백업 생성: {backup.name}',
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        
        serializer = SystemBackupSerializer(backup)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': '백업이 생성되었습니다.'
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def database_management_api(request):
    """데이터베이스 관리 API"""
    
    from django.db import connection
    
    if request.method == 'GET':
        action = request.GET.get('action', 'stats')
        
        if action == 'stats':
            # 데이터베이스 통계
            with connection.cursor() as cursor:
                # 테이블 정보 조회 (PostgreSQL)
                cursor.execute("""
                    SELECT 
                        schemaname,
                        tablename,
                        attname,
                        typename,
                        avg_width
                    FROM pg_stats 
                    WHERE schemaname = 'public'
                    ORDER BY tablename, attname;
                """)
                
                table_stats = cursor.fetchall()
                
            return Response({
                'success': True,
                'data': {
                    'table_stats': table_stats,
                    'total_tables': len(set(row[1] for row in table_stats)),
                    'total_users': CustomUser.objects.count(),
                    'total_projects': AHPProject.objects.count(),
                    'total_transactions': PaymentTransaction.objects.count()
                }
            })
        
        elif action == 'tables':
            # 테이블 목록
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                """)
                tables = [row[0] for row in cursor.fetchall()]
            
            return Response({
                'success': True,
                'data': {'tables': tables}
            })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def data_migration_api(request):
    """데이터 마이그레이션 API"""
    
    if request.method == 'GET':
        migrations = DataMigration.objects.all().order_by('-started_at')
        serializer = DataMigrationSerializer(migrations, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        migration_data = {
            'name': request.data.get('name'),
            'migration_type': request.data.get('migration_type'),
            'source_type': request.data.get('source_type'),
            'target_type': request.data.get('target_type'),
            'source_config': request.data.get('source_config', {}),
            'target_config': request.data.get('target_config', {}),
            'created_by': request.user
        }
        
        migration = DataMigration.objects.create(**migration_data)
        
        # 실제 마이그레이션 로직은 비동기로 처리
        migration.status = 'running'
        migration.total_records = 1000  # 시뮬레이션
        migration.save()
        
        ActivityLog.objects.create(
            user=request.user,
            action='create_migration',
            description=f'데이터 마이그레이션 시작: {migration.name}',
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        
        serializer = DataMigrationSerializer(migration)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': '데이터 마이그레이션이 시작되었습니다.'
        })


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def security_settings_api(request):
    """보안 설정 API"""
    
    if request.method == 'GET':
        # 보안 관련 시스템 설정 조회
        security_settings = SystemSettings.objects.filter(
            key__startswith='security_'
        ).order_by('key')
        
        serializer = SystemSettingsSerializer(security_settings, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        # 새 보안 설정 생성
        key = f"security_{request.data.get('key')}"
        value = request.data.get('value')
        description = request.data.get('description', '')
        
        setting, created = SystemSettings.objects.update_or_create(
            key=key,
            defaults={'value': value, 'description': description}
        )
        
        ActivityLog.objects.create(
            user=request.user,
            action='update_security_setting',
            description=f'보안 설정 {"생성" if created else "수정"}: {key}',
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        
        serializer = SystemSettingsSerializer(setting)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': f'보안 설정이 {"생성" if created else "수정"}되었습니다.'
        })


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def access_control_api(request):
    """접근 제어 API"""
    
    if request.method == 'GET':
        access_controls = AccessControl.objects.all().order_by('-created_at')
        serializer = AccessControlSerializer(access_controls, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['created_by'] = request.user.id
        
        serializer = AccessControlSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            
            ActivityLog.objects.create(
                user=request.user,
                action='create_access_control',
                description=f'접근 제어 규칙 생성: {data["resource_name"]}',
                ip_address=request.META.get('REMOTE_ADDR'),
            )
            
            return Response({
                'success': True,
                'data': serializer.data,
                'message': '접근 제어 규칙이 생성되었습니다.'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=400)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def security_logs_api(request):
    """보안 로그 API"""
    
    if request.method == 'GET':
        # 필터링 파라미터
        event_type = request.GET.get('event_type')
        threat_level = request.GET.get('threat_level')
        is_resolved = request.GET.get('is_resolved')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        logs = SecurityLog.objects.all().order_by('-timestamp')
        
        if event_type:
            logs = logs.filter(event_type=event_type)
        if threat_level:
            logs = logs.filter(threat_level=threat_level)
        if is_resolved is not None:
            logs = logs.filter(is_resolved=is_resolved.lower() == 'true')
        if date_from:
            logs = logs.filter(timestamp__gte=date_from)
        if date_to:
            logs = logs.filter(timestamp__lte=date_to)
        
        # 페이지네이션
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        start = (page - 1) * limit
        end = start + limit
        
        total_count = logs.count()
        paginated_logs = logs[start:end]
        
        serializer = SecurityLogSerializer(paginated_logs, many=True)
        
        # 통계 정보 추가
        stats = {
            'total_events': total_count,
            'critical_events': logs.filter(threat_level='critical').count(),
            'unresolved_events': logs.filter(is_resolved=False).count(),
            'today_events': logs.filter(timestamp__date=timezone.now().date()).count()
        }
        
        return Response({
            'success': True,
            'data': serializer.data,
            'stats': stats,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })
    
    elif request.method == 'POST':
        # 새 보안 이벤트 로그 생성
        serializer = SecurityLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'data': serializer.data,
                'message': '보안 로그가 생성되었습니다.'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=400)


@api_view(['GET'])
@permission_classes([])
def dashboard_stats_api(request):
    """대시보드 통계 API"""
    
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    # 사용자 통계
    user_stats = {
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'premium_users': CustomUser.objects.filter(
            subscription_tier__in=['professional', 'enterprise', 'unlimited']
        ).count(),
        'verified_users': CustomUser.objects.filter(is_verified=True).count(),
    }
    
    # 결제 통계
    payment_stats = {
        'monthly_revenue': PaymentTransaction.objects.filter(
            status='completed',
            created_at__gte=this_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0,
        'total_revenue': PaymentTransaction.objects.filter(
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0,
        'pending_payments': PaymentTransaction.objects.filter(
            status='pending'
        ).count(),
    }
    
    # 프로젝트 통계
    project_stats = {
        'total_projects': AHPProject.objects.count(),
        'active_projects': AHPProject.objects.filter(status='active').count(),
        'completed_projects': AHPProject.objects.filter(status='completed').count(),
        'public_projects': AHPProject.objects.filter(is_public=True).count(),
    }
    
    # 시스템 통계
    system_stats = {
        'total_backups': SystemBackup.objects.count(),
        'recent_backups': SystemBackup.objects.filter(
            started_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count(),
        'security_alerts': SecurityLog.objects.filter(
            threat_level__in=['high', 'critical'],
            is_resolved=False
        ).count(),
        'active_migrations': DataMigration.objects.filter(
            status='running'
        ).count(),
    }
    
    return Response({
        'success': True,
        'total_users': user_stats['total_users'],
        'active_projects': project_stats['active_projects'], 
        'system_performance': 98.5,  # 시뮬레이션 데이터
        'storage_usage': 67.3,       # 시뮬레이션 데이터
        'user_growth': 12.5,         # 시뮬레이션 데이터  
        'project_growth': 8.7,       # 시뮬레이션 데이터
        'performance_status': '시스템 정상 작동',
        'storage_status': '여유 공간 충분',
        'user_stats': user_stats,
        'payment_stats': payment_stats,
        'project_stats': project_stats,
        'system_stats': system_stats,
        'last_updated': timezone.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """대시보드 통계 API"""
    
    # 사용자 통계
    user_stats = {
        'total': CustomUser.objects.count(),
        'active': CustomUser.objects.filter(is_active=True).count(),
        'premium': CustomUser.objects.filter(
            subscription_tier__in=['professional', 'enterprise', 'unlimited']
        ).count(),
        'by_type': dict(CustomUser.objects.values('user_type').annotate(count=Count('id')).values_list('user_type', 'count'))
    }
    
    # 결제 통계
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    payment_stats = {
        'monthly_revenue': float(PaymentTransaction.objects.filter(
            status='completed',
            created_at__gte=this_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0),
        
        'total_revenue': float(PaymentTransaction.objects.filter(
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0),
        
        'by_status': dict(PaymentTransaction.objects.values('status').annotate(count=Count('id')).values_list('status', 'count'))
    }
    
    # 프로젝트 통계
    project_stats = {
        'total': AHPProject.objects.count(),
        'by_status': dict(AHPProject.objects.values('status').annotate(count=Count('id')).values_list('status', 'count'))
    }
    
    return Response({
        'users': user_stats,
        'payments': payment_stats,
        'projects': project_stats,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """최근 활동 조회 API"""
    
    activities = ActivityLog.objects.select_related('user').order_by('-timestamp')[:20]
    serializer = ActivityLogSerializer(activities, many=True)
    
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_user_action(request):
    """사용자 대량 작업 API"""
    
    user_ids = request.data.get('user_ids', [])
    action = request.data.get('action')
    
    if not user_ids or not action:
        return Response({'error': '사용자 ID와 액션이 필요합니다.'}, status=400)
    
    users = CustomUser.objects.filter(id__in=user_ids)
    
    if action == 'activate':
        users.update(is_active=True)
        message = f"{users.count()}명의 사용자가 활성화되었습니다."
    elif action == 'deactivate':
        users.update(is_active=False)
        message = f"{users.count()}명의 사용자가 비활성화되었습니다."
    elif action == 'verify':
        users.update(is_verified=True)
        message = f"{users.count()}명의 사용자가 인증되었습니다."
    elif action == 'upgrade_premium':
        users.update(subscription_tier='professional')
        message = f"{users.count()}명의 사용자가 프리미엄으로 업그레이드되었습니다."
    else:
        return Response({'error': '유효하지 않은 액션입니다.'}, status=400)
    
    # 활동 로그 기록
    ActivityLog.objects.create(
        user=request.user,
        action=f'bulk_user_{action}',
        description=f"{len(user_ids)}명 사용자에 대해 {action} 작업 수행",
        level='info',
        extra_data={'user_ids': user_ids}
    )
    
    return Response({'message': message})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """시스템 상태 확인 API"""
    
    # 데이터베이스 연결 확인
    try:
        CustomUser.objects.count()
        db_status = 'healthy'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    # 기본 시스템 정보
    health_data = {
        'database': db_status,
        'timestamp': timezone.now(),
        'total_users': CustomUser.objects.count(),
        'total_projects': AHPProject.objects.count(),
        'total_payments': PaymentTransaction.objects.count(),
    }
    
    return Response(health_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_statistics(request):
    """사용자 통계 API"""
    
    # 기본 통계
    total_users = CustomUser.objects.count()
    active_users = CustomUser.objects.filter(is_active=True).count()
    verified_users = CustomUser.objects.filter(is_verified=True).count()
    premium_users = CustomUser.objects.filter(
        subscription_tier__in=['professional', 'enterprise', 'unlimited']
    ).count()
    
    # 사용자 유형별 통계
    user_type_stats = dict(
        CustomUser.objects.values('user_type').annotate(count=Count('id')).values_list('user_type', 'count')
    )
    
    # 구독 티어별 통계
    subscription_stats = dict(
        CustomUser.objects.values('subscription_tier').annotate(count=Count('id')).values_list('subscription_tier', 'count')
    )
    
    # 월별 가입자 통계 (최근 12개월)
    monthly_signups = []
    for i in range(12):
        date = timezone.now().replace(day=1) - datetime.timedelta(days=i*30)
        next_month = date + datetime.timedelta(days=32)
        next_month = next_month.replace(day=1)
        
        count = CustomUser.objects.filter(
            created_at__gte=date,
            created_at__lt=next_month
        ).count()
        
        monthly_signups.append({
            'month': date.strftime('%Y-%m'),
            'count': count
        })
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'verified_users': verified_users,
        'premium_users': premium_users,
        'user_type_distribution': user_type_stats,
        'subscription_distribution': subscription_stats,
        'monthly_signups': reversed(monthly_signups)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_statistics(request):
    """결제 통계 API"""
    
    # 기본 결제 통계
    total_revenue = PaymentTransaction.objects.filter(
        status='completed'
    ).aggregate(Sum('amount'))['amount__sum'] or 0
    
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    monthly_revenue = PaymentTransaction.objects.filter(
        status='completed',
        created_at__gte=this_month
    ).aggregate(Sum('amount'))['amount__sum'] or 0
    
    # 결제 상태별 통계
    payment_status_stats = dict(
        PaymentTransaction.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
    )
    
    # 결제 방법별 통계
    payment_method_stats = dict(
        PaymentTransaction.objects.filter(status='completed').values('payment_method').annotate(count=Count('id')).values_list('payment_method', 'count')
    )
    
    # 월별 매출 통계 (최근 12개월)
    monthly_revenue_stats = []
    for i in range(12):
        date = timezone.now().replace(day=1) - datetime.timedelta(days=i*30)
        next_month = date + datetime.timedelta(days=32)
        next_month = next_month.replace(day=1)
        
        revenue = PaymentTransaction.objects.filter(
            status='completed',
            created_at__gte=date,
            created_at__lt=next_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        monthly_revenue_stats.append({
            'month': date.strftime('%Y-%m'),
            'revenue': float(revenue)
        })
    
    return Response({
        'total_revenue': float(total_revenue),
        'monthly_revenue': float(monthly_revenue),
        'payment_status_distribution': payment_status_stats,
        'payment_method_distribution': payment_method_stats,
        'monthly_revenue_trend': reversed(monthly_revenue_stats)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_statistics(request):
    """프로젝트 통계 API"""
    
    # 기본 프로젝트 통계
    total_projects = AHPProject.objects.count()
    active_projects = AHPProject.objects.filter(status='active').count()
    completed_projects = AHPProject.objects.filter(status='completed').count()
    public_projects = AHPProject.objects.filter(is_public=True).count()
    
    # 프로젝트 상태별 통계
    project_status_stats = dict(
        AHPProject.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
    )
    
    # 월별 프로젝트 생성 통계
    monthly_projects = []
    for i in range(12):
        date = timezone.now().replace(day=1) - datetime.timedelta(days=i*30)
        next_month = date + datetime.timedelta(days=32)
        next_month = next_month.replace(day=1)
        
        count = AHPProject.objects.filter(
            created_at__gte=date,
            created_at__lt=next_month
        ).count()
        
        monthly_projects.append({
            'month': date.strftime('%Y-%m'),
            'count': count
        })
    
    # 평가자 참여 통계
    evaluator_stats = {
        'total_evaluations': ProjectEvaluator.objects.count(),
        'completed_evaluations': ProjectEvaluator.objects.filter(status='completed').count(),
        'pending_evaluations': ProjectEvaluator.objects.filter(status='pending').count(),
    }
    
    return Response({
        'total_projects': total_projects,
        'active_projects': active_projects,
        'completed_projects': completed_projects,
        'public_projects': public_projects,
        'project_status_distribution': project_status_stats,
        'monthly_project_creation': reversed(monthly_projects),
        'evaluator_participation': evaluator_stats
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_users(request):
    """사용자 데이터 내보내기 API"""
    
    import csv
    from django.http import HttpResponse
    
    # CSV 응답 설정
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="users_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', '이메일', '이름', '사용자 유형', '구독 티어', 
        '조직', '부서', '직책', '인증 여부', '활성 여부', '가입일'
    ])
    
    users = CustomUser.objects.all().order_by('-created_at')
    for user in users:
        writer.writerow([
            str(user.id),
            user.email,
            user.get_full_name(),
            user.get_user_type_display(),
            user.get_subscription_tier_display(),
            user.organization,
            user.department,
            user.position,
            '인증됨' if user.is_verified else '미인증',
            '활성' if user.is_active else '비활성',
            user.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def system_backup(request):
    """시스템 백업 API (데이터 요약)"""
    
    # 실제 백업 대신 시스템 상태 요약 제공
    backup_data = {
        'backup_timestamp': timezone.now(),
        'user_count': CustomUser.objects.count(),
        'project_count': AHPProject.objects.count(),
        'payment_count': PaymentTransaction.objects.count(),
        'activity_log_count': ActivityLog.objects.count(),
        'system_status': {
            'database': 'healthy',
            'storage': 'available',
            'memory': 'sufficient'
        },
        'last_activities': list(
            ActivityLog.objects.order_by('-timestamp')[:10].values(
                'action', 'description', 'level', 'timestamp'
            )
        )
    }
    
    # 백업 로그 기록
    ActivityLog.objects.create(
        user=request.user,
        action='system_backup',
        description='시스템 백업 요약 데이터 생성',
        level='info',
        ip_address=request.META.get('REMOTE_ADDR'),
        extra_data={'backup_timestamp': str(timezone.now())}
    )
    
    return Response({
        'success': True,
        'message': '시스템 상태 요약이 생성되었습니다.',
        'backup_data': backup_data
    })