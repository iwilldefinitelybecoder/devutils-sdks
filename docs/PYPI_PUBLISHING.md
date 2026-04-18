# PyPI Publishing Guide

Complete guide to publishing the Python SDK to PyPI.

## Overview

PyPI (Python Package Index) is the official repository for Python packages. Publishing is automated via GitHub Actions.

## Prerequisites

### 1. Create PyPI Account

**Option A: PyPI.org (Recommended)**

1. Go to https://pypi.org/account/register/
2. Create account with email
3. Verify email
4. Enable 2FA (Settings → Two-factor authentication)

**Option B: Test PyPI (for testing)**

1. Go to https://test.pypi.org/account/register/
2. Create separate account
3. Use for testing before production

### 2. Create API Token

**For Production (PyPI):**

1. Go to https://pypi.org/manage/account/tokens/
2. Click "Add API token"
3. Name: `GitHub Actions`
4. Scope: "Entire account" (or specific project)
5. Copy token (starts with `pypi-`)

**For Testing (Test PyPI):**

1. Go to https://test.pypi.org/manage/account/tokens/
2. Same process as above

### 3. Add GitHub Secret

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `PYPI_API_TOKEN`
4. Value: Paste your PyPI token
5. Click "Add secret"

## Package Configuration

### pyproject.toml

Already configured with:

```toml
[project]
name = "devutils-sdk"
version = "1.0.0"
description = "Production-grade SDK for DevUtils API"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [{name = "DevUtils", email = "support@devutils.in"}]
```

### setup.py

Already configured for backward compatibility:

```python
from setuptools import setup, find_packages

setup(
    name="devutils-sdk",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
        "pydantic>=2.0.0",
        "python-dotenv>=0.21.0",
    ],
)
```

## Automated Publishing

### How It Works

1. **Commit with conventional message**

   ```bash
   git commit -m "feat: add new feature"
   ```

2. **Push to main**

   ```bash
   git push origin main
   ```

3. **GitHub Actions triggers**
   - Analyzes commits
   - Determines version bump
   - Builds Python package
   - Publishes to PyPI
   - Creates GitHub release

### Release Workflow

The `.github/workflows/release.yml` handles:

```yaml
- name: Publish Python SDK
  working-directory: devutils_sdk
  env:
    PYPI_API_TOKEN: ${{ secrets.PYPI_API_TOKEN }}
  run: |
    cd sdk-python
    python -m build
    twine upload dist/* --skip-existing
```

## Manual Publishing (if needed)

### Build Package

```bash
cd devutils_sdk/sdk-python

# Install build tools
pip install build twine

# Build distribution
python -m build

# Creates:
# - dist/devutils-sdk-1.0.0.tar.gz (source)
# - dist/devutils_sdk-1.0.0-py3-none-any.whl (wheel)
```

### Publish to PyPI

```bash
# Using token
twine upload dist/* \
  --username __token__ \
  --password pypi-YOUR_TOKEN_HERE

# Or using environment variable
export TWINE_PASSWORD=pypi-YOUR_TOKEN_HERE
twine upload dist/*
```

### Publish to Test PyPI

```bash
twine upload dist/* \
  --repository testpypi \
  --username __token__ \
  --password pypi-YOUR_TEST_TOKEN_HERE
```

## Verification

### Check Package on PyPI

1. Go to https://pypi.org/project/devutils-sdk/
2. Verify:
   - Version number
   - Description
   - README renders correctly
   - Files available

### Install from PyPI

```bash
# Install latest
pip install devutils-sdk

# Install specific version
pip install devutils-sdk==1.0.0

# Verify installation
python -c "from devutils_sdk import DevUtilsSDK; print('✓ Installed')"
```

### Test Installation

```bash
# Create virtual environment
python -m venv test_env
source test_env/bin/activate  # On Windows: test_env\Scripts\activate

# Install from PyPI
pip install devutils-sdk

# Test import
python -c "from devutils_sdk import DevUtilsSDK; print('Success!')"

# Deactivate
deactivate
```

