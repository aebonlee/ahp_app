#!/usr/bin/env bash
# Build script for Render.com

set -o errexit  # exit on error

echo "🔄 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔄 Making migrations..."
python manage.py makemigrations --verbosity=2

echo "🔄 Running migrations..."
python manage.py migrate --verbosity=2

echo "🔄 Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@ahp.com', 'admin123')
    print('✓ Superuser created')
else:
    print('Superuser already exists')
"

echo "🔄 Collecting static files..."
python manage.py collectstatic --noinput

echo "✓ Build completed successfully!"