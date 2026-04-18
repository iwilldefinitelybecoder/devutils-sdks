# Webhooks Guide

Real-time event streaming with Server-Sent Events (SSE).

## Overview

Webhooks allow you to receive real-time notifications when events occur.

## Creating a Webhook

```typescript
const webhook = await sdk.webhook.create("my-webhook");

console.log("Webhook ID:", webhook.id);
console.log("Webhook URL:", webhook.url);
console.log("Stream URL:", webhook.streamUrl);
```

Response:

```typescript
{
  id: string; // Unique webhook ID
  url: string; // URL to POST events to
  token: string; // Authentication token
  streamUrl: string; // SSE stream URL
  createdAt: string; // Creation timestamp
}
```

## Listening for Events

### Basic Listener

```typescript
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log("Event received:", event);
});

// Stop listening
listener.stop();
```

### Event Structure

```typescript
{
  id: string; // Event ID
  method: string; // HTTP method (GET, POST, etc.)
  path: string; // Request path
  headers: object; // Request headers
  payload: any; // Request body
  createdAt: string; // Event timestamp
}
```

## Getting Webhook Requests

Retrieve historical webhook requests:

```typescript
const requests = await sdk.webhook.getRequests(webhook.id, {
  limit: 20,
  offset: 0,
});

requests.forEach((request) => {
  console.log(`${request.method} ${request.path}`);
  console.log("Payload:", request.payload);
});
```

## Deleting a Webhook

```typescript
await sdk.webhook.delete(webhook.id);
```

## Use Cases

### Testing Webhooks

```typescript
// Create webhook
const webhook = await sdk.webhook.create("test-webhook");

// Listen for events
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log("Received:", event.payload);
});

// Send test request
fetch(webhook.url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ test: true }),
});

// Stop after 10 seconds
setTimeout(() => listener.stop(), 10000);
```

### Monitoring API Calls

```typescript
// Create webhook for monitoring
const webhook = await sdk.webhook.create("api-monitor");

// Listen for all requests
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log(`[${event.createdAt}] ${event.method} ${event.path}`);

  if (event.method === "POST") {
    console.log("Payload:", event.payload);
  }
});
```

### Debugging Integration

```typescript
// Create webhook for debugging
const webhook = await sdk.webhook.create("debug-webhook");

// Listen and log everything
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  console.log("=== Webhook Event ===");
  console.log("ID:", event.id);
  console.log("Method:", event.method);
  console.log("Path:", event.path);
  console.log("Headers:", JSON.stringify(event.headers, null, 2));
  console.log("Payload:", JSON.stringify(event.payload, null, 2));
  console.log("Time:", event.createdAt);
  console.log("==================");
});
```

## Advanced Patterns

### Multiple Webhooks

```typescript
// Create multiple webhooks for different purposes
const webhooks = await Promise.all([
  sdk.webhook.create("webhook-1"),
  sdk.webhook.create("webhook-2"),
  sdk.webhook.create("webhook-3"),
]);

// Listen to all
webhooks.forEach((webhook) => {
  sdk.webhook.listen(webhook.id, (event) => {
    console.log(`[${webhook.id}] ${event.method} ${event.path}`);
  });
});
```

### Filtering Events

```typescript
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  // Only log POST requests
  if (event.method === "POST") {
    console.log("POST request:", event.payload);
  }

  // Only log specific paths
  if (event.path.includes("/api/")) {
    console.log("API request:", event.path);
  }
});
```

### Event Aggregation

```typescript
const events = [];

const listener = await sdk.webhook.listen(webhook.id, (event) => {
  events.push(event);

  // Process every 10 events
  if (events.length >= 10) {
    console.log(`Processed ${events.length} events`);
    events.length = 0; // Clear
  }
});
```

### Error Handling

```typescript
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  try {
    // Process event
    console.log("Processing:", event.payload);
  } catch (error) {
    console.error("Error processing event:", error);
  }
});

// Handle listener errors
listener.on("error", (error) => {
  console.error("Listener error:", error);
});
```

## Best Practices

### 1. Clean Up Resources

```typescript
// Always stop listeners when done
const listener = await sdk.webhook.listen(webhook.id, handler);

// Stop after use
setTimeout(() => {
  listener.stop();
  sdk.webhook.delete(webhook.id);
}, 60000);
```

### 2. Handle Reconnections

```typescript
async function createRobustListener(webhookId) {
  let listener;

  async function connect() {
    try {
      listener = await sdk.webhook.listen(webhookId, handleEvent);
    } catch (error) {
      console.error("Connection failed, retrying...");
      setTimeout(connect, 5000);
    }
  }

  function handleEvent(event) {
    console.log("Event:", event);
  }

  await connect();
  return listener;
}
```

### 3. Batch Processing

```typescript
const events = [];
let timer;

const listener = await sdk.webhook.listen(webhook.id, (event) => {
  events.push(event);

  // Clear existing timer
  clearTimeout(timer);

  // Process after 5 seconds of inactivity
  timer = setTimeout(() => {
    if (events.length > 0) {
      processBatch(events);
      events.length = 0;
    }
  }, 5000);
});

function processBatch(batch) {
  console.log(`Processing batch of ${batch.length} events`);
  // Your processing logic
}
```

### 4. Logging

```typescript
const listener = await sdk.webhook.listen(webhook.id, (event) => {
  const log = {
    timestamp: new Date().toISOString(),
    eventId: event.id,
    method: event.method,
    path: event.path,
    status: "received",
  };

  console.log(JSON.stringify(log));
});
```

## Limits

- **Webhook retention**: 24 hours
- **Max requests per webhook**: 1000
- **Max concurrent listeners**: 10
- **Event payload size**: 1MB

## Troubleshooting

### Listener Not Receiving Events

1. Verify webhook ID is correct
2. Check webhook hasn't been deleted
3. Ensure network connection is stable
4. Check browser console for errors

### Events Not Persisting

1. Webhooks are stored for 24 hours
2. Use `getRequests()` to retrieve historical events
3. Consider storing events in your database

### Connection Drops

1. Implement reconnection logic
2. Check network stability
3. Monitor listener status
4. Use exponential backoff for retries

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for more webhook examples.
