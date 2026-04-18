# API Reference

Complete API documentation for all DevUtils SDKs.

## Screenshot

Take screenshots of websites in multiple formats.

### Options

| Option      | Type    | Default       | Description                                         |
| ----------- | ------- | ------------- | --------------------------------------------------- |
| `url`       | string  | required      | URL to screenshot                                   |
| `format`    | string  | "png"         | Output format: png, jpeg, webp                      |
| `width`     | number  | 1280          | Viewport width in pixels                            |
| `height`    | number  | 720           | Viewport height in pixels                           |
| `fullPage`  | boolean | false         | Capture full page                                   |
| `waitUntil` | string  | "networkidle" | Wait condition: load, domcontentloaded, networkidle |
| `timeout`   | number  | 30000         | Timeout in milliseconds                             |
| `device`    | string  | -             | Device preset (mobile, tablet, etc.)                |
| `userAgent` | string  | -             | Custom user agent                                   |
| `cookies`   | array   | -             | Cookies to set                                      |
| `headers`   | object  | -             | Custom headers                                      |

### Response

```typescript
{
  url: string;           // CDN URL of screenshot
  jobId: string;         // Job ID (internal)
  status: string;        // "completed"
  format: string;        // Output format
  width: number;         // Screenshot width
  height: number;        // Screenshot height
  createdAt: string;     // ISO timestamp
  expiresAt?: string;    // Expiration timestamp
}
```

### Examples

**JavaScript:**

```typescript
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png",
  width: 1920,
  height: 1080,
  fullPage: true,
});
```

**Python:**

```python
result = await sdk.screenshot(
    ScreenshotOptions(
        url="https://example.com",
        format="png",
        width=1920,
        height=1080,
        full_page=True
    )
)
```

## PDF

Generate PDFs from URLs or HTML.

### Options

| Option            | Type    | Default | Description                  |
| ----------------- | ------- | ------- | ---------------------------- |
| `url`             | string  | -       | URL to convert (if not HTML) |
| `html`            | string  | -       | HTML content to convert      |
| `format`          | string  | "A4"    | Page size: A4, Letter, etc.  |
| `marginTop`       | string  | "1cm"   | Top margin                   |
| `marginRight`     | string  | "1cm"   | Right margin                 |
| `marginBottom`    | string  | "1cm"   | Bottom margin                |
| `marginLeft`      | string  | "1cm"   | Left margin                  |
| `printBackground` | boolean | false   | Include background graphics  |
| `landscape`       | boolean | false   | Landscape orientation        |
| `timeout`         | number  | 30000   | Timeout in milliseconds      |

### Response

```typescript
{
  url: string;           // CDN URL of PDF
  jobId: string;         // Job ID (internal)
  status: string;        // "completed"
  createdAt: string;     // ISO timestamp
  expiresAt?: string;    // Expiration timestamp
}
```

### Examples

**From URL:**

```typescript
const result = await sdk.pdf({
  url: "https://example.com",
  format: "A4",
  printBackground: true,
});
```

**From HTML:**

```typescript
const result = await sdk.pdf({
  html: "<h1>Hello</h1><p>World</p>",
  format: "Letter",
});
```

## Reader

Extract and parse webpage content.

### Options

| Option    | Type   | Default  | Description             |
| --------- | ------ | -------- | ----------------------- |
| `url`     | string | required | URL to read             |
| `timeout` | number | 30000    | Timeout in milliseconds |

### Response

```typescript
{
  title: string;         // Page title
  content: string;       // Extracted content
  author?: string;       // Page author
  publishedDate?: string;// Publication date
  image?: string;        // Featured image URL
  language?: string;     // Page language
}
```

### Example

```typescript
const result = await sdk.reader("https://example.com");
console.log(result.title);
console.log(result.content);
```

## File Upload

Upload files to CDN.

### Options

| Option        | Type        | Default  | Description    |
| ------------- | ----------- | -------- | -------------- |
| `file`        | Buffer/Blob | required | File to upload |
| `name`        | string      | -        | File name      |
| `contentType` | string      | -        | MIME type      |

### Response

```typescript
{
  url: string;           // CDN URL of file
  name: string;          // File name
  size: number;          // File size in bytes
  contentType: string;   // MIME type
  expiresAt?: string;    // Expiration timestamp
}
```

### Example

```typescript
const file = new Blob(["content"], { type: "text/plain" });
const result = await sdk.uploadFile(file, { name: "document.txt" });
console.log(result.url);
```

## Webhooks

Real-time event streaming via Server-Sent Events (SSE).

### Create Webhook

```typescript
const webhook = await sdk.webhook.create("my-webhook");
// Returns: { id, url, token, streamUrl }
```

### Listen for Events

```typescript
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log("Event:", event);
  // { id, method, headers, payload, createdAt }
});

// Stop listening
listener.stop();
```

### Get Requests

```typescript
const requests = await sdk.webhook.getRequests(webhook.id, {
  limit: 10,
  offset: 0,
});
```

### Delete Webhook

```typescript
await sdk.webhook.delete(webhook.id);
```

## Connectors

Manage integrations and connectors.

### List Connectors

```typescript
const connectors = await sdk.connectors.list();
```

### Get Connector

```typescript
const connector = await sdk.connectors.get("connector-id");
```

### Create Connector

```typescript
const connector = await sdk.connectors.create({
  name: "My Connector",
  type: "slack",
  config: { webhookUrl: "https://..." },
});
```

### Update Connector

```typescript
await sdk.connectors.update("connector-id", {
  config: { webhookUrl: "https://new-url" },
});
```

### Test Connector

```typescript
await sdk.connectors.test({
  name: "Test",
  type: "slack",
  config: { webhookUrl: "https://..." },
});
```

### Delete Connector

```typescript
await sdk.connectors.delete("connector-id");
```

## Error Codes

| Code                  | Status | Retryable | Description         |
| --------------------- | ------ | --------- | ------------------- |
| `TIMEOUT`             | 408    | Yes       | Request timeout     |
| `RATE_LIMITED`        | 429    | Yes       | Rate limit exceeded |
| `SERVER_ERROR`        | 500    | Yes       | Server error        |
| `BAD_GATEWAY`         | 502    | Yes       | Bad gateway         |
| `SERVICE_UNAVAILABLE` | 503    | Yes       | Service unavailable |
| `GATEWAY_TIMEOUT`     | 504    | Yes       | Gateway timeout     |
| `INVALID_REQUEST`     | 400    | No        | Invalid request     |
| `UNAUTHORIZED`        | 401    | No        | Invalid API key     |
| `FORBIDDEN`           | 403    | No        | Access denied       |
| `NOT_FOUND`           | 404    | No        | Resource not found  |

## Rate Limiting

- **Requests per minute**: 60
- **Concurrent jobs**: 10
- **File size limit**: 100MB

See [Pricing](https://devutils.in/pricing) for plan limits.

## Retry Behavior

The SDK automatically retries on transient errors:

- **Max retries**: 5
- **Initial delay**: 500ms
- **Backoff multiplier**: 2x
- **Max delay**: 30s

Configure retry behavior:

**JavaScript:**

```typescript
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

**Python:**

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
