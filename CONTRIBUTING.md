# Contributing to DevUtils SDKs

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/iwilldefinitelybecoder/devutils-sdks.git
cd devutils-sdks

# Install dependencies
npm install
cd sdk-python && pip install -e ".[dev]"
cd ..

# Build all SDKs
npm run build:all

# Run tests
npm run test:all
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the existing code style
- Add tests for new features
- Update documentation

### 3. Commit with Conventional Commits

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
git commit -m "test: add test coverage"
git commit -m "refactor: improve code structure"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a PR on GitHub.

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

### Scopes

- `sdk-js`: JavaScript SDK
- `sdk-python`: Python SDK
- `cdn`: CDN SDK
- `core`: Shared core logic
- `release`: Release process

### Examples

```bash
git commit -m "feat(sdk-js): add retry configuration options"
git commit -m "fix(sdk-python): handle async context properly"
git commit -m "docs(core): update API reference"
git commit -m "test(cdn): add browser compatibility tests"
```

## Code Style

### JavaScript/TypeScript

- Use ESLint configuration
- Format with Prettier
- 2-space indentation
- Semicolons required

```bash
npm run lint
npm run format
```

### Python

- Follow PEP 8
- Use Black for formatting
- Use isort for imports

```bash
cd sdk-python
black devutils_sdk tests
isort devutils_sdk tests
```

## Testing

### JavaScript

```bash
npm run test:js
npm run test:js -- --watch
npm run test:js -- --coverage
```

### Python

```bash
cd sdk-python
pytest
pytest --cov=devutils_sdk
```

### All SDKs

```bash
npm run test:all
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc/docstrings for new functions
- Update docs/ folder for significant changes
- Include examples for new features

## Pull Request Process

1. **Update documentation** - Ensure docs reflect your changes
2. **Add tests** - New features must have tests
3. **Run tests** - All tests must pass
4. **Update CHANGELOG** - Add entry under "Unreleased"
5. **Request review** - At least one approval required
6. **Squash commits** - Keep history clean (optional)

## Release Process

Releases are automated via semantic versioning. Maintainers will:

1. Review and merge PRs
2. Semantic-release automatically creates releases
3. Versions are bumped based on commit types
4. Packages are published to npm, PyPI, and CDN

See [Release Guide](./docs/RELEASE_GUIDE.md) for details.

## Reporting Issues

### Bug Reports

Include:

- SDK and version
- Reproduction steps
- Expected vs actual behavior
- Environment details

### Feature Requests

Include:

- Use case
- Proposed API
- Examples

## Questions?

- Check [docs.devutils.in](https://docs.devutils.in)
- Open a discussion on GitHub
- Email support@devutils.in

---

Thank you for contributing! 🙏
