#!/usr/bin/env bash
# exit on error
set -o errexit

# 간단한 빌드 과정만 수행
echo "🚀 Installing dependencies..."
pip install -r requirements.txt

# Create required directories
echo "📁 Creating required directories..."
mkdir -p static
mkdir -p logs
mkdir -p persistent_data/media

echo "🚀 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Creating migrations..."
python manage.py makemigrations --noinput

echo "🚀 Running migrations..."
python manage.py migrate --noinput

echo "👤 Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@ahp.com', 'ahp2025admin');
    print('Superuser created');
else:
    print('Superuser already exists')
" || echo "Superuser creation skipped (may already exist)"

echo "✅ Build completed successfully!"