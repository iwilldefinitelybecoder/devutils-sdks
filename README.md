# DevUtils SDKs

Production-grade SDKs for the DevUtils API. Take screenshots, generate PDFs, extract content, and more.

[![npm version](https://img.shields.io/npm/v/@devutils/sdk.svg)](https://www.npmjs.com/package/@devutils/sdk)
[![PyPI version](https://img.shields.io/pypi/v/devutils-sdk.svg)](https://pypi.org/project/devutils-sdk/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Available SDKs

| SDK            | Package            | Status        |
| -------------- | ------------------ | ------------- |
| **JavaScript** | `@devutils/sdk`    | ✅ Production |
| **Python**     | `devutils-sdk`     | ✅ Production |
| **CDN**        | `devutils-sdk-cdn` | ✅ Production |

## 🚀 Quick Start

### JavaScript

```bash
npm install @devutils/sdk
```

```typescript
import { DevUtilsSDK } from '@devutils/sdk';

const sdk = new DevUtilsSDK('your-api-key');
const result = await sdk.screenshot('https://example.com');
console.log(result.url);
```

### Python

```bash
pip install devutils-sdk
```

```python
import asyncio
from devutils_sdk import DevUtilsSDK

async def main():
    sdk = DevUtilsSDK(api_key="your-api-key")
    result = await sdk.screenshot(url="https://example.com")
    print(result.image_url)

asyncio.run(main())
```

### CDN (Browser)

```html
<script src="https://cdn.js.deliver.devutils.in/sdk.min.js"></script>
<script>
  const sdk = new DevUtilsSDK('your-api-key');
  sdk.screenshot({ url: 'https://example.com' }).then((result) => console.log(result.url));
</script>
```

## 📚 Documentation

- [Getting Started](./docs/GETTING_STARTED.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Examples](./docs/EXAMPLES.md)
- [Contributing](./CONTRIBUTING.md)

## 🔑 API Key

Get your API key from [devutils.in/dashboard/api-keys](https://devutils.in/dashboard/api-keys)

## 🛠️ Features

- **Screenshot** - Capture website screenshots in multiple formats
- **PDF** - Generate PDFs from URLs or HTML
- **Reader** - Extract and parse webpage content
- **File Upload** - Upload files to CDN
- **Webhooks** - Real-time event streaming via SSE
- **Connectors** - Manage integrations
- **Retry Logic** - Automatic exponential backoff
- **Job Polling** - Transparent async job handling
- **Error Handling** - Comprehensive error classification

## 🏗️ Monorepo Structure

```
devutils-sdks/
├── sdk-js/              # JavaScript SDK (@devutils/sdk)
├── sdk-python/          # Python SDK (devutils-sdk)
├── cdn/                 # CDN SDK (devutils-sdk-cdn)
├── sdk/                 # Shared core logic
├── scripts/             # Release and build scripts
├── docs/                # Documentation
├── .github/workflows/   # CI/CD pipelines
└── package.json         # Monorepo root
```

## 🔄 Development

### Setup

```bash
# Install dependencies
npm install
cd sdk-python && pip install -e ".[dev]"

# Build all SDKs
npm run build:all

# Run tests
npm run test:all
```

### Release

Releases are automated via semantic versioning. Push to `main` or `beta` branch with conventional commits:

```bash
git commit -m "feat: add new feature"  # Creates minor version bump
git commit -m "fix: bug fix"           # Creates patch version bump
git commit -m "feat!: breaking change" # Creates major version bump
```

See [Release Guide](./docs/RELEASE_GUIDE.md) for details.

## 📋 Supported Platforms

### JavaScript

- Node.js 16+
- Modern browsers (ES2020+)

### Python

- Python 3.8+

### CDN

- All modern browsers
- IE 11+ (with polyfills)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.devutils.in](https://docs.devutils.in)
- **Issues**: [GitHub Issues](https://github.com/iwilldefinitelybecoder/devutils-sdks/issues)
- **Email**: support@devutils.in

## 🎯 Roadmap

- [ ] Go SDK
- [ ] Rust SDK
- [ ] GraphQL support
- [ ] WebSocket support
- [ ] Rate limiting utilities
- [ ] Caching layer

---

**Made with ❤️ by DevUtils**
