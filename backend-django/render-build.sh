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

# Run basic Django migrations only
echo "Running basic Django migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Create superuser script (optional - 오류 발생 시 스킵)
echo "Creating superuser (optional)..."
python manage.py shell -c "
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@ahp-platform.com',
            password='ahp2025admin'
        )
        print('Superuser created: admin / ahp2025admin')
    else:
        print('Superuser already exists')
except Exception as e:
    print(f'Superuser creation skipped: {e}')
" || echo "Superuser creation failed, continuing..."

echo "Build completed successfully!"