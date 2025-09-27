#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Handling migrations..."

# Direct database migration history fix for InconsistentMigrationHistory error
echo "Fixing migration history in database..."
python manage.py shell <<EOF
from django.db import connection
with connection.cursor() as cursor:
    # Delete problematic migration records that cause dependency conflicts
    cursor.execute("DELETE FROM django_migrations WHERE app='admin' AND name='0001_initial';")
    cursor.execute("DELETE FROM django_migrations WHERE app='auth' AND name='0001_initial';")
    cursor.execute("DELETE FROM django_migrations WHERE app='contenttypes' AND name='0001_initial';")
    print("Migration history cleaned successfully")
EOF

# Check migration status
echo "Current migration status:"
python manage.py showmigrations || true

# Apply accounts migrations first (required dependency for custom User model)
echo "Applying accounts migrations..."
python manage.py migrate accounts --fake-initial

# Apply all other migrations
echo "Applying all migrations..."
python manage.py migrate --fake-initial

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"