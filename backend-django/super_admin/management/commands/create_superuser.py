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
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created superuser "{username}"')
            )
        
        # 계정 정보 출력
        self.stdout.write(
            self.style.SUCCESS(f'Admin credentials: {username} / {password}')
        )