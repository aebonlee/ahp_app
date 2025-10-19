"""
AI Management App Configuration
"""
from django.apps import AppConfig


class AiManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_management'
    verbose_name = 'AI 관리 시스템'
    
    def ready(self):
        """앱이 준비되었을 때 실행되는 코드"""
        import apps.ai_management.signals  # 시그널 등록