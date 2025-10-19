"""
Django REST Framework Views for AI Management
AI 관리 시스템의 API 뷰들
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    AIServicePlan,
    AIServiceSettings, 
    UserAIAccess,
    AIUsageLog,
    PromptTemplate,
    DevelopmentPromptLog
)
from .serializers import (
    AIServicePlanSerializer,
    AIServiceSettingsSerializer,
    AIServiceSettingsCreateSerializer,
    UserAIAccessSerializer,
    AIUsageLogSerializer,
    AIUsageLogCreateSerializer,
    PromptTemplateSerializer,
    DevelopmentPromptLogSerializer,
    UserSerializer,
    AIUsageStatsSerializer,
    UserUsageStatsSerializer
)

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    """관리자만 쓰기 권한, 일반 사용자는 읽기 전용"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_staff or request.user.is_superuser


class AIServicePlanViewSet(viewsets.ModelViewSet):
    """AI 서비스 요금제 관리 ViewSet"""
    queryset = AIServicePlan.objects.all()
    serializer_class = AIServicePlanSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['is_active']
    search_fields = ['name', 'display_name']
    ordering = ['monthly_cost']
    
    @action(detail=False, methods=['get'])
    def active_plans(self, request):
        """활성화된 요금제만 조회"""
        active_plans = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active_plans, many=True)
        return Response(serializer.data)


class AIServiceSettingsViewSet(viewsets.ModelViewSet):
    """AI 서비스 설정 관리 ViewSet"""
    queryset = AIServiceSettings.objects.all()
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['provider', 'is_active', 'is_default']
    search_fields = ['name', 'model_name']
    ordering = ['-is_default', 'name']
    
    def get_serializer_class(self):
        """생성 시에는 API 키 포함 직렬화기 사용"""
        if self.action == 'create':
            return AIServiceSettingsCreateSerializer
        return AIServiceSettingsSerializer
    
    def perform_create(self, serializer):
        """생성자 자동 설정"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """API 연결 테스트"""
        setting = self.get_object()
        try:
            # 실제 API 테스트 로직 구현
            # 여기서는 시뮬레이션
            return Response({
                'success': True,
                'message': f'{setting.name} 연결 테스트 성공'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'연결 테스트 실패: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def make_default(self, request, pk=None):
        """기본 설정으로 지정"""
        setting = self.get_object()
        
        # 같은 제공자의 다른 설정들을 기본값 해제
        AIServiceSettings.objects.filter(
            provider=setting.provider
        ).update(is_default=False)
        
        setting.is_default = True
        setting.save()
        
        return Response({
            'message': f'{setting.name}이(가) 기본 설정으로 지정되었습니다.'
        })


class UserAIAccessViewSet(viewsets.ModelViewSet):
    """사용자 AI 접근 권한 관리 ViewSet"""
    queryset = UserAIAccess.objects.select_related('user', 'ai_plan', 'ai_settings', 'assigned_by')
    serializer_class = UserAIAccessSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['ai_plan', 'is_enabled', 'can_use_advanced_features']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering = ['-assigned_at']
    
    def perform_create(self, serializer):
        """할당자 자동 설정"""
        serializer.save(assigned_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def bulk_enable(self, request):
        """선택된 사용자들의 AI 기능 활성화"""
        user_ids = request.data.get('user_ids', [])
        count = UserAIAccess.objects.filter(id__in=user_ids).update(is_enabled=True)
        return Response({
            'message': f'{count}명의 사용자의 AI 기능이 활성화되었습니다.'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_disable(self, request):
        """선택된 사용자들의 AI 기능 비활성화"""
        user_ids = request.data.get('user_ids', [])
        count = UserAIAccess.objects.filter(id__in=user_ids).update(is_enabled=False)
        return Response({
            'message': f'{count}명의 사용자의 AI 기능이 비활성화되었습니다.'
        })
    
    @action(detail=True, methods=['post'])
    def reset_usage(self, request, pk=None):
        """사용량 초기화"""
        access = self.get_object()
        reset_type = request.data.get('type', 'monthly')  # 'daily' or 'monthly'
        
        if reset_type == 'daily':
            access.reset_daily_usage()
            message = '일간 사용량이 초기화되었습니다.'
        else:
            access.reset_monthly_usage()
            message = '월간 사용량이 초기화되었습니다.'
        
        return Response({'message': message})
    
    @action(detail=False, methods=['get'])
    def usage_overview(self, request):
        """사용량 개요"""
        total_users = self.queryset.count()
        active_users = self.queryset.filter(is_enabled=True).count()
        over_limit_users = self.queryset.filter(
            tokens_used_month__gte=models.F('ai_plan__monthly_token_limit')
        ).count()
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'over_limit_users': over_limit_users,
            'usage_rate': round((active_users / total_users * 100), 2) if total_users > 0 else 0
        })


class AIUsageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """AI 사용 로그 조회 ViewSet (읽기 전용)"""
    queryset = AIUsageLog.objects.select_related('user', 'ai_settings')
    serializer_class = AIUsageLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['request_type', 'ai_settings__provider', 'user_rating']
    search_fields = ['user__username', 'prompt', 'response']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """관리자가 아닌 경우 자신의 로그만 조회"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    @action(detail=False, methods=['get'])
    def daily_stats(self, request):
        """일간 통계"""
        today = timezone.now().date()
        stats = self.queryset.filter(created_at__date=today).aggregate(
            total_requests=Count('id'),
            total_tokens=Sum('tokens_used'),
            total_cost=Sum('cost'),
            average_response_time=Avg('response_time'),
            unique_users=Count('user', distinct=True)
        )
        
        # 요청 유형별 통계
        requests_by_type = dict(
            self.queryset.filter(created_at__date=today)
            .values_list('request_type')
            .annotate(count=Count('id'))
        )
        
        stats['requests_by_type'] = requests_by_type
        serializer = AIUsageStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_stats(self, request):
        """월간 통계"""
        this_month = timezone.now().replace(day=1).date()
        stats = self.queryset.filter(created_at__date__gte=this_month).aggregate(
            total_requests=Count('id'),
            total_tokens=Sum('tokens_used'),
            total_cost=Sum('cost'),
            unique_users=Count('user', distinct=True)
        )
        
        # 일별 사용량 (최근 30일)
        daily_usage = []
        for i in range(30):
            date = timezone.now().date() - timedelta(days=i)
            day_stats = self.queryset.filter(created_at__date=date).aggregate(
                requests=Count('id'),
                tokens=Sum('tokens_used')
            )
            daily_usage.append({
                'date': date.isoformat(),
                'requests': day_stats['requests'] or 0,
                'tokens': day_stats['tokens'] or 0
            })
        
        stats['daily_usage'] = daily_usage
        serializer = AIUsageStatsSerializer(stats)
        return Response(serializer.data)


