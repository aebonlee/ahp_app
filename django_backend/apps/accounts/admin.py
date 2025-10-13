"""
Admin configuration for Account models
사용자 계정 관리자 설정
"""
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, Permission
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q
from .models import UserProfile

User = get_user_model()


class UserProfileInline(admin.StackedInline):
    """사용자 프로필 인라인"""
    model = UserProfile
    can_delete = False
    verbose_name_plural = '프로필 정보'
    
    fieldsets = (
        ('개인 정보', {
            'fields': ('avatar', 'bio', 'expertise_areas', 'research_interests')
        }),
        ('알림 설정', {
            'fields': ('email_notifications', 'project_updates', 'evaluation_reminders')
        }),
        ('추가 정보', {
            'fields': ('publications',),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """확장된 사용자 관리자"""
    inlines = (UserProfileInline,)
    
    list_display = (
        'username_display', 'email_link', 'full_name', 
        'organization_badge', 'role_badges', 'status_badge',
        'projects_count', 'last_login_display', 'date_joined_display'
    )
    list_filter = (
        'is_active', 'is_staff', 'is_superuser',
        'is_evaluator', 'is_project_manager',
        'organization', 'date_joined', 'last_login'
    )
    search_fields = ('username', 'email', 'full_name', 'organization', 'department')
    ordering = ('-date_joined',)
    
    fieldsets = (
        ('계정 정보', {
            'fields': ('username', 'email', 'password')
        }),
        ('개인 정보', {
            'fields': ('full_name', 'first_name', 'last_name', 'phone')
        }),
        ('소속 정보', {
            'fields': ('organization', 'department', 'position')
        }),
        ('권한 설정', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'is_evaluator', 'is_project_manager',
                'groups', 'user_permissions'
            ),
            'classes': ('collapse',)
        }),
        ('시스템 설정', {
            'fields': ('language', 'timezone'),
            'classes': ('collapse',)
        }),
        ('중요 날짜', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        ('계정 생성', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')
        }),
        ('개인 정보', {
            'classes': ('wide',),
            'fields': ('full_name', 'organization', 'department', 'position', 'phone')
        }),
        ('권한 설정', {
            'classes': ('wide',),
            'fields': ('is_evaluator', 'is_project_manager', 'is_staff', 'is_active')
        }),
    )
    
    def username_display(self, obj):
        if obj.is_superuser:
            return format_html(
                '👑 <strong>{}</strong>',
                obj.username
            )
        elif obj.is_staff:
            return format_html(
                '👨‍💼 <strong>{}</strong>',
                obj.username
            )
        return obj.username
    username_display.short_description = '사용자명'
    username_display.admin_order_field = 'username'
    
    def email_link(self, obj):
        return format_html(
            '<a href="mailto:{}">{}</a>',
            obj.email, obj.email
        )
    email_link.short_description = '이메일'
    email_link.admin_order_field = 'email'
    
    def organization_badge(self, obj):
        if obj.organization:
            # 조직별 색상 지정
            org_colors = {
                '대학': '#007bff',
                '기업': '#28a745',
                '연구소': '#6f42c1',
                '정부': '#dc3545'
            }
            color = '#6c757d'  # 기본 색상
            for key, val in org_colors.items():
                if key in obj.organization:
                    color = val
                    break
            
            return format_html(
                '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
                color, obj.organization[:20]
            )
        return '-'
    organization_badge.short_description = '소속'
    organization_badge.admin_order_field = 'organization'
    
    def role_badges(self, obj):
        roles = []
        if obj.is_superuser:
            roles.append('<span style="background-color: #dc3545; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px;">슈퍼관리자</span>')
        elif obj.is_staff:
            roles.append('<span style="background-color: #fd7e14; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px;">스태프</span>')
        
        if obj.is_project_manager:
            roles.append('<span style="background-color: #007bff; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px;">PM</span>')
        
        if obj.is_evaluator:
            roles.append('<span style="background-color: #28a745; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px;">평가자</span>')
        
        return format_html(' '.join(roles)) if roles else '-'
    role_badges.short_description = '역할'
    
    def status_badge(self, obj):
        if not obj.is_active:
            return format_html('<span style="color: #dc3545;">❌ 비활성</span>')
        elif obj.last_login:
            days_ago = (timezone.now() - obj.last_login).days
            if days_ago < 7:
                return format_html('<span style="color: #28a745;">● 활성</span>')
            elif days_ago < 30:
                return format_html('<span style="color: #ffc107;">● 최근</span>')
            else:
                return format_html('<span style="color: #6c757d;">● 휴면</span>')
        return format_html('<span style="color: #17a2b8;">● 신규</span>')
    status_badge.short_description = '상태'
    
    def projects_count(self, obj):
        # 프로젝트 수 표시 (owner + member)
        from apps.projects.models import Project, ProjectMember
        owned = Project.objects.filter(owner=obj, status__in=['active', 'evaluation', 'completed']).count()
        member = ProjectMember.objects.filter(user=obj).exclude(project__owner=obj).count()
        
        if owned > 0 or member > 0:
            return format_html(
                '<span title="소유: {}, 참여: {}">👤 {} / 👥 {}</span>',
                owned, member, owned, member
            )
        return '-'
    projects_count.short_description = '프로젝트'
    
    def last_login_display(self, obj):
        if obj.last_login:
            days_ago = (timezone.now() - obj.last_login).days
            if days_ago == 0:
                return '오늘'
            elif days_ago == 1:
                return '어제'
            elif days_ago < 7:
                return f'{days_ago}일 전'
            elif days_ago < 30:
                weeks = days_ago // 7
                return f'{weeks}주 전'
            else:
                return obj.last_login.strftime('%Y-%m-%d')
        return '미접속'
    last_login_display.short_description = '마지막 로그인'
    last_login_display.admin_order_field = 'last_login'
    
    def date_joined_display(self, obj):
        days_since = (timezone.now() - obj.date_joined).days
        if days_since < 7:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">🆕 {}일 전</span>',
                days_since
            )
        elif days_since < 30:
            return f'{days_since}일 전'
        else:
            return obj.date_joined.strftime('%Y-%m-%d')
    date_joined_display.short_description = '가입일'
    date_joined_display.admin_order_field = 'date_joined'
    
    actions = ['activate_users', 'deactivate_users', 'grant_evaluator', 'grant_project_manager']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated}명의 사용자를 활성화했습니다.')
    activate_users.short_description = '선택된 사용자 활성화'
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated}명의 사용자를 비활성화했습니다.')
    deactivate_users.short_description = '선택된 사용자 비활성화'
    
    def grant_evaluator(self, request, queryset):
        updated = queryset.update(is_evaluator=True)
        self.message_user(request, f'{updated}명의 사용자에게 평가자 권한을 부여했습니다.')
    grant_evaluator.short_description = '평가자 권한 부여'
    
    def grant_project_manager(self, request, queryset):
        updated = queryset.update(is_project_manager=True)
        self.message_user(request, f'{updated}명의 사용자에게 프로젝트 관리자 권한을 부여했습니다.')
    grant_project_manager.short_description = '프로젝트 관리자 권한 부여'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # 프로젝트 카운트 추가 (성능 최적화)
        return qs.select_related('profile').prefetch_related('groups', 'user_permissions')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """사용자 프로필 관리"""
    list_display = (
        'user_display', 'avatar_preview', 'expertise_display',
        'notification_settings', 'created_date'
    )
    list_filter = (
        'email_notifications', 'project_updates',
        'evaluation_reminders', 'created_at'
    )
    search_fields = ('user__username', 'user__email', 'bio', 'expertise_areas')
    readonly_fields = ('created_at', 'updated_at', 'avatar_preview_large')
    
    fieldsets = (
        ('사용자', {
            'fields': ('user',)
        }),
        ('프로필 정보', {
            'fields': ('avatar', 'avatar_preview_large', 'bio')
        }),
        ('전문 분야', {
            'fields': ('expertise_areas', 'research_interests', 'publications')
        }),
        ('알림 설정', {
            'fields': (
                'email_notifications',
                'project_updates',
                'evaluation_reminders'
            )
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/">{}</a>',
            obj.user.id, obj.user.email
        )
    user_display.short_description = '사용자'
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width: 30px; height: 30px; border-radius: 50%;">',
                obj.avatar.url
            )
        return format_html(
            '<div style="width: 30px; height: 30px; border-radius: 50%; background: #ccc; display: inline-block;"></div>'
        )
    avatar_preview.short_description = '아바타'
    
    def avatar_preview_large(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width: 150px; height: 150px; border-radius: 10px;">',
                obj.avatar.url
            )
        return '아바타 없음'
    avatar_preview_large.short_description = '아바타 미리보기'
    
    def expertise_display(self, obj):
        if obj.expertise_areas:
            areas = obj.expertise_areas.split(',')[:3]  # 최대 3개만 표시
            badges = []
            colors = ['#007bff', '#28a745', '#6f42c1']
            for i, area in enumerate(areas):
                color = colors[i % len(colors)]
                badges.append(
                    f'<span style="background-color: {color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">{area.strip()}</span>'
                )
            return format_html(''.join(badges))
        return '-'
    expertise_display.short_description = '전문 분야'
    
    def notification_settings(self, obj):
        icons = []
        if obj.email_notifications:
            icons.append('✉️')
        if obj.project_updates:
            icons.append('📋')
        if obj.evaluation_reminders:
            icons.append('⏰')
        return ' '.join(icons) if icons else '🔕'
    notification_settings.short_description = '알림'
    
    def created_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_date.short_description = '생성일'


# 그룹 관리 커스터마이징
admin.site.unregister(Group)

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    """그룹 관리 커스터마이징"""
    list_display = ('name_display', 'users_count', 'permissions_count')
    search_fields = ('name',)
    filter_horizontal = ('permissions',)
    
    def name_display(self, obj):
        group_icons = {
            'Administrators': '👑',
            'Project Managers': '👨‍💼',
            'Evaluators': '📊',
            'Viewers': '👁️'
        }
        icon = group_icons.get(obj.name, '👥')
        return format_html('{} <strong>{}</strong>', icon, obj.name)
    name_display.short_description = '그룹명'
    
    def users_count(self, obj):
        count = obj.user_set.count()
        return format_html(
            '<span style="background-color: #007bff; color: white; padding: 2px 8px; border-radius: 3px;">{} 명</span>',
            count
        )
    users_count.short_description = '사용자 수'
    
    def permissions_count(self, obj):
        count = obj.permissions.count()
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 2px 8px; border-radius: 3px;">{} 개</span>',
            count
        )
    permissions_count.short_description = '권한 수'