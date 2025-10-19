# Generated migration for AHP models
from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('simple_service', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add status and updated_at to SimpleProject
        migrations.AddField(
            model_name='simpleproject',
            name='status',
            field=models.CharField(choices=[('draft', '초안'), ('active', '진행중'), ('completed', '완료')], default='draft', max_length=20),
        ),
        migrations.AddField(
            model_name='simpleproject',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Create SimpleCriteria model
        migrations.CreateModel(
            name='SimpleCriteria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('type', models.CharField(choices=[('criteria', '평가기준'), ('alternative', '대안')], default='criteria', max_length=20)),
                ('order', models.PositiveIntegerField(default=0)),
                ('weight', models.FloatField(default=0.0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='simple_service.simplecriteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='criteria', to='simple_service.simpleproject')),
            ],
            options={
                'db_table': 'simple_criteria',
                'ordering': ['order'],
            },
        ),
        
        # Create SimpleComparison model
        migrations.CreateModel(
            name='SimpleComparison',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField(default=1.0, validators=[django.core.validators.MinValueValidator(0.111111111111111), django.core.validators.MaxValueValidator(9)])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('criteria_a', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons_as_a', to='simple_service.simplecriteria')),
                ('criteria_b', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons_as_b', to='simple_service.simplecriteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons', to='simple_service.simpleproject')),
            ],
            options={
                'db_table': 'simple_comparisons',
            },
        ),
        
        # Create SimpleResult model
        migrations.CreateModel(
            name='SimpleResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField()),
                ('rank', models.IntegerField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('criteria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='simple_service.simplecriteria')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='results', to='simple_service.simpleproject')),
            ],
            options={
                'db_table': 'simple_results',
                'ordering': ['rank'],
            },
        ),
        
        # Add unique constraints
        migrations.AlterUniqueTogether(
            name='simplecriteria',
            unique_together={('project', 'name')},
        ),
        migrations.AlterUniqueTogether(
            name='simplecomparison',
            unique_together={('project', 'criteria_a', 'criteria_b')},
        ),
        migrations.AlterUniqueTogether(
            name='simpleresult',
            unique_together={('project', 'criteria')},
        ),
    ]