"""
구독 관리 API 뷰
"""
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count, Q, Avg
from django.contrib.auth import get_user_model
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import (
    SubscriptionPlan, UserSubscription, PaymentMethod,
    PaymentRecord, SubscriptionUsage, UsageAlert, CouponCode
)
from .serializers import (
    SubscriptionPlanSerializer, UserSubscriptionSerializer,
    PaymentMethodSerializer, PaymentRecordSerializer,
    SubscriptionUsageSerializer, UsageAlertSerializer,
    CouponCodeSerializer, PaymentRequestSerializer,
    SubscriptionStatsSerializer, LimitCheckSerializer
)

User = get_user_model()


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """구독 플랜 조회 API"""
    
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 인기 플랜만 조회
        if self.request.query_params.get('popular_only'):
            queryset = queryset.filter(is_popular=True)
        
        # 플랜 타입별 필터
        plan_type = self.request.query_params.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        
        return queryset.order_by('sort_order', 'price')


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    """사용자 구독 관리 API"""
    
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return UserSubscription.objects.all().select_related('user', 'plan').prefetch_related('usage', 'payment_records')
        return UserSubscription.objects.filter(user=user).select_related('plan').prefetch_related('usage', 'payment_records')
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """현재 사용자의 구독 정보 조회"""
        try:
            subscription = UserSubscription.objects.select_related('plan').prefetch_related('usage').get(
                user=request.user
            )
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except UserSubscription.DoesNotExist:
            return Response({'detail': '구독 정보가 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """구독 취소"""
        subscription = self.get_object()
        
        if subscription.user != request.user and not request.user.is_superuser:
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        
        subscription.status = 'cancelled'
        subscription.auto_renew = False
        subscription.save()
        
        return Response({'detail': '구독이 취소되었습니다.'})
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """구독 갱신"""
        subscription = self.get_object()
        
        if subscription.user != request.user and not request.user.is_superuser:
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        
        if subscription.status in ['cancelled', 'expired']:
            subscription.status = 'active'
            subscription.end_date = timezone.now() + timedelta(days=30 * subscription.plan.duration_months)
            subscription.auto_renew = True
            subscription.save()
            
            return Response({'detail': '구독이 갱신되었습니다.'})
        
        return Response({'detail': '갱신할 수 없는 구독 상태입니다.'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """결제 수단 관리 API"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # 첫 번째 결제 수단은 자동으로 기본 결제 수단으로 설정
        is_first_payment_method = not PaymentMethod.objects.filter(user=self.request.user).exists()
        
        serializer.save(
            user=self.request.user,
            is_primary=is_first_payment_method or serializer.validated_data.get('is_primary', False)
        )
        
        # 새로운 기본 결제 수단 설정 시 기존 기본 결제 수단 해제
        if serializer.instance.is_primary:
            PaymentMethod.objects.filter(
                user=self.request.user,
                is_primary=True
            ).exclude(id=serializer.instance.id).update(is_primary=False)
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """기본 결제 수단 설정"""
        payment_method = self.get_object()
        
        # 기존 기본 결제 수단 해제
        PaymentMethod.objects.filter(
            user=request.user,
            is_primary=True
        ).update(is_primary=False)
        
        # 새로운 기본 결제 수단 설정
        payment_method.is_primary = True
        payment_method.save()
        
        return Response({'detail': '기본 결제 수단으로 설정되었습니다.'})


class PaymentRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """결제 기록 조회 API"""
    
    serializer_class = PaymentRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return PaymentRecord.objects.all().select_related('subscription__user', 'payment_method')
        return PaymentRecord.objects.filter(subscription__user=user).select_related('payment_method')


class SubscriptionUsageViewSet(viewsets.ReadOnlyModelViewSet):
    """구독 사용량 조회 API"""
    
    serializer_class = SubscriptionUsageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return SubscriptionUsage.objects.all().select_related('subscription__user')
        return SubscriptionUsage.objects.filter(subscription__user=user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """현재 사용자의 사용량 조회"""
        try:
            usage = SubscriptionUsage.objects.select_related('subscription').get(
                subscription__user=request.user
            )
            serializer = self.get_serializer(usage)
            return Response(serializer.data)
        except SubscriptionUsage.DoesNotExist:
            return Response({'detail': '사용량 정보가 없습니다.'}, status=status.HTTP_404_NOT_FOUND)


class PaymentProcessingView(APIView):
    """결제 처리 API"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(request=PaymentRequestSerializer)
    def post(self, request):
        """구독 플랜 결제 처리"""
        serializer = PaymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            with transaction.atomic():
                # 대상 사용자 결정 (슈퍼 관리자가 다른 사용자를 위한 결제인 경우)
                target_user = request.user
                if request.user.is_superuser and data.get('target_user_id'):
                    try:
                        target_user = User.objects.get(id=data['target_user_id'])
                    except User.DoesNotExist:
                        return Response({'detail': '대상 사용자를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
                
                # 플랜 조회
                plan = SubscriptionPlan.objects.get(plan_id=data['plan_id'], is_active=True)
                
                # 기존 구독 확인 및 처리
                existing_subscription = UserSubscription.objects.filter(user=target_user).first()
                if existing_subscription:
                    if existing_subscription.status == 'active':
                        return Response({'detail': '이미 활성 구독이 있습니다.'}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        # 기존 비활성 구독 삭제
                        existing_subscription.delete()
                
                # 결제 수단 생성 또는 업데이트
                payment_method = None
                if data['payment_method_type'] == 'card':
                    payment_method = PaymentMethod.objects.create(
                        user=target_user,
                        payment_type='card',
                        card_last_four=data['card_number'][-4:],
                        card_brand=self._detect_card_brand(data['card_number']),
                        card_expiry_month=data['card_expiry_month'],
                        card_expiry_year=data['card_expiry_year'],
                        is_primary=True
                    )
                elif data['payment_method_type'] == 'bank_transfer':
                    payment_method = PaymentMethod.objects.create(
                        user=target_user,
                        payment_type='bank_transfer',
                        bank_name=data['bank_name'],
                        account_last_four=data['account_number'][-4:],
                        account_holder_name=data['account_holder_name'],
                        is_primary=True
                    )
                
                # 구독 생성
                start_date = timezone.now()
                end_date = start_date + timedelta(days=30 * plan.duration_months)
                
                subscription = UserSubscription.objects.create(
                    user=target_user,
                    plan=plan,
                    status='active',
                    start_date=start_date,
                    end_date=end_date,
                    auto_renew=True,
                    next_billing_date=end_date,
                    custom_max_projects=data.get('custom_max_projects'),
                    custom_max_evaluators=data.get('custom_max_evaluators'),
                    custom_ai_enabled=data.get('custom_ai_enabled'),
                    created_by=request.user
                )
                
                # 사용량 추적 초기화
                SubscriptionUsage.objects.create(subscription=subscription)
                
                # 쿠폰 할인 계산
                discount_amount = Decimal('0')
                coupon_code = data.get('coupon_code')
                if coupon_code:
                    try:
                        coupon = CouponCode.objects.get(code=coupon_code, is_active=True)
                        if coupon.can_be_used_by_user(target_user):
                            discount_amount = coupon.calculate_discount(plan.price)
                            coupon.current_uses += 1
                            coupon.save()
                    except CouponCode.DoesNotExist:
                        pass
                
                # 결제 기록 생성
                final_amount = plan.price - discount_amount
                payment_record = PaymentRecord.objects.create(
                    subscription=subscription,
                    payment_method=payment_method,
                    payment_type='subscription',
                    amount=final_amount,
                    currency=plan.currency,
                    status='completed',  # 실제로는 결제 게이트웨이 처리 후 상태 업데이트
                    transaction_id=f"TXN_{uuid.uuid4().hex[:12].upper()}",
                    coupon_code=coupon_code,
                    discount_amount=discount_amount,
                    billing_period_start=start_date,
                    billing_period_end=end_date,
                    paid_at=timezone.now(),
                    description=f"{plan.name} 구독 결제"
                )
                
                # 실제 결제 게이트웨이 처리는 여기서 구현
                # payment_success = self._process_payment_gateway(payment_record, data)
                payment_success = True  # 임시로 성공 처리
                
                if payment_success:
                    return Response({
                        'success': True,
                        'subscription_id': subscription.id,
                        'payment_id': payment_record.id,
                        'message': '결제가 성공적으로 처리되었습니다.'
                    })
                else:
                    # 결제 실패 시 롤백
                    payment_record.status = 'failed'
                    payment_record.save()
                    subscription.status = 'pending'
                    subscription.save()
                    
                    return Response({
                        'success': False,
                        'error': '결제 처리 중 오류가 발생했습니다.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': '플랜을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'결제 처리 중 오류가 발생했습니다: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _detect_card_brand(self, card_number):
        """카드 브랜드 감지"""
        card_number = card_number.replace(' ', '')
        
        if card_number.startswith('4'):
            return 'Visa'
        elif card_number.startswith(('51', '52', '53', '54', '55')):
            return 'Mastercard'
        elif card_number.startswith(('34', '37')):
            return 'American Express'
        elif card_number.startswith('6011'):
            return 'Discover'
        else:
            return 'Unknown'


class UsageAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """사용량 알림 API"""
    
    serializer_class = UsageAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return UsageAlert.objects.all().select_related('subscription__user')
        return UsageAlert.objects.filter(subscription__user=user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """알림을 읽음으로 표시"""
        alert = self.get_object()
        alert.mark_as_read()
        return Response({'detail': '알림이 읽음 처리되었습니다.'})
    
    @action(detail=True, methods=['post'])
    def mark_resolved(self, request, pk=None):
        """알림을 해결됨으로 표시"""
        alert = self.get_object()
        alert.mark_as_resolved()
        return Response({'detail': '알림이 해결 처리되었습니다.'})


class LimitCheckView(APIView):
    """사용량 제한 확인 API"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(request=LimitCheckSerializer)
    def post(self, request):
        """리소스 사용 가능 여부 확인"""
        serializer = LimitCheckSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            subscription = UserSubscription.objects.select_related('plan').get(
                user=request.user,
                status='active'
            )
            
            if hasattr(subscription, 'usage'):
                usage = subscription.usage
                allowed = usage.check_limit(
                    data['resource_type'],
                    data['required_amount']
                )
                
                return Response({
                    'allowed': allowed,
                    'resource_type': data['resource_type'],
                    'required_amount': data['required_amount'],
                    'current_usage': getattr(usage, f"current_{data['resource_type']}", 0),
                    'limit': getattr(subscription.plan, f"max_{data['resource_type']}_per_project", -1)
                })
            else:
                return Response({'detail': '사용량 정보가 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
                
        except UserSubscription.DoesNotExist:
            return Response({'detail': '활성 구독이 없습니다.'}, status=status.HTTP_404_NOT_FOUND)


class CouponValidationView(APIView):
    """쿠폰 코드 검증 API"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """쿠폰 코드 유효성 검증"""
        coupon_code = request.data.get('coupon_code')
        plan_id = request.data.get('plan_id')
        
        if not coupon_code:
            return Response({'detail': '쿠폰 코드가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = CouponCode.objects.get(code=coupon_code.upper(), is_active=True)
            
            if not coupon.is_valid:
                return Response({
                    'valid': False,
                    'message': '유효하지 않은 쿠폰 코드입니다.'
                })
            
            if not coupon.can_be_used_by_user(request.user):
                return Response({
                    'valid': False,
                    'message': '이미 사용한 쿠폰 코드입니다.'
                })
            
            # 플랜별 적용 가능 여부 확인
            if plan_id and coupon.applicable_plans.exists():
                if not coupon.applicable_plans.filter(plan_id=plan_id).exists():
                    return Response({
                        'valid': False,
                        'message': '이 플랜에 적용할 수 없는 쿠폰입니다.'
                    })
            
            # 할인 금액 계산
            discount_amount = Decimal('0')
            if plan_id:
                try:
                    plan = SubscriptionPlan.objects.get(plan_id=plan_id, is_active=True)
                    discount_amount = coupon.calculate_discount(plan.price)
                except SubscriptionPlan.DoesNotExist:
                    pass
            
            return Response({
                'valid': True,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
                'discount_amount': discount_amount,
                'message': f'{coupon.name} 쿠폰이 적용되었습니다.'
            })
            
        except CouponCode.DoesNotExist:
            return Response({
                'valid': False,
                'message': '존재하지 않는 쿠폰 코드입니다.'
            })


class SubscriptionStatsView(APIView):
    """구독 통계 API (관리자 전용)"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """구독 관련 통계 조회"""
        if not request.user.is_superuser:
            return Response({'detail': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        
        # 기본 통계
        total_active_subscriptions = UserSubscription.objects.filter(status='active').count()
        total_revenue = PaymentRecord.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0')
        
        # 플랜별 분포
        plan_distribution = dict(
            UserSubscription.objects.filter(status='active').values_list(
                'plan__name'
            ).annotate(count=Count('id')).values_list('plan__name', 'count')
        )
        
        # 월별 수익 (최근 12개월)
        revenue_by_month = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30 * i)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            monthly_revenue = PaymentRecord.objects.filter(
                status='completed',
                paid_at__range=[month_start, month_end]
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            revenue_by_month.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': float(monthly_revenue)
            })
        
        revenue_by_month.reverse()
        
        # 성장률 계산 (이번 달 vs 지난 달)
        current_month = timezone.now().replace(day=1)
        last_month = current_month - timedelta(days=1)
        last_month_start = last_month.replace(day=1)
        
        current_month_subs = UserSubscription.objects.filter(
            created_at__gte=current_month
        ).count()
        last_month_subs = UserSubscription.objects.filter(
            created_at__range=[last_month_start, current_month]
        ).count()
        
        monthly_growth = 0
        if last_month_subs > 0:
            monthly_growth = ((current_month_subs - last_month_subs) / last_month_subs) * 100
        
        # ARPU (Average Revenue Per User)
        active_users = UserSubscription.objects.filter(status='active').count()
        arpu = total_revenue / active_users if active_users > 0 else Decimal('0')
        
        stats_data = {
            'total_active_subscriptions': total_active_subscriptions,
            'total_revenue': total_revenue,
            'plan_distribution': plan_distribution,
            'monthly_growth': monthly_growth,
            'revenue_by_month': revenue_by_month,
            'user_acquisition_rate': monthly_growth,
            'churn_rate': 0,  # 실제로는 더 복잡한 계산 필요
            'average_revenue_per_user': arpu
        }
        
        serializer = SubscriptionStatsSerializer(stats_data)
        return Response(serializer.data)