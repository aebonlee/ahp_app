"""
Force database setup management command
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Force complete database setup including migrations and superuser'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Starting forced database setup...")
        
        try:
            # Test database connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(self.style.SUCCESS("✅ Database connection successful"))
            
            # Force create tables with SQL
            self.stdout.write("🔧 Creating tables with SQL...")
            sql_file_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'create_tables.sql')
            if os.path.exists(sql_file_path):
                with open(sql_file_path, 'r') as f:
                    sql_content = f.read()
                with connection.cursor() as cursor:
                    cursor.execute(sql_content)
                self.stdout.write(self.style.SUCCESS("✅ Tables created with SQL"))
            else:
                self.stdout.write(self.style.WARNING("⚠️ SQL file not found, continuing..."))
            
            # Create migrations
            self.stdout.write("📝 Creating migrations...")
            call_command('makemigrations', verbosity=1)
            self.stdout.write(self.style.SUCCESS("✅ Migrations created"))
            
            # Apply migrations
            self.stdout.write("🔄 Applying migrations...")
            call_command('migrate', verbosity=1)
            self.stdout.write(self.style.SUCCESS("✅ Migrations applied"))
            
            # Create superuser
            self.stdout.write("👤 Creating superuser...")
            User = get_user_model()
            
            if not User.objects.filter(is_superuser=True).exists():
                User.objects.create_superuser(
                    username='admin',
                    email='admin@ahp.com',
                    password='ahp2025admin'
                )
                self.stdout.write(self.style.SUCCESS("✅ Superuser created: admin/ahp2025admin"))
            else:
                self.stdout.write(self.style.WARNING("ℹ️ Superuser already exists"))
                
            # Test table existence
            with connection.cursor() as cursor:
                if connection.vendor == 'postgresql':
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'simple_projects'
                    """)
                else:
                    cursor.execute("""
                        SELECT name FROM sqlite_master 
                        WHERE type='table' AND name='simple_projects'
                    """)
                
                tables = cursor.fetchall()
                if tables:
                    self.stdout.write(self.style.SUCCESS("✅ simple_projects table exists"))
                else:
                    self.stdout.write(self.style.ERROR("❌ simple_projects table not found"))
            
            self.stdout.write(self.style.SUCCESS("🎉 Database setup completed successfully!"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Setup failed: {str(e)}"))
            raise