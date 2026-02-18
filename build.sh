#!/bin/bash
# Production Build & Deploy Script
# This script builds the application and prepares it for deployment

set -e

echo "📦 PoE Forum Mobile API - Production Build"
echo "=========================================="

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm ci --production

# Step 3: Fix vulnerabilities
echo "🔒 Checking for vulnerabilities..."
npm audit fix || true

# Step 4: Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Step 5: Verify build
echo "✅ Verifying build..."
if [ ! -f "dist/server/index.js" ]; then
  echo "❌ Build failed: dist/server/index.js not found"
  exit 1
fi

# Step 6: Check environment
echo "🔍 Checking environment configuration..."
if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found"
  echo "📋 Copy .env.example to .env and update with your production values"
  echo "   cp .env.example .env"
fi

# Step 7: Success message
echo ""
echo "✅ Build successful!"
echo ""
echo "📝 Next steps:"
echo "   1. Configure .env with production values"
echo "   2. Run: npm start"
echo "   3. Test: curl http://localhost:3000/health"
echo ""
echo "🐳 To run with Docker:"
echo "   docker build -t poe-forum-api ."
echo "   docker run -p 3000:3000 --env-file .env poe-forum-api"
echo ""
