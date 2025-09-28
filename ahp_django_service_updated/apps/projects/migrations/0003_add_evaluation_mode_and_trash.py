# Generated migration for evaluation_mode, workflow_stage, and trash functionality

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_alter_project_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='evaluation_mode',
            field=models.CharField(
                choices=[
                    ('practical', '실용적'),
                    ('theoretical', '이론적'),
                    ('direct_input', '직접입력'),
                    ('fuzzy_ahp', '퍼지 AHP')
                ],
                default='practical',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='project',
            name='workflow_stage',
            field=models.CharField(
                choices=[
                    ('creating', '생성중'),
                    ('waiting', '대기중'),
                    ('evaluating', '평가중'),
                    ('completed', '완료')
                ],
                default='creating',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='project',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='criteria_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='project',
            name='alternatives_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='project',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', '초안'),
                    ('active', '진행중'),
                    ('evaluation', '평가중'),
                    ('completed', '완료'),
                    ('archived', '보관'),
                    ('deleted', '삭제됨')
                ],
                default='draft',
                max_length=20
            ),
        ),
    ]