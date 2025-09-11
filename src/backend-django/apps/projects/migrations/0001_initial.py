# Generated migration for projects app
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('super_admin', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('objective', models.TextField(help_text='프로젝트의 목적과 목표')),
                ('status', models.CharField(choices=[('draft', '초안'), ('active', '진행중'), ('evaluation', '평가중'), ('completed', '완료'), ('archived', '보관')], default='draft', max_length=20)),
                ('visibility', models.CharField(choices=[('private', '비공개'), ('team', '팀 공개'), ('public', '공개')], default='private', max_length=20)),
                ('consistency_ratio_threshold', models.FloatField(default=0.1, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deadline', models.DateTimeField(blank=True, null=True)),
                ('tags', models.TextField(blank=True, help_text='콤마로 구분된 태그')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_projects', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ProjectMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('viewer', '조회자'), ('evaluator', '평가자'), ('manager', '관리자')], default='evaluator', max_length=20)),
                ('joined_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='project',
            name='collaborators',
            field=models.ManyToManyField(related_name='collaborated_projects', through='projects.ProjectMember', through_fields=('project', 'user'), to=settings.AUTH_USER_MODEL),
        ),
    ]