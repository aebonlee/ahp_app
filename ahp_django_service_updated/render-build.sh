#!/usr/bin/env bash
# Simplified and safe build script
set -e

echo "🚀 Installing dependencies..."
pip install -r requirements.txt

echo "📁 Creating required directories..."
mkdir -p static
mkdir -p staticfiles
mkdir -p logs

echo "🚀 Collecting static files..."
python manage.py collectstatic --noinput || true

echo "🗄️ Running database migrations..."
python manage.py migrate --noinput || true

echo "✅ Build completed!"