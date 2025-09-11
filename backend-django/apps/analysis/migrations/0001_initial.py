# Generated migration for analysis app
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0001_initial'),
        ('super_admin', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnalysisResult',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('result_type', models.CharField(choices=[('weights', '가중치'), ('ranking', '순위'), ('sensitivity', '민감도 분석'), ('consensus', '합의도 분석')], max_length=20)),
                ('results_data', models.JSONField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analysis_results', to='projects.project')),
            ],
        ),
    ]