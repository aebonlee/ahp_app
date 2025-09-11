"""
Simple Service Views - 프로덕션 최적화된 API
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from django.db.models import Count, Prefetch, Q
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from django.db import connection
from django.utils import timezone
import math
import logging
import time
import os
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
from .models import SimpleProject, SimpleData, SimpleCriteria, SimpleComparison, SimpleResult
from .serializers import (
    SimpleProjectSerializer, SimpleDataSerializer, SimpleCriteriaSerializer, 
    SimpleComparisonSerializer, SimpleResultSerializer
)

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SimpleProjectViewSet(viewsets.ModelViewSet):
    """프로덕션 최적화된 프로젝트 ViewSet"""
    queryset = SimpleProject.objects.all()
    serializer_class = SimpleProjectSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """최적화된 쿼리셋"""
        queryset = SimpleProject.objects.select_related('created_by').prefetch_related(
            Prefetch('criteria', queryset=SimpleCriteria.objects.select_related('parent')),
            'comparisons__created_by',
            'results__criteria'
        ).annotate(
            criteria_count=Count('criteria'),
            comparisons_count=Count('comparisons')
        )
        
        # 필터링
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        user_filter = self.request.query_params.get('my_projects')
        if user_filter and self.request.user.is_authenticated:
            queryset = queryset.filter(created_by=self.request.user)
            
        return queryset
    
    @method_decorator(ratelimit(key='user', rate='10/m', method='POST', block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        logger.info(f"Project created: {serializer.instance.title} by {self.request.user.username}")
    
    def perform_update(self, serializer):
        serializer.save()
        # 캐시 무효화
        cache.delete(f"project_stats_{serializer.instance.id}")
        logger.info(f"Project updated: {serializer.instance.title}")
    
    @method_decorator(cache_page(300))  # 5분 캐싱
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """프로젝트 통계"""
        project = self.get_object()
        cache_key = f"project_stats_{project.id}"
        stats = cache.get(cache_key)
        
        if stats is None:
            stats = {
                'criteria_count': project.criteria.count(),
                'comparisons_count': project.comparisons.count(),
                'results_count': project.results.count(),
                'completion_rate': project.completion_rate,
                'created_at': project.created_at,
                'last_updated': project.updated_at,
                'created_by': {
                    'username': project.created_by.username,
                    'first_name': project.created_by.first_name,
                    'last_name': project.created_by.last_name,
                }
            }
            cache.set(cache_key, stats, 300)  # 5분 캐싱
            
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def calculate_weights(self, request, pk=None):
        """AHP 가중치 계산"""
        project = self.get_object()
        
        try:
            with transaction.atomic():
                # 기존 결과 삭제
                SimpleResult.objects.filter(project=project).delete()
                
                # 평가기준 가져오기
                criteria = project.criteria.filter(type='criteria').order_by('order')
                if not criteria.exists():
                    return Response({'error': 'No criteria found'}, status=status.HTTP_400_BAD_REQUEST)
                
                # 쌍대비교 행렬 구성
                n = criteria.count()
                matrix = [[1.0 for _ in range(n)] for _ in range(n)]
                
                for i, criterion_a in enumerate(criteria):
                    for j, criterion_b in enumerate(criteria):
                        if i != j:
                            comparison = SimpleComparison.objects.filter(
                                project=project,
                                criteria_a=criterion_a,
                                criteria_b=criterion_b
                            ).first()
                            
                            if comparison:
                                matrix[i][j] = comparison.value
                            else:
                                # 역방향 비교가 있는지 확인
                                reverse_comparison = SimpleComparison.objects.filter(
                                    project=project,
                                    criteria_a=criterion_b,
                                    criteria_b=criterion_a
                                ).first()
                                
                                if reverse_comparison:
                                    matrix[i][j] = 1.0 / reverse_comparison.value
                                else:
                                    matrix[i][j] = 1.0
                
                # 기하평균법으로 가중치 계산
                weights = []
                for i in range(n):
                    product = 1.0
                    for j in range(n):
                        product *= matrix[i][j]
                    weights.append(product ** (1.0 / n))
                
                # 정규화
                total_weight = sum(weights)
                if total_weight > 0:
                    weights = [w / total_weight for w in weights]
                
                # 결과 저장
                for i, (criterion, weight) in enumerate(zip(criteria, weights)):
                    SimpleResult.objects.create(
                        project=project,
                        criteria=criterion,
                        weight=weight,
                        rank=i + 1,
                        created_by=request.user
                    )
                    
                    # 기준 가중치도 업데이트
                    criterion.weight = weight
                    criterion.save()
                
                # 순위 재정렬
                results = SimpleResult.objects.filter(project=project).order_by('-weight')
                for rank, result in enumerate(results, 1):
                    result.rank = rank
                    result.save()
                
                return Response({
                    'message': 'Weights calculated successfully',
                    'weights': weights,
                    'criteria_count': n
                })
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimpleCriteriaViewSet(viewsets.ModelViewSet):
    """최적화된 AHP 평가기준 ViewSet"""
    queryset = SimpleCriteria.objects.all()
    serializer_class = SimpleCriteriaSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        queryset = SimpleCriteria.objects.select_related('project', 'parent').prefetch_related('children')
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
            
        return queryset
    
    @method_decorator(ratelimit(key='user', rate='20/m', method='POST', block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class SimpleComparisonViewSet(viewsets.ModelViewSet):
    """최적화된 쌍대비교 ViewSet"""
    queryset = SimpleComparison.objects.all()
    serializer_class = SimpleComparisonSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'value']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = SimpleComparison.objects.select_related(
            'project', 'criteria_a', 'criteria_b', 'created_by'
        )
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset
    
    @method_decorator(ratelimit(key='user', rate='30/m', method='POST', block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        logger.info(f"Comparison created by {self.request.user.username}")


class SimpleResultViewSet(viewsets.ReadOnlyModelViewSet):
    """최적화된 AHP 결과 ViewSet (읽기 전용)"""
    queryset = SimpleResult.objects.all()
    serializer_class = SimpleResultSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rank', 'weight', 'created_at']
    ordering = ['rank']
    
    def get_queryset(self):
        queryset = SimpleResult.objects.select_related(
            'project', 'criteria', 'created_by'
        )
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset


class SimpleDataViewSet(viewsets.ModelViewSet):
    """최적화된 프로젝트 데이터 ViewSet"""
    queryset = SimpleData.objects.all()
    serializer_class = SimpleDataSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['key', 'value']
    ordering_fields = ['created_at', 'updated_at', 'key']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        queryset = SimpleData.objects.select_related('project')
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        key_filter = self.request.query_params.get('key')
        if key_filter:
            queryset = queryset.filter(key__icontains=key_filter)
            
        return queryset
    
    @method_decorator(ratelimit(key='user', rate='50/m', method='POST', block=True))
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


@api_view(['GET'])
def health_check(request):
    """상세한 헬스체크 API"""
    start_time = time.time()
    health_data = {
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '2.0',
        'environment': os.environ.get('NODE_ENV', 'production')
    }
    
    try:
        # 데이터베이스 연결 확인
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_response_time = time.time() - start_time
            health_data['database'] = {
                'status': 'connected',
                'response_time_ms': round(db_response_time * 1000, 2)
            }
    except Exception as e:
        health_data['database'] = {
            'status': 'error',
            'error': str(e)
        }
        health_data['status'] = 'unhealthy'
    
    try:
        # 캐시 확인
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test', 10)
        cache_value = cache.get(cache_key)
        health_data['cache'] = {
            'status': 'working' if cache_value == 'test' else 'error'
        }
        cache.delete(cache_key)
    except Exception as e:
        health_data['cache'] = {
            'status': 'error',
            'error': str(e)
        }
    
    # 시스템 리소스 정보
    if HAS_PSUTIL:
        try:
            memory = psutil.virtual_memory()
            health_data['system'] = {
                'memory_usage_percent': round(memory.percent, 2),
                'memory_available_mb': round(memory.available / 1024 / 1024, 2),
                'cpu_percent': round(psutil.cpu_percent(interval=0.1), 2)
            }
        except:
            health_data['system'] = {'status': 'unavailable'}
    else:
        health_data['system'] = {'status': 'psutil not available'}
    
    health_data['response_time_ms'] = round((time.time() - start_time) * 1000, 2)
    
    status_code = 200 if health_data['status'] == 'healthy' else 503
    return Response(health_data, status=status_code)

@api_view(['GET'])
def service_status(request):
    """서비스 상태 확인 (기존 호환성)"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        stats = {
            'projects_count': SimpleProject.objects.count(),
            'criteria_count': SimpleCriteria.objects.count(),
            'comparisons_count': SimpleComparison.objects.count(),
            'results_count': SimpleResult.objects.count(),
            'data_count': SimpleData.objects.count(),
            'users_count': User.objects.count(),
            'active_users_count': User.objects.filter(is_active=True).count()
        }
    except Exception:
        stats = {'error': 'Database unavailable'}
    
    return Response({
        'message': 'AHP Service is Running - Frontend Ready',
        'status': 'SUCCESS',
        'version': '2.1.0',  # CSS 디자인 시스템 통합 업데이트
        'last_updated': '2025-01-10T16:30:00Z',
        'deployment_notes': 'CSS Design System Integration + Auth Components Enhancement',
        'features': {
            'projects': True,
            'criteria': True,
            'comparisons': True,
            'weight_calculation': True,
            'authentication': True,
            'cors_enabled': True,
            'pagination': True,
            'search': True,
            'caching': True,
            'rate_limiting': True,
            'logging': True,
            'health_monitoring': True
        },
        'stats': stats,
        'endpoints': {
            'health': '/health/',
            'projects': '/api/service/projects/',
            'auth': {
                'login': '/api/login/',
                'register': '/api/register/',
                'logout': '/api/logout/',
                'user_info': '/api/user/'
            }
        }
    })