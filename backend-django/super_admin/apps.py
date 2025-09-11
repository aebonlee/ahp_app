from django.apps import AppConfig


class SuperAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'super_admin'
    verbose_name = 'Super Admin Management'
    
    def ready(self):
        # 앱이 준비되면 자동으로 슈퍼유저 생성
        try:
            from django.core.management import call_command
            call_command('create_superuser')
        except Exception as e:
            # 마이그레이션 중에는 테이블이 없을 수 있으므로 무시
            pass