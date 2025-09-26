# Generated migration for complete AHP system

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0001_initial'),
    ]

    operations = [
        # Drop old tables
        migrations.RemoveField(
            model_name='alternative',
            name='project',
        ),
        migrations.RemoveField(
            model_name='comparison',
            name='criteria',
        ),
        migrations.RemoveField(
            model_name='comparison',
            name='project',
        ),
        migrations.RemoveField(
            model_name='criteria',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='criteria',
            name='project',
        ),
        migrations.RemoveField(
            model_name='project',
            name='owner',
        ),
        migrations.DeleteModel(
            name='Alternative',
        ),
        migrations.DeleteModel(
            name='Comparison',
        ),
        migrations.DeleteModel(
            name='Criteria',
        ),
        migrations.DeleteModel(
            name='Project',
        ),
        
        # Create new Project model
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('objective', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('setup', '프로젝트 설정'), ('model_building', '모델 구축'), ('evaluator_assignment', '평가자 할당'), ('evaluation_in_progress', '평가 진행 중'), ('evaluation_complete', '평가 완료'), ('results_available', '결과 제공')], default='setup', max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_projects', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ahp_projects',
                'ordering': ['-created_at'],
            },
        ),
        
        # Create Criteria model
        migrations.CreateModel(
            name='Criteria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('level', models.IntegerField(default=1)),
                ('order_index', models.IntegerField(default=0)),
                ('weight', models.FloatField(default=0.0)),
                ('local_weight', models.FloatField(default=0.0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='projects.criteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='criteria', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_criteria',
                'verbose_name_plural': 'Criteria',
                'ordering': ['level', 'order_index'],
            },
        ),
        
        # Create Alternative model
        migrations.CreateModel(
            name='Alternative',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('order_index', models.IntegerField(default=0)),
                ('final_score', models.FloatField(default=0.0)),
                ('rank', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alternatives', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_alternatives',
                'ordering': ['order_index'],
            },
        ),
        
        # Create Evaluator model
        migrations.CreateModel(
            name='Evaluator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('role', models.CharField(choices=[('admin', '관리자'), ('evaluator', '평가자')], default='evaluator', max_length=20)),
                ('access_key', models.CharField(max_length=50, unique=True)),
                ('is_invited', models.BooleanField(default=False)),
                ('invitation_sent_at', models.DateTimeField(blank=True, null=True)),
                ('evaluation_started_at', models.DateTimeField(blank=True, null=True)),
                ('evaluation_completed_at', models.DateTimeField(blank=True, null=True)),
                ('progress_percentage', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evaluators', to='projects.project')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='evaluations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'ahp_evaluators',
                'unique_together': {('project', 'email')},
            },
        ),
        
        # Create Comparison model
        migrations.CreateModel(
            name='Comparison',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('left_item_id', models.CharField(max_length=50)),
                ('right_item_id', models.CharField(max_length=50)),
                ('left_item_name', models.CharField(max_length=200)),
                ('right_item_name', models.CharField(max_length=200)),
                ('value', models.FloatField(validators=[django.core.validators.MinValueValidator(0.1111111111111111), django.core.validators.MaxValueValidator(9)])),
                ('is_criteria_comparison', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('criteria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons', to='projects.criteria')),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons', to='projects.evaluator')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_comparisons',
                'unique_together': {('project', 'evaluator', 'criteria', 'left_item_id', 'right_item_id')},
            },
        ),
        
        # Create ComparisonMatrix model
        migrations.CreateModel(
            name='ComparisonMatrix',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('matrix_type', models.CharField(max_length=20)),
                ('matrix_data', models.JSONField()),
                ('consistency_ratio', models.FloatField(default=0.0)),
                ('is_consistent', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('criteria', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='matrices', to='projects.criteria')),
                ('evaluator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matrices', to='projects.evaluator')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matrices', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_comparison_matrices',
            },
        ),
        
        # Create Result model
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField(default=0.0)),
                ('rank', models.IntegerField(default=0)),
                ('is_group_result', models.BooleanField(default=False)),
                ('criteria_scores', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('alternative', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='projects.alternative')),
                ('evaluator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='results', to='projects.evaluator')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_results',
                'ordering': ['-score'],
            },
        ),
        
        # Create SensitivityAnalysis model
        migrations.CreateModel(
            name='SensitivityAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('original_weight', models.FloatField()),
                ('modified_weight', models.FloatField()),
                ('results_data', models.JSONField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('criteria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sensitivity_analyses', to='projects.criteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sensitivity_analyses', to='projects.project')),
            ],
            options={
                'db_table': 'ahp_sensitivity_analyses',
            },
        ),
    ]