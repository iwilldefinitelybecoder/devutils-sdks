# Contributing to DevUtils SDKs

Thank you for contributing to the DevUtils SDKs monorepo! This document outlines our development standards and configuration guidelines.

## Project Structure

```
devutils_sdk/
├── sdk-js/              # JavaScript/TypeScript SDK (npm)
├── cdn/                 # CDN-optimized browser SDK
├── sdk-python/          # Python SDK (PyPI)
├── scripts/             # Release and build scripts
└── docs/                # Documentation
```

## Configuration Standards

### TypeScript Configuration

- **Root `tsconfig.json`**: Base configuration for all packages
- **Package-specific `tsconfig.json`**: Extends root config with package-specific settings
- **Key settings**:
  - `target: ES2020` - Modern JavaScript target
  - `strict: true` - Strict type checking enabled
  - `declaration: true` - Generate .d.ts files
  - `sourceMap: true` - Enable source maps for debugging

### Jest Configuration

- **Root `jest.config.js`**: Multi-project configuration
- **Coverage threshold**: 70% for all metrics (branches, functions, lines, statements)
- **Test environments**:
  - `sdk-js`: `node` (server-side SDK)
  - `cdn`: `jsdom` (browser SDK)

### ESLint & Prettier

- **Root `.eslintrc.json`**: Shared ESLint rules for all packages
- **Root `.prettierrc`**: Consistent code formatting
- **Ignore files**: `.eslintignore` and `.prettierignore` prevent linting build artifacts

### npm Configuration

- **`.npmrc`**: Monorepo-wide npm settings
  - `save-exact=true`: Pin exact versions
  - `require-lock=true`: Enforce lockfile usage
  - `legacy-peer-deps=true`: Handle peer dependency conflicts
  - `audit-level=moderate`: Security audit threshold

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Build all SDKs
npm run build:all

# Run all tests
npm run test:all

# Lint and format
npm run lint
npm run format
```

### Making Changes

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style
3. **Run tests locally**: `npm run test:all`
4. **Lint and format**: `npm run lint && npm run format`
5. **Commit with conventional commits**: `feat:`, `fix:`, `docs:`, etc.
6. **Push and create a pull request**

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples**:

- `feat(sdk-js): add retry mechanism`
- `fix(cdn): resolve bundle size issue`
- `docs: update API documentation`

## Version Management

- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Automated releases**: semantic-release handles version bumping
- **All SDKs sync**: Python, JavaScript, and CDN versions stay synchronized

## Publishing

### npm (JavaScript SDK)

```bash
npm run release
```

Publishes to npm registry as `@devutils/sdk`

### PyPI (Python SDK)

Automatically published via `release-all.sh` script using twine

### CDN (Browser SDK)

Files prepared at `cdn/v{version}/` and `cdn/latest/`

## Configuration Files Reference

| File                            | Purpose                 | Scope           |
| ------------------------------- | ----------------------- | --------------- |
| `tsconfig.json`                 | TypeScript compilation  | Root + packages |
| `jest.config.js`                | Test configuration      | Root + packages |
| `.eslintrc.json`                | Linting rules           | Root + packages |
| `.prettierrc`                   | Code formatting         | Root + packages |
| `.npmrc`                        | npm settings            | Root            |
| `.releaserc`                    | semantic-release config | Root            |
| `.github/workflows/release.yml` | CI/CD pipeline          | Root            |

## Troubleshooting

### TypeScript Errors

- Ensure `tsconfig.json` is valid: `npx tsc --noEmit`
- Check for duplicate compiler options across configs

### Jest Failures

- Run with verbose output: `npm run test:all -- --verbose`
- Check coverage thresholds: `npm run test:all -- --coverage`

### npm Publishing Issues

- Verify npm token: `npm whoami`
- Check 2FA settings on npm account
- Ensure all versions are synchronized

### Python SDK Issues

- Verify Python version: `python --version` (requires 3.8+)
- Check PyPI token configuration
- Validate `pyproject.toml` syntax

## Questions?

Open an issue or contact the maintainers at support@devutils.in
