# Getting Started with DevUtils SDKs

Choose your SDK and get started in minutes.

## Installation

### JavaScript

```bash
npm install @devutils/sdk
```

### Python

```bash
pip install devutils-sdk
```

### CDN (Browser)

```html
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
```

## Authentication

Get your API key from [devutils.in/dashboard/api-keys](https://devutils.in/dashboard/api-keys)

### JavaScript

```typescript
import { DevUtilsSDK } from "@devutils/sdk";

const sdk = new DevUtilsSDK("your-api-key");
```

### Python

```python
from devutils_sdk import DevUtilsSDK

sdk = DevUtilsSDK(api_key="your-api-key")
```

### CDN

```javascript
const sdk = new DevUtilsSDK("your-api-key");
```

## Basic Usage

### Screenshot

**JavaScript:**

```typescript
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png",
  width: 1280,
  height: 720,
});
console.log(result.url); // Ready to use!
```

**Python:**

```python
result = await sdk.screenshot(
    ScreenshotOptions(
        url="https://example.com",
        format="png",
        width=1280,
        height=720
    )
)
print(result.image_url)
```

### PDF

**JavaScript:**

```typescript
const result = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
  printBackground: true,
});
console.log(result.url);
```

**Python:**

```python
result = await sdk.pdf(
    PDFOptions(
        url="https://example.com",
        format="A4",
        print_background=True
    )
)
print(result.pdf_url)
```

### Reader

**JavaScript:**

```typescript
const result = await sdk.reader("https://example.com");
console.log(result.title);
console.log(result.content);
```

**Python:**

```python
result = await sdk.reader("https://example.com")
print(result.title)
print(result.content)
```

## Error Handling

### JavaScript

```typescript
try {
  const result = await sdk.screenshot({ url: "https://example.com" });
} catch (error) {
  console.error("Error:", error.code, error.message);
  if (error.isRetryable()) {
    console.log("Can retry");
  }
}
```

### Python

```python
from devutils_sdk import DevUtilsError

try:
    result = await sdk.screenshot(options)
except DevUtilsError as e:
    print(f"Error: {e.code} - {e.message}")
    if e.is_retryable():
        print("Can retry")
```

## Configuration

### JavaScript

```typescript
const sdk = new DevUtilsSDK("api-key", {
  baseUrl: "https://api.devutils.in",
  timeout: 30000,
});
```

### Python

```python
from devutils_sdk.core.http_client import HttpClientConfig

config = HttpClientConfig(
    api_key="your-api-key",
    base_url="https://api.devutils.in",
    timeout=30000
)
sdk = DevUtilsSDK(api_key="your-api-key", config=config)
```

## Next Steps

- [API Reference](./API_REFERENCE.md)
- [Examples](./EXAMPLES.md)
- [Webhooks](./WEBHOOKS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
