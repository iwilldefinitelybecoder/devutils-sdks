# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email **security@devutils.in** instead of using the issue tracker.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide updates on our progress.

## Security Best Practices

### API Key Management

1. **Never commit API keys** to version control
2. **Use environment variables** for API keys
3. **Rotate keys regularly** (every 90 days)
4. **Use separate keys** for development and production
5. **Restrict key permissions** to minimum required

```typescript
// ✓ Good
const apiKey = process.env.DEVUTILS_API_KEY;
const sdk = new DevUtilsSDK(apiKey);

// ✗ Bad
const sdk = new DevUtilsSDK("du_prod_abc123...");
```

### HTTPS Only

Always use HTTPS for API calls. The SDK enforces this by default.

```typescript
// ✓ Good - HTTPS enforced
const sdk = new DevUtilsSDK("api-key");

// ✗ Bad - HTTP not supported
const sdk = new DevUtilsSDK("api-key", {
  baseUrl: "http://api.devutils.in", // Will fail
});
```

### Input Validation

Validate and sanitize user input before passing to SDK:

```typescript
// ✓ Good
function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const url = userInput;
if (validateUrl(url)) {
  const result = await sdk.screenshot({ url });
}

// ✗ Bad - No validation
const result = await sdk.screenshot({ url: userInput });
```

### Error Handling

Don't expose sensitive information in error messages:

```typescript
// ✓ Good
try {
  const result = await sdk.screenshot({ url });
} catch (error) {
  console.error("Screenshot failed");
  // Log full error internally only
  logger.error(error);
}

// ✗ Bad - Exposes API key
try {
  const result = await sdk.screenshot({ url });
} catch (error) {
  console.error("Error:", error.message); // May contain API key
}
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// ✓ Good - Rate limited
const limiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 });

async function screenshot(url: string) {
  await limiter.acquire();
  return sdk.screenshot({ url });
}
```

### CORS Configuration

For browser usage, configure CORS properly:

```typescript
// ✓ Good - Specific origin
const corsOptions = {
  origin: "https://yourdomain.com",
  credentials: true,
};

// ✗ Bad - Allow all origins
const corsOptions = {
  origin: "*",
};
```

### Dependency Security

Keep dependencies up to date:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Data Privacy

1. **Don't log sensitive data** - URLs, API keys, user data
2. **Use HTTPS** - Encrypt data in transit
3. **Implement access control** - Restrict who can use the SDK
4. **Audit logs** - Track API usage
5. **Data retention** - Delete data when no longer needed

### Frontend Security

When using the CDN SDK in browsers:

```html
<!-- ✓ Good - Use backend proxy -->
<script>
  fetch("/api/screenshot", {
    method: "POST",
    body: JSON.stringify({ url: "https://example.com" }),
  });
</script>

<!-- ✗ Bad - Exposes API key in frontend -->
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
<script>
  const sdk = new DevUtilsSDK("du_prod_abc123..."); // Exposed!
</script>
```

## Security Updates

We release security updates as soon as possible. Subscribe to:

- [GitHub Security Advisories](https://github.com/iwilldefinitelybecoder/devutils-sdks/security/advisories)
- [Release Notifications](https://github.com/iwilldefinitelybecoder/devutils-sdks/releases)

## Compliance

DevUtils SDKs comply with:

- **OWASP Top 10** - Security best practices
- **GDPR** - Data protection regulations
- **SOC 2** - Security controls
- **ISO 27001** - Information security

## Third-Party Dependencies

We regularly audit third-party dependencies for vulnerabilities:

```bash
# Check dependency vulnerabilities
npm audit

# View detailed report
npm audit --json
```

## Responsible Disclosure

We appreciate responsible disclosure of security issues. Please:

1. **Don't publicly disclose** vulnerabilities before we can fix them
2. **Give us time** to develop and release a fix
3. **Work with us** to understand and resolve the issue
4. **Accept credit** for responsible disclosure

## Security Checklist

Before deploying to production:

- [ ] API keys stored in environment variables
- [ ] HTTPS enabled for all API calls
- [ ] Input validation implemented
- [ ] Error handling doesn't expose sensitive data
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Dependencies up to date
- [ ] Security headers configured
- [ ] Logging doesn't contain sensitive data
- [ ] Access control implemented

## Contact

- **Security Issues**: security@devutils.in
- **General Support**: support@devutils.in
- **GitHub Issues**: [Report Bug](https://github.com/iwilldefinitelybecoder/devutils-sdks/issues)

---

Last updated: 2024-04-18
