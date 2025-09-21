from django.apps import AppConfig
import os


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.common'
    
    def ready(self):
        """Run when Django starts up"""
        # Only run auto-migration in production
        if not os.environ.get('DEBUG', '').lower() == 'true':
            self.run_auto_migration()
    
    def run_auto_migration(self):
        """Automatically run migrations on startup"""
        try:
            from django.core.management import call_command
            from django.db import connection
            
            # Test database connection first
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            
            # Run migrations
            call_command('makemigrations', verbosity=0, interactive=False)
            call_command('migrate', verbosity=0, interactive=False)
            
            print("✓ Auto-migration completed successfully")
            
        except Exception as e:
            print(f"Auto-migration failed: {e}")
            # Don't break the app startup, just log the error
            pass