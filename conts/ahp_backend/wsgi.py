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

# Run migrations on startup
try:
    from django.core.management import call_command
    from django.db import connection
    from django.contrib.auth import get_user_model
    
    print("🔄 Starting database setup...")
    
    # Test database connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✓ Database connection successful")
    
    # Run migrations
    print("🔄 Creating migrations...")
    call_command('makemigrations', verbosity=1, interactive=False)
    print("🔄 Applying migrations...")
    call_command('migrate', verbosity=1, interactive=False)
    print("✓ Migrations completed successfully")
    
    # Create superuser if needed
    try:
        User = get_user_model()
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@ahp.com',
                password='admin123'
            )
            print("✓ Superuser created: admin/admin123")
        else:
            print("ℹ️ Superuser already exists")
    except Exception as e:
        print(f"⚠️ Superuser creation failed: {e}")
    
    print("✅ Database setup completed successfully!")
    
except Exception as e:
    print(f"❌ Database setup failed: {e}")
    print("🔄 Continuing with app startup...")