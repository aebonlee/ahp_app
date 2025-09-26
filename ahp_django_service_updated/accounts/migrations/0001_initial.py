# Generated manually for accounts app

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('role', models.CharField(choices=[('super_admin', '슈퍼 관리자'), ('service_admin', '서비스 관리자'), ('service_user', '서비스 사용자'), ('evaluator', '평가자')], default='service_user', max_length=20)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('organization', models.CharField(blank=True, max_length=200)),
                ('department', models.CharField(blank=True, max_length=100)),
                ('position', models.CharField(blank=True, max_length=100)),
                ('profile_image', models.ImageField(blank=True, null=True, upload_to='profile_images/')),
                ('bio', models.TextField(blank=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('can_create_projects', models.BooleanField(default=False)),
                ('max_projects', models.IntegerField(default=5)),
                ('last_login_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'accounts_user',
                'verbose_name': '사용자',
                'verbose_name_plural': '사용자',
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email_notifications', models.BooleanField(default=True)),
                ('evaluation_reminders', models.BooleanField(default=True)),
                ('project_updates', models.BooleanField(default=True)),
                ('language', models.CharField(choices=[('ko', '한국어'), ('en', 'English')], default='ko', max_length=10)),
                ('timezone', models.CharField(default='Asia/Seoul', max_length=50)),
                ('total_evaluations', models.IntegerField(default=0)),
                ('total_projects_owned', models.IntegerField(default=0)),
                ('total_projects_participated', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='accounts.user')),
            ],
            options={
                'db_table': 'accounts_user_profile',
            },
        ),
        migrations.CreateModel(
            name='UserActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('login', '로그인'), ('logout', '로그아웃'), ('register', '회원가입'), ('project_create', '프로젝트 생성'), ('project_update', '프로젝트 수정'), ('project_delete', '프로젝트 삭제'), ('evaluation_start', '평가 시작'), ('evaluation_complete', '평가 완료')], max_length=30)),
                ('description', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activity_logs', to='accounts.user')),
            ],
            options={
                'db_table': 'accounts_user_activity_log',
                'ordering': ['-created_at'],
            },
        ),
    ]