"""
Super Admin - Django Admin Customization
Advanced admin interface for complete platform management
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db.models import Count, Sum, Q
import datetime

from .models import (
    CustomUser, PaymentPlan, PaymentTransaction, 
    AHPProject, ProjectEvaluator, SystemSettings, ActivityLog
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """향상된 사용자 관리"""
    
    list_display = (
        'email', 'get_full_name', 'user_type', 'subscription_tier',
        'is_verified', 'is_active', 'last_login', 'created_at'
    )
    list_filter = (
        'user_type', 'subscription_tier', 'is_verified', 'is_active',
        'created_at', 'last_login'
    )
    search_fields = ('email', 'first_name', 'last_name', 'organization')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('email', 'username', 'first_name', 'last_name', 'password')
        }),
        ('사용자 분류', {
            'fields': ('user_type', 'is_verified', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('프로필 정보', {
            'fields': ('phone', 'organization', 'department', 'position', 'bio'),
            'classes': ('collapse',)
        }),
        ('구독 정보', {
            'fields': (
                'subscription_tier', 'subscription_start', 'subscription_end',
                'monthly_project_limit', 'monthly_evaluator_limit', 'storage_limit_mb'
            ),
            'classes': ('collapse',)
        }),
        ('보안 정보', {
            'fields': (
                'last_login_ip', 'failed_login_attempts', 'account_locked_until',
                'verification_token'
            ),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('id', 'created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_users', 'deactivate_users', 'verify_users', 'upgrade_to_premium']
    
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()}명의 사용자가 활성화되었습니다.")
    activate_users.short_description = "선택된 사용자 활성화"
    
    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()}명의 사용자가 비활성화되었습니다.")
    deactivate_users.short_description = "선택된 사용자 비활성화"
    
    def verify_users(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f"{queryset.count()}명의 사용자가 인증되었습니다.")
    verify_users.short_description = "선택된 사용자 인증"
    
    def upgrade_to_premium(self, request, queryset):
        queryset.update(subscription_tier='professional')
        self.message_user(request, f"{queryset.count()}명의 사용자가 프리미엄으로 업그레이드되었습니다.")
    upgrade_to_premium.short_description = "프리미엄으로 업그레이드"


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    """결제 플랜 관리"""
    
    list_display = (
        'name', 'tier', 'plan_type', 'formatted_price', 
        'project_limit', 'evaluator_limit', 'is_active'
    )
    list_filter = ('tier', 'plan_type', 'is_active', 'created_at')
    search_fields = ('name',)
    ordering = ['tier', 'price']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'tier', 'plan_type', 'is_active')
        }),
        ('가격 정보', {
            'fields': ('price', 'currency', 'discount_percent')
        }),
        ('제한사항', {
            'fields': (
                'project_limit', 'evaluator_limit', 'storage_limit_mb'
            )
        }),
        ('기능', {
            'fields': ('advanced_analytics', 'api_access', 'priority_support')
        }),
    )
    
    def formatted_price(self, obj):
        return f"{obj.price:,}원"
    formatted_price.short_description = "가격"
    formatted_price.admin_order_field = "price"


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    """결제 거래 관리"""
    
    list_display = (
        'transaction_id', 'user_email', 'plan_name', 'formatted_amount',
        'payment_method', 'status', 'created_at'
    )
    list_filter = (
        'status', 'payment_method', 'currency', 'created_at', 'processed_at'
    )
    search_fields = (
        'transaction_id', 'user__email', 'plan__name', 'external_transaction_id'
    )
    readonly_fields = ('transaction_id', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('transaction_id', 'user', 'plan')
        }),
        ('결제 정보', {
            'fields': ('amount', 'currency', 'payment_method', 'external_transaction_id')
        }),
        ('상태', {
            'fields': ('status', 'created_at', 'processed_at')
        }),
        ('추가 정보', {
            'fields': ('notes', 'failure_reason'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "사용자"
    user_email.admin_order_field = "user__email"
    
    def plan_name(self, obj):
        return obj.plan.name
    plan_name.short_description = "플랜"
    plan_name.admin_order_field = "plan__name"
    
    def formatted_amount(self, obj):
        return f"{obj.amount:,}원"
    formatted_amount.short_description = "금액"
    formatted_amount.admin_order_field = "amount"


class ProjectEvaluatorInline(admin.TabularInline):
    model = ProjectEvaluator
    extra = 0
    readonly_fields = ('invited_at', 'invitation_token', 'completed_at')


@admin.register(AHPProject)
class AHPProjectAdmin(admin.ModelAdmin):
    """AHP 프로젝트 관리"""
    
    list_display = (
        'title', 'owner_name', 'status', 'evaluator_count', 
        'consistency_ratio', 'is_public', 'created_at'
    )
    list_filter = ('status', 'is_public', 'created_at', 'updated_at')
    search_fields = ('title', 'description', 'owner__email', 'owner__first_name', 'owner__last_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [ProjectEvaluatorInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('title', 'description', 'owner', 'status', 'is_public')
        }),
        ('프로젝트 설정', {
            'fields': ('criteria', 'alternatives', 'deadline'),
            'classes': ('collapse',)
        }),
        ('평가 결과', {
            'fields': ('evaluation_matrix', 'final_weights', 'consistency_ratio'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.email
    owner_name.short_description = "소유자"
    owner_name.admin_order_field = "owner__first_name"
    
    def evaluator_count(self, obj):
        return obj.evaluators.count()
    evaluator_count.short_description = "평가자 수"


@admin.register(ProjectEvaluator)
class ProjectEvaluatorAdmin(admin.ModelAdmin):
    """프로젝트 평가자 관리"""
    
    list_display = (
        'project_title', 'evaluator_name', 'status', 'invited_at', 'completed_at'
    )
    list_filter = ('status', 'invited_at', 'completed_at')
    search_fields = (
        'project__title', 'evaluator__email', 
        'evaluator__first_name', 'evaluator__last_name'
    )
    
    def project_title(self, obj):
        return obj.project.title
    project_title.short_description = "프로젝트"
    project_title.admin_order_field = "project__title"
    
    def evaluator_name(self, obj):
        return obj.evaluator.get_full_name() or obj.evaluator.email
    evaluator_name.short_description = "평가자"
    evaluator_name.admin_order_field = "evaluator__first_name"


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    """시스템 설정 관리"""
    
    list_display = ('key', 'value_preview', 'description', 'updated_at')
    search_fields = ('key', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    def value_preview(self, obj):
        return obj.value[:100] + '...' if len(obj.value) > 100 else obj.value
    value_preview.short_description = "값"


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """활동 로그 관리"""
    
    list_display = (
        'timestamp', 'user_email', 'action', 'level', 'ip_address'
    )
    list_filter = ('level', 'timestamp', 'action')
    search_fields = ('user__email', 'action', 'description', 'ip_address')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    def user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'
    user_email.short_description = "사용자"
    user_email.admin_order_field = "user__email"
    
    def has_add_permission(self, request):
        return False  # 로그는 시스템에서만 생성


# Admin Site 커스터마이징
admin.site.site_header = "AHP Platform 총 관리자"
admin.site.site_title = "AHP 관리자"
admin.site.index_title = "플랫폼 관리 대시보드"


# Dashboard 통계를 위한 커스텀 뷰 (추후 구현)
class DashboardStats:
    """대시보드 통계 데이터"""
    
    @classmethod
    def get_user_stats(cls):
        total_users = CustomUser.objects.count()
        active_users = CustomUser.objects.filter(is_active=True).count()
        premium_users = CustomUser.objects.filter(
            subscription_tier__in=['professional', 'enterprise', 'unlimited']
        ).count()
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'premium_users': premium_users,
        }
    
    @classmethod
    def get_payment_stats(cls):
        today = timezone.now().date()
        this_month = today.replace(day=1)
        
        monthly_revenue = PaymentTransaction.objects.filter(
            status='completed',
            created_at__gte=this_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        total_revenue = PaymentTransaction.objects.filter(
            status='completed'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return {
            'monthly_revenue': monthly_revenue,
            'total_revenue': total_revenue,
        }
    
    @classmethod
    def get_project_stats(cls):
        total_projects = AHPProject.objects.count()
        active_projects = AHPProject.objects.filter(status='active').count()
        completed_projects = AHPProject.objects.filter(status='completed').count()
        
        return {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
        }