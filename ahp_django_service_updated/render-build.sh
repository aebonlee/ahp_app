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
    
    # Drop all tables using raw SQL (bypass Django migration system)
    echo "Dropping all tables via SQL..."
    python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    # Get all table names
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public';
    """)
    tables = cursor.fetchall()
    
    # Drop all tables
    for table in tables:
        table_name = table[0]
        print(f"Dropping table: {table_name}")
        cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
    
    print("✅ All tables dropped successfully")
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