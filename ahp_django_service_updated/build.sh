#!/usr/bin/env bash
# Build script for Render.com

set -o errexit  # exit on error

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running production setup..."
python manage.py setup_production

echo "Starting server..."