"""
Django Shell script to check user database
Run with: python manage.py shell < check_users.py
"""
from django.contrib.auth import get_user_model
from super_admin.models import CustomUser
import json

User = get_user_model()

# 전체 사용자 수
total_users = User.objects.count()
print(f"\n{'='*60}")
print(f"📊 AHP Platform 회원 DB 현황")
print(f"{'='*60}")
print(f"총 회원 수: {total_users}명\n")

# 각 사용자 정보
print(f"{'='*60}")
print("🔍 회원 목록:")
print(f"{'='*60}")

for i, user in enumerate(User.objects.all().order_by('-date_joined'), 1):
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
    
    # 구독 티어
    subscription = getattr(user, 'subscription_tier', 'free')
    
    # 마지막 로그인
    last_login = user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else 'Never'
    
    print(f"\n[{i}] {user.username}")
    print(f"    📧 Email: {user.email}")
    print(f"    👤 Name: {user.get_full_name() or 'N/A'}")
    print(f"    🏷️ Type: {user_type}")
    print(f"    💳 Subscription: {subscription}")
    print(f"    ✅ Active: {'Yes' if user.is_active else 'No'}")
    print(f"    📅 Joined: {user.date_joined.strftime('%Y-%m-%d %H:%M')}")
    print(f"    🕐 Last Login: {last_login}")

# 통계 정보
print(f"\n{'='*60}")
print("📈 사용자 통계:")
print(f"{'='*60}")
print(f"- Super Admins: {User.objects.filter(is_superuser=True).count()}명")
print(f"- Staff Users: {User.objects.filter(is_staff=True).count()}명")
print(f"- Active Users: {User.objects.filter(is_active=True).count()}명")
print(f"- Inactive Users: {User.objects.filter(is_active=False).count()}명")

# CustomUser 타입별 통계
if hasattr(CustomUser, 'USER_TYPES'):
    print(f"\n📊 사용자 타입별 통계:")
    for user_type, display_name in CustomUser.USER_TYPES:
        count = User.objects.filter(user_type=user_type).count()
        if count > 0:
            print(f"  - {display_name}: {count}명")

# 구독 티어별 통계
if hasattr(CustomUser, 'SUBSCRIPTION_TIERS'):
    print(f"\n💳 구독 티어별 통계:")
    for tier, display_name in CustomUser.SUBSCRIPTION_TIERS:
        count = User.objects.filter(subscription_tier=tier).count()
        if count > 0:
            print(f"  - {display_name}: {count}명")

# 최근 가입자
recent_users = User.objects.order_by('-date_joined')[:5]
if recent_users:
    print(f"\n🆕 최근 가입자 (최근 5명):")
    for user in recent_users:
        print(f"  - {user.username} ({user.email}) - {user.date_joined.strftime('%Y-%m-%d')}")

print(f"\n{'='*60}")
print("✅ 회원 DB 조회 완료")
print(f"{'='*60}\n")