from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = '회원 관리'
    
    def ready(self):
        import accounts.signals  # 시그널 등록