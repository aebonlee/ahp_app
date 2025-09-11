#!/bin/bash

echo "🚀 Starting AHP Backend on Render.com..."

# Print environment info
echo "📊 Environment Info:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "Database configured: $(if [ -n "$DATABASE_URL" ]; then echo "✅ Yes"; else echo "❌ No"; fi)"

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found!"
    exit 1
fi

# Start the application
echo "🏃 Starting application..."
node dist/index.js