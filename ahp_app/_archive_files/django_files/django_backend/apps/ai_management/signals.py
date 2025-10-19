"""
AI Management Signals
사용량 업데이트, 알림 발송 등의 자동화 처리
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import AIUsageLog, UserAIAccess, AIServiceSettings


@receiver(post_save, sender=AIUsageLog)
def update_user_usage_stats(sender, instance, created, **kwargs):
    """AI 사용 로그 생성 시 사용자 사용량 통계 업데이트"""
    if created:
        try:
            user_access = UserAIAccess.objects.get(user=instance.user)
            
            # 오늘 사용량 업데이트
            user_access.tokens_used_today += instance.tokens_used
            user_access.requests_today += 1
            
            # 이번 달 사용량 업데이트
            user_access.tokens_used_month += instance.tokens_used
            user_access.requests_month += 1
            
            user_access.save(update_fields=[
                'tokens_used_today', 'requests_today',
                'tokens_used_month', 'requests_month'
            ])
            
            # 사용량 알림 체크
            if user_access.should_send_alert:
                send_usage_alert(user_access)
                
        except UserAIAccess.DoesNotExist:
            pass


@receiver(pre_save, sender=AIServiceSettings)
def validate_default_setting(sender, instance, **kwargs):
    """기본 설정 유효성 검증"""
    if instance.is_default:
        # 같은 제공자의 다른 기본 설정들을 False로 변경
        AIServiceSettings.objects.filter(
            provider=instance.provider,
            is_default=True
        ).exclude(pk=instance.pk).update(is_default=False)


def send_usage_alert(user_access):
    """사용량 알림 이메일 발송"""
    if not user_access.email_usage_alerts:
        return
    
    user = user_access.user
    if not user.email:
        return
    
    subject = f'[AHP 플랫폼] AI 사용량 알림 - {user_access.usage_percentage:.1f}% 사용'
    
    message = f"""
안녕하세요, {user.get_full_name() or user.username}님

AI 서비스 사용량이 설정하신 알림 임계값({user_access.usage_alert_threshold}%)에 도달했습니다.

📊 현재 사용량:
- 이번 달 사용 토큰: {user_access.tokens_used_month:,} / {user_access.ai_plan.monthly_token_limit:,}
- 사용률: {user_access.usage_percentage:.1f}%
- 요금제: {user_access.ai_plan.get_name_display()}

사용량이 한도에 도달하면 AI 기능 사용이 제한될 수 있습니다.
추가 문의사항은 관리자에게 연락해주세요.

감사합니다.
AHP 플랫폼 팀
"""
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"사용량 알림 이메일 발송 실패: {e}")