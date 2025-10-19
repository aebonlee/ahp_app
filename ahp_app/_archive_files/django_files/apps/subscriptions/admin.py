"""
구독 관리 Django Admin 설정
관리자가 구독, 결제, 사용량을 효과적으로 관리할 수 있도록 구성
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.shortcuts import redirect
from django.contrib import messages
from django.db.models import Count, Sum, Q
from .models import (
    SubscriptionPlan, UserSubscription, PaymentMethod, 
    PaymentRecord, SubscriptionUsage, UsageAlert, CouponCode
)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = [
        'plan_id', 'name', 'plan_type', 'price_display', 
        'max_personal_admins', 'max_projects_per_admin',
        'ai_features_enabled', 'is_active', 'is_popular',
        'subscription_count', 'total_revenue'
    ]
    list_filter = [
        'plan_type', 'is_active', 'is_popular', 'ai_features_enabled',
        'advanced_analytics', 'group_ahp_enabled', 'currency'
    ]
    search_fields = ['plan_id', 'name', 'description']
    ordering = ['sort_order', 'price']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('plan_id', 'name', 'description', 'plan_type')
        }),
        ('가격 정보', {
            'fields': ('price', 'currency', 'duration_months')
        }),
        ('제한사항', {
            'fields': (
                'max_personal_admins', 'max_projects_per_admin',
                'max_surveys_per_project', 'max_evaluators_per_project',
                'max_criteria_per_project', 'max_alternatives_per_project',
                'storage_limit_gb'
            )
        }),
        ('기능 설정', {
            'fields': (
                'ai_features_enabled', 'advanced_analytics',
                'group_ahp_enabled', 'api_access',
                'custom_branding', 'priority_support'
            )
        }),
        ('상태 및 표시', {
            'fields': ('is_active', 'is_popular', 'is_featured', 'sort_order')
        }),
        ('메타데이터', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def price_display(self, obj):
        return f"₩{obj.price:,}/월"
    price_display.short_description = '월 요금'
    
    def subscription_count(self, obj):
        count = obj.subscriptions.filter(status='active').count()
        return format_html(
            '<a href="{}?plan__id__exact={}">{}</a>',
            reverse('admin:subscriptions_usersubscription_changelist'),
            obj.id,
            count
        )
    subscription_count.short_description = '활성 구독 수'
    
    def total_revenue(self, obj):
        revenue = PaymentRecord.objects.filter(
            subscription__plan=obj,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        return f"₩{revenue:,}"
    total_revenue.short_description = '총 수익'
    
    actions = ['activate_plans', 'deactivate_plans', 'mark_as_popular']
    
    def activate_plans(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}개 플랜이 활성화되었습니다.')
    activate_plans.short_description = '선택된 플랜 활성화'
    
    def deactivate_plans(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}개 플랜이 비활성화되었습니다.')
    deactivate_plans.short_description = '선택된 플랜 비활성화'
    
    def mark_as_popular(self, request, queryset):
        # 먼저 모든 플랜의 인기 표시 제거
        SubscriptionPlan.objects.update(is_popular=False)
        # 선택된 플랜들을 인기로 표시
        updated = queryset.update(is_popular=True)
        self.message_user(request, f'{updated}개 플랜이 인기 플랜으로 설정되었습니다.')
    mark_as_popular.short_description = '인기 플랜으로 설정'


class PaymentRecordInline(admin.TabularInline):
    model = PaymentRecord
    extra = 0
    readonly_fields = ['created_at', 'transaction_id', 'amount', 'status']
    fields = ['created_at', 'payment_type', 'amount', 'status', 'transaction_id']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class SubscriptionUsageInline(admin.StackedInline):
    model = SubscriptionUsage
    readonly_fields = ['last_reset_date', 'updated_at']
    fieldsets = (
        ('현재 사용량', {
            'fields': (
                'current_personal_admins', 'current_projects',
                'current_surveys', 'current_evaluators', 'storage_used_gb'
            )
        }),
        ('월간 사용량', {
            'fields': (
                'monthly_ai_requests', 'monthly_api_calls', 'monthly_email_sends'
            )
        }),
        ('누적 사용량', {
            'fields': (
                'total_projects_created', 'total_evaluations_completed', 'total_ai_requests'
            )
        })
    )


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'user_display', 'plan', 'status', 'start_date',
        'end_date', 'days_remaining_display', 'auto_renew',
        'usage_summary', 'total_payments'
    ]
    list_filter = [
        'status', 'auto_renew', 'plan__plan_type',
        'plan', 'start_date', 'end_date'
    ]
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'plan__name', 'plan__plan_id'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('구독 정보', {
            'fields': ('user', 'plan', 'status')
        }),
        ('기간 설정', {
            'fields': (
                'start_date', 'end_date', 'trial_end_date',
                'auto_renew', 'next_billing_date'
            )
        }),
        ('사용자 정의 제한', {
            'fields': (
                'custom_max_projects', 'custom_max_evaluators', 'custom_ai_enabled'
            ),
            'classes': ('collapse',)
        }),
        ('관리자 노트', {
            'fields': ('notes',),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    inlines = [SubscriptionUsageInline, PaymentRecordInline]
    
    def user_display(self, obj):
        return format_html(
            '<a href="{}?q={}">{}</a><br><small>{}</small>',
            reverse('admin:accounts_user_changelist'),
            obj.user.email,
            obj.user.email,
            f"{obj.user.first_name} {obj.user.last_name}".strip() or "이름 없음"
        )
    user_display.short_description = '사용자'
    
    def days_remaining_display(self, obj):
        days = obj.days_remaining
        if days <= 0:
            return format_html('<span style="color: red;">만료됨</span>')
        elif days <= 7:
            return format_html('<span style="color: orange;">{} 일</span>', days)
        else:
            return f"{days} 일"
    days_remaining_display.short_description = '남은 일수'
    
    def usage_summary(self, obj):
        if hasattr(obj, 'usage'):
            usage = obj.usage
            return format_html(
                '프로젝트: {}/{}<br>평가자: {}/{}',
                usage.current_projects,
                obj.effective_max_projects if obj.effective_max_projects != -1 else '∞',
                usage.current_evaluators,
                obj.effective_max_evaluators if obj.effective_max_evaluators != -1 else '∞'
            )
        return "사용량 데이터 없음"
    usage_summary.short_description = '사용량 요약'
    
    def total_payments(self, obj):
        total = obj.payment_records.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        return f"₩{total:,}"
    total_payments.short_description = '총 결제액'
    
    actions = [
        'activate_subscriptions', 'cancel_subscriptions', 
        'extend_trial', 'send_renewal_reminder'
    ]
    
    def activate_subscriptions(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated}개 구독이 활성화되었습니다.')
    activate_subscriptions.short_description = '선택된 구독 활성화'
    
    def cancel_subscriptions(self, request, queryset):
        updated = queryset.update(status='cancelled', auto_renew=False)
        self.message_user(request, f'{updated}개 구독이 취소되었습니다.')
    cancel_subscriptions.short_description = '선택된 구독 취소'
    
    def extend_trial(self, request, queryset):
        from datetime import timedelta
        trial_end = timezone.now() + timedelta(days=7)
        updated = queryset.update(trial_end_date=trial_end)
        self.message_user(request, f'{updated}개 구독의 체험기간이 7일 연장되었습니다.')
    extend_trial.short_description = '체험기간 7일 연장'


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = [
        'user_display', 'amount_display', 'status',
        'payment_type', 'created_at', 'paid_at',
        'transaction_id_display'
    ]
    list_filter = [
        'status', 'payment_type', 'currency',
        'created_at', 'paid_at'
    ]
    search_fields = [
        'subscription__user__email', 'transaction_id',
        'coupon_code', 'description'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('결제 정보', {
            'fields': (
                'subscription', 'payment_method', 'payment_type',
                'amount', 'currency', 'status'
            )
        }),
        ('할인 및 쿠폰', {
            'fields': ('coupon_code', 'discount_amount'),
            'classes': ('collapse',)
        }),
        ('세금 및 수수료', {
            'fields': ('tax_amount', 'fee_amount'),
            'classes': ('collapse',)
        }),
        ('환불 정보', {
            'fields': ('refund_amount', 'refund_reason'),
            'classes': ('collapse',)
        }),
        ('결제 게이트웨이', {
            'fields': ('transaction_id', 'gateway_response'),
            'classes': ('collapse',)
        }),
        ('기간 정보', {
            'fields': ('billing_period_start', 'billing_period_end'),
            'classes': ('collapse',)
        }),
        ('메타데이터', {
            'fields': ('description', 'notes'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at', 'paid_at']
    
    def user_display(self, obj):
        return obj.subscription.user.email
    user_display.short_description = '사용자'
    
    def amount_display(self, obj):
        color = {
            'completed': 'green',
            'failed': 'red',
            'pending': 'orange',
            'refunded': 'purple'
        }.get(obj.status, 'black')
        
        return format_html(
            '<span style="color: {};">₩{:,}</span>',
            color,
            obj.amount
        )
    amount_display.short_description = '금액'
    
    def transaction_id_display(self, obj):
        if obj.transaction_id:
            return obj.transaction_id[:20] + '...' if len(obj.transaction_id) > 20 else obj.transaction_id
        return '-'
    transaction_id_display.short_description = '거래 ID'
    
    actions = ['mark_as_completed', 'process_refund']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='completed',
            paid_at=timezone.now()
        )
        self.message_user(request, f'{updated}개 결제가 완료 처리되었습니다.')
    mark_as_completed.short_description = '결제 완료 처리'
    
    def process_refund(self, request, queryset):
        # 실제로는 결제 게이트웨이와 연동하여 환불 처리
        updated = queryset.filter(status='completed').update(status='refunded')
        self.message_user(request, f'{updated}개 결제가 환불 처리되었습니다.')
    process_refund.short_description = '환불 처리'


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'payment_type', 'display_info',
        'is_primary', 'is_active', 'created_at'
    ]
    list_filter = ['payment_type', 'is_primary', 'is_active', 'card_brand']
    search_fields = ['user__email', 'card_last_four', 'account_last_four']
    ordering = ['-created_at']
    
    def display_info(self, obj):
        if obj.payment_type == 'card':
            return f"{obj.card_brand} ****{obj.card_last_four}"
        elif obj.payment_type == 'bank_transfer':
            return f"{obj.bank_name} ****{obj.account_last_four}"
        return obj.get_payment_type_display()
    display_info.short_description = '결제 정보'


@admin.register(SubscriptionUsage)
class SubscriptionUsageAdmin(admin.ModelAdmin):
    list_display = [
        'user_display', 'current_projects', 'current_evaluators',
        'storage_used_gb', 'monthly_ai_requests', 'usage_percentage'
    ]
    list_filter = ['last_reset_date', 'updated_at']
    search_fields = ['subscription__user__email']
    ordering = ['-updated_at']
    
    def user_display(self, obj):
        return obj.subscription.user.email
    user_display.short_description = '사용자'
    
    def usage_percentage(self, obj):
        subscription = obj.subscription
        project_limit = subscription.effective_max_projects
        
        if project_limit == -1:
            return "무제한"
        
        percentage = (obj.current_projects / project_limit * 100) if project_limit > 0 else 0
        color = 'red' if percentage > 90 else 'orange' if percentage > 70 else 'green'
        
        return format_html(
            '<span style="color: {};">{:.1f}%</span>',
            color,
            percentage
        )
    usage_percentage.short_description = '프로젝트 사용률'


@admin.register(UsageAlert)
class UsageAlertAdmin(admin.ModelAdmin):
    list_display = [
        'user_display', 'alert_type', 'severity',
        'title', 'is_read', 'is_resolved', 'created_at'
    ]
    list_filter = [
        'alert_type', 'severity', 'is_read', 'is_resolved',
        'created_at'
    ]
    search_fields = ['subscription__user__email', 'title', 'message']
    ordering = ['-created_at']
    
    def user_display(self, obj):
        return obj.subscription.user.email
    user_display.short_description = '사용자'
    
    actions = ['mark_as_read', 'mark_as_resolved']
    
    def mark_as_read(self, request, queryset):
        updated = 0
        for alert in queryset.filter(is_read=False):
            alert.mark_as_read()
            updated += 1
        self.message_user(request, f'{updated}개 알림을 읽음 처리했습니다.')
    mark_as_read.short_description = '읽음 처리'
    
    def mark_as_resolved(self, request, queryset):
        updated = 0
        for alert in queryset.filter(is_resolved=False):
            alert.mark_as_resolved()
            updated += 1
        self.message_user(request, f'{updated}개 알림을 해결 처리했습니다.')
    mark_as_resolved.short_description = '해결 처리'


@admin.register(CouponCode)
class CouponCodeAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'discount_type', 'discount_value',
        'current_uses', 'max_uses', 'is_valid_display',
        'valid_until'
    ]
    list_filter = [
        'discount_type', 'is_active', 'valid_from', 'valid_until'
    ]
    search_fields = ['code', 'name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('쿠폰 정보', {
            'fields': ('code', 'name', 'description')
        }),
        ('할인 설정', {
            'fields': (
                'discount_type', 'discount_value', 'max_discount_amount'
            )
        }),
        ('사용 제한', {
            'fields': (
                'max_uses', 'max_uses_per_user', 'current_uses'
            )
        }),
        ('적용 플랜', {
            'fields': ('applicable_plans',)
        }),
        ('유효 기간', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('상태', {
            'fields': ('is_active',)
        })
    )
    
    readonly_fields = ['current_uses', 'created_at']
    filter_horizontal = ['applicable_plans']
    
    def is_valid_display(self, obj):
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ 유효</span>')
        else:
            return format_html('<span style="color: red;">✗ 무효</span>')
    is_valid_display.short_description = '유효성'
    
    actions = ['activate_coupons', 'deactivate_coupons']
    
    def activate_coupons(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}개 쿠폰이 활성화되었습니다.')
    activate_coupons.short_description = '선택된 쿠폰 활성화'
    
    def deactivate_coupons(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}개 쿠폰이 비활성화되었습니다.')
    deactivate_coupons.short_description = '선택된 쿠폰 비활성화'


# 커스텀 관리자 뷰
class SubscriptionDashboardAdmin(admin.ModelAdmin):
    """구독 대시보드 - 통계 및 요약 정보"""
    
    def changelist_view(self, request, extra_context=None):
        # 통계 데이터 수집
        total_subscriptions = UserSubscription.objects.count()
        active_subscriptions = UserSubscription.objects.filter(status='active').count()
        total_revenue = PaymentRecord.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        plan_distribution = UserSubscription.objects.values(
            'plan__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        extra_context = extra_context or {}
        extra_context.update({
            'total_subscriptions': total_subscriptions,
            'active_subscriptions': active_subscriptions,
            'total_revenue': total_revenue,
            'plan_distribution': plan_distribution,
        })
        
        return super().changelist_view(request, extra_context)


# 관리자 사이트 커스터마이징
admin.site.site_header = "AHP 플랫폼 관리"
admin.site.site_title = "AHP Admin"
admin.site.index_title = "AHP 플랫폼 관리 시스템"