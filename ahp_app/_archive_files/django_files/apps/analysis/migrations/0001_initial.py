# Generated manually to fix deployment

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Criterion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='평가기준명')),
                ('description', models.TextField(blank=True, verbose_name='설명')),
                ('weight', models.FloatField(default=0.0, verbose_name='가중치')),
                ('level', models.IntegerField(default=1, verbose_name='계층 레벨')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='analysis.criterion', verbose_name='상위 기준')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='criteria', to='projects.project', verbose_name='프로젝트')),
            ],
            options={
                'verbose_name': '평가기준',
                'verbose_name_plural': '평가기준들',
                'db_table': 'analysis_criterion',
            },
        ),
        migrations.CreateModel(
            name='Alternative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='대안명')),
                ('description', models.TextField(blank=True, verbose_name='설명')),
                ('final_score', models.FloatField(default=0.0, verbose_name='최종 점수')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alternatives', to='projects.project', verbose_name='프로젝트')),
            ],
            options={
                'verbose_name': '대안',
                'verbose_name_plural': '대안들',
                'db_table': 'analysis_alternative',
            },
        ),
    ]