#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting Render.com build process..."

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Database setup with error handling
echo "Setting up database..."

# Check database connection first
echo "Checking database connection..."
python manage.py check --database default

# Run migrations with verbose output
echo "Running migrations..."
python manage.py makemigrations --verbosity=2
python manage.py showmigrations
python manage.py migrate --verbosity=2

# Verify table creation
echo "Verifying database setup..."
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table';\") if 'sqlite' in connection.vendor else cursor.execute(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public';\")
    tables = [row[0] for row in cursor.fetchall()]
    print(f'Created tables: {tables}')
    if 'simple_projects' in tables:
        print('✓ simple_projects table exists')
    else:
        print('❌ simple_projects table missing')
"

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@ahp-platform.com',
        password='AHP2025!Admin'
    )
    print('Superuser created: admin / AHP2025!Admin')
else:
    print('Superuser already exists')

# Create sample evaluator user
if not User.objects.filter(username='evaluator').exists():
    user = User.objects.create_user(
        username='evaluator',
        email='evaluator@ahp-platform.com', 
        password='AHP2025!Eval'
    )
    user.is_evaluator = True
    user.save()
    print('Evaluator user created: evaluator / AHP2025!Eval')
else:
    print('Evaluator user already exists')
"

echo "Build completed successfully!"