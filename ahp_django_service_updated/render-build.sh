#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Handling migrations..."
# Reset problematic migrations
python manage.py migrate admin zero --fake || true
python manage.py migrate auth zero --fake || true

# Apply accounts migrations first (required dependency)
echo "Applying accounts migrations..."
python manage.py migrate accounts || true

# Apply all other migrations
echo "Applying all migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"