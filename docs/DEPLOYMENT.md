# Deployment Guide

How to deploy and use DevUtils SDKs in production.

## Environment Setup

### Development

```bash
# Install dependencies
npm install
cd sdk-python && pip install -e ".[dev]"

# Set environment variables
export DEVUTILS_API_KEY="your-dev-key"

# Run tests
npm run test:all
```

### Staging

```bash
# Build all SDKs
npm run build:all

# Run integration tests
npm run test:all

# Deploy to staging
npm run deploy:staging
```

### Production

```bash
# Build all SDKs
npm run build:all

# Run full test suite
npm run test:all

# Deploy to production
npm run deploy:prod
```

## Configuration

### Environment Variables

```bash
# Required
DEVUTILS_API_KEY=your-api-key

# Optional
DEVUTILS_BASE_URL=https://api.devutils.in
DEVUTILS_TIMEOUT=30000
DEVUTILS_DEBUG=false
```

### Node.js

```typescript
// Production configuration
const sdk = new DevUtilsSDK(process.env.DEVUTILS_API_KEY, {
  baseUrl: process.env.DEVUTILS_BASE_URL || "https://api.devutils.in",
  timeout: parseInt(process.env.DEVUTILS_TIMEOUT || "30000"),
});
```

### Python

```python
import os
from devutils_sdk import DevUtilsSDK
from devutils_sdk.core.http_client import HttpClientConfig

config = HttpClientConfig(
    api_key=os.getenv("DEVUTILS_API_KEY"),
    base_url=os.getenv("DEVUTILS_BASE_URL", "https://api.devutils.in"),
    timeout=int(os.getenv("DEVUTILS_TIMEOUT", "30000"))
)

sdk = DevUtilsSDK(api_key=os.getenv("DEVUTILS_API_KEY"), config=config)
```

## Docker Deployment

### Node.js

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Set environment
ENV DEVUTILS_API_KEY=${DEVUTILS_API_KEY}

# Run application
CMD ["node", "dist/index.js"]
```

### Python

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Set environment
ENV DEVUTILS_API_KEY=${DEVUTILS_API_KEY}

# Run application
CMD ["python", "main.py"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    environment:
      DEVUTILS_API_KEY: ${DEVUTILS_API_KEY}
      DEVUTILS_BASE_URL: https://api.devutils.in
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## Kubernetes Deployment

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: devutils-config
data:
  DEVUTILS_BASE_URL: "https://api.devutils.in"
  DEVUTILS_TIMEOUT: "30000"
```

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: devutils-secret
type: Opaque
stringData:
  DEVUTILS_API_KEY: your-api-key
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devutils-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: devutils-app
  template:
    metadata:
      labels:
        app: devutils-app
    spec:
      containers:
        - name: app
          image: devutils-app:latest
          envFrom:
            - configMapRef:
                name: devutils-config
            - secretRef:
                name: devutils-secret
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

## AWS Deployment

### Lambda (Node.js)

```typescript
import { DevUtilsSDK } from "@devutils/sdk";

const sdk = new DevUtilsSDK(process.env.DEVUTILS_API_KEY);

export const handler = async (event) => {
  try {
    const result = await sdk.screenshot({
      url: event.url,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Lambda (Python)

```python
import json
import os
from devutils_sdk import DevUtilsSDK

sdk = DevUtilsSDK(api_key=os.getenv("DEVUTILS_API_KEY"))

def lambda_handler(event, context):
    try:
        result = await sdk.screenshot(url=event["url"])
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
```

### CloudFormation

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Resources:
  DevUtilsSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: devutils-api-key
      SecretString: !Sub |
        {
          "api_key": "${DevUtilsApiKey}"
        }

  DevUtilsLambda:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: nodejs18.x
      Handler: index.handler
      Environment:
        Variables:
          DEVUTILS_API_KEY: !Sub "{{resolve:secretsmanager:devutils-api-key:SecretString:api_key}}"
```

## Monitoring

### Health Checks

```typescript
async function healthCheck() {
  try {
    // Test API connectivity
    const result = await sdk.screenshot({
      url: "https://example.com",
      timeout: 5000,
    });

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Log API calls
logger.info("Screenshot request", {
  url: "https://example.com",
  timestamp: new Date().toISOString(),
});
```

### Metrics

```typescript
import prometheus from "prom-client";

const screenshotCounter = new prometheus.Counter({
  name: "devutils_screenshots_total",
  help: "Total screenshots taken",
});

const screenshotDuration = new prometheus.Histogram({
  name: "devutils_screenshot_duration_ms",
  help: "Screenshot duration in milliseconds",
});

async function screenshot(url: string) {
  const start = Date.now();
  try {
    const result = await sdk.screenshot({ url });
    screenshotCounter.inc();
    screenshotDuration.observe(Date.now() - start);
    return result;
  } catch (error) {
    screenshotCounter.inc({ status: "error" });
    throw error;
  }
}
```

## Performance Optimization

### Caching

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function cachedScreenshot(url: string) {
  const cached = cache.get(url);
  if (cached) return cached;

  const result = await sdk.screenshot({ url });
  cache.set(url, result);
  return result;
}
```

### Connection Pooling

```typescript
// SDK handles connection pooling automatically
// No additional configuration needed
```

### Batch Processing

```typescript
async function batchScreenshots(urls: string[], concurrency = 5) {
  const results = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((url) => sdk.screenshot({ url })));
    results.push(...batchResults);
  }

  return results;
}
```

## Scaling

### Horizontal Scaling

1. Deploy multiple instances
2. Use load balancer
3. Share API key via environment
4. Monitor rate limits

### Vertical Scaling

1. Increase timeout values
2. Increase memory allocation
3. Optimize batch sizes
4. Use caching

## Backup & Recovery

### Data Backup

```bash
# Backup configuration
cp .env .env.backup

# Backup logs
tar -czf logs-backup.tar.gz logs/
```

### Disaster Recovery

1. Keep API keys in secure vault
2. Document deployment process
3. Test recovery procedures
4. Monitor uptime

## Rollback

```bash
# Rollback to previous version
npm install @devutils/sdk@1.0.0

# Or use git
git revert <commit-hash>
git push origin main
```

## Support

- **Documentation**: [docs.devutils.in](https://docs.devutils.in)
- **Issues**: [GitHub Issues](https://github.com/iwilldefinitelybecoder/devutils-sdks/issues)
- **Email**: support@devutils.in
