# Generated manually to fix deployment

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('objective', models.TextField(help_text='프로젝트의 목적과 목표')),
                ('status', models.CharField(choices=[('draft', '초안'), ('active', '진행중'), ('evaluation', '평가중'), ('completed', '완료'), ('archived', '보관'), ('deleted', '삭제됨')], default='draft', max_length=20)),
                ('visibility', models.CharField(choices=[('private', '비공개'), ('team', '팀 공개'), ('public', '공개')], default='private', max_length=20)),
                ('evaluation_mode', models.CharField(choices=[('practical', '실용적'), ('theoretical', '이론적'), ('direct_input', '직접입력'), ('fuzzy_ahp', '퍼지 AHP')], default='practical', max_length=20)),
                ('workflow_stage', models.CharField(choices=[('creating', '생성중'), ('waiting', '대기중'), ('evaluating', '평가중'), ('completed', '완료')], default='creating', max_length=20)),
                ('consistency_ratio_threshold', models.FloatField(default=0.1)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('deadline', models.DateTimeField(blank=True, null=True)),
                ('criteria_count', models.PositiveIntegerField(default=0)),
                ('alternatives_count', models.PositiveIntegerField(default=0)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('settings', models.JSONField(blank=True, default=dict)),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='owned_projects', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ahp_projects',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProjectMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('owner', '소유자'), ('manager', '관리자'), ('evaluator', '평가자'), ('viewer', '뷰어')], max_length=20)),
                ('can_edit_structure', models.BooleanField(default=False)),
                ('can_manage_evaluators', models.BooleanField(default=False)),
                ('can_view_results', models.BooleanField(default=True)),
                ('joined_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('invited_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invited_members', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project_members',
            },
        ),
        migrations.CreateModel(
            name='Criteria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('type', models.CharField(choices=[('criteria', '평가기준'), ('alternative', '대안')], max_length=20)),
                ('order', models.PositiveIntegerField(default=0)),
                ('level', models.PositiveIntegerField(default=0)),
                ('weight', models.FloatField(default=0.0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='projects.criteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='criteria', to='projects.project')),
            ],
            options={
                'db_table': 'criteria',
                'ordering': ['level', 'order'],
            },
        ),
        migrations.CreateModel(
            name='ProjectTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('category', models.CharField(max_length=100)),
                ('structure', models.JSONField(help_text='Template structure data')),
                ('default_settings', models.JSONField(default=dict)),
                ('is_public', models.BooleanField(default=False)),
                ('usage_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project_templates',
            },
        ),
        migrations.AddField(
            model_name='project',
            name='collaborators',
            field=models.ManyToManyField(related_name='collaborated_projects', through='projects.ProjectMember', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='projectmember',
            unique_together={('project', 'user')},
        ),
        migrations.AlterUniqueTogether(
            name='criteria',
            unique_together={('project', 'name')},
        ),
    ]