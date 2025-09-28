# Generated manually to fix deployment

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='이메일')),
                ('username', models.CharField(max_length=150, unique=True, verbose_name='사용자명')),
                ('first_name', models.CharField(blank=True, max_length=30, verbose_name='이름')),
                ('last_name', models.CharField(blank=True, max_length=30, verbose_name='성')),
                ('is_active', models.BooleanField(default=True, verbose_name='활성화')),
                ('is_staff', models.BooleanField(default=False, verbose_name='스태프')),
                ('is_superuser', models.BooleanField(default=False, verbose_name='슈퍼유저')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='가입일')),
            ],
            options={
                'verbose_name': '사용자',
                'verbose_name_plural': '사용자들',
                'db_table': 'accounts_customuser',
            },
        ),
    ]