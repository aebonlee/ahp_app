# Generated manually to fix deployment

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='프로젝트 제목')),
                ('description', models.TextField(blank=True, verbose_name='프로젝트 설명')),
                ('objective', models.TextField(verbose_name='의사결정 목표')),
                ('evaluation_mode', models.CharField(choices=[('practical', '실무용'), ('academic', '학술용'), ('workshop', '워크샵')], default='practical', max_length=20, verbose_name='평가 모드')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='생성일시')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='수정일시')),
                ('status', models.CharField(choices=[('draft', '초안'), ('active', '진행중'), ('completed', '완료'), ('archived', '보관됨')], default='draft', max_length=20, verbose_name='상태')),
            ],
            options={
                'verbose_name': '프로젝트',
                'verbose_name_plural': '프로젝트들',
                'db_table': 'projects_project',
                'ordering': ['-created_at'],
            },
        ),
    ]