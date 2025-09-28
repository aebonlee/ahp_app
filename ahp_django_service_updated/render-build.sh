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
    echo "⚠️  FLUSH_DB=true detected - Performing complete reset..."
    echo "This will DELETE ALL DATA and regenerate migrations!"
    
    # Step 1: Delete all migration files except __init__.py
    echo "🗑️  Removing all existing migration files..."
    find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
    find . -path "*/migrations/*.pyc" -delete
    
    # Step 2: Delete migration cache
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Step 3: Create fresh migration files
    echo "📝 Creating fresh migration files..."
    python manage.py makemigrations accounts
    python manage.py makemigrations projects
    python manage.py makemigrations
    
    # Step 4: Clean existing database tables before applying new migrations
    echo "🧹 Cleaning existing database tables..."
    python manage.py shell <<EOF
from django.db import connection
try:
    with connection.cursor() as cursor:
        # Drop specific tables that might conflict
        tables_to_drop = [
            'ahp_users', 'accounts_user', 'auth_user',
            'ahp_projects', 'simple_projects', 'projects_project',
            'project_members', 'criteria', 'project_templates',
            'django_migrations'
        ]
        
        for table in tables_to_drop:
            try:
                cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
                print(f"✅ Dropped table: {table}")
            except Exception as e:
                print(f"⚠️  Table {table} not found or already dropped")
        
        # Drop any remaining sequences
        cursor.execute("""
            SELECT sequence_name FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
        """)
        sequences = [row[0] for row in cursor.fetchall()]
        for seq in sequences:
            try:
                cursor.execute(f'DROP SEQUENCE IF EXISTS "{seq}" CASCADE;')
                print(f"✅ Dropped sequence: {seq}")
            except:
                pass
                
    print("✅ Database cleanup completed")
except Exception as e:
    print(f"⚠️  Database cleanup error: {e}")
    print("Proceeding with migrations anyway...")
EOF
    
    # Step 5: Apply all migrations fresh
    echo "🚀 Applying all migrations from scratch..."
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