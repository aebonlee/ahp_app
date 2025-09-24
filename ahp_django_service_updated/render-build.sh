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

echo "🚀 Running migrations..."
python manage.py migrate --noinput

echo "✅ Build completed successfully!"