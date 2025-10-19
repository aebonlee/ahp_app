#!/bin/bash
# Simple build script for Render.com

echo "🚀 Starting simple build process..."

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

echo "✅ Build completed successfully!"