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

# Create database tables
echo "Running migrations..."
python manage.py makemigrations accounts
python manage.py makemigrations projects  
python manage.py makemigrations evaluations
python manage.py makemigrations analysis
python manage.py makemigrations common
python manage.py makemigrations workshops
python manage.py makemigrations exports
python manage.py migrate

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