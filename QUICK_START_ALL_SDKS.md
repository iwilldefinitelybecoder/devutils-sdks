# Quick Start - All SDKs

Get started with any of the three DevUtils SDKs in minutes.

---

## 🚀 JavaScript SDK

### Install

```bash
npm install @devutils/sdk
```

### Use

```typescript
import { DevUtilsSDK, ScreenshotOptions } from "@devutils/sdk";

const sdk = new DevUtilsSDK("your-api-key");

// Take a screenshot
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png",
  width: 1280,
  height: 720,
});

console.log("Job ID:", result.jobId);
console.log("Status:", result.status);
```

### More Examples

```typescript
// Generate PDF
const pdf = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
  printBackground: true,
});

// Read content
const content = await sdk.reader("https://example.com");
console.log(content.title);
console.log(content.content);

// Get job status
const status = await sdk.getScreenshotStatus(jobId);
```

---

## 🐍 Python SDK

### Install

```bash
pip install devutils-sdk
```

### Use

```python
import asyncio
from devutils_sdk import DevUtilsSDK, ScreenshotOptions

async def main():
    sdk = DevUtilsSDK(api_key='your-api-key')

    # Take a screenshot
    result = await sdk.screenshot(
        ScreenshotOptions(
            url='https://example.com',
            format='png',
            width=1280,
            height=720
        )
    )

    print(f'Job ID: {result.job_id}')
    print(f'Status: {result.status}')

    sdk.close()

asyncio.run(main())
```

### More Examples

```python
# Generate PDF
pdf_result = await sdk.pdf(
    PDFOptions(
        url='https://example.com',
        format='A4',
        print_background=True
    )
)

# Read content
content = await sdk.reader('https://example.com')
print(content.title)
print(content.content)

# Get job status
status = await sdk.get_screenshot_status(job_id)
```

---

## 🌐 CDN SDK

### Install via CDN (Easiest)

```html
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
```

### Use

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
  </head>
  <body>
    <script>
      const sdk = new DevUtilsSDK("your-api-key");

      // Take a screenshot
      sdk
        .screenshot({
          url: "https://example.com",
          format: "png",
          width: 1280,
          height: 720,
        })
        .then((result) => {
          console.log("Job ID:", result.jobId);
          console.log("Status:", result.status);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    </script>
  </body>
</html>
```

### Install via npm

```bash
npm install devutils-sdk-cdn
```

### Use as Module

```javascript
import DevUtilsSDK from "devutils-sdk-cdn";

const sdk = new DevUtilsSDK("your-api-key");

// Take a screenshot
const result = await sdk.screenshot({
  url: "https://example.com",
});

console.log("Job ID:", result.jobId);
```

### More Examples

```javascript
// Generate PDF
const pdf = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
});

// Read content
const content = await sdk.reader("https://example.com");
console.log(content.title);

// Get job status
const status = await sdk.getScreenshotStatus(jobId);
```

---

## 🔑 API Key

Get your API key from: https://devutils.in/dashboard/api-keys

Set as environment variable:

```bash
export DEVUTILS_API_KEY="your-api-key"
```

Or pass directly:

```javascript
const sdk = new DevUtilsSDK("your-api-key");
```

---

## 📋 Common Operations

### Screenshot

```javascript
// JavaScript
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png", // png, jpeg, webp
  width: 1280,
  height: 720,
  fullPage: false,
  waitUntil: "networkidle",
  timeout: 30000,
});
```

```python
# Python
result = await sdk.screenshot(
    ScreenshotOptions(
        url='https://example.com',
        format='png',
        width=1280,
        height=720
    )
)
```

### PDF

```javascript
// JavaScript
const result = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
  marginTop: "1cm",
  marginRight: "1cm",
  marginBottom: "1cm",
  marginLeft: "1cm",
  printBackground: true,
  landscape: false,
});
```

```python
# Python
result = await sdk.pdf(
    PDFOptions(
        url='https://example.com',
        format='A4',
        print_background=True
    )
)
```

### Reader

```javascript
// JavaScript
const result = await sdk.reader("https://example.com");
console.log(result.title);
console.log(result.content);
```

```python
# Python
result = await sdk.reader('https://example.com')
print(result.title)
print(result.content)
```

---

## ⚠️ Error Handling

### JavaScript

```javascript
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
    print(f'Error: {e.code} - {e.message}')
    if e.is_retryable():
        print('Can retry')
```

---

## 🔄 Retry Logic

### JavaScript

```javascript
// Automatic retry with exponential backoff
const result = await DevUtilsSDK.retry(
  () => sdk.screenshot({ url: "https://example.com" }),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
);
```

### Python

```python
from devutils_sdk import retry, RetryConfig

result = await retry(
    lambda: sdk.screenshot(options),
    RetryConfig(
        max_attempts=3,
        initial_delay=1.0,
        max_delay=30.0,
        backoff_multiplier=2.0
    )
)
```

---

## 📚 Full Documentation

- **JavaScript**: `sdk-js/README.md`
- **Python**: `sdk-python/README.md`
- **CDN**: `cdn/README.md`

---

## 🆘 Support

- **Docs**: https://docs.devutils.in
- **Issues**: https://github.com/devutils/sdks/issues
- **Email**: support@devutils.in

---

**Ready to build?** Pick your SDK and start coding! 🚀
