# DevUtils SDK - Python

Production-grade Python SDK for DevUtils API. Take screenshots, generate PDFs, read content, and more.

## Installation

```bash
pip install devutils-sdk
```

## Quick Start

```python
import asyncio
from devutils_sdk import DevUtilsSDK, ScreenshotOptions

async def main():
    sdk = DevUtilsSDK(api_key="your-api-key")

    # Take a screenshot
    result = await sdk.screenshot(
        ScreenshotOptions(
            url="https://example.com",
            format="png",
            width=1280,
            height=720
        )
    )

    print(f"Screenshot job: {result.job_id}")
    print(f"Status: {result.status}")

    sdk.close()

asyncio.run(main())
```

## Features

- 📸 **Screenshots** - Capture web pages as images
- 📄 **PDF Generation** - Convert web pages to PDF
- 📖 **Content Reader** - Extract and parse web content
- 🔄 **Async/Await** - Full async support
- ⚡ **Retry Logic** - Automatic retry with exponential backoff
- 🔐 **Type Safe** - Full type hints and validation
- 📦 **Lightweight** - Minimal dependencies

## API Reference

### Screenshot

```python
from devutils_sdk import ScreenshotOptions

result = await sdk.screenshot(
    ScreenshotOptions(
        url="https://example.com",
        format="png",  # png, jpeg, webp
        width=1280,
        height=720,
        full_page=False,
        wait_until="networkidle",
        timeout=30000
    )
)
```

### PDF

```python
from devutils_sdk import PDFOptions

result = await sdk.pdf(
    PDFOptions(
        url="https://example.com",
        format="A4",
        margin_top="1cm",
        margin_right="1cm",
        margin_bottom="1cm",
        margin_left="1cm",
        print_background=True,
        landscape=False
    )
)
```

### Reader

```python
result = await sdk.reader("https://example.com")
print(result.title)
print(result.content)
```

## Error Handling

```python
from devutils_sdk import DevUtilsError

try:
    result = await sdk.screenshot(options)
except DevUtilsError as e:
    print(f"Error: {e.code} - {e.message}")
    if e.is_retryable():
        print("This error can be retried")
```

## Configuration

```python
from devutils_sdk import DevUtilsSDK, HttpClientConfig

config = HttpClientConfig(
    base_url="https://api.devutils.in",
    timeout=30,
    max_retries=3,
    api_key="your-api-key"
)

sdk = DevUtilsSDK(api_key="your-api-key", config=config)
```

## Requirements

- Python 3.8+
- requests >= 2.28.0
- pydantic >= 2.0.0

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=devutils_sdk

# Format code
black devutils_sdk

# Lint
flake8 devutils_sdk

# Type check
mypy devutils_sdk
```

## License

MIT

## Support

- Documentation: https://docs.devutils.in
- Issues: https://github.com/devutils/sdk-python/issues
- Email: support@devutils.in
