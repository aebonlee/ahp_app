"""
Evaluation Models for AHP Platform
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import numpy as np

User = get_user_model()


class Evaluation(models.Model):
    """Main evaluation session model"""
    
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('in_progress', '진행중'),
        ('completed', '완료'),
        ('expired', '만료'),
    ]
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations')
    
    # Evaluation details
    title = models.CharField(max_length=200, blank=True)
    instructions = models.TextField(blank=True)
    
    # Status and progress
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Results
    consistency_ratio = models.FloatField(null=True, blank=True)
    is_consistent = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'evaluations'
        ordering = ['-created_at']
        unique_together = ['project', 'evaluator']
        
    def __str__(self):
        return f"{self.project.title} - {self.evaluator.username}"
        
    def start_evaluation(self):
        """Start the evaluation process"""
        if self.status == 'pending':
            self.status = 'in_progress'
            self.started_at = timezone.now()
            self.save()
            
    def complete_evaluation(self):
        """Complete the evaluation"""
        if self.status == 'in_progress':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.progress = 100.0
            self.save()
            
    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False
        
    def calculate_consistency_ratio(self):
        """Calculate consistency ratio for all pairwise comparisons"""
        comparisons = self.pairwise_comparisons.all()
        if not comparisons:
            return None
            
        # Group comparisons by criteria level
        criteria_groups = {}
        for comp in comparisons:
            level = comp.criteria_a.level
            if level not in criteria_groups:
                criteria_groups[level] = []
            criteria_groups[level].append(comp)
            
        total_cr = 0.0
        valid_groups = 0
        
        for level, group_comparisons in criteria_groups.items():
            cr = self._calculate_group_consistency_ratio(group_comparisons)
            if cr is not None:
                total_cr += cr
                valid_groups += 1
                
        if valid_groups > 0:
            self.consistency_ratio = total_cr / valid_groups
            self.is_consistent = self.consistency_ratio <= 0.1
            self.save()
            return self.consistency_ratio
            
        return None
        
    def _calculate_group_consistency_ratio(self, comparisons):
        """Calculate CR for a group of pairwise comparisons"""
        if not comparisons:
            return None
            
        # Create comparison matrix
        criteria_list = list(set([comp.criteria_a for comp in comparisons] + [comp.criteria_b for comp in comparisons]))
        n = len(criteria_list)
        
        if n < 2:
            return None
            
        # Initialize matrix
        matrix = np.ones((n, n))
        
        # Fill matrix with comparison values
        for comp in comparisons:
            i = criteria_list.index(comp.criteria_a)
            j = criteria_list.index(comp.criteria_b)
            matrix[i][j] = comp.value
            matrix[j][i] = 1.0 / comp.value
            
        # Calculate consistency ratio using eigenvalue method
        eigenvalues = np.linalg.eigvals(matrix)
        lambda_max = max(eigenvalues.real)
        
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0
        
        # Random Index values
        ri_values = {2: 0, 3: 0.52, 4: 0.89, 5: 1.11, 6: 1.25, 7: 1.35, 8: 1.40, 9: 1.45, 10: 1.49}
        ri = ri_values.get(n, 1.49)
        
        return ci / ri if ri > 0 else 0


class PairwiseComparison(models.Model):
    """Individual pairwise comparison between criteria"""
    
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='pairwise_comparisons')
    criteria_a = models.ForeignKey('projects.Criteria', on_delete=models.CASCADE, related_name='comparisons_as_a')
    criteria_b = models.ForeignKey('projects.Criteria', on_delete=models.CASCADE, related_name='comparisons_as_b')
    
    # Comparison value (1/9 to 9 scale)
    value = models.FloatField(validators=[MinValueValidator(1/9), MaxValueValidator(9)])
    
    # Additional context
    comment = models.TextField(blank=True)
    confidence = models.IntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    # Timing
    answered_at = models.DateTimeField(default=timezone.now)
    time_spent = models.FloatField(default=0.0, help_text="Time spent in seconds")
    
    class Meta:
        db_table = 'pairwise_comparisons'
        unique_together = ['evaluation', 'criteria_a', 'criteria_b']
        
    def __str__(self):
        return f"{self.criteria_a.name} vs {self.criteria_b.name}: {self.value}"
        
    def save(self, *args, **kwargs):
        # Ensure criteria_a has lower ID than criteria_b for consistency
        if self.criteria_a.id > self.criteria_b.id:
            self.criteria_a, self.criteria_b = self.criteria_b, self.criteria_a
            self.value = 1.0 / self.value if self.value != 0 else 0
        super().save(*args, **kwargs)


class EvaluationSession(models.Model):
    """Track evaluation sessions and user activity"""
    
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='sessions')
    
    # Session info
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration = models.FloatField(default=0.0, help_text="Duration in seconds")
    
    # User activity
    page_views = models.JSONField(default=list)
    interactions = models.JSONField(default=list)
    
    # Browser/device info
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'evaluation_sessions'
        ordering = ['-started_at']
        
    def __str__(self):
        return f"Session {self.id} - {self.evaluation}"
        
    def end_session(self):
        """End the evaluation session"""
        if not self.ended_at:
            self.ended_at = timezone.now()
            self.duration = (self.ended_at - self.started_at).total_seconds()
            self.save()


class EvaluationInvitation(models.Model):
    """Invitations sent to evaluators"""
    
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('accepted', '수락'),
        ('declined', '거절'),
        ('expired', '만료'),
    ]
    
    # Basic information
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='invitations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluation_invitations')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    
    # Invitation details
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timing
    sent_at = models.DateTimeField(default=timezone.now)
    responded_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Token for secure access
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    
    class Meta:
        db_table = 'evaluation_invitations'
        unique_together = ['project', 'evaluator']
        
    def __str__(self):
        return f"Invitation to {self.evaluator.username} for {self.project.title}"
        
    def accept(self):
        """Accept the invitation"""
        if self.status == 'pending':
            self.status = 'accepted'
            self.responded_at = timezone.now()
            self.save()
            
            # Create evaluation instance
            evaluation, created = Evaluation.objects.get_or_create(
                project=self.project,
                evaluator=self.evaluator,
                defaults={'title': f"Evaluation for {self.project.title}"}
            )
            return evaluation
        return None
        
    def decline(self):
        """Decline the invitation"""
        if self.status == 'pending':
            self.status = 'declined'
            self.responded_at = timezone.now()
            self.save()
            
    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False