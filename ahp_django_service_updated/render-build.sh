#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Handling migrations..."
# Check migration status
python manage.py showmigrations || true

# Force reset admin and auth migrations to resolve dependency conflicts
echo "Resetting conflicting migrations..."
python manage.py migrate admin zero --fake 2>/dev/null || true
python manage.py migrate auth zero --fake 2>/dev/null || true
python manage.py migrate contenttypes zero --fake 2>/dev/null || true

# Apply accounts migrations first (required dependency for custom User model)
echo "Applying accounts migrations..."
python manage.py migrate accounts --fake-initial || python manage.py migrate accounts

# Apply all other migrations
echo "Applying all migrations..."
python manage.py migrate --fake-initial

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"