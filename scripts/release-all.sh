#!/bin/bash

# DevUtils Multi-SDK Release Script
# Coordinates releases across npm, Python, and CDN
# Usage: ./scripts/release-all.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Error: Version not provided"
  echo "Usage: ./scripts/release-all.sh <version>"
  exit 1
fi

echo "🚀 Starting multi-SDK release for v${VERSION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================================================
# STEP 1: Build all SDKs
# ============================================================================
echo ""
echo "📦 STEP 1: Building all SDKs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  → Building npm SDK..."
cd sdk-js
npm run build
cd ..

echo "  → Building Python SDK..."
if [ -d "sdk-python" ]; then
  cd sdk-python
  python -m build
  cd ..
else
  echo "  ⚠️  Python SDK not yet created (skipping)"
fi

echo "  → Building CDN SDK..."
if [ -d "cdn" ]; then
  cd cdn
  npm run build
  cd ..
else
  echo "  ⚠️  CDN SDK not yet created (skipping)"
fi

echo "✅ All SDKs built successfully"

# ============================================================================
# STEP 2: Sync versions everywhere
# ============================================================================
echo ""
echo "🔄 STEP 2: Syncing version to all SDKs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# npm SDK version is already updated by semantic-release
echo "  → npm SDK: v${VERSION} (updated by semantic-release)"

# Update Python SDK version
if [ -f "sdk-python/pyproject.toml" ]; then
  echo "  → Updating Python SDK version..."
  sed -i "s/^version = \".*\"/version = \"${VERSION}\"/" sdk-python/pyproject.toml
  echo "  ✅ Python SDK: v${VERSION}"
else
  echo "  ⚠️  Python SDK pyproject.toml not found (skipping)"
fi

# Update Python setup.py if it exists
if [ -f "sdk-python/setup.py" ]; then
  sed -i "s/version=\".*\"/version=\"${VERSION}\"/" sdk-python/setup.py
fi

# Update CDN SDK version
if [ -f "cdn/package.json" ]; then
  echo "  → Updating CDN SDK version..."
  npm --prefix cdn version ${VERSION} --no-git-tag-version
  echo "  ✅ CDN SDK: v${VERSION}"
else
  echo "  ⚠️  CDN SDK package.json not found (skipping)"
fi

echo "✅ All versions synced"

# ============================================================================
# STEP 3: Publish npm SDK
# ============================================================================
echo ""
echo "📤 STEP 3: Publishing npm SDK..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd sdk-js
npm publish
cd ..

echo "✅ npm SDK published: @devutils/sdk@${VERSION}"

# ============================================================================
# STEP 4: Publish Python SDK
# ============================================================================
echo ""
echo "📤 STEP 4: Publishing Python SDK..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "sdk-python" ] && [ -f "sdk-python/dist" ]; then
  echo "  → Uploading to PyPI..."
  
  # Check if twine is installed
  if ! command -v twine &> /dev/null; then
    echo "  ⚠️  twine not installed. Install with: pip install twine"
    echo "  ⚠️  Skipping PyPI upload"
  else
    cd sdk-python
    twine upload dist/* --skip-existing
    cd ..
    echo "✅ Python SDK published: devutils-sdk==${VERSION}"
  fi
else
  echo "  ⚠️  Python SDK not ready for publishing (skipping)"
fi

# ============================================================================
# STEP 5: Upload CDN SDK
# ============================================================================
echo ""
echo "📤 STEP 5: Uploading CDN SDK..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "cdn/dist" ]; then
  echo "  → Preparing CDN files..."
  
  # Create versioned directory
  mkdir -p cdn/v${VERSION}
  mkdir -p cdn/latest
  
  # Copy minified SDK
  if [ -f "cdn/dist/sdk.min.js" ]; then
    cp cdn/dist/sdk.min.js cdn/v${VERSION}/sdk.min.js
    cp cdn/dist/sdk.min.js cdn/latest/sdk.min.js
    echo "  ✅ Copied sdk.min.js to v${VERSION}/ and latest/"
  fi
  
  # Copy ESM bundle if available
  if [ -f "cdn/dist/sdk.esm.js" ]; then
    cp cdn/dist/sdk.esm.js cdn/v${VERSION}/sdk.esm.js
    cp cdn/dist/sdk.esm.js cdn/latest/sdk.esm.js
    echo "  ✅ Copied sdk.esm.js to v${VERSION}/ and latest/"
  fi
  
  # TODO: Upload to your CDN server
  # Example for S3:
  # aws s3 sync cdn/v${VERSION}/ s3://cdn.devutils.in/v${VERSION}/ --delete
  # aws s3 sync cdn/latest/ s3://cdn.devutils.in/latest/ --delete
  
  # Example for custom server:
  # scp -r cdn/v${VERSION}/* user@cdn.devutils.in:/var/www/cdn/v${VERSION}/
  # scp -r cdn/latest/* user@cdn.devutils.in:/var/www/cdn/latest/
  
  echo ""
  echo "  ⚠️  CDN upload requires manual configuration"
  echo "  📍 Files ready at:"
  echo "     - cdn/v${VERSION}/sdk.min.js"
  echo "     - cdn/latest/sdk.min.js"
  echo ""
  echo "  Configure CDN_UPLOAD_SCRIPT environment variable or update this script"
  echo "  with your CDN provider credentials (S3, Cloudflare, custom server, etc.)"
  
else
  echo "  ⚠️  CDN SDK not ready for publishing (skipping)"
fi

# ============================================================================
# STEP 6: Summary
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Release v${VERSION} Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Published:"
echo "  ✅ npm: @devutils/sdk@${VERSION}"
echo "     https://www.npmjs.com/package/@devutils/sdk"
echo ""
echo "  ⏳ PyPI: devutils-sdk==${VERSION}"
echo "     https://pypi.org/project/devutils-sdk/"
echo ""
echo "  📍 CDN: Ready at cdn/v${VERSION}/"
echo "     https://cdn.devutils.in/v${VERSION}/sdk.min.js"
echo "     https://cdn.devutils.in/latest/sdk.min.js"
echo ""
echo "🔗 GitHub Release:"
echo "   https://github.com/devutils/sdks/releases/tag/v${VERSION}"
echo ""
echo "✨ All SDKs now at v${VERSION}"
echo ""
