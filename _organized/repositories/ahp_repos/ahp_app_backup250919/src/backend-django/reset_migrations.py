#!/usr/bin/env python3
"""
Migration Reset Script for Render.com Deployment
This script resets all migrations to handle the custom User model dependency issues.
"""
import os
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from django.conf import settings

def reset_migrations():
    """Reset all migrations for clean deployment"""
    print("🔄 Starting migration reset for Render.com deployment...")
    
    # Step 1: Clear migration history from database
    print("📝 Step 1: Clearing migration history...")
    with connection.cursor() as cursor:
        try:
            # Delete all migration records
            cursor.execute("DELETE FROM django_migrations;")
            print("   ✅ Cleared django_migrations table")
        except Exception as e:
            print(f"   ⚠️ Could not clear migrations (table may not exist): {e}")
    
    # Step 2: Remove all migration files
    print("📝 Step 2: Removing migration files...")
    apps_dir = Path(settings.BASE_DIR) / 'apps'
    for app_path in apps_dir.iterdir():
        if app_path.is_dir():
            migrations_dir = app_path / 'migrations'
            if migrations_dir.exists():
                # Remove all migration files except __init__.py
                for migration_file in migrations_dir.glob('*.py'):
                    if migration_file.name != '__init__.py':
                        migration_file.unlink()
                        print(f"   🗑️ Removed {migration_file}")
    
    # Step 3: Create fresh migrations with proper dependencies
    print("📝 Step 3: Creating fresh migrations...")
    
    # Create accounts migration first (contains custom User model)
    print("   📦 Creating accounts migration...")
    execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
    
    # Create other app migrations
    for app in ['common', 'projects', 'evaluations', 'analysis', 'workshops', 'exports']:
        print(f"   📦 Creating {app} migration...")
        execute_from_command_line(['manage.py', 'makemigrations', app])
    
    print("✅ Migration reset complete!")
    print("🚀 Ready for Render.com deployment")

if __name__ == '__main__':
    reset_migrations()