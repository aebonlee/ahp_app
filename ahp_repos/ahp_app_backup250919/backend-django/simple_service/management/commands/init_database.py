"""
Database initialization management command
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Initialize PostgreSQL database with proper schema and users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force initialization even if tables exist',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting database initialization...'))
        
        try:
            # 1. Make migrations
            self.stdout.write('📝 Creating migrations...')
            call_command('makemigrations', verbosity=2, interactive=False)
            
            # 2. Run migrations
            self.stdout.write('⚡ Running migrations...')
            call_command('migrate', verbosity=2, interactive=False)
            
            # 3. Create superuser
            self.create_default_users()
            
            # 4. Verify tables
            self.verify_database()
            
            self.stdout.write(
                self.style.SUCCESS('✅ Database initialization completed successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Database initialization failed: {str(e)}')
            )
            logger.error(f"Database initialization error: {e}")
            raise

    def create_default_users(self):
        """Create default users"""
        self.stdout.write('👤 Creating default users...')
        
        User = get_user_model()
        
        # Create system user
        system_user, created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@ahp.com',
                'first_name': 'System',
                'last_name': 'User',
                'is_staff': True,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ System user created')
        else:
            self.stdout.write('ℹ️ System user already exists')
        
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ahp-platform.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        
        if created:
            admin_user.set_password('ahp2025admin')
            admin_user.save()
            self.stdout.write('✅ Admin user created')
        else:
            # Update password
            admin_user.set_password('ahp2025admin')
            admin_user.save()
            self.stdout.write('ℹ️ Admin user already exists (password updated)')

    def verify_database(self):
        """Verify database setup"""
        self.stdout.write('🔍 Verifying database setup...')
        
        User = get_user_model()
        
        with connection.cursor() as cursor:
            # Check tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name LIKE 'simple_%'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            self.stdout.write(f'📊 Found {len(tables)} simple_service tables:')
            for table in tables:
                self.stdout.write(f'  - {table}')
        
        # Check users
        user_count = User.objects.count()
        admin_count = User.objects.filter(is_superuser=True).count()
        
        self.stdout.write(f'👥 Users: {user_count} total, {admin_count} admins')
        
        # Check projects
        from simple_service.models import SimpleProject
        project_count = SimpleProject.objects.count()
        self.stdout.write(f'📋 Projects: {project_count}')