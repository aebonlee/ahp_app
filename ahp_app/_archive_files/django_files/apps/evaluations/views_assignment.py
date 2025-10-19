"""
Views for Evaluator Assignment System
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import transaction, models
from django.utils import timezone
from datetime import timedelta

from .models import (
    EvaluationInvitation, BulkInvitation, 
    EvaluationTemplate, EmailDeliveryStatus
)
from .serializers import (
    BulkInvitationSerializer, BulkInvitationCreateSerializer,
    EvaluationTemplateSerializer, EmailDeliveryStatusSerializer,
    EvaluatorAssignmentProgressSerializer
)
from apps.projects.models import Project

User = get_user_model()


class BulkInvitationViewSet(viewsets.ModelViewSet):
    """대량 초대 관리 ViewSet"""
    serializer_class = BulkInvitationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자가 생성한 대량 초대 목록"""
        return BulkInvitation.objects.filter(
            created_by=self.request.user
        ).select_related('project', 'created_by')
    
    @action(detail=False, methods=['post'])
    def send_bulk_invitations(self, request):
        """대량 초대 발송"""
        serializer = BulkInvitationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            with transaction.atomic():
                # 프로젝트 조회
                project = Project.objects.get(id=data['project_id'])
                
                # 대량 초대 객체 생성
                bulk_invitation = BulkInvitation.objects.create(
                    project=project,
                    created_by=request.user,
                    total_count=len(data['evaluator_emails'])
                )
                
                # 평가자 생성 또는 조회
                evaluators = []
                for email in data['evaluator_emails']:
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'username': email.split('@')[0],
                            'is_active': True
                        }
                    )
                    evaluators.append(user)
                
                # 초대 생성
                expires_at = timezone.now() + timedelta(days=data.get('expiry_days', 30))
                invitations_created = 0
                invitations_existing = 0
                
                for evaluator in evaluators:
                    invitation, created = EvaluationInvitation.objects.get_or_create(
                        project=project,
                        evaluator=evaluator,
                        defaults={
                            'invited_by': request.user,
                            'message': data.get('custom_message', ''),
                            'expires_at': expires_at,
                            'metadata': {
                                'bulk_invitation_id': str(bulk_invitation.id),
                                'template_id': data.get('template_id')
                            }
                        }
                    )
                    
                    if created:
                        invitations_created += 1
                        
                        # 이메일 발송 상태 추적 객체 생성
                        EmailDeliveryStatus.objects.create(
                            invitation=invitation,
                            bulk_invitation=bulk_invitation,
                            metadata={'scheduled': True}
                        )
                    else:
                        invitations_existing += 1
                
                # 결과 업데이트
                bulk_invitation.results = {
                    'created': invitations_created,
                    'existing': invitations_existing,
                    'duplicate_emails': serializer.context.get('duplicate_count', 0)
                }
                bulk_invitation.save()
                
                # TODO: Celery 작업 시작 (이메일 발송)
                # from .tasks import send_bulk_invitation_emails
                # task = send_bulk_invitation_emails.delay(str(bulk_invitation.id))
                # bulk_invitation.celery_task_id = task.id
                # bulk_invitation.save()
                
                return Response({
                    'bulk_invitation_id': str(bulk_invitation.id),
                    'total_count': bulk_invitation.total_count,
                    'invitations_created': invitations_created,
                    'invitations_existing': invitations_existing,
                    'message': '초대가 성공적으로 생성되었습니다.'
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def check_status(self, request, pk=None):
        """초대 상태 확인"""
        bulk_invitation = self.get_object()
        
        # 이메일 상태 집계
        email_statuses = EmailDeliveryStatus.objects.filter(
            bulk_invitation=bulk_invitation
        )
        
        status_summary = {
            'pending': email_statuses.filter(status='pending').count(),
            'sent': email_statuses.filter(status='sent').count(),
            'delivered': email_statuses.filter(status='delivered').count(),
            'opened': email_statuses.filter(status='opened').count(),
            'clicked': email_statuses.filter(status='clicked').count(),
            'bounced': email_statuses.filter(status='bounced').count(),
            'failed': email_statuses.filter(status='failed').count(),
        }
        
        # 수락 상태 확인
        invitations = EvaluationInvitation.objects.filter(
            metadata__bulk_invitation_id=str(bulk_invitation.id)
        )
        
        acceptance_summary = {
            'pending': invitations.filter(status='pending').count(),
            'accepted': invitations.filter(status='accepted').count(),
            'declined': invitations.filter(status='declined').count(),
            'expired': invitations.filter(status='expired').count(),
        }
        
        return Response({
            'bulk_invitation': BulkInvitationSerializer(bulk_invitation).data,
            'email_status': status_summary,
            'acceptance_status': acceptance_summary,
            'updated_at': timezone.now()
        })
    
    @action(detail=True, methods=['post'])
    def resend_failed(self, request, pk=None):
        """실패한 초대 재발송"""
        bulk_invitation = self.get_object()
        
        # 실패한 이메일 조회
        failed_emails = EmailDeliveryStatus.objects.filter(
            bulk_invitation=bulk_invitation,
            status__in=['failed', 'bounced']
        )
        
        if not failed_emails.exists():
            return Response({
                'message': '재발송할 실패한 이메일이 없습니다.'
            }, status=status.HTTP_200_OK)
        
        # 재발송 처리
        resent_count = 0
        for email_status in failed_emails:
            email_status.status = 'pending'
            email_status.retry_count += 1
            email_status.save()
            resent_count += 1
            
            # TODO: Celery 작업으로 재발송
            # from .tasks import resend_invitation_email
            # resend_invitation_email.delay(email_status.id)
        
        return Response({
            'resent_count': resent_count,
            'message': f'{resent_count}개의 이메일을 재발송 대기열에 추가했습니다.'
        })


class EvaluationTemplateViewSet(viewsets.ModelViewSet):
    """평가 템플릿 관리 ViewSet"""
    serializer_class = EvaluationTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """활성화된 템플릿 목록"""
        queryset = EvaluationTemplate.objects.filter(
            is_active=True
        ).select_related('created_by')
        
        # 본인이 생성한 템플릿 또는 기본 템플릿만 표시
        return queryset.filter(
            models.Q(created_by=self.request.user) | 
            models.Q(is_default=True)
        )
    
    @action(detail=False, methods=['get'])
    def get_default(self, request):
        """기본 템플릿 조회"""
        try:
            template = EvaluationTemplate.objects.get(is_default=True)
            serializer = self.get_serializer(template)
            return Response(serializer.data)
        except EvaluationTemplate.DoesNotExist:
            # 기본 템플릿이 없으면 생성
            template = self.create_default_template()
            serializer = self.get_serializer(template)
            return Response(serializer.data)
    
    def create_default_template(self):
        """기본 템플릿 생성"""
        return EvaluationTemplate.objects.create(
            name="기본 템플릿",
            description="AHP 평가 요청을 위한 기본 이메일 템플릿",
            instructions="평가 지침을 입력하세요",
            email_subject="[{{ project_name }}] AHP 평가 요청",
            email_body="""
안녕하세요 {{ evaluator_name }}님,

{{ project_name }} 프로젝트의 AHP 평가에 참여해 주시기 바랍니다.

프로젝트 정보:
- 프로젝트명: {{ project_name }}
- 평가 기한: {{ deadline }}
- 예상 소요 시간: {{ estimated_time }}분

아래 링크를 클릭하여 평가를 시작하세요:
{{ evaluation_link }}

이 링크는 {{ expiry_date }}까지 유효합니다.

감사합니다.
            """,
            reminder_subject="[리마인더] {{ project_name }} 평가를 완료해 주세요",
            reminder_body="평가 마감일이 다가오고 있습니다. 평가를 완료해 주세요.",
            created_by=self.request.user,
            is_default=True
        )
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """템플릿 복제"""
        template = self.get_object()
        
        # 템플릿 복제
        new_template = EvaluationTemplate.objects.create(
            name=f"{template.name} (복사본)",
            description=template.description,
            instructions=template.instructions,
            email_subject=template.email_subject,
            email_body=template.email_body,
            reminder_subject=template.reminder_subject,
            reminder_body=template.reminder_body,
            auto_reminder=template.auto_reminder,
            reminder_days=template.reminder_days,
            expiry_days=template.expiry_days,
            created_by=request.user,
            is_default=False,
            is_active=True
        )
        
        serializer = self.get_serializer(new_template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EvaluatorProgressViewSet(viewsets.ViewSet):
    """평가자 진행률 추적 ViewSet"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def project_progress(self, request, pk=None):
        """프로젝트별 평가 진행률"""
        try:
            project = Project.objects.get(id=pk)
            
            # 권한 확인
            if project.owner != request.user and request.user not in project.members.all():
                return Response({
                    'error': '권한이 없습니다.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # 진행률 데이터 생성
            serializer = EvaluatorAssignmentProgressSerializer()
            data = serializer.to_representation(project)
            
            return Response(data)
            
        except Project.DoesNotExist:
            return Response({
                'error': '프로젝트를 찾을 수 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def my_projects_progress(self, request):
        """내 프로젝트들의 진행률"""
        projects = Project.objects.filter(owner=request.user)
        
        progress_data = []
        for project in projects:
            serializer = EvaluatorAssignmentProgressSerializer()
            data = serializer.to_representation(project)
            progress_data.append({
                'project_id': project.id,
                'project_title': project.title,
                'progress': data['overall_progress'],
                'summary': {
                    'total': data['total_evaluators'],
                    'completed': data['completed'],
                    'in_progress': data['in_progress'],
                    'pending': data['pending']
                }
            })
        
        return Response({
            'projects': progress_data,
            'total_projects': len(progress_data)
        })