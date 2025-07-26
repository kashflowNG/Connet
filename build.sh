#!/bin/bash

# Render Build Script for ETH DeFi Platform
set -e

echo "🚀 Starting ETH DeFi Platform build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database migrations (if DATABASE_URL is available)
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ Running database migrations..."
  npm run db:push
else
  echo "⚠️ DATABASE_URL not found, skipping migrations"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Generated files:"
  ls -la dist/
else
  echo "❌ Build failed - missing output files"
  exit 1
fi

echo "🎉 Build process completed!"