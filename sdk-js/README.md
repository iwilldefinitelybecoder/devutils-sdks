# @devutils/sdk

Production-grade SDK for DevUtils API. Take screenshots, generate PDFs, extract content, and manage webhooks with a simple, intuitive API.

## Features

✨ **Simple API** - No job IDs, no polling. Just get results.
✨ **Auto Retry** - Exponential backoff with jitter
✨ **Type Safe** - Full TypeScript support
✨ **Real-time** - SSE webhooks with auto-reconnect
✨ **Error Handling** - Normalized error types
✨ **Timeout Control** - Configurable per request

## Installation

```bash
npm install @devutils/sdk
```

## Quick Start

```typescript
import DevUtils from "@devutils/sdk";

const devutils = new DevUtils("YOUR_API_KEY");

// Screenshot
const screenshot = await devutils.screenshot("https://example.com");
console.log(screenshot.url); // CDN URL

// PDF
const pdf = await devutils.pdf("https://example.com");
console.log(pdf.url);

// Reader
const content = await devutils.reader("https://example.com");
console.log(content.markdown);

// Webhooks
const webhook = await devutils.webhook.create("my-webhook");
devutils.webhook.listen(webhook.id, (event) => {
  console.log("Received:", event);
});
```

## API Reference

### Screenshot

```typescript
const result = await devutils.screenshot(url, {
  fullPage: true,
  mobile: false,
  darkMode: false,
  blockAds: true,
  blockCookieBanners: true,
  hideChatWidgets: true,
  hideSelectors: [".ad", ".popup"],
  clickSelectors: [".accept-cookies"],
  viewport: { width: 1280, height: 720 },
  type: "png", // "png" | "webp" | "jpg"
  waitTime: 0,
  timeout: 30000,
});

// Returns: { url: "https://cdn.devutils.in/..." }
```

### PDF

```typescript
// From URL
const result = await devutils.pdf("https://example.com", {
  pageSize: "A4", // "A4" | "Letter" | "Legal" | "Tabloid"
  orientation: "portrait", // "portrait" | "landscape"
  timeout: 30000,
});

// From HTML
const result = await devutils.pdf(
  { html: "<h1>Hello</h1>" },
  { pageSize: "A4" },
);

// Returns: { url: "https://cdn.devutils.in/..." }
```

### Reader

```typescript
const result = await devutils.reader("https://example.com", {
  outputFormat: "markdown", // "markdown" | "text"
  includeScreenshot: false,
  includeLinks: true,
  includeMetadata: true,
  timeout: 30000,
});

// Returns:
// {
//   markdown: "# Title\n\nContent...",
//   text: "Title\n\nContent...",
//   metadata: { title, description, author },
//   stats: { wordCount, linkCount, imageCount },
//   screenshotUrl: "https://cdn.devutils.in/...",
//   renderTimeMs: 1250
// }
```

### File Upload

```typescript
const file = new Blob(["content"], { type: "text/plain" });
const result = await devutils.uploadFile(file, {
  name: "document.txt",
  timeout: 30000,
});

// Returns: { url: "https://cdn.devutils.in/..." }
```

### Webhooks

```typescript
// Create webhook
const webhook = await devutils.webhook.create("my-webhook");
// Returns: { id, url, token, streamUrl }

// Listen for events
const listener = await devutils.webhook.listen(webhook.id, (event) => {
  console.log("Event:", event);
  // { id, method, headers, payload, createdAt }
});

// Stop listening
listener.stop();

// Get webhook requests
const requests = await devutils.webhook.getRequests(webhook.id, {
  limit: 10,
  offset: 0,
});

// Delete webhook
await devutils.webhook.delete(webhook.id);
```

### Connectors

```typescript
// List connectors
const connectors = await devutils.connectors.list();

// Get connector
const connector = await devutils.connectors.get("connector-id");

// Create connector
const newConnector = await devutils.connectors.create({
  name: "My Connector",
  type: "slack",
  config: { webhookUrl: "https://..." },
});

// Update connector
const updated = await devutils.connectors.update("connector-id", {
  config: { webhookUrl: "https://..." },
});

// Test connector
const result = await devutils.connectors.test({
  name: "Test",
  type: "slack",
  config: { webhookUrl: "https://..." },
});

// Delete connector
await devutils.connectors.delete("connector-id");
```

## Error Handling

```typescript
import { DevUtilsError } from "@devutils/sdk";

try {
  const result = await devutils.screenshot(url);
} catch (error) {
  if (error instanceof DevUtilsError) {
    console.error(error.code); // "TIMEOUT", "RATE_LIMITED", etc.
    console.error(error.statusCode); // 408, 429, etc.
    console.error(error.message);

    if (error.isRetryable()) {
      // Handle retryable errors
    }
  }
}
```

## Authentication

```typescript
// API Key (recommended)
const devutils = new DevUtils("du_prod_abc123...");

// JWT Token
const devutils = new DevUtils("", { token: "eyJhbGc..." });

// Update credentials
devutils.setApiKey("new-key");
devutils.setToken("new-token");
devutils.clearAuth();
```

## Configuration

```typescript
const devutils = new DevUtils("API_KEY", {
  baseUrl: "https://api.devutils.in", // Custom API endpoint
  timeout: 30000, // Default timeout in ms
});
```

## Retry Behavior

The SDK automatically retries on:

- 408 (Request Timeout)
- 429 (Rate Limited)
- 500, 502, 503, 504 (Server Errors)

Backoff strategy:

- Initial: 500ms
- Backoff: 1s, 2s, 3s (capped)
- Max retries: 5

## Polling Behavior

For async jobs (screenshot, PDF):

- Initial poll: 500ms
- Backoff: 1.5x multiplier
- Max poll delay: 3s
- Max wait: 30s

## Browser Support

Works in modern browsers with:

- Fetch API
- EventSource (for webhooks)
- FormData (for file uploads)

```html
<script src="https://cdn.devutils.in/sdk.min.js"></script>
<script>
  const devutils = new DevUtils("API_KEY");
  devutils.screenshot("https://example.com").then((result) => {
    console.log(result.url);
  });
</script>
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import DevUtils, {
  ScreenshotResult,
  PdfResult,
  ReaderResult,
  WebhookEvent,
  DevUtilsError,
} from "@devutils/sdk";
```

## License

MIT

## Support

- Documentation: https://devutils.in/docs
- Issues: https://github.com/devutils/sdk-js/issues
- Email: support@devutils.in
