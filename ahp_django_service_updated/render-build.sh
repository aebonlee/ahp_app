#!/usr/bin/env bash
# exit on error
set -o errexit

# 간단한 빌드 과정만 수행
echo "🚀 Installing dependencies..."
pip install -r requirements.txt

echo "🚀 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Running migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"