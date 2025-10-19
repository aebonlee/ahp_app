# Generated manually for evaluator assignment system
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('evaluations', '0001_initial'),
        ('projects', '0001_initial'),
    ]

    operations = [
        # Create Evaluation model first
        migrations.CreateModel(
            name='Evaluation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=200)),
                ('instructions', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('in_progress', '진행중'), ('completed', '완료'), ('expired', '만료')], default='pending', max_length=20)),
                ('progress', models.FloatField(default=0.0)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('consistency_ratio', models.FloatField(blank=True, null=True)),
                ('is_consistent', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluations', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluations', to='projects.project')),
            ],
            options={
                'db_table': 'evaluations',
                'ordering': ['-created_at'],
            },
        ),
        
        # Add unique constraint to Evaluation
        migrations.AlterUniqueTogether(
            name='evaluation',
            unique_together={('project', 'evaluator')},
        ),
        
        # Create PairwiseComparison model
        migrations.CreateModel(
            name='PairwiseComparison',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField()),
                ('comment', models.TextField(blank=True)),
                ('confidence', models.IntegerField(default=5)),
                ('answered_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('time_spent', models.FloatField(default=0.0, help_text="Time spent in seconds")),
                ('evaluation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pairwise_comparisons', to='evaluations.evaluation')),
                ('criteria_a', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons_as_a', to='projects.criteria')),
                ('criteria_b', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons_as_b', to='projects.criteria')),
            ],
            options={
                'db_table': 'pairwise_comparisons',
            },
        ),
        
        # Add unique constraint to PairwiseComparison
        migrations.AlterUniqueTogether(
            name='pairwisecomparison',
            unique_together={('evaluation', 'criteria_a', 'criteria_b')},
        ),
        
        # Create EvaluationSession model
        migrations.CreateModel(
            name='EvaluationSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('ended_at', models.DateTimeField(blank=True, null=True)),
                ('duration', models.FloatField(default=0.0, help_text="Duration in seconds")),
                ('page_views', models.JSONField(default=list)),
                ('interactions', models.JSONField(default=list)),
                ('user_agent', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('evaluation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to='evaluations.evaluation')),
            ],
            options={
                'db_table': 'evaluation_sessions',
                'ordering': ['-started_at'],
            },
        ),
        
        # Create EvaluationInvitation model
        migrations.CreateModel(
            name='EvaluationInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('accepted', '수락'), ('declined', '거절'), ('expired', '만료')], default='pending', max_length=20)),
                ('sent_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('responded_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('token', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_invitations', to=settings.AUTH_USER_MODEL)),
                ('invited_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_invitations', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='projects.project')),
            ],
            options={
                'db_table': 'evaluation_invitations',
            },
        ),
        
        # Add unique constraint to EvaluationInvitation
        migrations.AlterUniqueTogether(
            name='evaluationinvitation',
            unique_together={('project', 'evaluator')},
        ),
        
        # Add indexes to EvaluationInvitation
        migrations.AddIndex(
            model_name='evaluationinvitation',
            index=models.Index(fields=['token'], name='evaluation__token_123456_idx'),
        ),
        migrations.AddIndex(
            model_name='evaluationinvitation',
            index=models.Index(fields=['project', 'status'], name='evaluation__project_status_idx'),
        ),
        migrations.AddIndex(
            model_name='evaluationinvitation',
            index=models.Index(fields=['expires_at'], name='evaluation__expires_idx'),
        ),
        
        # Create DemographicSurvey model
        migrations.CreateModel(
            name='DemographicSurvey',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('age', models.CharField(blank=True, choices=[('20s', '20대'), ('30s', '30대'), ('40s', '40대'), ('50s', '50대'), ('60s', '60대 이상')], max_length=10)),
                ('gender', models.CharField(blank=True, choices=[('male', '남성'), ('female', '여성'), ('other', '기타'), ('prefer-not', '응답하지 않음')], max_length=15)),
                ('education', models.CharField(blank=True, choices=[('high-school', '고등학교 졸업'), ('bachelor', '학사'), ('master', '석사'), ('phd', '박사'), ('other', '기타')], max_length=20)),
                ('occupation', models.CharField(blank=True, max_length=100)),
                ('experience', models.CharField(blank=True, choices=[('less-1', '1년 미만'), ('1-3', '1-3년'), ('3-5', '3-5년'), ('5-10', '5-10년'), ('more-10', '10년 이상')], max_length=10)),
                ('department', models.CharField(blank=True, max_length=100)),
                ('position', models.CharField(blank=True, max_length=100)),
                ('project_experience', models.CharField(blank=True, choices=[('none', '없음'), ('1-2', '1-2회'), ('3-5', '3-5회'), ('more-5', '5회 이상')], max_length=10)),
                ('decision_role', models.CharField(blank=True, choices=[('decision-maker', '최종 의사결정권자'), ('advisor', '자문/조언자'), ('analyst', '분석가'), ('evaluator', '평가자'), ('observer', '관찰자')], max_length=20)),
                ('additional_info', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_completed', models.BooleanField(default=False)),
                ('completion_timestamp', models.DateTimeField(blank=True, null=True)),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='demographic_surveys', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='demographic_surveys', to='projects.project')),
            ],
            options={
                'db_table': 'demographic_surveys',
                'ordering': ['-created_at'],
            },
        ),
        
        # Add unique constraint to DemographicSurvey
        migrations.AlterUniqueTogether(
            name='demographicsurvey',
            unique_together={('evaluator', 'project')},
        ),
        
        # Create BulkInvitation model
        migrations.CreateModel(
            name='BulkInvitation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('total_count', models.IntegerField(default=0)),
                ('sent_count', models.IntegerField(default=0)),
                ('failed_count', models.IntegerField(default=0)),
                ('accepted_count', models.IntegerField(default=0)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('processing', '처리중'), ('completed', '완료'), ('failed', '실패')], default='pending', max_length=20)),
                ('celery_task_id', models.CharField(blank=True, max_length=100)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('results', models.JSONField(default=dict)),
                ('error_log', models.TextField(blank=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_invitations_created', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_invitations', to='projects.project')),
            ],
            options={
                'db_table': 'bulk_invitations',
                'ordering': ['-created_at'],
            },
        ),
        
        # Create EvaluationTemplate model
        migrations.CreateModel(
            name='EvaluationTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('instructions', models.TextField()),
                ('email_subject', models.CharField(default='AHP 평가 요청', max_length=200)),
                ('email_body', models.TextField()),
                ('reminder_subject', models.CharField(blank=True, max_length=200)),
                ('reminder_body', models.TextField(blank=True)),
                ('auto_reminder', models.BooleanField(default=True)),
                ('reminder_days', models.IntegerField(default=3)),
                ('expiry_days', models.IntegerField(default=30)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_default', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_templates', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'evaluation_templates',
                'ordering': ['name'],
            },
        ),
        
        # Create EvaluationAccessLog model
        migrations.CreateModel(
            name='EvaluationAccessLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('session_started', '세션 시작'), ('comparison_saved', '비교 저장'), ('evaluation_completed', '평가 완료'), ('token_validated', '토큰 검증'), ('access_denied', '접근 거부')], max_length=50)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict)),
                ('evaluation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='access_logs', to='evaluations.evaluation')),
            ],
            options={
                'db_table': 'evaluation_access_logs',
                'ordering': ['-timestamp'],
            },
        ),
        
        # Add indexes to EvaluationAccessLog
        migrations.AddIndex(
            model_name='evaluationaccesslog',
            index=models.Index(fields=['evaluation', 'timestamp'], name='eval_access_eval_time_idx'),
        ),
        migrations.AddIndex(
            model_name='evaluationaccesslog',
            index=models.Index(fields=['action'], name='eval_access_action_idx'),
        ),
        
        # Create EmailDeliveryStatus model
        migrations.CreateModel(
            name='EmailDeliveryStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', '대기중'), ('sent', '발송됨'), ('delivered', '전달됨'), ('opened', '열람됨'), ('clicked', '클릭됨'), ('bounced', '반송됨'), ('failed', '실패')], default='pending', max_length=20)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('opened_at', models.DateTimeField(blank=True, null=True)),
                ('clicked_at', models.DateTimeField(blank=True, null=True)),
                ('error_message', models.TextField(blank=True)),
                ('retry_count', models.IntegerField(default=0)),
                ('metadata', models.JSONField(default=dict)),
                ('bulk_invitation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='email_statuses', to='evaluations.bulkinvitation')),
                ('invitation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='email_status', to='evaluations.evaluationinvitation')),
            ],
            options={
                'db_table': 'email_delivery_status',
                'ordering': ['-sent_at'],
            },
        ),
    ]