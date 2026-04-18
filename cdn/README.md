# DevUtils SDK - CDN Distribution

Browser-ready SDK for DevUtils API. Use directly in your HTML or import as a module.

## Installation

### Via CDN (Easiest)

```html
<!-- Latest version -->
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.devutils.in/v1.0.0/sdk.min.js"></script>
```

### Via npm

```bash
npm install devutils-sdk-cdn
```

## Quick Start

### HTML Script Tag

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
          console.log("Screenshot job:", result.jobId);
          console.log("Status:", result.status);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    </script>
  </body>
</html>
```

### ES Module

```javascript
import DevUtilsSDK from "devutils-sdk-cdn";

const sdk = new DevUtilsSDK("your-api-key");

// Take a screenshot
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png",
  width: 1280,
  height: 720,
});

console.log("Screenshot job:", result.jobId);
```

### CommonJS

```javascript
const DevUtilsSDK = require("devutils-sdk-cdn");

const sdk = new DevUtilsSDK("your-api-key");

sdk
  .screenshot({
    url: "https://example.com",
  })
  .then((result) => {
    console.log("Screenshot job:", result.jobId);
  });
```

## Features

- 📸 **Screenshots** - Capture web pages as images
- 📄 **PDF Generation** - Convert web pages to PDF
- 📖 **Content Reader** - Extract and parse web content
- ⚡ **Promise-based** - Modern async/await support
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 📦 **Lightweight** - Minimal bundle size (~50KB minified)
- 🌍 **Browser Compatible** - Works in all modern browsers

## API Reference

### Screenshot

```javascript
const result = await sdk.screenshot({
  url: "https://example.com",
  format: "png", // png, jpeg, webp
  width: 1280,
  height: 720,
  fullPage: false,
  waitUntil: "networkidle",
  timeout: 30000,
});

console.log(result.jobId); // Job ID
console.log(result.status); // Job status
console.log(result.imageUrl); // Image URL when ready
```

### PDF

```javascript
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

console.log(result.jobId); // Job ID
console.log(result.pdfUrl); // PDF URL when ready
```

### Reader

```javascript
const result = await sdk.reader("https://example.com");

console.log(result.title); // Page title
console.log(result.content); // Extracted content
console.log(result.author); // Author if available
console.log(result.publishedDate); // Published date if available
```

### Get Job Status

```javascript
// Check screenshot status
const status = await sdk.getScreenshotStatus(jobId);

// Check PDF status
const status = await sdk.getPdfStatus(jobId);
```

## Error Handling

```javascript
try {
  const result = await sdk.screenshot({ url: "https://example.com" });
} catch (error) {
  console.error("Error code:", error.code);
  console.error("Error message:", error.message);
  console.error("Status code:", error.statusCode);

  if (error.isRetryable()) {
    console.log("This error can be retried");
  }
}
```

## Configuration

```javascript
const sdk = new DevUtilsSDK("your-api-key", {
  baseUrl: "https://api.devutils.in",
  timeout: 30,
  maxRetries: 3,
});
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Bundle Sizes

- `sdk.js` - ~80KB (UMD)
- `sdk.esm.js` - ~75KB (ESM)
- `sdk.min.js` - ~50KB (Minified)

## Examples

### React

```jsx
import { useEffect, useState } from "react";
import DevUtilsSDK from "devutils-sdk-cdn";

export function ScreenshotComponent() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const takeScreenshot = async () => {
    setLoading(true);
    try {
      const sdk = new DevUtilsSDK(process.env.REACT_APP_API_KEY);
      const result = await sdk.screenshot({
        url: "https://example.com",
      });
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error("Screenshot failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={takeScreenshot} disabled={loading}>
        {loading ? "Taking screenshot..." : "Take Screenshot"}
      </button>
      {imageUrl && <img src={imageUrl} alt="Screenshot" />}
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <button @click="takeScreenshot" :disabled="loading">
      {{ loading ? "Taking screenshot..." : "Take Screenshot" }}
    </button>
    <img v-if="imageUrl" :src="imageUrl" alt="Screenshot" />
  </div>
</template>

<script>
import DevUtilsSDK from "devutils-sdk-cdn";

export default {
  data() {
    return {
      imageUrl: null,
      loading: false,
      sdk: new DevUtilsSDK(process.env.VUE_APP_API_KEY),
    };
  },
  methods: {
    async takeScreenshot() {
      this.loading = true;
      try {
        const result = await this.sdk.screenshot({
          url: "https://example.com",
        });
        this.imageUrl = result.imageUrl;
      } catch (error) {
        console.error("Screenshot failed:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

## License

MIT

## Support

- Documentation: https://docs.devutils.in
- Issues: https://github.com/devutils/sdk-cdn/issues
- Email: support@devutils.in
