"""
Evaluator Management Views for Web Frontend
Compatible with existing React components
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.paginator import Paginator
from django.db.models import Q, Count
from .serializers import UserSummarySerializer, UserSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluator_list(request):
    """
    Get list of evaluators for management page
    Compatible with: https://aebonlee.github.io/ahp_app/?tab=evaluator-management
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        search = request.GET.get('search', '').strip()
        status_filter = request.GET.get('status', 'all')
        
        # Base query for evaluators
        evaluators = User.objects.filter(is_evaluator=True)
        
        # Apply search filter
        if search:
            evaluators = evaluators.filter(
                Q(username__icontains=search) |
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(organization__icontains=search)
            )
        
        # Apply status filter
        if status_filter == 'active':
            evaluators = evaluators.filter(is_active=True)
        elif status_filter == 'inactive':
            evaluators = evaluators.filter(is_active=False)
        
        # Order by last activity
        evaluators = evaluators.order_by('-last_activity', '-date_joined')
        
        # Add evaluation statistics
        evaluators = evaluators.annotate(
            total_evaluations=Count('evaluations'),
            completed_evaluations=Count('evaluations', filter=Q(evaluations__status='completed'))
        )
        
        # Pagination
        paginator = Paginator(evaluators, 20)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        evaluator_data = []
        for evaluator in page_obj:
            evaluator_info = {
                'id': evaluator.id,
                'username': evaluator.username,
                'email': evaluator.email,
                'fullName': evaluator.full_name or evaluator.get_full_name(),
                'organization': evaluator.organization,
                'department': evaluator.department,
                'position': evaluator.position,
                'isActive': evaluator.is_active,
                'dateJoined': evaluator.date_joined,
                'lastActivity': evaluator.last_activity,
                'totalEvaluations': evaluator.total_evaluations,
                'completedEvaluations': evaluator.completed_evaluations,
                'completionRate': (
                    evaluator.completed_evaluations / evaluator.total_evaluations * 100
                    if evaluator.total_evaluations > 0 else 0
                )
            }
            evaluator_data.append(evaluator_info)
        
        return Response({
            'success': True,
            'evaluators': evaluator_data,
            'pagination': {
                'currentPage': page,
                'totalPages': paginator.num_pages,
                'totalCount': paginator.count,
                'hasNext': page_obj.has_next(),
                'hasPrevious': page_obj.has_previous()
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Evaluator list error: {str(e)}")
        return Response({
            'success': False,
            'message': '평가자 목록 조회 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_evaluator(request):
    """
    Create new evaluator account
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'fullName']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'success': False,
                    'message': f'{field}는 필수 입력 항목입니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username/email already exists
        if User.objects.filter(username=data['username']).exists():
            return Response({
                'success': False,
                'message': '이미 존재하는 사용자명입니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=data['email']).exists():
            return Response({
                'success': False,
                'message': '이미 존재하는 이메일입니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create evaluator user
        with transaction.atomic():
            evaluator = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                full_name=data['fullName'],
                organization=data.get('organization', ''),
                department=data.get('department', ''),
                position=data.get('position', ''),
                phone=data.get('phone', ''),
                is_evaluator=True
            )
        
        evaluator_data = {
            'id': evaluator.id,
            'username': evaluator.username,
            'email': evaluator.email,
            'fullName': evaluator.full_name,
            'organization': evaluator.organization,
            'department': evaluator.department,
            'position': evaluator.position,
            'isActive': evaluator.is_active,
            'dateJoined': evaluator.date_joined
        }
        
        return Response({
            'success': True,
            'message': '평가자 계정이 생성되었습니다.',
            'evaluator': evaluator_data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Create evaluator error: {str(e)}")
        return Response({
            'success': False,
            'message': '평가자 생성 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_evaluator(request, evaluator_id):
    """
    Update evaluator information
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get evaluator
        try:
            evaluator = User.objects.get(id=evaluator_id, is_evaluator=True)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': '평가자를 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data
        
        # Update allowed fields
        updatable_fields = [
            'full_name', 'email', 'organization', 'department', 
            'position', 'phone', 'is_active'
        ]
        
        updated = False
        for field in updatable_fields:
            if field in data:
                if field == 'email':
                    # Check email uniqueness
                    if User.objects.filter(email=data['email']).exclude(id=evaluator.id).exists():
                        return Response({
                            'success': False,
                            'message': '이미 존재하는 이메일입니다.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                setattr(evaluator, field, data[field])
                updated = True
        
        if updated:
            evaluator.save()
        
        evaluator_data = {
            'id': evaluator.id,
            'username': evaluator.username,
            'email': evaluator.email,
            'fullName': evaluator.full_name,
            'organization': evaluator.organization,
            'department': evaluator.department,
            'position': evaluator.position,
            'phone': evaluator.phone,
            'isActive': evaluator.is_active
        }
        
        return Response({
            'success': True,
            'message': '평가자 정보가 업데이트되었습니다.',
            'evaluator': evaluator_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Update evaluator error: {str(e)}")
        return Response({
            'success': False,
            'message': '평가자 업데이트 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_evaluator(request, evaluator_id):
    """
    Deactivate evaluator (soft delete)
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get evaluator
        try:
            evaluator = User.objects.get(id=evaluator_id, is_evaluator=True)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': '평가자를 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Soft delete (deactivate)
        evaluator.is_active = False
        evaluator.save()
        
        return Response({
            'success': True,
            'message': '평가자가 비활성화되었습니다.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Delete evaluator error: {str(e)}")
        return Response({
            'success': False,
            'message': '평가자 삭제 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluator_statistics(request):
    """
    Get evaluator management statistics
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate statistics
        total_evaluators = User.objects.filter(is_evaluator=True).count()
        active_evaluators = User.objects.filter(is_evaluator=True, is_active=True).count()
        inactive_evaluators = total_evaluators - active_evaluators
        
        # Recent activity
        recent_evaluators = User.objects.filter(
            is_evaluator=True,
            last_activity__isnull=False
        ).order_by('-last_activity')[:5]
        
        recent_activity = []
        for evaluator in recent_evaluators:
            recent_activity.append({
                'username': evaluator.username,
                'fullName': evaluator.full_name,
                'lastActivity': evaluator.last_activity,
                'organization': evaluator.organization
            })
        
        stats = {
            'totalEvaluators': total_evaluators,
            'activeEvaluators': active_evaluators,
            'inactiveEvaluators': inactive_evaluators,
            'activationRate': (active_evaluators / total_evaluators * 100) if total_evaluators > 0 else 0,
            'recentActivity': recent_activity
        }
        
        return Response({
            'success': True,
            'statistics': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Evaluator statistics error: {str(e)}")
        return Response({
            'success': False,
            'message': '통계 조회 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_evaluators(request):
    """
    Create multiple evaluators from CSV/Excel data
    """
    try:
        # Check permissions
        if not (request.user.is_staff or request.user.is_project_manager):
            return Response({
                'success': False,
                'message': '권한이 없습니다.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        evaluators_data = request.data.get('evaluators', [])
        
        if not evaluators_data:
            return Response({
                'success': False,
                'message': '평가자 데이터가 필요합니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created_evaluators = []
        errors = []
        
        with transaction.atomic():
            for i, data in enumerate(evaluators_data):
                try:
                    # Validate required fields
                    if not all(data.get(field) for field in ['username', 'email', 'fullName']):
                        errors.append(f"Row {i+1}: 필수 필드 누락")
                        continue
                    
                    # Check duplicates
                    if User.objects.filter(username=data['username']).exists():
                        errors.append(f"Row {i+1}: 사용자명 '{data['username']}' 이미 존재")
                        continue
                    
                    if User.objects.filter(email=data['email']).exists():
                        errors.append(f"Row {i+1}: 이메일 '{data['email']}' 이미 존재")
                        continue
                    
                    # Create evaluator
                    evaluator = User.objects.create_user(
                        username=data['username'],
                        email=data['email'],
                        password=data.get('password', 'temp123!'),  # Temporary password
                        full_name=data['fullName'],
                        organization=data.get('organization', ''),
                        department=data.get('department', ''),
                        position=data.get('position', ''),
                        is_evaluator=True
                    )
                    
                    created_evaluators.append({
                        'username': evaluator.username,
                        'email': evaluator.email,
                        'fullName': evaluator.full_name
                    })
                    
                except Exception as e:
                    errors.append(f"Row {i+1}: {str(e)}")
        
        return Response({
            'success': True,
            'message': f'{len(created_evaluators)}명의 평가자가 생성되었습니다.',
            'created': created_evaluators,
            'errors': errors,
            'total_created': len(created_evaluators),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Bulk create evaluators error: {str(e)}")
        return Response({
            'success': False,
            'message': '대량 생성 중 오류가 발생했습니다.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)