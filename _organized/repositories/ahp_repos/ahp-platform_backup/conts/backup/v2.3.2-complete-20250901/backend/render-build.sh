#!/bin/bash

echo "🚀 Starting Render.com backend build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"

# List build output for debugging
echo "📁 Build output:"
ls -la dist/