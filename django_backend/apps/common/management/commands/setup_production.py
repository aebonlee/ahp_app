"""
Production setup management command
Handles database migrations and initial data setup for Render.com deployment
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Setup production database with migrations and initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of tables',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting production setup...')
        )

        try:
            # Check database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(
                self.style.SUCCESS('✓ Database connection successful')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Database connection failed: {e}')
            )
            return

        # Run migrations
        try:
            self.stdout.write('Running migrations...')
            call_command('makemigrations', verbosity=1)
            call_command('migrate', verbosity=1)
            self.stdout.write(
                self.style.SUCCESS('✓ Migrations completed')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Migration failed: {e}')
            )

        # Create superuser if not exists
        try:
            User = get_user_model()
            if not User.objects.filter(is_superuser=True).exists():
                admin_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@ahp.com')
                admin_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
                
                User.objects.create_superuser(
                    username='admin',
                    email=admin_email,
                    password=admin_password
                )
                self.stdout.write(
                    self.style.SUCCESS('✓ Superuser created')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Superuser already exists')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Superuser creation failed: {e}')
            )

        # Collect static files for production
        try:
            if not os.environ.get('DEBUG', '').lower() == 'true':
                call_command('collectstatic', '--noinput', verbosity=1)
                self.stdout.write(
                    self.style.SUCCESS('✓ Static files collected')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Static files collection failed: {e}')
            )

        self.stdout.write(
            self.style.SUCCESS('Production setup completed!')
        )