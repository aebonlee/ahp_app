"""
Django management command to create superuser if not exists
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create superuser if not exists'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@ahp-platform.com'
        password = 'ahp2025admin'
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists')
            )
            # 비밀번호 업데이트
            admin_user = User.objects.get(username=username)
            admin_user.set_password(password)
            admin_user.email = email
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated superuser "{username}" password and permissions')
            )
        else:
            # CustomUser 모델 사용
            admin_user = User(
                username=username,
                email=email,
                first_name='Admin',
                last_name='User',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            admin_user.set_password(password)
            
            # CustomUser 필드 설정
            if hasattr(admin_user, 'user_type'):
                admin_user.user_type = 'super_admin'
            if hasattr(admin_user, 'subscription_tier'):
                admin_user.subscription_tier = 'unlimited'
            if hasattr(admin_user, 'is_verified'):
                admin_user.is_verified = True
                
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser "{username}"')
            )
        
        # 계정 정보 출력
        self.stdout.write(
            self.style.SUCCESS(f'Admin credentials: {username} / {password}')
        )