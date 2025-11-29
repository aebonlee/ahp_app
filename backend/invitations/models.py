# invitations/models.py
"""
AHP 평가 초대 시스템 Django 모델
작성일: 2024-11-29
작성자: Claude Opus 4.1
"""

import uuid
import secrets
import hashlib
from datetime import timedelta
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.postgres.fields import JSONField
from django.core.validators import EmailValidator, MinValueValidator, MaxValueValidator

User = get_user_model()


class PermissionTemplate(models.Model):
    """사전 정의된 권한 템플릿"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'permission_templates'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_system'])
        ]
    
    def __str__(self):
        return f"{self.name} ({'System' if self.is_system else 'Custom'})"


class EvaluationInvitation(models.Model):
    """평가 초대 모델"""
    
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('accepted', '수락됨'),
        ('rejected', '거절됨'),
        ('expired', '만료됨'),
        ('revoked', '철회됨')
    ]
    
    ROLE_CHOICES = [
        ('owner', '소유자'),
        ('admin', '관리자'),
        ('evaluator', '평가자'),
        ('viewer', '열람자')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    inviter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations'
    )
    
    # 초대 대상 정보
    invitee_email = models.EmailField(validators=[EmailValidator()])
    invitee_name = models.CharField(max_length=100, blank=True)
    
    # 토큰 관련
    token = models.CharField(max_length=512, unique=True)
    token_hash = models.CharField(max_length=256, db_index=True)
    
    # 역할 및 권한
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='evaluator')
    custom_message = models.TextField(blank=True, max_length=1000)
    permissions = models.JSONField(default=dict)
    
    # 상태 관리
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField()
    
    # 리마인더
    reminder_count = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    last_reminder_at = models.DateTimeField(null=True, blank=True)
    
    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'evaluation_invitations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token_hash']),
            models.Index(fields=['project', 'status']),
            models.Index(fields=['invitee_email']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['status', 'expires_at'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'invitee_email'],
                condition=models.Q(status='pending'),
                name='unique_pending_invitation_per_project'
            )
        ]
    
    def __str__(self):
        return f"Invitation to {self.invitee_email} for {self.project.name}"
    
    def save(self, *args, **kwargs):
        """저장 시 자동 처리"""
        
        # 새 객체인 경우
        if not self.pk:
            # 토큰 생성
            if not self.token:
                self.token = secrets.token_urlsafe(32)
            
            # 토큰 해시 생성
            if not self.token_hash:
                self.token_hash = hashlib.sha256(self.token.encode()).hexdigest()
            
            # 만료 시간 설정 (기본 7일)
            if not self.expires_at:
                self.expires_at = timezone.now() + timedelta(days=7)
        
        # 상태 변경 시 타임스탬프 업데이트
        if self.pk:
            old_instance = EvaluationInvitation.objects.filter(pk=self.pk).first()
            if old_instance:
                if old_instance.status != self.status:
                    if self.status == 'accepted':
                        self.accepted_at = timezone.now()
                    elif self.status == 'rejected':
                        self.rejected_at = timezone.now()
                    elif self.status == 'revoked':
                        self.revoked_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """만료 여부 확인"""
        return timezone.now() > self.expires_at
    
    def can_accept(self):
        """수락 가능 여부"""
        return self.status == 'pending' and not self.is_expired()
    
    def send_reminder(self):
        """리마인더 발송 가능 여부"""
        if self.status != 'pending' or self.reminder_count >= 3:
            return False
        
        if self.last_reminder_at:
            # 마지막 리마인더로부터 최소 24시간 경과
            time_since_last = timezone.now() - self.last_reminder_at
            if time_since_last < timedelta(hours=24):
                return False
        
        return True
    
    def get_accept_url(self, base_url=''):
        """수락 URL 생성"""
        return f"{base_url}/invitations/accept?token={self.token}"


class ParticipantPermission(models.Model):
    """프로젝트 참여자 권한"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='project_permissions'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='participant_permissions'
    )
    invitation = models.ForeignKey(
        EvaluationInvitation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resulting_permission'
    )
    
    # 역할 정의
    role = models.CharField(max_length=50, default='evaluator')
    role_priority = models.IntegerField(default=100)
    
    # 세부 권한
    can_view_project = models.BooleanField(default=True)
    can_view_criteria = models.BooleanField(default=True)
    can_view_evaluations = models.BooleanField(default=True)
    can_view_results = models.BooleanField(default=False)
    can_create_evaluation = models.BooleanField(default=False)
    can_edit_own_evaluation = models.BooleanField(default=False)
    can_edit_all_evaluations = models.BooleanField(default=False)
    can_manage_criteria = models.BooleanField(default=False)
    can_invite_others = models.BooleanField(default=False)
    can_export_data = models.BooleanField(default=False)
    can_delete_project = models.BooleanField(default=False)
    
    # 메타데이터
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_permissions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'participant_permissions'
        ordering = ['role_priority', 'created_at']
        unique_together = [['user', 'project']]
        indexes = [
            models.Index(fields=['user', 'project']),
            models.Index(fields=['project', 'role']),
            models.Index(fields=['expires_at'])
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.role} in {self.project.name}"
    
    def is_expired(self):
        """권한 만료 여부"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at
    
    def has_permission(self, permission_name):
        """특정 권한 확인"""
        if self.is_expired():
            return False
        return getattr(self, permission_name, False)
    
    def get_all_permissions(self):
        """모든 권한 딕셔너리로 반환"""
        permission_fields = [
            'can_view_project', 'can_view_criteria', 'can_view_evaluations',
            'can_view_results', 'can_create_evaluation', 'can_edit_own_evaluation',
            'can_edit_all_evaluations', 'can_manage_criteria', 'can_invite_others',
            'can_export_data', 'can_delete_project'
        ]
        return {field: getattr(self, field) for field in permission_fields}
    
    @classmethod
    def create_from_role(cls, user, project, role, assigned_by=None):
        """역할 기반 권한 생성"""
        
        ROLE_PERMISSIONS = {
            'owner': {
                'role_priority': 0,
                'can_view_project': True,
                'can_view_criteria': True,
                'can_view_evaluations': True,
                'can_view_results': True,
                'can_create_evaluation': True,
                'can_edit_own_evaluation': True,
                'can_edit_all_evaluations': True,
                'can_manage_criteria': True,
                'can_invite_others': True,
                'can_export_data': True,
                'can_delete_project': True
            },
            'admin': {
                'role_priority': 10,
                'can_view_project': True,
                'can_view_criteria': True,
                'can_view_evaluations': True,
                'can_view_results': True,
                'can_create_evaluation': True,
                'can_edit_own_evaluation': True,
                'can_edit_all_evaluations': True,
                'can_manage_criteria': True,
                'can_invite_others': True,
                'can_export_data': True,
                'can_delete_project': False
            },
            'evaluator': {
                'role_priority': 50,
                'can_view_project': True,
                'can_view_criteria': True,
                'can_view_evaluations': False,
                'can_view_results': False,
                'can_create_evaluation': True,
                'can_edit_own_evaluation': True,
                'can_edit_all_evaluations': False,
                'can_manage_criteria': False,
                'can_invite_others': False,
                'can_export_data': False,
                'can_delete_project': False
            },
            'viewer': {
                'role_priority': 100,
                'can_view_project': True,
                'can_view_criteria': True,
                'can_view_evaluations': True,
                'can_view_results': True,
                'can_create_evaluation': False,
                'can_edit_own_evaluation': False,
                'can_edit_all_evaluations': False,
                'can_manage_criteria': False,
                'can_invite_others': False,
                'can_export_data': True,
                'can_delete_project': False
            }
        }
        
        permissions = ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS['viewer'])
        
        return cls.objects.create(
            user=user,
            project=project,
            role=role,
            assigned_by=assigned_by,
            **permissions
        )


class InvitationActivity(models.Model):
    """초대 활동 로그"""
    
    ACTION_CHOICES = [
        ('created', '생성됨'),
        ('sent', '발송됨'),
        ('viewed', '열람됨'),
        ('accepted', '수락됨'),
        ('rejected', '거절됨'),
        ('expired', '만료됨'),
        ('revoked', '철회됨'),
        ('reminder_sent', '리마인더 발송됨')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invitation = models.ForeignKey(
        EvaluationInvitation,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    actor_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'invitation_activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invitation', '-created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['actor'])
        ]
    
    def __str__(self):
        return f"{self.action} - {self.invitation.invitee_email} at {self.created_at}"