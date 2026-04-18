# Examples

Real-world examples for common use cases.

## Screenshot Examples

### Basic Screenshot

**JavaScript:**

```typescript
import { DevUtilsSDK } from "@devutils/sdk";

const sdk = new DevUtilsSDK("your-api-key");

async function captureWebsite() {
  const result = await sdk.screenshot({
    url: "https://example.com",
  });
  console.log("Screenshot URL:", result.url);
}

captureWebsite();
```

**Python:**

```python
import asyncio
from devutils_sdk import DevUtilsSDK, ScreenshotOptions

async def capture_website():
    sdk = DevUtilsSDK(api_key="your-api-key")
    result = await sdk.screenshot(
        ScreenshotOptions(url="https://example.com")
    )
    print("Screenshot URL:", result.image_url)
    sdk.close()

asyncio.run(capture_website())
```

### Full Page Screenshot

```typescript
const result = await sdk.screenshot({
  url: "https://example.com",
  fullPage: true,
  format: "png",
});
```

### Mobile Screenshot

```typescript
const result = await sdk.screenshot({
  url: "https://example.com",
  device: "iPhone 13",
  format: "png",
});
```

### Custom Viewport

```typescript
const result = await sdk.screenshot({
  url: "https://example.com",
  width: 1920,
  height: 1080,
  format: "webp",
});
```

## PDF Examples

### URL to PDF

```typescript
const result = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
  printBackground: true,
});
console.log("PDF URL:", result.url);
```

### HTML to PDF

```typescript
const html = `
  <html>
    <head><title>Invoice</title></head>
    <body>
      <h1>Invoice #001</h1>
      <p>Amount: $100.00</p>
    </body>
  </html>
`;

const result = await sdk.pdf({
  html: html,
  format: "A4",
});
```

### Custom Margins

```typescript
const result = await sdk.pdf({
  url: "https://example.com",
  format: "Letter",
  marginTop: "2cm",
  marginRight: "1.5cm",
  marginBottom: "2cm",
  marginLeft: "1.5cm",
  landscape: false,
});
```

## Reader Examples

### Extract Article Content

```typescript
const result = await sdk.reader("https://example.com/article");
console.log("Title:", result.title);
console.log("Content:", result.content);
console.log("Author:", result.author);
console.log("Published:", result.publishedDate);
```

### Parse Multiple URLs

```typescript
const urls = [
  "https://example.com/article1",
  "https://example.com/article2",
  "https://example.com/article3",
];

const results = await Promise.all(urls.map((url) => sdk.reader(url)));

results.forEach((result, index) => {
  console.log(`Article ${index + 1}: ${result.title}`);
});
```

## File Upload Examples

### Upload Text File

```typescript
const content = "Hello, World!";
const file = new Blob([content], { type: "text/plain" });

const result = await sdk.uploadFile(file, {
  name: "hello.txt",
});
console.log("File URL:", result.url);
```

### Upload JSON Data

```typescript
const data = { name: "John", age: 30 };
const file = new Blob([JSON.stringify(data)], { type: "application/json" });

const result = await sdk.uploadFile(file, {
  name: "data.json",
});
```

### Upload from Node.js

```typescript
import fs from "fs";

const fileContent = fs.readFileSync("document.pdf");
const result = await sdk.uploadFile(fileContent, {
  name: "document.pdf",
  contentType: "application/pdf",
});
```

## Webhook Examples

### Create and Listen

```typescript
// Create webhook
const webhook = await sdk.webhook.create("my-webhook");
console.log("Webhook ID:", webhook.id);
console.log("Webhook URL:", webhook.url);

// Listen for events
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log("Received event:", event);
  console.log("Method:", event.method);
  console.log("Payload:", event.payload);
});

// Stop listening after 1 minute
setTimeout(() => {
  listener.stop();
}, 60000);
```

### Get Webhook Requests

```typescript
const requests = await sdk.webhook.getRequests(webhook.id, {
  limit: 20,
  offset: 0,
});

requests.forEach((request) => {
  console.log(`${request.method} ${request.path}`);
  console.log("Headers:", request.headers);
  console.log("Payload:", request.payload);
});
```

## Error Handling Examples

### Retry on Failure

```typescript
async function screenshotWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sdk.screenshot({ url });
    } catch (error) {
      if (error.isRetryable() && i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}

const result = await screenshotWithRetry("https://example.com");
```

### Handle Specific Errors

```typescript
try {
  const result = await sdk.screenshot({ url: "https://example.com" });
} catch (error) {
  if (error.isStatus(401)) {
    console.error("Invalid API key");
  } else if (error.isStatus(429)) {
    console.error("Rate limited");
  } else if (error.isRetryable()) {
    console.error("Transient error, can retry");
  } else {
    console.error("Permanent error:", error.message);
  }
}
```

## Batch Processing

### Process Multiple URLs

```typescript
async function processUrls(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map((url) => sdk.screenshot({ url })),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`✓ ${urls[index]}: ${result.value.url}`);
    } else {
      console.log(`✗ ${urls[index]}: ${result.reason.message}`);
    }
  });
}

await processUrls([
  "https://example.com",
  "https://google.com",
  "https://github.com",
]);
```

## Real-World Use Cases

### Generate Report Screenshots

```typescript
async function generateReport(urls: string[]) {
  const screenshots = await Promise.all(
    urls.map((url) => sdk.screenshot({ url, fullPage: true })),
  );

  return {
    generatedAt: new Date().toISOString(),
    screenshots: screenshots.map((s) => ({
      url: s.url,
      format: s.format,
      size: `${s.width}x${s.height}`,
    })),
  };
}
```

### Convert Web Content to PDF

```typescript
async function webToPdf(url: string, filename: string) {
  const result = await sdk.pdf({
    url,
    format: "A4",
    printBackground: true,
  });

  // Download or process the PDF
  console.log(`PDF ready: ${result.url}`);
  return result.url;
}
```

### Archive Web Pages

```typescript
async function archiveWebpage(url: string) {
  const [screenshot, pdf, content] = await Promise.all([
    sdk.screenshot({ url, fullPage: true }),
    sdk.pdf({ url }),
    sdk.reader(url),
  ]);

  return {
    url,
    screenshot: screenshot.url,
    pdf: pdf.url,
    title: content.title,
    content: content.content,
    archivedAt: new Date().toISOString(),
  };
}
```

## Performance Tips

### Parallel Requests

```typescript
// Good: Parallel requests
const results = await Promise.all([
  sdk.screenshot({ url: "https://example.com" }),
  sdk.pdf({ url: "https://example.com" }),
  sdk.reader("https://example.com"),
]);

// Avoid: Sequential requests (slower)
const screenshot = await sdk.screenshot({ url: "https://example.com" });
const pdf = await sdk.pdf({ url: "https://example.com" });
const content = await sdk.reader("https://example.com");
```

### Batch with Concurrency Control

```typescript
async function batchWithConcurrency(urls: string[], concurrency = 5) {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => sdk.screenshot({ url })),
    );
    results.push(...batchResults);
  }
  return results;
}
```

## More Examples

See the [API Reference](./API_REFERENCE.md) for complete documentation.
