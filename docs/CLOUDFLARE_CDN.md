# Cloudflare CDN Deployment

Deploy the CDN SDK to Cloudflare Pages or R2 (object storage).

## Overview

Two options for Cloudflare deployment:

1. **Cloudflare Pages** - Free static hosting (recommended for CDN)
2. **Cloudflare R2** - Object storage (like S3)

## Option 1: Cloudflare Pages (Recommended)

### Setup

1. **Create Cloudflare Account**
   - Go to https://dash.cloudflare.com
   - Sign up or log in

2. **Create Pages Project**
   - Go to Workers & Pages → Pages
   - Click "Create application"
   - Select "Upload assets"
   - Name: `devutils-sdk-cdn`

3. **Get API Token**
   - Go to Account Settings → API Tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Permissions:
     - Account.Workers Scripts: Edit
     - Account.Workers KV: Edit
   - Copy token

4. **Add GitHub Secrets**
   - Go to repository Settings → Secrets
   - Add `CLOUDFLARE_API_TOKEN` with your token
   - Add `CLOUDFLARE_ACCOUNT_ID` (from account settings)

### Deployment Script

Create `scripts/deploy-cloudflare.sh`:

```bash
#!/bin/bash

# Deploy CDN SDK to Cloudflare Pages

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/deploy-cloudflare.sh <version>"
  exit 1
fi

echo "🚀 Deploying CDN SDK v${VERSION} to Cloudflare Pages..."

# Install wrangler
npm install -g wrangler

# Create deployment directory
mkdir -p cdn/deploy
cp cdn/dist/sdk.min.js cdn/deploy/sdk.min.js
cp cdn/dist/sdk.esm.js cdn/deploy/sdk.esm.js
cp cdn/dist/sdk.d.ts cdn/deploy/sdk.d.ts

# Create index.html for Pages
cat > cdn/deploy/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>DevUtils SDK CDN</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>DevUtils SDK CDN</h1>
  <p>Use the SDK from:</p>
  <ul>
    <li><code>&lt;script src="https://cdn.devutils.in/sdk.min.js"&gt;&lt;/script&gt;</code></li>
    <li><code>import SDK from 'https://cdn.devutils.in/sdk.esm.js'</code></li>
  </ul>
</body>
</html>
EOF

# Deploy using wrangler
wrangler pages deploy cdn/deploy \
  --project-name devutils-sdk-cdn \
  --branch main

echo "✅ Deployed to Cloudflare Pages!"
echo "📍 URL: https://devutils-sdk-cdn.pages.dev"
```

### GitHub Actions Integration

Update `.github/workflows/release.yml`:

```yaml
- name: Deploy to Cloudflare Pages
  if: github.ref == 'refs/heads/main'
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    npm install -g wrangler
    mkdir -p cdn/deploy
    cp cdn/dist/sdk.min.js cdn/deploy/
    cp cdn/dist/sdk.esm.js cdn/deploy/
    wrangler pages deploy cdn/deploy \
      --project-name devutils-sdk-cdn \
      --branch main
```

## Option 2: Cloudflare R2 (Object Storage)

### Setup

1. **Create R2 Bucket**
   - Go to R2 → Create bucket
   - Name: `devutils-sdk`
   - Leave other settings default

2. **Create API Token**
   - Go to Account Settings → API Tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Permissions:
     - Account.R2: Edit
   - Copy token

3. **Get Account ID**
   - Go to Account Settings
   - Copy Account ID

4. **Add GitHub Secrets**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_R2_BUCKET` (bucket name)

### Deployment Script

Create `scripts/deploy-r2.sh`:

```bash
#!/bin/bash

# Deploy CDN SDK to Cloudflare R2

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/deploy-r2.sh <version>"
  exit 1
fi

echo "🚀 Deploying CDN SDK v${VERSION} to Cloudflare R2..."

# Install wrangler
npm install -g wrangler

# Configure wrangler
cat > wrangler.toml << EOF
name = "devutils-sdk"
type = "javascript"

[env.production]
vars = { ENVIRONMENT = "production" }
EOF

