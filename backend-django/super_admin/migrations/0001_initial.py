# Generated migration for Super Admin models
# This migration creates all the tables for the comprehensive admin system

from django.db import migrations, models
import django.contrib.auth.models
import django.contrib.auth.validators
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('user_type', models.CharField(choices=[('super_admin', '슈퍼 관리자'), ('admin', '관리자'), ('personal_service', '개인서비스 이용자'), ('evaluator', '평가자'), ('enterprise', '기업 사용자')], default='personal_service', max_length=20)),
                ('phone', models.CharField(blank=True, max_length=15)),
                ('organization', models.CharField(blank=True, max_length=200)),
                ('department', models.CharField(blank=True, max_length=100)),
                ('position', models.CharField(blank=True, max_length=100)),
                ('bio', models.TextField(blank=True)),
                ('subscription_tier', models.CharField(choices=[('free', '무료'), ('basic', '기본'), ('professional', '전문가'), ('enterprise', '기업'), ('unlimited', '무제한')], default='free', max_length=20)),
                ('subscription_start', models.DateTimeField(blank=True, null=True)),
                ('subscription_end', models.DateTimeField(blank=True, null=True)),
                ('monthly_project_limit', models.IntegerField(default=3)),
                ('monthly_evaluator_limit', models.IntegerField(default=10)),
                ('storage_limit_mb', models.IntegerField(default=100)),
                ('is_verified', models.BooleanField(default=False)),
                ('verification_token', models.CharField(blank=True, max_length=100)),
                ('last_login_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('failed_login_attempts', models.IntegerField(default=0)),
                ('account_locked_until', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': '사용자',
                'verbose_name_plural': '사용자 관리',
                'ordering': ['-created_at'],
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PaymentPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('tier', models.CharField(choices=[('free', '무료'), ('basic', '기본'), ('professional', '전문가'), ('enterprise', '기업'), ('unlimited', '무제한')], max_length=20)),
                ('plan_type', models.CharField(choices=[('monthly', '월간'), ('yearly', '연간'), ('lifetime', '평생')], max_length=20)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='KRW', max_length=3)),
                ('discount_percent', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('project_limit', models.IntegerField()),
                ('evaluator_limit', models.IntegerField()),
                ('storage_limit_mb', models.IntegerField()),
                ('advanced_analytics', models.BooleanField(default=False)),
                ('api_access', models.BooleanField(default=False)),
                ('priority_support', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': '결제 플랜',
                'verbose_name_plural': '결제 플랜 관리',
                'ordering': ['price'],
            },
        ),
        migrations.CreateModel(
            name='AHPProject',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('criteria', models.JSONField(default=list)),
                ('alternatives', models.JSONField(default=list)),
                ('evaluation_matrix', models.JSONField(default=dict)),
                ('final_weights', models.JSONField(default=dict)),
                ('consistency_ratio', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(choices=[('draft', '초안'), ('active', '진행중'), ('evaluation', '평가중'), ('completed', '완료'), ('archived', '보관됨')], default='draft', max_length=20)),
                ('is_public', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deadline', models.DateTimeField(blank=True, null=True)),
                ('owner', models.ForeignKey(on_delete=models.CASCADE, related_name='super_admin_owned_projects', to='super_admin.customuser')),
            ],
            options={
                'verbose_name': 'AHP 프로젝트',
                'verbose_name_plural': 'AHP 프로젝트 관리',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PaymentTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.UUIDField(default=uuid.uuid4, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='KRW', max_length=3)),
                ('payment_method', models.CharField(choices=[('card', '신용카드'), ('bank_transfer', '계좌이체'), ('mobile', '휴대폰 결제'), ('paypal', 'PayPal'), ('kakaopay', '카카오페이'), ('naverpay', '네이버페이')], max_length=20)),
                ('status', models.CharField(choices=[('pending', '대기중'), ('processing', '처리중'), ('completed', '완료'), ('failed', '실패'), ('cancelled', '취소'), ('refunded', '환불')], default='pending', max_length=20)),
                ('external_transaction_id', models.CharField(blank=True, max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('failure_reason', models.TextField(blank=True)),
                ('plan', models.ForeignKey(on_delete=models.CASCADE, to='super_admin.paymentplan')),
                ('user', models.ForeignKey(on_delete=models.CASCADE, related_name='payments', to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '결제 거래',
                'verbose_name_plural': '결제 거래 관리',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProjectEvaluator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invited_at', models.DateTimeField(auto_now_add=True)),
                ('invitation_token', models.UUIDField(default=uuid.uuid4)),
                ('status', models.CharField(choices=[('pending', '초대 대기'), ('accepted', '수락됨'), ('declined', '거절됨'), ('completed', '평가 완료')], default='pending', max_length=20)),
                ('evaluation_data', models.JSONField(default=dict)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('evaluator', models.ForeignKey(on_delete=models.CASCADE, to='super_admin.customuser')),
                ('project', models.ForeignKey(on_delete=models.CASCADE, to='super_admin.ahpproject')),
            ],
            options={
                'verbose_name': '프로젝트 평가자',
                'verbose_name_plural': '프로젝트 평가자 관리',
            },
        ),
        migrations.AddField(
            model_name='ahpproject',
            name='evaluators',
            field=models.ManyToManyField(related_name='evaluation_projects', through='super_admin.ProjectEvaluator', to='super_admin.customuser'),
        ),
        migrations.CreateModel(
            name='SystemSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('value', models.TextField()),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': '시스템 설정',
                'verbose_name_plural': '시스템 설정 관리',
            },
        ),
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('level', models.CharField(choices=[('info', '정보'), ('warning', '경고'), ('error', '오류'), ('critical', '치명적')], default='info', max_length=20)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('extra_data', models.JSONField(default=dict)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name='super_admin_activity_logs', to='super_admin.customuser')),
            ],
            options={
                'verbose_name': '활동 로그',
                'verbose_name_plural': '활동 로그 관리',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='projectevaluator',
            unique_together={('project', 'evaluator')},
        ),
    ]