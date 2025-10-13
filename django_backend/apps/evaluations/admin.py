"""
Admin configuration for Evaluation models
평가 모델 관리자 설정
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count, Q, Avg
from .models import (
    Evaluation, PairwiseComparison, EvaluationSession, 
    EvaluationInvitation, DemographicSurvey
)


class PairwiseComparisonInline(admin.TabularInline):
    model = PairwiseComparison
    extra = 0
    fields = ('criteria_a', 'criteria_b', 'value', 'confidence', 'answered_at')
    readonly_fields = ('answered_at',)


class EvaluationSessionInline(admin.TabularInline):
    model = EvaluationSession
    extra = 0
    fields = ('started_at', 'ended_at', 'duration', 'ip_address')
    readonly_fields = ('started_at', 'ended_at', 'duration')


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    """평가(Evaluation) 관리 어드민"""
    inlines = [PairwiseComparisonInline, EvaluationSessionInline]
    
    list_display = [
        'project_link', 
        'evaluator_display', 
        'status_badge', 
        'progress_bar', 
        'consistency_display', 
        'session_time_display',
        'created_at_display'
    ]
    list_filter = ['status', 'is_consistent', 'created_at', 'project']
    search_fields = ['project__title', 'evaluator__username', 'title']
    readonly_fields = ['created_at', 'updated_at', 'consistency_ratio', 'is_consistent']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('project', 'evaluator', 'title', 'instructions')
        }),
        ('진행 상황', {
            'fields': ('status', 'progress', 'started_at', 'completed_at', 'expires_at'),
            'description': '평가 진행 상황과 시간 정보'
        }),
        ('일관성 검사', {
            'fields': ('consistency_ratio', 'is_consistent'),
            'description': '일관성 비율이 0.1 이하이면 일관성이 있다고 판단됩니다.'
        }),
        ('메타데이터', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def project_link(self, obj):
        """프로젝트 링크"""
        return format_html(
            '<a href="/admin/projects/project/{}/change/" style="color: #007bff;">{}</a>',
            obj.project.id, obj.project.title
        )
    project_link.short_description = '프로젝트'
    
    def evaluator_display(self, obj):
        """평가자 표시"""
        if obj.evaluator:
            return format_html(
                '<span style="font-weight: bold;">👤 {}</span><br><small style="color: #6c757d;">{}</small>',
                obj.evaluator.username or obj.evaluator.email,
                obj.evaluator.email
            )
        return '익명'
    evaluator_display.short_description = '평가자'
    
    def status_badge(self, obj):
        """상태 뱃지"""
        colors = {
            'pending': '#ffc107',     # 노랑
            'in_progress': '#007bff', # 파랑
            'completed': '#28a745',   # 초록
            'expired': '#dc3545',     # 빨강
            'cancelled': '#6c757d',   # 회색
        }
        icons = {
            'pending': '⏳',
            'in_progress': '🔄',
            'completed': '✅',
            'expired': '⏰',
            'cancelled': '❌',
        }
        color = colors.get(obj.status, '#6c757d')
        icon = icons.get(obj.status, '❓')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_badge.short_description = '상태'
    
    def progress_bar(self, obj):
        """진행률 바"""
        progress = obj.progress or 0
        color = '#28a745' if progress >= 100 else '#007bff' if progress >= 50 else '#ffc107'
        return format_html(
            '''
            <div style="width: 100px; background-color: #e9ecef; border-radius: 3px; overflow: hidden;">
                <div style="width: {}%; height: 20px; background-color: {}; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
                    {}%
                </div>
            </div>
            ''',
            progress, color, int(progress)
        )
    progress_bar.short_description = '진행률'
    
    def consistency_display(self, obj):
        """일관성 표시"""
        if obj.consistency_ratio is not None:
            if obj.is_consistent:
                return format_html(
                    '<span style="color: #28a745; font-weight: bold;">✅ {:.3f}</span>',
                    obj.consistency_ratio
                )
            else:
                return format_html(
                    '<span style="color: #dc3545; font-weight: bold;">❌ {:.3f}</span>',
                    obj.consistency_ratio
                )
        return '미계산'
    consistency_display.short_description = '일관성 비율'
    
    def session_time_display(self, obj):
        """세션 시간 표시"""
        if obj.started_at and obj.completed_at:
            duration = obj.completed_at - obj.started_at
            minutes = int(duration.total_seconds() / 60)
            return f'⏱️ {minutes}분'
        elif obj.started_at:
            return '🔄 진행중'
        return '미시작'
    session_time_display.short_description = '소요시간'
    
    def created_at_display(self, obj):
        """생성일 표시"""
        return obj.created_at.strftime('%m/%d %H:%M') if obj.created_at else '-'
    created_at_display.short_description = '생성일'
    
    # 액션 추가
    actions = ['reset_evaluations', 'extend_deadline', 'recalculate_consistency']
    
    def reset_evaluations(self, request, queryset):
        """선택된 평가 초기화"""
        updated = queryset.update(status='pending', progress=0, started_at=None, completed_at=None)
        self.message_user(request, f'{updated}개의 평가를 초기화했습니다.')
    reset_evaluations.short_description = '선택된 평가 초기화'
    
    def extend_deadline(self, request, queryset):
        """마감일 연장 (7일)"""
        from django.utils import timezone
        from datetime import timedelta
        new_deadline = timezone.now() + timedelta(days=7)
        updated = queryset.update(expires_at=new_deadline)
        self.message_user(request, f'{updated}개의 평가 마감일을 7일 연장했습니다.')
    extend_deadline.short_description = '마감일 7일 연장'
    
    def recalculate_consistency(self, request, queryset):
        """일관성 재계산"""
        count = 0
        for evaluation in queryset:
            # 여기에 일관성 재계산 로직 추가 (향후 구현)
            evaluation.save()  # 모델의 save() 메서드에서 일관성 계산
            count += 1
        self.message_user(request, f'{count}개의 평가 일관성을 재계산했습니다.')
    recalculate_consistency.short_description = '일관성 재계산'


@admin.register(PairwiseComparison)
class PairwiseComparisonAdmin(admin.ModelAdmin):
    """쌍대비교 관리"""
    list_display = [
        'evaluation_project', 'evaluator_name', 'comparison_display',
        'value_display', 'confidence_badge', 'answered_time'
    ]
    list_filter = ['confidence', 'answered_at', 'evaluation__project']
    search_fields = ['evaluation__project__title', 'criteria_a__name', 'criteria_b__name']
    readonly_fields = ['answered_at']
    ordering = ['-answered_at']
    
    fieldsets = (
        ('평가 정보', {
            'fields': ('evaluation',)
        }),
        ('비교 기준', {
            'fields': ('criteria_a', 'criteria_b')
        }),
        ('평가 값', {
            'fields': ('value', 'confidence', 'comment')
        }),
        ('시간 정보', {
            'fields': ('answered_at', 'time_spent'),
            'classes': ('collapse',)
        }),
    )
    
    def evaluation_project(self, obj):
        if obj.evaluation and obj.evaluation.project:
            return format_html(
                '<a href="/admin/projects/project/{}/change/">{}</a>',
                obj.evaluation.project.id,
                obj.evaluation.project.title[:20]
            )
        return '-'
    evaluation_project.short_description = '프로젝트'
    
    def evaluator_name(self, obj):
        if obj.evaluation and obj.evaluation.evaluator:
            return obj.evaluation.evaluator.email
        return '익명'
    evaluator_name.short_description = '평가자'
    
    def comparison_display(self, obj):
        if obj.criteria_a and obj.criteria_b:
            return format_html(
                '<span style="font-size: 12px;">{} <strong>vs</strong> {}</span>',
                obj.criteria_a.name[:15],
                obj.criteria_b.name[:15]
            )
        return '-'
    comparison_display.short_description = '비교 기준'
    
    def value_display(self, obj):
        # AHP 스케일 값 표시 (1-9)
        value_colors = {
            1: '#6c757d',    # 회색 - 동등
            3: '#28a745',    # 초록 - 약간 중요
            5: '#007bff',    # 파랑 - 중요
            7: '#ffc107',    # 노랑 - 매우 중요
            9: '#dc3545',    # 빨강 - 절대 중요
        }
        color = '#6c757d'
        for key in sorted(value_colors.keys()):
            if obj.value <= key:
                color = value_colors[key]
                break
        
        # 상대적 중요도 텍스트
        if obj.value == 1:
            text = '동등'
        elif obj.value < 1:
            text = f'← {1/obj.value:.1f}x'
        else:
            text = f'{obj.value:.1f}x →'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, text
        )
    value_display.short_description = '중요도'
    
    def confidence_badge(self, obj):
        conf_colors = {
            'very_high': ('#28a745', '매우 확신'),
            'high': ('#007bff', '확신'),
            'medium': ('#ffc107', '보통'),
            'low': ('#fd7e14', '불확신'),
            'very_low': ('#dc3545', '매우 불확신')
        }
        color, text = conf_colors.get(obj.confidence, ('#6c757d', '미정'))
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, text
        )
    confidence_badge.short_description = '확신도'
    
    def answered_time(self, obj):
        if obj.answered_at:
            # 오늘이면 시간만, 아니면 날짜 표시
            if obj.answered_at.date() == timezone.now().date():
                return obj.answered_at.strftime('%H:%M')
            return obj.answered_at.strftime('%m/%d %H:%M')
        return '-'
    answered_time.short_description = '응답 시간'


@admin.register(EvaluationInvitation)
class EvaluationInvitationAdmin(admin.ModelAdmin):
    """평가 초대 관리"""
    list_display = [
        'project_title', 'evaluator_email', 'invited_by_name',
        'status_badge', 'sent_time', 'response_time', 'expires_badge'
    ]
    list_filter = ['status', 'sent_at', 'project']
    search_fields = ['project__title', 'evaluator__email', 'invited_by__email']
    readonly_fields = ['token', 'sent_at', 'responded_at']
    ordering = ['-sent_at']
    
    fieldsets = (
        ('초대 정보', {
            'fields': ('project', 'evaluator', 'invited_by')
        }),
        ('메시지', {
            'fields': ('message',)
        }),
        ('상태', {
            'fields': ('status', 'sent_at', 'responded_at', 'expires_at')
        }),
        ('보안', {
            'fields': ('token',),
            'classes': ('collapse',)
        }),
    )
    
    def project_title(self, obj):
        if obj.project:
            return format_html(
                '<a href="/admin/projects/project/{}/change/" title="{}">{}</a>',
                obj.project.id, obj.project.title, obj.project.title[:25]
            )
        return '-'
    project_title.short_description = '프로젝트'
    
    def evaluator_email(self, obj):
        if obj.evaluator:
            return format_html(
                '📧 <a href="mailto:{}">{}</a>',
                obj.evaluator.email, obj.evaluator.email
            )
        return '-'
    evaluator_email.short_description = '초대 대상'
    
    def invited_by_name(self, obj):
        if obj.invited_by:
            return obj.invited_by.email
        return '시스템'
    invited_by_name.short_description = '초대자'
    
    def status_badge(self, obj):
        status_info = {
            'pending': ('⏳', '#ffc107', '대기'),
            'sent': ('✉️', '#17a2b8', '발송'),
            'accepted': ('✅', '#28a745', '수락'),
            'declined': ('❌', '#dc3545', '거절'),
            'expired': ('⏰', '#6c757d', '만료')
        }
        icon, color, text = status_info.get(obj.status, ('❓', '#6c757d', '알수없음'))
        return format_html(
            '{} <span style="color: {}; font-weight: bold;">{}</span>',
            icon, color, text
        )
    status_badge.short_description = '상태'
    
    def sent_time(self, obj):
        if obj.sent_at:
            days_ago = (timezone.now() - obj.sent_at).days
            if days_ago == 0:
                return '오늘'
            elif days_ago == 1:
                return '어제'
            elif days_ago < 7:
                return f'{days_ago}일 전'
            else:
                return obj.sent_at.strftime('%m/%d')
        return '-'
    sent_time.short_description = '발송일'
    
    def response_time(self, obj):
        if obj.responded_at:
            if obj.sent_at:
                duration = obj.responded_at - obj.sent_at
                hours = int(duration.total_seconds() / 3600)
                if hours < 24:
                    return f'{hours}시간'
                else:
                    days = hours // 24
                    return f'{days}일'
            return obj.responded_at.strftime('%m/%d')
        return '-'
    response_time.short_description = '응답 시간'
    
    def expires_badge(self, obj):
        if obj.expires_at:
            if obj.expires_at < timezone.now():
                return format_html('<span style="color: #dc3545;">⏰ 만료됨</span>')
            days_left = (obj.expires_at - timezone.now()).days
            if days_left < 3:
                return format_html('<span style="color: #ffc107;">⚠️ {}일 남음</span>', days_left)
            return format_html('<span style="color: #28a745;">✅ {}일 남음</span>', days_left)
        return '-'
    expires_badge.short_description = '만료'
    
    actions = ['resend_invitations', 'extend_expiry']
    
    def resend_invitations(self, request, queryset):
        """초대 재발송"""
        count = queryset.filter(status='pending').update(sent_at=timezone.now(), status='sent')
        self.message_user(request, f'{count}개의 초대를 재발송했습니다.')
    resend_invitations.short_description = '선택된 초대 재발송'
    
    def extend_expiry(self, request, queryset):
        """만료일 7일 연장"""
        from datetime import timedelta
        new_expiry = timezone.now() + timedelta(days=7)
        count = queryset.update(expires_at=new_expiry)
        self.message_user(request, f'{count}개의 초대 만료일을 연장했습니다.')
    extend_expiry.short_description = '만료일 7일 연장'


@admin.register(EvaluationSession)
class EvaluationSessionAdmin(admin.ModelAdmin):
    """평가 세션 관리"""
    list_display = [
        'evaluation_info', 'session_status', 'duration_display',
        'browser_info', 'ip_location', 'started_time'
    ]
    list_filter = ['started_at', 'ended_at']
    search_fields = ['evaluation__project__title', 'evaluation__evaluator__email', 'ip_address']
    readonly_fields = ['started_at', 'ended_at', 'duration']
    ordering = ['-started_at']
    
    fieldsets = (
        ('평가 정보', {
            'fields': ('evaluation',)
        }),
        ('세션 정보', {
            'fields': ('started_at', 'ended_at', 'duration')
        }),
        ('활동 정보', {
            'fields': ('page_views', 'interactions'),
            'classes': ('collapse',)
        }),
        ('접속 정보', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    def evaluation_info(self, obj):
        if obj.evaluation:
            return format_html(
                '<strong>{}</strong><br><small>{}</small>',
                obj.evaluation.project.title[:25],
                obj.evaluation.evaluator.email if obj.evaluation.evaluator else '익명'
            )
        return '-'
    evaluation_info.short_description = '평가 정보'
    
    def session_status(self, obj):
        if obj.ended_at:
            return format_html('<span style="color: #28a745;">✅ 완료</span>')
        elif obj.started_at:
            # 현재 진행 중인 시간 계산
            duration = timezone.now() - obj.started_at
            minutes = int(duration.total_seconds() / 60)
            return format_html(
                '<span style="color: #007bff;">🔄 진행중 ({}분)</span>',
                minutes
            )
        return format_html('<span style="color: #6c757d;">⏳ 대기</span>')
    session_status.short_description = '상태'
    
    def duration_display(self, obj):
        if obj.duration:
            minutes = int(obj.duration / 60)
            if minutes < 60:
                return f'{minutes}분'
            hours = minutes // 60
            remaining_minutes = minutes % 60
            return f'{hours}시간 {remaining_minutes}분'
        elif obj.started_at and not obj.ended_at:
            # 진행 중인 경우
            duration = timezone.now() - obj.started_at
            minutes = int(duration.total_seconds() / 60)
            return f'~{minutes}분'
        return '-'
    duration_display.short_description = '소요 시간'
    
    def browser_info(self, obj):
        if obj.user_agent:
            # 간단한 브라우저 감지
            if 'Chrome' in obj.user_agent:
                return '🌐 Chrome'
            elif 'Firefox' in obj.user_agent:
                return '🦊 Firefox'
            elif 'Safari' in obj.user_agent:
                return '🧭 Safari'
            elif 'Edge' in obj.user_agent:
                return '🌊 Edge'
            return '🌏 기타'
        return '-'
    browser_info.short_description = '브라우저'
    
    def ip_location(self, obj):
        if obj.ip_address:
            # IP 주소 마스킹 (개인정보 보호)
            parts = obj.ip_address.split('.')
            if len(parts) == 4:
                return f'{parts[0]}.{parts[1]}.*.* '
            return obj.ip_address[:10] + '...'
        return '-'
    ip_location.short_description = 'IP'
    
    def started_time(self, obj):
        if obj.started_at:
            return obj.started_at.strftime('%m/%d %H:%M')
        return '-'
    started_time.short_description = '시작 시간'


@admin.register(DemographicSurvey)
class DemographicSurveyAdmin(admin.ModelAdmin):
    """Demographic Survey admin"""
    list_display = (
        'evaluator', 'project', 'age', 'gender', 'education', 'occupation',
        'is_completed', 'completion_percentage', 'created_at'
    )
    list_filter = ('is_completed', 'age', 'gender', 'education', 'project', 'created_at')
    search_fields = ('evaluator__username', 'project__title', 'occupation', 'department')
    readonly_fields = ('created_at', 'updated_at', 'completion_timestamp', 'completion_percentage')
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('evaluator', 'project')
        }),
        ('인구통계학적 정보', {
            'fields': ('age', 'gender', 'education', 'occupation')
        }),
        ('전문 정보', {
            'fields': ('experience', 'department', 'position', 'project_experience')
        }),
        ('의사결정 역할', {
            'fields': ('decision_role', 'additional_info')
        }),
        ('완료 상태', {
            'fields': ('is_completed', 'completion_timestamp', 'completion_percentage')
        }),
        ('메타데이터', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def completion_percentage(self, obj):
        """완성도 표시"""
        # 완성도 계산 (필드 채움 정도)
        fields = ['age', 'gender', 'education', 'occupation', 'experience']
        filled = sum(1 for f in fields if getattr(obj, f, None))
        percentage = (filled / len(fields)) * 100
        
        color = '#28a745' if percentage >= 80 else '#ffc107' if percentage >= 50 else '#dc3545'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.0f}%</span>',
            color, percentage
        )
    completion_percentage.short_description = "완성도"
    
    actions = ['mark_as_completed', 'export_survey_data']
    
    def mark_as_completed(self, request, queryset):
        """설문 완료 처리"""
        updated = queryset.update(is_completed=True, completion_timestamp=timezone.now())
        self.message_user(request, f'{updated}개의 설문을 완료 처리했습니다.')
    mark_as_completed.short_description = '선택된 설문 완료 처리'
    
    def export_survey_data(self, request, queryset):
        """설문 데이터 내보내기"""
        # 실제 구현은 CSV 파일 생성 등으로 확장 가능
        count = queryset.count()
        self.message_user(request, f'{count}개의 설문 데이터를 준비했습니다.')
    export_survey_data.short_description = '설문 데이터 내보내기'