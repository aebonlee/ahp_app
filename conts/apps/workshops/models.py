"""
Workshop Models for Multi-Evaluator AHP Sessions
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid
import json

User = get_user_model()


class WorkshopSession(models.Model):
    """Workshop session for multiple evaluators"""
    
    STATUS_CHOICES = [
        ('preparation', '준비중'),
        ('in_progress', '진행중'),
        ('analyzing', '분석중'),
        ('completed', '완료'),
        ('cancelled', '취소'),
    ]
    
    # Basic info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='workshops')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Workshop details
    facilitator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='facilitated_workshops')
    max_participants = models.IntegerField(default=30)
    workshop_code = models.CharField(max_length=10, unique=True)
    
    # Timing
    scheduled_at = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=120)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='preparation')
    is_anonymous = models.BooleanField(default=False)
    allow_late_join = models.BooleanField(default=True)
    
    # Results
    consensus_method = models.CharField(max_length=50, default='geometric_mean')
    consensus_achieved = models.BooleanField(default=False)
    
    # Meeting documentation
    meeting_minutes = models.TextField(blank=True)
    recording_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workshop_sessions'
        ordering = ['-scheduled_at']
        
    def __str__(self):
        return f"{self.title} - {self.project.title}"
        
    def generate_workshop_code(self):
        """Generate unique workshop access code"""
        import random
        import string
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not WorkshopSession.objects.filter(workshop_code=code).exists():
                self.workshop_code = code
                self.save()
                return code


class WorkshopParticipant(models.Model):
    """Workshop participant management"""
    
    ROLE_CHOICES = [
        ('evaluator', '평가자'),
        ('observer', '관찰자'),
        ('facilitator', '진행자'),
    ]
    
    STATUS_CHOICES = [
        ('invited', '초대됨'),
        ('registered', '등록됨'),
        ('active', '참여중'),
        ('completed', '완료'),
        ('absent', '불참'),
    ]
    
    workshop = models.ForeignKey(WorkshopSession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    name = models.CharField(max_length=100)
    
    # Participant info
    organization = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='evaluator')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='invited')
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Progress
    completion_rate = models.FloatField(default=0.0)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Access
    access_token = models.UUIDField(default=uuid.uuid4, unique=True)
    invitation_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'workshop_participants'
        unique_together = ['workshop', 'email']
        
    def __str__(self):
        return f"{self.name} - {self.workshop.title}"


class RealTimeProgress(models.Model):
    """Real-time progress tracking for workshop sessions"""
    
    workshop = models.ForeignKey(WorkshopSession, on_delete=models.CASCADE, related_name='progress_updates')
    participant = models.ForeignKey(WorkshopParticipant, on_delete=models.CASCADE)
    
    # Progress details
    current_comparison = models.CharField(max_length=200)
    comparisons_completed = models.IntegerField(default=0)
    total_comparisons = models.IntegerField()
    
    # Timing
    started_at = models.DateTimeField(default=timezone.now)
    last_updated = models.DateTimeField(auto_now=True)
    estimated_completion = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_stuck = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'realtime_progress'
        unique_together = ['workshop', 'participant']
        
    def __str__(self):
        return f"Progress: {self.participant.name} - {self.comparisons_completed}/{self.total_comparisons}"


class GroupConsensusResult(models.Model):
    """Group consensus analysis results"""
    
    workshop = models.OneToOneField(WorkshopSession, on_delete=models.CASCADE, related_name='consensus_result')
    
    # Consensus metrics
    kendalls_w = models.FloatField(null=True, blank=True)
    consensus_indicator = models.FloatField(null=True, blank=True)
    disagreement_index = models.FloatField(null=True, blank=True)
    
    # Aggregated weights
    aggregated_weights = models.JSONField()
    individual_weights = models.JSONField()
    
    # Statistical analysis
    mean_weights = models.JSONField()
    std_deviation = models.JSONField()
    confidence_intervals = models.JSONField()
    
    # Outlier analysis
    outlier_participants = models.JSONField(default=list)
    consensus_clusters = models.JSONField(default=dict)
    
    calculated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'group_consensus_results'
        
    def __str__(self):
        return f"Consensus for {self.workshop.title}"


class SurveyTemplate(models.Model):
    """Survey templates for data collection"""
    
    TYPE_CHOICES = [
        ('demographic', '인구통계'),
        ('pre_evaluation', '사전평가'),
        ('post_evaluation', '사후평가'),
        ('custom', '사용자정의'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Survey structure
    questions = models.JSONField()
    settings = models.JSONField(default=dict)
    
    # Usage
    is_active = models.BooleanField(default=True)
    usage_count = models.IntegerField(default=0)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'survey_templates'
        
    def __str__(self):
        return self.name


class SurveyResponse(models.Model):
    """Survey responses from participants"""
    
    workshop = models.ForeignKey(WorkshopSession, on_delete=models.CASCADE, related_name='survey_responses')
    participant = models.ForeignKey(WorkshopParticipant, on_delete=models.CASCADE)
    template = models.ForeignKey(SurveyTemplate, on_delete=models.CASCADE)
    
    # Response data
    responses = models.JSONField()
    
    # Metadata
    submitted_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        db_table = 'survey_responses'
        unique_together = ['workshop', 'participant', 'template']
        
    def __str__(self):
        return f"Response from {self.participant.name}"