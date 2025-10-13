#!/usr/bin/env python
"""
Development server runner for AHP Django Backend
"""
import os
import sys
import django
from pathlib import Path

# Add the django_backend directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

def run_development_server():
    """Run Django development server with proper setup"""
    
    try:
        django.setup()
        
        print("🚀 AHP Django Backend Development Server")
        print("=" * 50)
        
        # Check database connection
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            print("✅ Database connection: OK")
        except Exception as e:
            print(f"❌ Database connection: FAILED ({e})")
            print("   Please check your DATABASE_URL in .env file")
            
        # Check if migrations are needed
        from django.core.management import execute_from_command_line
        
        print("\n📋 Running migrations...")
        try:
            execute_from_command_line(['manage.py', 'migrate', '--verbosity=1'])
            print("✅ Migrations: Complete")
        except Exception as e:
            print(f"❌ Migrations: Failed ({e})")
            
        # Create superuser if needed (optional)
        print("\n👤 Checking superuser...")
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(is_superuser=True).exists():
                print("   No superuser found. You can create one with: python manage.py createsuperuser")
            else:
                print("✅ Superuser exists")
        except Exception as e:
            print(f"   Note: {e}")
            
        print("\n🌐 Starting development server...")
        print("   Frontend should connect to: http://localhost:8000")
        print("   Admin interface: http://localhost:8000/admin/")
        print("   API root: http://localhost:8000/api/")
        print("   API service: http://localhost:8000/api/service/")
        print("\n   Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Run the development server
        execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
        
    except KeyboardInterrupt:
        print("\n\n👋 Development server stopped")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("   Please check your Django setup and dependencies")

if __name__ == '__main__':
    run_development_server()