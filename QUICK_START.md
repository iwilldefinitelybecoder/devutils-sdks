# Quick Start Guide - DevUtils SDKs

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Build All SDKs

```bash
npm run build:all
```

### 3. Run Tests

```bash
npm run test:all
```

### 4. Lint & Format

```bash
npm run lint
npm run format
```

---

## 📁 Project Structure

```
devutils_sdk/
├── sdk-js/              # JavaScript SDK (@devutils/sdk)
├── cdn/                 # CDN SDK (devutils-sdk-cdn)
├── sdk-python/          # Python SDK (devutils-sdk)
├── scripts/             # Build & release scripts
├── docs/                # Documentation
└── .github/workflows/   # CI/CD pipelines
```

---

## 🔧 Common Commands

| Command               | Purpose                  |
| --------------------- | ------------------------ |
| `npm install`         | Install all dependencies |
| `npm run build:all`   | Build all SDKs           |
| `npm run test:all`    | Run all tests            |
| `npm run lint`        | Check code quality       |
| `npm run format`      | Auto-format code         |
| `npm run release:dry` | Preview release          |
| `npm run release`     | Publish all SDKs         |

---

## 📚 Documentation

| Document                         | Purpose               |
| -------------------------------- | --------------------- |
| `CONTRIBUTING.md`                | Development standards |
| `RELEASE_CHECKLIST.md`           | Release procedures    |
| `NPM_PUBLISHING_FIX.md`          | npm E403 error fix    |
| `CONFIGURATION_FIXES_SUMMARY.md` | All fixes detailed    |
| `FIXES_COMPLETE.md`              | Executive summary     |

---

## 🐛 Troubleshooting

### Tests Failing?

```bash
npm run test:all -- --verbose
```

### Build Errors?

```bash
npm run build:all -- --verbose
```

### npm Publishing Issues?

See `NPM_PUBLISHING_FIX.md`

### Configuration Questions?

See `CONTRIBUTING.md`

---

## 🔑 Key Files

| File             | Purpose                  |
| ---------------- | ------------------------ |
| `tsconfig.json`  | TypeScript configuration |
| `jest.config.js` | Test configuration       |
| `.eslintrc.json` | Code quality rules       |
| `.prettierrc`    | Code formatting          |
| `.npmrc`         | npm settings             |
| `.releaserc`     | Release automation       |

---

## 📦 SDKs Overview

### JavaScript SDK (@devutils/sdk)

- **Location**: `sdk-js/`
- **Registry**: npm
- **Build**: `npm run build --workspace=sdk-js`
- **Test**: `npm run test:js`

### CDN SDK (devutils-sdk-cdn)

- **Location**: `cdn/`
- **Registry**: npm (browser-ready)
- **Build**: `npm run build --workspace=cdn`
- **Test**: `npm run test:cdn`

### Python SDK (devutils-sdk)

- **Location**: `sdk-python/`
- **Registry**: PyPI
- **Build**: `cd sdk-python && python -m build`
- **Test**: `npm run test:python`

---

## 🚀 Release Process

1. **Make changes** and commit with conventional commits
2. **Push to main** branch
3. **GitHub Actions** automatically:
   - Builds all SDKs
   - Runs all tests
   - Publishes to npm, PyPI, and CDN
   - Creates GitHub release

**Note**: Requires npm token configured (see `NPM_PUBLISHING_FIX.md`)

---

## ✅ Pre-Release Checklist

- [ ] All tests passing: `npm run test:all`
- [ ] Code formatted: `npm run format`
- [ ] No linting errors: `npm run lint`
- [ ] npm token configured
- [ ] PyPI token configured
- [ ] On main branch

---

## 🔗 Useful Links

- **npm Package**: https://www.npmjs.com/package/@devutils/sdk
- **PyPI Package**: https://pypi.org/project/devutils-sdk/
- **GitHub Repo**: https://github.com/iwilldefinitelybecoder/devutils-sdks
- **Documentation**: https://docs.devutils.in

---

## 💡 Tips

- Use `npm run release:dry` to preview releases
- Check `CONTRIBUTING.md` for code standards
- Review `RELEASE_CHECKLIST.md` before releasing
- Keep dependencies updated via Dependabot

---

## ❓ Need Help?

1. Check relevant documentation file
2. Review GitHub issues
3. Contact: support@devutils.in

---

**Last Updated**: April 18, 2026
