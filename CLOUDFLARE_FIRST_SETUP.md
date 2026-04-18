# Cloudflare Pages First-Time Setup

The first Cloudflare Pages deployment requires manual project creation. After that, deployments are automatic.

## Step 1: Create Cloudflare Pages Project

1. Go to https://dash.cloudflare.com/
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Pages"** tab
4. Click **"Create application"**
5. Select **"Upload assets"** (not "Connect to Git")
6. Project name: `devutils-sdk-cdn`
7. Click **"Create project"**

## Step 2: Upload Initial Files

1. Drag and drop the files from `cdn/deploy/` into the upload area:
   - `sdk.min.js`
   - `sdk.esm.js`
   - `index.html`

2. Click **"Deploy site"**

## Step 3: Verify Deployment

1. Go to https://devutils-sdk-cdn.pages.dev
2. You should see the landing page
3. Test the SDK files are accessible

## Step 4: Future Deployments

After the project is created, all future deployments are automatic via GitHub Actions. Just push to `main` and the workflow will deploy to Cloudflare Pages.

## Custom Domain (Optional)

To use `cdn.js.deliver.devutils.in`:

1. In Cloudflare Pages project settings
2. Click **"Custom domains"**
3. Add `cdn.js.deliver.devutils.in`
4. Update DNS CNAME record at your registrar to point to `devutils-sdk-cdn.pages.dev`

---

**Status**: Manual setup required for first deployment only
