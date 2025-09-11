from django.apps import AppConfig

class SimpleServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'simple_service'
    
    def ready(self):
        """Django 앱 시작 시 실행 - aebon 계정 자동 생성"""
        try:
            from django.contrib.auth.models import User
            import os
            
            # migration 중이거나 테스트 중일 때는 실행하지 않음
            if 'migrate' in os.sys.argv or 'test' in os.sys.argv:
                return
            
            # aebon 계정이 없으면 생성
            if not User.objects.filter(username='aebon').exists():
                User.objects.create_superuser(
                    username='aebon',
                    email='aebon@example.com', 
                    password='aebon2025',
                    first_name='aebon',
                    last_name='Super Admin'
                )
                print("👑 AEBON 최고관리자 계정 자동 생성 완료!")
            else:
                # 기존 aebon 계정 권한 보장
                user = User.objects.get(username='aebon')
                if not user.is_superuser or not user.is_staff:
                    user.is_superuser = True
                    user.is_staff = True
                    user.save()
                    print("👑 AEBON 최고관리자 권한 업데이트 완료!")
                    
        except Exception as e:
            # DB가 아직 준비되지 않았을 수 있으므로 에러는 무시
            pass