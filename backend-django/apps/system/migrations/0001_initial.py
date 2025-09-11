# Generated manually for AHP Platform System Management

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('super_admin', '0001_initial'),  # Depends on super_admin's CustomUser model
    ]

    operations = [
        migrations.CreateModel(
            name='SystemSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('value', models.TextField()),
                ('setting_type', models.CharField(choices=[('string', 'String'), ('integer', 'Integer'), ('float', 'Float'), ('boolean', 'Boolean'), ('json', 'JSON')], default='string', max_length=20)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(default='general', max_length=50)),
                ('is_public', models.BooleanField(default=False, help_text='공개 API에서 접근 가능한지 여부')),
                ('is_editable', models.BooleanField(default=True, help_text='관리자가 수정 가능한지 여부')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='apps_updated_settings', to='super_admin.CustomUser')),
            ],
            options={
                'verbose_name': 'System Setting',
                'verbose_name_plural': 'System Settings',
                'db_table': 'apps_system_settings',
            },
        ),
        migrations.CreateModel(
            name='SystemLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('level', models.CharField(choices=[('debug', 'Debug'), ('info', 'Info'), ('warning', 'Warning'), ('error', 'Error'), ('critical', 'Critical')], max_length=20)),
                ('category', models.CharField(choices=[('auth', 'Authentication'), ('project', 'Project Management'), ('evaluation', 'Evaluation'), ('system', 'System'), ('api', 'API'), ('security', 'Security')], max_length=50)),
                ('message', models.TextField()),
                ('details', models.JSONField(blank=True, default=dict)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('request_method', models.CharField(blank=True, max_length=10)),
                ('request_path', models.TextField(blank=True)),
                ('response_status', models.PositiveIntegerField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='apps_system_logs', to='super_admin.CustomUser')),
            ],
            options={
                'db_table': 'apps_system_logs',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='MaintenanceMode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_enabled', models.BooleanField(default=False)),
                ('message', models.TextField(default='시스템 점검 중입니다. 잠시 후 다시 시도해주세요.', help_text='사용자에게 표시될 메시지')),
                ('allowed_ips', models.JSONField(blank=True, default=list, help_text='점검 중에도 접근 가능한 IP 주소 목록')),
                ('scheduled_start', models.DateTimeField(blank=True, null=True)),
                ('scheduled_end', models.DateTimeField(blank=True, null=True)),
                ('enabled_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('enabled_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='apps_maintenance_modes', to='super_admin.CustomUser')),
            ],
            options={
                'verbose_name': 'Maintenance Mode',
                'verbose_name_plural': 'Maintenance Mode',
                'db_table': 'apps_maintenance_mode',
            },
        ),
        migrations.CreateModel(
            name='SystemStatistics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('total_users', models.PositiveIntegerField(default=0)),
                ('active_users_today', models.PositiveIntegerField(default=0)),
                ('new_users_today', models.PositiveIntegerField(default=0)),
                ('total_projects', models.PositiveIntegerField(default=0)),
                ('active_projects', models.PositiveIntegerField(default=0)),
                ('completed_projects_today', models.PositiveIntegerField(default=0)),
                ('evaluations_today', models.PositiveIntegerField(default=0)),
                ('total_evaluations', models.PositiveIntegerField(default=0)),
                ('avg_response_time', models.FloatField(default=0.0, help_text='평균 응답 시간 (초)')),
                ('error_count', models.PositiveIntegerField(default=0)),
                ('storage_used_mb', models.FloatField(default=0.0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'apps_system_statistics',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='BackupRecord',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('backup_type', models.CharField(choices=[('full', 'Full Backup'), ('incremental', 'Incremental Backup'), ('manual', 'Manual Backup')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.BigIntegerField(blank=True, help_text='파일 크기 (bytes)', null=True)),
                ('file_path', models.TextField(blank=True)),
                ('started_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('tables_backed_up', models.JSONField(blank=True, default=list)),
                ('error_message', models.TextField(blank=True)),
                ('initiated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='apps_backup_records', to='super_admin.CustomUser')),
            ],
            options={
                'db_table': 'apps_backup_records',
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='APIUsageLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('endpoint', models.CharField(max_length=255)),
                ('method', models.CharField(max_length=10)),
                ('ip_address', models.GenericIPAddressField()),
                ('user_agent', models.TextField(blank=True)),
                ('status_code', models.PositiveIntegerField()),
                ('response_time_ms', models.PositiveIntegerField(help_text='응답 시간 (milliseconds)')),
                ('request_size', models.PositiveIntegerField(default=0, help_text='요청 크기 (bytes)')),
                ('response_size', models.PositiveIntegerField(default=0, help_text='응답 크기 (bytes)')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='apps_api_usage_logs', to='super_admin.CustomUser')),
            ],
            options={
                'db_table': 'apps_api_usage_logs',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='SystemNotification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('notification_type', models.CharField(choices=[('info', 'Information'), ('warning', 'Warning'), ('error', 'Error'), ('success', 'Success')], max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='medium', max_length=20)),
                ('target_all_admins', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('is_dismissible', models.BooleanField(default=True)),
                ('auto_dismiss_after', models.DurationField(blank=True, help_text='자동 해제 시간', null=True)),
                ('show_on_login', models.BooleanField(default=False)),
                ('show_in_header', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='apps_created_notifications', to='super_admin.CustomUser')),
                ('target_users', models.ManyToManyField(blank=True, related_name='apps_system_notifications', to='super_admin.CustomUser')),
            ],
            options={
                'db_table': 'apps_system_notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='systemlog',
            index=models.Index(fields=['timestamp'], name='apps_system_logs_timestamp_idx'),
        ),
        migrations.AddIndex(
            model_name='systemlog',
            index=models.Index(fields=['level'], name='apps_system_logs_level_idx'),
        ),
        migrations.AddIndex(
            model_name='systemlog',
            index=models.Index(fields=['category'], name='apps_system_logs_category_idx'),
        ),
        migrations.AddIndex(
            model_name='systemlog',
            index=models.Index(fields=['user'], name='apps_system_logs_user_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusagelog',
            index=models.Index(fields=['endpoint'], name='apps_api_usage_logs_endpoint_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusagelog',
            index=models.Index(fields=['timestamp'], name='apps_api_usage_logs_timestamp_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusagelog',
            index=models.Index(fields=['user'], name='apps_api_usage_logs_user_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusagelog',
            index=models.Index(fields=['status_code'], name='apps_api_usage_logs_status_code_idx'),
        ),
    ]