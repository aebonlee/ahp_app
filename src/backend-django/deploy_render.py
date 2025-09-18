#!/usr/bin/env python3
"""
Render.com Deployment Script
Handles Django migrations with custom User model dependencies
"""
import os
import sys
import django
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

def setup_django():
    """Setup Django with proper settings"""
    django.setup()
    from django.core.management import execute_from_command_line
    from django.db import connection
    return execute_from_command_line, connection

def check_database():
    """Check if database tables exist"""
    execute_from_command_line, connection = setup_django()
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'django_migrations';
            """)
            return cursor.fetchone() is not None
    except Exception:
        return False

def reset_migration_state():
    """Reset migration state for clean deployment"""
    execute_from_command_line, connection = setup_django()
    
    print("🔄 Resetting migration state...")
    
    try:
        with connection.cursor() as cursor:
            # Clear migration records for problematic apps
            cursor.execute("DELETE FROM django_migrations WHERE app IN ('admin', 'auth', 'contenttypes');")
            cursor.execute("DELETE FROM django_migrations WHERE app LIKE 'apps.%';")
            print("   ✅ Cleared problematic migration records")
    except Exception as e:
        print(f"   ⚠️ Could not clear migration records: {e}")

def deploy_with_proper_order():
    """Deploy with proper migration order"""
    execute_from_command_line, connection = setup_django()
    
    print("🚀 Starting ordered migration deployment...")
    
    # Step 1: Migrate contenttypes and accounts first
    print("📝 Step 1: Core dependencies...")
    execute_from_command_line(['manage.py', 'migrate', 'contenttypes', '--verbosity=2'])
    execute_from_command_line(['manage.py', 'migrate', 'accounts', '--verbosity=2'])
    
    # Step 2: Migrate auth and admin (now that User model exists)
    print("📝 Step 2: Auth system...")
    execute_from_command_line(['manage.py', 'migrate', 'auth', '--verbosity=2'])
    execute_from_command_line(['manage.py', 'migrate', 'admin', '--verbosity=2'])
    
    # Step 3: Migrate sessions and other core Django apps
    print("📝 Step 3: Core Django apps...")
    execute_from_command_line(['manage.py', 'migrate', 'sessions', '--verbosity=2'])
    
    # Step 4: Migrate our custom apps
    print("📝 Step 4: Custom apps...")
    for app in ['common', 'projects', 'evaluations', 'analysis', 'workshops', 'exports']:
        try:
            execute_from_command_line(['manage.py', 'migrate', f'apps.{app}', '--verbosity=2'])
        except Exception as e:
            print(f"   ⚠️ {app} migration failed: {e}")
    
    # Step 5: Final migrate to catch any remaining
    print("📝 Step 5: Final migration...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])
    
    print("✅ Migration deployment complete!")

def main():
    """Main deployment function"""
    print("🎯 Django Deployment for Render.com")
    print("=" * 50)
    
    if not check_database():
        print("🆕 Fresh database detected")
        deploy_with_proper_order()
    else:
        print("🔄 Existing database detected")
        reset_migration_state()
        deploy_with_proper_order()
    
    print("🎉 Deployment successful!")

if __name__ == '__main__':
    main()