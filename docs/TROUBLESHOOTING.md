# Troubleshooting

Common issues and solutions.

## Authentication Issues

### "Invalid API Key"

**Error:** `401 Unauthorized`

**Solutions:**

1. Verify API key is correct
2. Check key hasn't expired
3. Ensure key has required permissions
4. Get new key from [devutils.in/dashboard/api-keys](https://devutils.in/dashboard/api-keys)

```typescript
// Verify key is set
console.log("API Key:", sdk.apiKey ? "✓ Set" : "✗ Missing");
```

### "API Key Not Found"

**Error:** `Missing API key`

**Solutions:**

1. Pass API key to constructor
2. Set environment variable: `DEVUTILS_API_KEY`
3. Use `sdk.setApiKey(key)` to update

```typescript
// Correct
const sdk = new DevUtilsSDK("your-api-key");

// Or from environment
const sdk = new DevUtilsSDK(process.env.DEVUTILS_API_KEY);
```

## Rate Limiting

### "Rate Limited"

**Error:** `429 Too Many Requests`

**Solutions:**

1. Reduce request frequency
2. Implement exponential backoff
3. Use batch processing with delays
4. Upgrade plan for higher limits

```typescript
// Implement backoff
async function withBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.isStatus(429) && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

## Timeout Issues

### "Request Timeout"

**Error:** `408 Request Timeout`

**Solutions:**

1. Increase timeout value
2. Check network connectivity
3. Try again (usually transient)
4. Check if URL is accessible

```typescript
// Increase timeout
const sdk = new DevUtilsSDK("api-key", {
  timeout: 60000, // 60 seconds
});

// Or per request
const result = await sdk.screenshot({
  url: "https://example.com",
  timeout: 60000,
});
```

## Screenshot Issues

### "Screenshot Failed"

**Error:** `Failed to capture screenshot`

**Solutions:**

1. Verify URL is accessible
2. Check if page loads properly
3. Try different viewport size
4. Disable ad blockers/cookie banners

```typescript
// Try with different options
const result = await sdk.screenshot({
  url: "https://example.com",
  waitUntil: "networkidle",
  timeout: 30000,
  fullPage: false, // Try without full page
});
```

### "Blank Screenshot"

**Causes:**

1. Page requires JavaScript
2. Content loads dynamically
3. Page is behind authentication

**Solutions:**

```typescript
// Wait for network to be idle
const result = await sdk.screenshot({
  url: "https://example.com",
  waitUntil: "networkidle",
});

// Or wait for DOM content
const result = await sdk.screenshot({
  url: "https://example.com",
  waitUntil: "domcontentloaded",
});
```

## PDF Issues

### "PDF Generation Failed"

**Error:** `Failed to generate PDF`

**Solutions:**

1. Verify URL is valid
2. Check HTML syntax if using HTML input
3. Try simpler page first
4. Check file size limits

```typescript
// Validate HTML
const html = `
  <!DOCTYPE html>
  <html>
    <head><title>Test</title></head>
    <body><h1>Hello</h1></body>
  </html>
`;

const result = await sdk.pdf({ html });
```

### "PDF Too Large"

**Error:** `File size exceeds limit`

**Solutions:**

1. Reduce page complexity
2. Disable background images
3. Use smaller viewport
4. Split into multiple PDFs

```typescript
// Disable background
const result = await sdk.pdf({
  url: "https://example.com",
  printBackground: false,
});
```

## Reader Issues

### "Content Not Extracted"

**Error:** `Failed to extract content`

**Solutions:**

1. Verify URL is accessible
2. Check if page has readable content
3. Try different URL
4. Check page structure

```typescript
// Verify content exists
const result = await sdk.reader("https://example.com");
if (!result.content) {
  console.log("No content found");
  console.log("Title:", result.title);
  console.log("Language:", result.language);
}
```

## Network Issues

### "Connection Refused"

**Error:** `ECONNREFUSED`

**Solutions:**

1. Check internet connection
2. Verify API endpoint is accessible
3. Check firewall/proxy settings
4. Try different network

```typescript
// Test connectivity
try {
  const result = await sdk.screenshot({ url: "https://example.com" });
  console.log("✓ Connected");
} catch (error) {
  console.error("✗ Connection failed:", error.message);
}
```

### "DNS Resolution Failed"

**Error:** `ENOTFOUND`

**Solutions:**

1. Check URL spelling
2. Verify domain exists
3. Check DNS settings
4. Try IP address instead

```typescript
// Verify URL
const url = "https://example.com";
try {
  new URL(url); // Validates URL format
  const result = await sdk.screenshot({ url });
} catch (error) {
  console.error("Invalid URL:", error.message);
}
```

## SDK Issues

### "Module Not Found"

**Error:** `Cannot find module '@devutils/sdk'`

**Solutions:**

1. Install package: `npm install @devutils/sdk`
2. Check package name spelling
3. Verify Node.js version (16+)
4. Clear node_modules: `rm -rf node_modules && npm install`

### "Type Errors"

**Error:** `Property 'screenshot' does not exist`

**Solutions:**

1. Ensure TypeScript types are installed
2. Check SDK version compatibility
3. Verify import statement
4. Update SDK: `npm update @devutils/sdk`

```typescript
// Correct import
import { DevUtilsSDK } from "@devutils/sdk";

// Verify types
const sdk: DevUtilsSDK = new DevUtilsSDK("key");
```

## Python-Specific Issues

### "Async Runtime Error"

**Error:** `RuntimeError: no running event loop`

**Solutions:**

1. Use `asyncio.run()` to run async code
2. Ensure you're in async context
3. Don't mix sync and async

```python
# Correct
import asyncio
from devutils_sdk import DevUtilsSDK

async def main():
    sdk = DevUtilsSDK(api_key="key")
    result = await sdk.screenshot(url="https://example.com")
    sdk.close()

asyncio.run(main())

# Incorrect - will fail
sdk = DevUtilsSDK(api_key="key")
result = sdk.screenshot(url="https://example.com")  # ✗ Not awaited
```

### "Import Error"

**Error:** `ModuleNotFoundError: No module named 'devutils_sdk'`

**Solutions:**

1. Install package: `pip install devutils-sdk`
2. Check Python version (3.8+)
3. Verify virtual environment
4. Update pip: `pip install --upgrade pip`

## Browser/CDN Issues

### "CORS Error"

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**

1. Use backend proxy
2. Check API CORS settings
3. Verify origin is whitelisted
4. Use credentials if needed

```javascript
// Use backend proxy
const response = await fetch("/api/screenshot", {
  method: "POST",
  body: JSON.stringify({ url: "https://example.com" }),
});
```

### "Script Not Loading"

**Error:** `Failed to load script from CDN`

**Solutions:**

1. Check CDN URL is correct
2. Verify internet connection
3. Check browser console for errors
4. Try different CDN version

```html
<!-- Verify URL -->
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
<script>
  if (typeof DevUtilsSDK === "undefined") {
    console.error("SDK failed to load");
  }
</script>
```

## Getting Help

If you can't find a solution:

1. **Check documentation**: [docs.devutils.in](https://docs.devutils.in)
2. **Search issues**: [GitHub Issues](https://github.com/iwilldefinitelybecoder/devutils-sdks/issues)
3. **Create issue**: Include error message, SDK version, and reproduction steps
4. **Email support**: support@devutils.in

## Debug Mode

Enable debug logging:

**JavaScript:**

```typescript
const sdk = new DevUtilsSDK("api-key", {
  debug: true,
});
```

**Python:**

```python
import logging
logging.basicConfig(level=logging.DEBUG)

sdk = DevUtilsSDK(api_key="key")
```

## Performance Debugging

Monitor request performance:

```typescript
const start = Date.now();
const result = await sdk.screenshot({ url: "https://example.com" });
const duration = Date.now() - start;

console.log(`Screenshot took ${duration}ms`);
console.log(`URL: ${result.url}`);
```