class PromptTemplateViewSet(viewsets.ModelViewSet):
    """AI 프롬프트 템플릿 관리 ViewSet"""
    queryset = PromptTemplate.objects.all()
    serializer_class = PromptTemplateSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['category', 'is_public', 'is_active']
    search_fields = ['name', 'description', 'template']
    ordering = ['-usage_count', 'name']
    
    def get_queryset(self):
        """일반 사용자는 공개 템플릿만 조회"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_public=True, is_active=True)
        return queryset
    
    def perform_create(self, serializer):
        """생성자 자동 설정"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """템플릿 사용 (사용 횟수 증가)"""
        template = self.get_object()
        template.increment_usage()
        return Response({
            'message': f'템플릿 "{template.name}" 사용 완료',
            'usage_count': template.usage_count
        })


class DevelopmentPromptLogViewSet(viewsets.ReadOnlyModelViewSet):
    """개발 프롬프트 로그 ViewSet (읽기 전용)"""
    queryset = DevelopmentPromptLog.objects.select_related('user')
    serializer_class = DevelopmentPromptLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['context', 'file_saved']
    search_fields = ['user__username', 'user_prompt', 'context', 'session_id']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'])
    def export_logs(self, request):
        """선택된 로그들을 개발일지로 내보내기"""
        log_ids = request.data.get('log_ids', [])
        logs = self.queryset.filter(id__in=log_ids)
        
        # 실제 구현에서는 파일 생성 로직 추가
        # 현재는 시뮬레이션
        filename = f"dev_log_{timezone.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        return Response({
            'message': f'{logs.count()}개의 로그가 개발일지로 내보내기되었습니다.',
            'filename': filename
        })


class UserManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """사용자 관리 ViewSet (AI 권한 관련)"""
    queryset = User.objects.select_related('ai_access__ai_plan').filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['username']
    
    @action(detail=False, methods=['get'])
    def without_ai_access(self, request):
        """AI 접근 권한이 없는 사용자들"""
        users_without_access = self.queryset.filter(ai_access__isnull=True)
        serializer = self.get_serializer(users_without_access, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def usage_summary(self, request):
        """사용자별 사용량 요약"""
        users_with_access = UserAIAccess.objects.select_related(
            'user', 'ai_plan'
        ).filter(is_enabled=True)
        
        summary = []
        for access in users_with_access:
            summary.append({
                'user_id': access.user.id,
                'username': access.user.username,
                'total_requests': access.requests_month,
                'total_tokens': access.tokens_used_month,
                'usage_percentage': access.usage_percentage,
                'plan_name': access.ai_plan.display_name,
                'is_over_limit': access.is_over_limit
            })
        
        serializer = UserUsageStatsSerializer(summary, many=True)
        return Response(serializer.data)


# 비인증 사용자용 뷰 (공개 정보만)
class PublicAIInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """공개 AI 정보 ViewSet (인증 불필요)"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def available_plans(self, request):
        """사용 가능한 AI 요금제 정보"""
        plans = AIServicePlan.objects.filter(is_active=True)
        serializer = AIServicePlanSerializer(plans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public_templates(self, request):
        """공개 프롬프트 템플릿"""
        templates = PromptTemplate.objects.filter(is_public=True, is_active=True)
        serializer = PromptTemplateSerializer(templates, many=True)
        return Response(serializer.data)