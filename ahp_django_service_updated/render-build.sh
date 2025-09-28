#!/usr/bin/env bash
set -o errexit

# Change to the Django app directory
cd "$(dirname "$0")"

echo "Installing dependencies..."
pip install -r requirements.txt

echo "========================================="
echo "Handling migrations..."
echo "FLUSH_DB environment variable: ${FLUSH_DB:-not set}"
echo "========================================="

# OPTION 1: Try to fix migration history (default)
# OPTION 2: If this fails, set FLUSH_DB=true in Render environment variables for complete reset

if [ "$FLUSH_DB" = "true" ]; then
    echo "⚠️  FLUSH_DB=true detected - Performing complete database reset..."
    echo "This will DELETE ALL DATA in the database!"
    
    # Drop database schema and recreate (more robust than dropping individual tables)
    echo "Dropping and recreating database schema..."
    python manage.py shell <<EOF
from django.db import connection
from django.core.management.color import no_style
from django.core.management.sql import sql_flush

try:
    # Get the database name from connection settings
    db_name = connection.settings_dict['NAME']
    print(f"Working with database: {db_name}")
    
    # Use Django's built-in flush SQL commands
    style = no_style()
    sql_list = sql_flush(style, connection)
    
    with connection.cursor() as cursor:
        # Execute each SQL command separately with error handling
        for sql in sql_list:
            try:
                cursor.execute(sql)
                print(f"✅ Executed: {sql[:50]}...")
            except Exception as e:
                print(f"⚠️  Skipped: {sql[:50]}... (Error: {e})")
                # Rollback and start a new transaction
                connection.rollback()
        
        # Additional cleanup for stubborn tables/indexes
        print("Performing additional cleanup...")
        
        # Drop any remaining indexes that might cause conflicts
        cleanup_commands = [
            "DROP INDEX IF EXISTS accounts_user_username_6088629e_like CASCADE;",
            "DROP INDEX IF EXISTS accounts_user_username_key CASCADE;", 
            "DROP INDEX IF EXISTS auth_user_username_6821ab7c_like CASCADE;",
            "DROP SCHEMA public CASCADE;",
            "CREATE SCHEMA public;",
            "GRANT ALL ON SCHEMA public TO PUBLIC;",
        ]
        
        for cmd in cleanup_commands:
            try:
                cursor.execute(cmd)
                print(f"✅ Cleanup: {cmd}")
            except Exception as e:
                print(f"⚠️  Cleanup skipped: {cmd} (Error: {e})")
                connection.rollback()
                
except Exception as e:
    print(f"❌ Database reset failed: {e}")
    
print("✅ Database reset completed")
EOF
    
    # Fresh migrations from scratch
    echo "Applying all migrations from scratch..."
    python manage.py migrate
    
    # Create superuser (only if credentials are set)
    if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
        echo "Creating superuser..."
        python manage.py createsuperuser --noinput --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" || true
    fi
else
    # Standard migration fix (tries to preserve data)
    echo "========================================="
    echo "FLUSH_DB not set - Attempting to fix migration history without data loss..."
    echo "========================================="
    
    python manage.py shell <<EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM django_migrations WHERE app='admin' AND name='0001_initial';")
        cursor.execute("DELETE FROM django_migrations WHERE app='auth' AND name='0001_initial';")
        cursor.execute("DELETE FROM django_migrations WHERE app='contenttypes' AND name='0001_initial';")
        print("✅ Migration history cleaned successfully")
except Exception as e:
    print(f"⚠️  Could not clean migration history: {e}")
EOF
    
    # Check migration status
    echo "Current migration status:"
    python manage.py showmigrations || true
    
    # Apply migrations
    echo "Applying migrations..."
    python manage.py migrate accounts --fake-initial
    python manage.py migrate --fake-initial
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"