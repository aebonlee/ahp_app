"""
WSGI config for ahp_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

# Initialize Django application
application = get_wsgi_application()

# Run migrations on startup in production
if not os.environ.get('DEBUG', '').lower() == 'true':
    try:
        from django.core.management import call_command
        from django.db import connection
        
        print("🔄 Running startup migrations...")
        
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✓ Database connection successful")
        
        # Run migrations
        call_command('makemigrations', verbosity=1, interactive=False)
        call_command('migrate', verbosity=1, interactive=False)
        print("✓ Migrations completed successfully")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        # Continue anyway - don't break the app startup