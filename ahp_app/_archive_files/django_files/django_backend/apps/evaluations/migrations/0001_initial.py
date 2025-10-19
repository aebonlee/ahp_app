# Generated manually to fix deployment

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0001_initial'),
        ('analysis', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EvaluationMatrix',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matrix_data', models.JSONField(verbose_name='행렬 데이터')),
                ('consistency_ratio', models.FloatField(default=0.0, verbose_name='일관성 비율')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='생성일시')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='수정일시')),
                ('criterion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_matrices', to='analysis.criterion', verbose_name='평가기준')),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_matrices', to=settings.AUTH_USER_MODEL, verbose_name='평가자')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluation_matrices', to='projects.project', verbose_name='프로젝트')),
            ],
            options={
                'verbose_name': '평가 행렬',
                'verbose_name_plural': '평가 행렬들',
                'db_table': 'evaluations_evaluationmatrix',
            },
        ),
    ]