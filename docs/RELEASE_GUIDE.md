# Release Guide

How releases work and how to manage them.

## Overview

DevUtils SDKs use **semantic versioning** with **automated releases** via GitHub Actions.

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features (backward compatible)
- **PATCH** (1.0.1): Bug fixes

## Release Process

### 1. Commit with Conventional Commits

Push commits to `main` or `beta` branch:

```bash
git commit -m "feat: add new feature"      # → MINOR bump
git commit -m "fix: resolve bug"           # → PATCH bump
git commit -m "feat!: breaking change"     # → MAJOR bump
git commit -m "docs: update README"        # → No version bump
```

### 2. Automatic Release

GitHub Actions automatically:

1. Analyzes commits
2. Determines version bump
3. Updates all SDKs
4. Publishes to npm, PyPI, CDN
5. Creates GitHub release
6. Sends notifications

### 3. Manual Release (if needed)

```bash
cd devutils_sdk

# Dry run
npm run release:dry

# Actual release
npm run release
```

## What Gets Released

### npm (@devutils/sdk)

- Published to [npmjs.com](https://www.npmjs.com/package/@devutils/sdk)
- Includes TypeScript types
- ESM and CommonJS builds

### PyPI (devutils-sdk)

- Published to [pypi.org](https://pypi.org/project/devutils-sdk/)
- Includes type hints
- Wheel and source distributions

### CDN (devutils-sdk-cdn)

- Uploaded to `https://cdn.devutils.in/`
- Versioned: `v1.0.0/sdk.min.js`
- Latest: `latest/sdk.min.js`

## Version Sync

All SDKs are versioned together:

```
@devutils/sdk@1.2.3
devutils-sdk==1.2.3
devutils-sdk-cdn@1.2.3
```

## Changelog

Automatically generated from commits. View at:

- [GitHub Releases](https://github.com/iwilldefinitelybecoder/devutils-sdks/releases)
- [CHANGELOG.md](../CHANGELOG.md)

## Pre-Release (Beta)

Push to `beta` branch for pre-releases:

```bash
git checkout -b beta
git commit -m "feat: experimental feature"
git push origin beta
```

Creates: `1.0.0-beta.1`, `1.0.0-beta.2`, etc.

## Rollback

If a release has issues:

1. Create a fix commit
2. Push to `main`
3. New patch release is created automatically

Example:

```bash
git commit -m "fix: revert problematic change"
git push origin main
# Creates v1.0.1
```

## GitHub Secrets Required

For automated releases, configure these secrets:

- `NPM_TOKEN` - npm publish token
- `PYPI_API_TOKEN` - PyPI API token
- `AWS_ACCESS_KEY_ID` - S3 access (optional)
- `AWS_SECRET_ACCESS_KEY` - S3 secret (optional)

See [GitHub Secrets Setup](./GITHUB_SECRETS.md)

## Troubleshooting

### Release Failed

Check GitHub Actions logs:

1. Go to [Actions](https://github.com/iwilldefinitelybecoder/devutils-sdks/actions)
2. Click failed workflow
3. View logs for errors

### Manual Publish

If automated release fails:

```bash
cd devutils_sdk

# npm
cd sdk-js
npm publish

# PyPI
cd ../sdk-python
twine upload dist/*

# CDN
# Upload cdn/dist/* to your CDN
```

### Version Mismatch

If versions get out of sync:

```bash
# Update manually
npm --prefix sdk-js version 1.2.3 --no-git-tag-version
npm --prefix cdn version 1.2.3 --no-git-tag-version
sed -i 's/version = ".*"/version = "1.2.3"/' sdk-python/pyproject.toml

# Commit
git add .
git commit -m "chore: sync versions to 1.2.3"
git push origin main
```

## Best Practices

1. **Use conventional commits** - Ensures correct version bumps
2. **Test before pushing** - Run `npm run test:all`
3. **Update docs** - Include examples for new features
4. **Add changelog entry** - Update CHANGELOG.md
5. **Review PRs** - At least one approval before merge
6. **Use beta branch** - For experimental features

## Release Checklist

Before pushing to main:

- [ ] All tests pass (`npm run test:all`)
- [ ] Code is linted (`npm run lint`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages are conventional
- [ ] PR reviewed and approved

## Support

- **Issues**: [GitHub Issues](https://github.com/iwilldefinitelybecoder/devutils-sdks/issues)
- **Docs**: [docs.devutils.in](https://docs.devutils.in)
- **Email**: support@devutils.in
