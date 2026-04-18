#!/bin/bash
# DevUtils Multi-SDK Release Script
# Called by semantic-release after it has already bumped sdk-js/package.json
# Usage: ./scripts/release-all.sh <version>

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "❌ Version not provided"
  echo "Usage: ./scripts/release-all.sh <version>"
  exit 1
fi

echo ""
echo "🚀 Multi-SDK release — v${VERSION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Sync versions ──────────────────────────────────────────────────────────
echo ""
echo "🔄 Syncing versions to v${VERSION}..."

# Python — pyproject.toml is the single source of truth
sed -i "s/^version = \".*\"/version = \"${VERSION}\"/" sdk-python/pyproject.toml
echo "  ✅ sdk-python/pyproject.toml → ${VERSION}"

# CDN package.json (npm version handles the JSON correctly)
npm --prefix cdn version "${VERSION}" --no-git-tag-version --allow-same-version
echo "  ✅ cdn/package.json → ${VERSION}"

# ── 2. Publish Python SDK to PyPI ─────────────────────────────────────────────
echo ""
echo "📤 Publishing Python SDK to PyPI..."

if [ -z "$PYPI_API_TOKEN" ]; then
  echo "❌ PYPI_API_TOKEN is not set — cannot publish to PyPI"
  exit 1
fi

cd sdk-python

# Clean any stale build artefacts
rm -rf build dist *.egg-info

# Build wheel + sdist
python -m build

# Verify something was produced
if [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "❌ python -m build produced no files in dist/"
  exit 1
fi

# Write .pypirc — username must be __token__ when using an API token
cat > ~/.pypirc << PYPIRC
[distutils]
index-servers = pypi

[pypi]
repository = https://upload.pypi.org/legacy/
username = __token__
password = ${PYPI_API_TOKEN}
PYPIRC
chmod 600 ~/.pypirc

twine upload dist/* --skip-existing --non-interactive
echo "✅ devutils-sdk==${VERSION} published to PyPI"

cd ..

# ── 3. CDN — Cloudflare Pages deploy is handled by the workflow step ──────────
# (The workflow runs wrangler pages deploy after this script exits.)
# We just make sure the CDN was built and the dist files exist.
echo ""
echo "📦 Verifying CDN build artefacts..."

if [ ! -f "cdn/dist/sdk.min.js" ] || [ ! -f "cdn/dist/sdk.esm.js" ]; then
  echo "❌ CDN dist files missing — run 'npm run build:cdn' first"
  exit 1
fi
echo "  ✅ cdn/dist/sdk.min.js"
echo "  ✅ cdn/dist/sdk.esm.js"

# ── 4. Summary ────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Release script complete — v${VERSION}"
echo ""
echo "  ✅ npm:  @devutils/sdk@${VERSION}  (published by semantic-release)"
echo "  ✅ PyPI: devutils-sdk==${VERSION}"
echo "  ⏳ CDN:  deploying via Cloudflare Pages step in workflow..."
echo ""
