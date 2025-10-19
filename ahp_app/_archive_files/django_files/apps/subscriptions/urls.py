"""
구독 관리 URL 설정
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionPlanViewSet,
    UserSubscriptionViewSet,
    PaymentMethodViewSet,
    PaymentRecordViewSet,
    SubscriptionUsageViewSet,
    UsageAlertViewSet,
    PaymentProcessingView,
    LimitCheckView,
    CouponValidationView,
    SubscriptionStatsView
)

app_name = 'subscriptions'

# DRF Router 설정
router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plans')
router.register(r'subscriptions', UserSubscriptionViewSet, basename='user-subscriptions')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-methods')
router.register(r'payment-records', PaymentRecordViewSet, basename='payment-records')
router.register(r'usage', SubscriptionUsageViewSet, basename='subscription-usage')
router.register(r'alerts', UsageAlertViewSet, basename='usage-alerts')

# URL 패턴
urlpatterns = [
    # DRF Router URLs
    path('', include(router.urls)),
    
    # 결제 처리
    path('subscribe/', PaymentProcessingView.as_view(), name='payment-processing'),
    
    # 사용량 제한 확인
    path('check-limits/', LimitCheckView.as_view(), name='limit-check'),
    
    # 쿠폰 검증
    path('validate-coupon/', CouponValidationView.as_view(), name='coupon-validation'),
    
    # 통계 (관리자 전용)
    path('stats/', SubscriptionStatsView.as_view(), name='subscription-stats'),
]