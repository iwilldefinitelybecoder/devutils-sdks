# GitHub Secrets Setup

Configure secrets for automated SDK releases.

## Required Secrets

### 1. NPM_TOKEN

For publishing to npm registry.

**Steps:**

1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign in to your account
3. Click profile → Access Tokens
4. Create token with "Publish" permission
5. Copy token

**Add to GitHub:**

1. Go to repository Settings
2. Secrets and variables → Actions
3. New repository secret
4. Name: `NPM_TOKEN`
5. Value: Paste token
6. Click Add secret

### 2. PYPI_API_TOKEN

For publishing to PyPI.

**Steps:**

1. Go to [pypi.org](https://pypi.org)
2. Sign in to your account
3. Account settings → API tokens
4. Create token with "Entire account" scope
5. Copy token

**Add to GitHub:**

1. Go to repository Settings
2. Secrets and variables → Actions
3. New repository secret
4. Name: `PYPI_API_TOKEN`
5. Value: Paste token
6. Click Add secret

### 3. GITHUB_TOKEN

Usually provided automatically by GitHub Actions.

If needed:

1. Go to Settings → Developer settings → Personal access tokens
2. Create token with `repo` and `workflow` scopes
3. Add as `GITHUB_TOKEN` secret

## Optional Secrets

### CLOUDFLARE_API_TOKEN (Optional - for CDN)

For deploying to Cloudflare Pages or R2.

**Steps:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Account Settings → API Tokens
3. Click "Create Token"
4. Use template: "Edit Cloudflare Workers" or create custom
5. Permissions:
   - For Pages: `Account.Workers Scripts: Edit`
   - For R2: `Account.R2: Edit`
6. Copy token

**Add to GitHub:**

1. Go to repository Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: Paste token
5. Click Add secret

**Additional Secrets (if using R2):**

- `CLOUDFLARE_ACCOUNT_ID` - From Account Settings
- `CLOUDFLARE_R2_BUCKET` - Your R2 bucket name

**Recommendation**: Use Cloudflare Pages (free, easiest setup)

See [CLOUDFLARE_CDN.md](./CLOUDFLARE_CDN.md) for complete setup.

### SLACK_WEBHOOK

For release notifications.

**Steps:**

1. Go to Slack workspace settings
2. Create incoming webhook
3. Copy webhook URL
4. Add as `SLACK_WEBHOOK` secret

## Verify Secrets

Check that secrets are configured:

```bash
# List secrets (requires GitHub CLI)
gh secret list --repo iwilldefinitelybecoder/devutils-sdks
```

## Rotate Secrets

Periodically rotate tokens:

1. Generate new token on service (npm, PyPI, etc.)
2. Update GitHub secret
3. Revoke old token

## Troubleshooting

### Release Failed - Invalid Token

- Verify token is correct
- Check token hasn't expired
- Ensure token has correct permissions

### Release Failed - Access Denied

- Verify account has publish permissions
- Check token scope
- Ensure organization settings allow publishing

### Secrets Not Available

- Secrets are only available to workflows in the same repository
- Forks don't have access to secrets
- Use `if: github.repository == 'iwilldefinitelybecoder/devutils-sdks'` to restrict

## Security Best Practices

1. **Use fine-grained tokens** - Limit scope to what's needed
2. **Rotate regularly** - Every 90 days
3. **Monitor usage** - Check token activity logs
4. **Revoke unused tokens** - Clean up old tokens
5. **Never commit secrets** - Use GitHub Secrets, not .env files
6. **Use branch protection** - Require reviews before merge

## Support

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [npm Token Docs](https://docs.npmjs.com/about-access-tokens)
- [PyPI Token Docs](https://pypi.org/help/#apitoken)