# Upload to R2
wrangler r2 object put \
  devutils-sdk/v${VERSION}/sdk.min.js \
  --file cdn/dist/sdk.min.js \
  --content-type application/javascript

wrangler r2 object put \
  devutils-sdk/latest/sdk.min.js \
  --file cdn/dist/sdk.min.js \
  --content-type application/javascript

wrangler r2 object put \
  devutils-sdk/v${VERSION}/sdk.esm.js \
  --file cdn/dist/sdk.esm.js \
  --content-type application/javascript

wrangler r2 object put \
  devutils-sdk/latest/sdk.esm.js \
  --file cdn/dist/sdk.esm.js \
  --content-type application/javascript

echo "✅ Deployed to Cloudflare R2!"
echo "📍 URLs:"
echo "   https://cdn.devutils.in/v${VERSION}/sdk.min.js"
echo "   https://cdn.devutils.in/latest/sdk.min.js"
```

### GitHub Actions Integration

```yaml
- name: Deploy to Cloudflare R2
  if: github.ref == 'refs/heads/main'
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_R2_BUCKET: ${{ secrets.CLOUDFLARE_R2_BUCKET }}
  run: |
    npm install -g wrangler
    wrangler r2 object put \
      devutils-sdk/v${GITHUB_REF#refs/tags/}/sdk.min.js \
      --file cdn/dist/sdk.min.js
```

## Custom Domain Setup

### Point Domain to Cloudflare

1. **Add Domain to Cloudflare**
   - Go to Websites → Add site
   - Enter your domain
   - Update nameservers at registrar

2. **Configure CNAME**
   - For Pages: Create CNAME pointing to `devutils-sdk-cdn.pages.dev`
   - For R2: Create CNAME pointing to `<account-id>.r2.cloudflarestorage.com`

3. **Enable HTTPS**
   - Cloudflare automatically provides SSL/TLS

### Example: cdn.devutils.in

```
CNAME cdn.devutils.in → devutils-sdk-cdn.pages.dev
```

## Usage

### From CDN

```html
<!-- Minified -->
<script src="https://cdn.devutils.in/sdk.min.js"></script>

<!-- ESM -->
<script type="module">
  import SDK from "https://cdn.devutils.in/sdk.esm.js";
</script>
```

### Versioned URLs

```html
<!-- Specific version -->
<script src="https://cdn.devutils.in/v1.0.0/sdk.min.js"></script>

<!-- Latest -->
<script src="https://cdn.devutils.in/latest/sdk.min.js"></script>
```

## Monitoring

### Cloudflare Analytics

1. Go to Analytics & Logs
2. View:
   - Requests
   - Bandwidth
   - Cache hit ratio
   - Errors

### Performance

- **Cache**: Cloudflare caches globally
- **TTL**: Set to 1 year for versioned files
- **Purge**: Automatic on new deployments

## Troubleshooting

### 401 Unauthorized

- Verify API token is correct
- Check token has R2/Pages permissions
- Regenerate token if needed

### 403 Forbidden

- Verify account ID is correct
- Check bucket name is correct
- Ensure token has write permissions

### Files Not Uploading

```bash
# Debug with verbose output
wrangler r2 object put --help

# Check bucket contents
wrangler r2 object list devutils-sdk
```

## Cost

### Cloudflare Pages

- **Free**: Unlimited deployments, 500 builds/month
- **Pro**: $20/month, unlimited builds

### Cloudflare R2

- **Storage**: $0.015/GB/month
- **Requests**: $0.36/million requests
- **Egress**: Free (no bandwidth charges)

## Comparison

| Feature     | Pages        | R2            |
| ----------- | ------------ | ------------- |
| Cost        | Free         | Pay-as-you-go |
| Setup       | Easy         | Moderate      |
| Performance | Excellent    | Excellent     |
| Scalability | Unlimited    | Unlimited     |
| Best for    | Static files | Large files   |

## Recommendation

**Use Cloudflare Pages** for the CDN SDK because:

- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy deployment
- ✅ Perfect for static JS files

## Next Steps

1. Create Cloudflare account
2. Create Pages project
3. Generate API token
4. Add GitHub secrets
5. Update release workflow
6. Deploy!

---

See [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) for complete release process.
