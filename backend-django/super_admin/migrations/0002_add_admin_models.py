# Generated manually for super admin models

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('super_admin', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemBackup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('backup_type', models.CharField(choices=[('full', '전체 백업'), ('database', '데이터베이스 백업'), ('files', '파일 백업'), ('incremental', '증분 백업')], max_length=20)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('running', '진행중'), ('completed', '완료'), ('failed', '실패')], default='pending', max_length=20)),
                ('file_path', models.CharField(blank=True, max_length=500)),
                ('file_size', models.BigIntegerField(blank=True, null=True)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('description', models.TextField(blank=True)),
                ('error_message', models.TextField(blank=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '시스템 백업',
                'verbose_name_plural': '시스템 백업 관리',
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='SecurityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('login_success', '로그인 성공'), ('login_failed', '로그인 실패'), ('password_changed', '비밀번호 변경'), ('account_locked', '계정 잠금'), ('suspicious_activity', '의심스러운 활동'), ('unauthorized_access', '무권한 접근'), ('privilege_escalation', '권한 상승'), ('data_breach_attempt', '데이터 유출 시도')], max_length=50)),
                ('threat_level', models.CharField(choices=[('low', '낮음'), ('medium', '보통'), ('high', '높음'), ('critical', '치명적')], max_length=20)),
                ('description', models.TextField()),
                ('ip_address', models.GenericIPAddressField()),
                ('user_agent', models.TextField(blank=True)),
                ('extra_data', models.JSONField(default=dict)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('is_resolved', models.BooleanField(default=False)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='super_admin.customuser')),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_security_logs', to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '보안 로그',
                'verbose_name_plural': '보안 로그 관리',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='AccessControl',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('resource_name', models.CharField(max_length=200)),
                ('resource_type', models.CharField(choices=[('page', '페이지'), ('api', 'API'), ('feature', '기능'), ('data', '데이터')], max_length=20)),
                ('resource_path', models.CharField(max_length=500)),
                ('required_user_types', models.JSONField(default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('ip_whitelist', models.JSONField(blank=True, default=list)),
                ('ip_blacklist', models.JSONField(blank=True, default=list)),
                ('time_restrictions', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='super_admin.customuser')),
                ('allowed_users', models.ManyToManyField(blank=True, to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '접근 제어',
                'verbose_name_plural': '접근 제어 관리',
                'unique_together': {('resource_name', 'resource_type')},
            },
        ),
        migrations.CreateModel(
            name='DataMigration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('migration_type', models.CharField(choices=[('import', '데이터 가져오기'), ('export', '데이터 내보내기'), ('sync', '데이터 동기화'), ('transform', '데이터 변환')], max_length=20)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('running', '진행중'), ('completed', '완료'), ('failed', '실패'), ('cancelled', '취소됨')], default='pending', max_length=20)),
                ('source_type', models.CharField(max_length=100)),
                ('target_type', models.CharField(max_length=100)),
                ('source_config', models.JSONField(default=dict)),
                ('target_config', models.JSONField(default=dict)),
                ('total_records', models.IntegerField(default=0)),
                ('processed_records', models.IntegerField(default=0)),
                ('success_records', models.IntegerField(default=0)),
                ('failed_records', models.IntegerField(default=0)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('log_messages', models.JSONField(default=list)),
                ('error_messages', models.JSONField(default=list)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '데이터 마이그레이션',
                'verbose_name_plural': '데이터 마이그레이션 관리',
                'ordering': ['-started_at'],
            },
        ),
    ]