## Troubleshooting

### "Invalid distribution"

**Cause**: Package metadata is invalid

**Solution**:

```bash
# Validate package
twine check dist/*

# Fix issues in pyproject.toml or setup.py
```

### "File already exists"

**Cause**: Version already published

**Solution**:

```bash
# Use --skip-existing flag
twine upload dist/* --skip-existing

# Or bump version in pyproject.toml
```

### "401 Unauthorized"

**Cause**: Invalid or expired token

**Solution**:

1. Generate new token on PyPI
2. Update GitHub secret
3. Retry upload

### "403 Forbidden"

**Cause**: Token doesn't have permission

**Solution**:

1. Check token scope (should be "Entire account")
2. Generate new token with correct permissions
3. Update GitHub secret

### Package not installing

**Cause**: Dependencies not specified

**Solution**:

```toml
# In pyproject.toml
dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
    "python-dotenv>=0.21.0",
]
```

## Best Practices

### 1. Test Before Publishing

```bash
# Test on Test PyPI first
twine upload dist/* --repository testpypi

# Install from Test PyPI
pip install -i https://test.pypi.org/simple/ devutils-sdk

# Verify it works
python -c "from devutils_sdk import DevUtilsSDK; print('✓')"
```

### 2. Use Semantic Versioning

```
1.0.0 = MAJOR.MINOR.PATCH

- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
```

### 3. Update CHANGELOG

Before each release:

```markdown
## [1.1.0] - 2024-04-18

### Added

- New feature X
- New feature Y

### Fixed

- Bug fix A
- Bug fix B
```

### 4. Document Changes

Include in commit message:

```bash
git commit -m "feat: add new feature

- Feature description
- Breaking changes (if any)
- Migration guide (if needed)"
```

### 5. Tag Releases

```bash
# Create git tag
git tag v1.0.0

# Push tag
git push origin v1.0.0
```

## Package Metadata

### README

Automatically included from `sdk-python/README.md`:

```markdown
# DevUtils SDK

Production-grade SDK for DevUtils API.

## Installation

pip install devutils-sdk

## Usage

from devutils_sdk import DevUtilsSDK

sdk = DevUtilsSDK(api_key="your-key")
```

### Keywords

In `pyproject.toml`:

```toml
keywords = ["devutils", "screenshot", "pdf", "reader", "api", "sdk"]
```

### Classifiers

```toml
classifiers = [
    "Development Status :: 5 - Production/Stable",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
```

## Release Checklist

Before publishing:

- [ ] All tests pass (`pytest`)
- [ ] Code is linted (`black`, `isort`, `flake8`)
- [ ] Version bumped in `pyproject.toml`
- [ ] Version bumped in `setup.py`
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] Commit message is conventional
- [ ] No uncommitted changes
- [ ] GitHub secret is configured

## Automation

### Semantic Release

The `.releaserc` config automatically:

1. Analyzes commits
2. Bumps version
3. Updates CHANGELOG
4. Publishes to PyPI
5. Creates GitHub release

### Example Flow

```bash
# Make changes
git commit -m "feat: add retry configuration"

# Push to main
git push origin main

# GitHub Actions:
# 1. Detects "feat:" commit
# 2. Bumps MINOR version (1.0.0 → 1.1.0)
# 3. Updates pyproject.toml
# 4. Builds package
# 5. Publishes to PyPI
# 6. Creates GitHub release v1.1.0
```

## Support

- **PyPI Help**: https://pypi.org/help/
- **Twine Docs**: https://twine.readthedocs.io/
- **setuptools**: https://setuptools.pypa.io/
- **Python Packaging**: https://packaging.python.org/

## Next Steps

1. Create PyPI account
2. Generate API token
3. Add GitHub secret `PYPI_API_TOKEN`
4. Make a commit with conventional message
5. Push to main
6. Watch GitHub Actions publish to PyPI!

---

See [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) for complete release process.
