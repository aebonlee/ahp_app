#!/usr/bin/env bash
# exit on error but continue on non-critical failures
set -e

echo "🚀 Installing dependencies..."
pip install -r requirements.txt

echo "📁 Creating required directories..."
mkdir -p static
mkdir -p logs
mkdir -p persistent_data/media

echo "🚀 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Force database setup..."
python manage.py force_setup || echo "Setup warning: continuing with basic migrations..."

echo "🚀 Running basic migrations..."
python manage.py migrate --run-syncdb || echo "Migration warning: continuing..."

echo "✅ Build completed successfully!"