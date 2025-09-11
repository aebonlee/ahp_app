from django.apps import AppConfig


class SuperAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'super_admin'
    verbose_name = 'Super Admin Management'
    
    def ready(self):
        # 앱이 준비되면 자동으로 슈퍼유저 생성
        import os
        import django
        if os.environ.get('RUN_MAIN') != 'true':  # runserver가 reload할 때는 실행하지 않음
            try:
                django.setup()
                from django.core.management import call_command
                call_command('create_superuser')
            except Exception as e:
                # 개발 단계에서는 에러 출력
                import logging
                logging.error(f"Failed to create superuser: {e}")