from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = '관리자 계정 생성'

    def handle(self, *args, **options):
        User = get_user_model()
        try:
            if User.objects.filter(username='admin').exists():
                self.stdout.write(
                    self.style.SUCCESS('✅ 관리자 계정이 이미 존재합니다.')
                )
            else:
                User.objects.create_superuser(
                    username='admin',
                    email='admin@ahp-platform.com',
                    password='ahp2025admin'
                )
                self.stdout.write(
                    self.style.SUCCESS('✅ 관리자 계정 생성 완료!')
                )
                self.stdout.write('Username: admin')
                self.stdout.write('Password: ahp2025admin')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ 오류: {e}')
            )