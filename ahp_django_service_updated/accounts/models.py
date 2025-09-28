from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    확장된 사용자 모델
    - Super Admin: 시스템 전체 관리
    - Service Admin: 개인 서비스 관리자 (프로젝트 생성 및 관리)
    - Service User: 일반 서비스 사용자
    - Evaluator: 평가자 (프로젝트 평가만 가능)
    """
    
    ROLE_CHOICES = [
        ('super_admin', '슈퍼 관리자'),  # 시스템 전체 관리
        ('service_admin', '결제 회원'),  # 개인 서비스 이용, 프로젝트 생성 권한
        ('evaluator', '일반 회원'),      # 평가하여 포인트 획득
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='evaluator')
    phone = models.CharField(max_length=20, blank=True)
    organization = models.CharField(max_length=200, blank=True, verbose_name='소속')
    department = models.CharField(max_length=100, blank=True, verbose_name='부서')
    position = models.CharField(max_length=100, blank=True, verbose_name='직급')
    
    # 서비스 관련
    is_verified = models.BooleanField(default=False, verbose_name='이메일 인증 완료')
    can_create_projects = models.BooleanField(default=False, verbose_name='프로젝트 생성 권한')
    max_projects = models.IntegerField(default=5, verbose_name='최대 프로젝트 수')
    
    # 소셜 로그인 지원 (향후 확장용)
    provider = models.CharField(max_length=20, blank=True, default='email', choices=[
        ('email', '이메일'),
        ('google', '구글'),
        ('naver', '네이버'),
        ('kakao', '카카오'),
    ])
    social_id = models.CharField(max_length=100, blank=True, verbose_name='소셜 로그인 ID')
    
    # 프로필
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True, verbose_name='자기소개')
    
    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'ahp_users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        """관리자 권한 확인"""
        return self.role in ['super_admin', 'service_admin']
    
    @property
    def can_manage_projects(self):
        """프로젝트 관리 권한 확인"""
        return self.role in ['super_admin', 'service_admin']
    
    @property
    def can_evaluate(self):
        """평가 권한 확인"""
        return True  # 모든 사용자가 평가 가능
    
    def get_project_count(self):
        """생성한 프로젝트 수"""
        return self.owned_projects.count()
    
    def can_create_new_project(self):
        """새 프로젝트 생성 가능 여부"""
        if self.role == 'super_admin':
            return True
        if self.role == 'service_admin':  # 결제 회원
            return self.get_project_count() < self.max_projects
        return False  # 일반 회원(evaluator)은 프로젝트 생성 불가


class UserProfile(models.Model):
    """사용자 추가 프로필 정보"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # 알림 설정
    email_notifications = models.BooleanField(default=True)
    evaluation_reminders = models.BooleanField(default=True)
    project_updates = models.BooleanField(default=True)
    
    # 언어 및 타임존
    language = models.CharField(max_length=10, default='ko', choices=[('ko', '한국어'), ('en', 'English')])
    timezone = models.CharField(max_length=50, default='Asia/Seoul')
    
    # 통계
    total_evaluations = models.IntegerField(default=0)
    total_projects_owned = models.IntegerField(default=0)
    total_projects_participated = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ahp_user_profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class UserActivityLog(models.Model):
    """사용자 활동 로그"""
    
    ACTION_CHOICES = [
        ('login', '로그인'),
        ('logout', '로그아웃'),
        ('create_project', '프로젝트 생성'),
        ('delete_project', '프로젝트 삭제'),
        ('start_evaluation', '평가 시작'),
        ('complete_evaluation', '평가 완료'),
        ('view_results', '결과 조회'),
        ('export_data', '데이터 내보내기'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_user_activity_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()} at {self.created_at}"