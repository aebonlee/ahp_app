"""
Django management command to list all users in the database
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from super_admin.models import CustomUser

User = get_user_model()

class Command(BaseCommand):
    help = 'List all users in the database'

    def handle(self, *args, **options):
        # 전체 사용자 수
        total_users = User.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\n📊 총 회원 수: {total_users}명\n')
        )
        
        # 각 사용자 정보 출력
        self.stdout.write(self.style.WARNING('=' * 80))
        self.stdout.write(self.style.SUCCESS('회원 목록:'))
        self.stdout.write(self.style.WARNING('=' * 80))
        
        for user in User.objects.all().order_by('-date_joined'):
            # 사용자 타입 결정
            if user.is_superuser:
                user_type = '🔴 Super Admin'
            elif user.is_staff:
                user_type = '🟠 Staff'
            elif hasattr(user, 'user_type'):
                user_type_map = {
                    'super_admin': '🔴 Super Admin',
                    'admin': '🟠 Admin',
                    'personal_service': '🔵 개인서비스',
                    'evaluator': '🟢 평가자',
                    'enterprise': '🟣 기업'
                }
                user_type = user_type_map.get(user.user_type, '⚪ 일반')
            else:
                user_type = '⚪ 일반'
            
            # 구독 티어 정보
            subscription_tier = getattr(user, 'subscription_tier', 'N/A')
            
            # 마지막 로그인 정보
            last_login = user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else 'Never'
            
            # 사용자 정보 출력
            self.stdout.write(f'\n{"-" * 40}')
            self.stdout.write(f'ID: {user.id}')
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Name: {user.get_full_name() or "N/A"}')
            self.stdout.write(f'Type: {user_type}')
            self.stdout.write(f'Subscription: {subscription_tier}')
            self.stdout.write(f'Active: {"✅ Yes" if user.is_active else "❌ No"}')
            self.stdout.write(f'Joined: {user.date_joined.strftime("%Y-%m-%d %H:%M")}')
            self.stdout.write(f'Last Login: {last_login}')
        
        self.stdout.write(self.style.WARNING('\n' + '=' * 80))
        
        # 통계 정보
        self.stdout.write(self.style.SUCCESS('\n📈 사용자 통계:'))
        self.stdout.write(f'- Super Admins: {User.objects.filter(is_superuser=True).count()}명')
        self.stdout.write(f'- Staff: {User.objects.filter(is_staff=True).count()}명')
        self.stdout.write(f'- Active Users: {User.objects.filter(is_active=True).count()}명')
        
        # CustomUser 모델의 타입별 통계
        if hasattr(User, 'user_type'):
            self.stdout.write(self.style.SUCCESS('\n📊 사용자 타입별 통계:'))
            for user_type, display_name in CustomUser.USER_TYPES:
                count = User.objects.filter(user_type=user_type).count()
                if count > 0:
                    self.stdout.write(f'- {display_name}: {count}명')
            
            # 구독 티어별 통계
            if hasattr(CustomUser, 'SUBSCRIPTION_TIERS'):
                self.stdout.write(self.style.SUCCESS('\n💳 구독 티어별 통계:'))
                for tier, display_name in CustomUser.SUBSCRIPTION_TIERS:
                    count = User.objects.filter(subscription_tier=tier).count()
                    if count > 0:
                        self.stdout.write(f'- {display_name}: {count}명')
        
        # 최근 가입자
        recent_users = User.objects.order_by('-date_joined')[:5]
        if recent_users:
            self.stdout.write(self.style.SUCCESS('\n🆕 최근 가입자 (최근 5명):'))
            for user in recent_users:
                self.stdout.write(f'- {user.username} ({user.email}) - {user.date_joined.strftime("%Y-%m-%d")}')