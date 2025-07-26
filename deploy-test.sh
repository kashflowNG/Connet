#!/bin/bash

# Pre-deployment Test Script for Render
echo "🧪 Testing ETH DeFi Platform before deployment..."

# Test 1: Check if build script is executable
echo "1. Checking build script..."
if [ -x "build.sh" ]; then
  echo "✅ build.sh is executable"
else
  echo "❌ build.sh is not executable"
  exit 1
fi

# Test 2: Verify required files exist
echo "2. Checking deployment files..."
files=("render.yaml" "RENDER_DEPLOYMENT.md" "Dockerfile.render" "env.production.example")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file is missing"
    exit 1
  fi
done

# Test 3: Check if health endpoints are defined
echo "3. Checking health endpoints..."
if grep -q "/health" server/index.ts; then
  echo "✅ Health endpoints configured"
else
  echo "❌ Health endpoints missing"
  exit 1
fi

# Test 4: Validate render.yaml syntax
echo "4. Validating render.yaml..."
if command -v python3 >/dev/null 2>&1; then
  python3 -c "import yaml; yaml.safe_load(open('render.yaml'))" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✅ render.yaml syntax is valid"
  else
    echo "❌ render.yaml has syntax errors"
    exit 1
  fi
else
  echo "⚠️ Python not available, skipping YAML validation"
fi

# Test 5: Check database schema file
echo "5. Checking database schema..."
if [ -f "shared/schema.ts" ]; then
  echo "✅ Database schema exists"
else
  echo "❌ Database schema missing"
  exit 1
fi

# Test 6: Verify build commands work locally
echo "6. Testing build process..."
if npm run build >/dev/null 2>&1; then
  echo "✅ Build process works"
  # Clean up test build
  rm -rf dist/
else
  echo "❌ Build process failed"
  exit 1
fi

echo ""
echo "🎉 All pre-deployment tests passed!"
echo ""
echo "📋 Next steps for Render deployment:"
echo "1. Push code to GitHub repository"
echo "2. Go to render.com and create new Blueprint"
echo "3. Connect your GitHub repo"
echo "4. Render will auto-detect render.yaml"
echo "5. Click 'Apply' to deploy"
echo ""
echo "🌐 Your app will be live at: https://eth-portfolio-platform.onrender.com"
echo "📖 Full deployment guide: RENDER_DEPLOYMENT.md"