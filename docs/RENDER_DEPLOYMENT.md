# PMP Study Pro - Render Deployment Guide

## Overview

This guide walks you through deploying PMP Study Pro to Render with zero Docker containers. You'll have:

- **PostgreSQL Database** (managed by Render)
- **Express API** (Node.js service on Render)
- **Next.js Frontend** (Node.js service on Render)
- **Custom domain** (pmpstudypro.com)
- **Auto-deploys** from GitHub on every push

## Prerequisites

1. **Render Account** - Sign up at https://render.com
2. **GitHub Access** - Your private repo connected to Render
3. **Domain** - pmpstudypro.com purchased (Namecheap, GoDaddy, etc.)
4. **Secrets** - API keys for Stripe, JWT secrets

## Step 1: Connect GitHub to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select "Connect a repository"
4. Authorize your GitHub account
5. Select your `pmp_application` private repo
6. Click "Connect"

## Step 2: Deploy from render.yaml

Render can auto-deploy from the `render.yaml` file:

1. On the service creation screen, you'll have the option to choose "Use Render YAML"
2. Render will read `render.yaml` from your repo and create all services

**If deploying manually** (first time):

1. In Render dashboard, create the services in this order:
   - PostgreSQL database (pmp-postgres)
   - API service (pmp-api)
   - Web service (pmp-web)

## Step 3: Set Environment Variables & Secrets

### For API Service (pmp-api)

Go to Service Settings → Environment tab. Add these secrets (marked with `scope: secret`):

```
JWT_SECRET                 # Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET         # Generate with: openssl rand -base64 32
STRIPE_SECRET_KEY          # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET      # From Stripe Dashboard (webhook signing secret)
```

**Generate JWT secrets:**

```bash
openssl rand -base64 32
```

Copy this output for both `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### For Web Service (pmp-web)

No additional environment secrets required for Stripe (all payment processing is handled server-side).

### Database Setup

Render's `render.yaml` automatically:

- Creates PostgreSQL instance
- Generates a strong password
- Provides `DATABASE_URL` automatically

The API service automatically gets `DATABASE_URL` through `fromDatabase` property in render.yaml.

## Step 4: Run Database Migrations

After deployment, connect to your Render PostgreSQL instance and run migrations:

1. In Render Dashboard, click on `pmp-postgres` service
2. Click "Connect" and note the connection string
3. Locally, set your `DATABASE_URL`:

   ```bash
   export DATABASE_URL="your-render-connection-string"
   ```

4. Run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

Or, add a build step in `pmp-api` service that runs automatically:

```yaml
buildCommand: npm install && npm run db:generate && npm run db:migrate && npm run db:seed
```

## Step 5: Configure Domain (pmpstudypro.com)

### 1. Point Domain to Render

In your domain registrar (Namecheap, GoDaddy, etc.):

1. Go to DNS settings
2. Create these DNS records:

```
Type: CNAME
Name: pmpstudypro.com
Value: pmp-web.onrender.com

Type: CNAME
Name: www.pmpstudypro.com
Value: pmp-web.onrender.com
```

Wait 24-48 hours for DNS propagation.

### 2. Update Render Settings

In Render Dashboard:

1. Select `pmp-web` service
2. Go to Settings → Custom Domains
3. Add:
   - `pmpstudypro.com`
   - `www.pmpstudypro.com`

4. Render will auto-provision SSL/HTTPS certificates

### 3. Update Environment Variables

After domain is live, update these variables:

**On pmp-api service:**

```
CORS_ORIGIN = https://pmpstudypro.com,https://www.pmpstudypro.com
```

**On pmp-web service:**

```
NEXT_PUBLIC_API_URL = https://pmp-api.onrender.com/api
```

## Step 6: Set Up Stripe Webhooks

Your Stripe integration needs webhooks for payment events:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL:
   ```
   https://pmp-api.onrender.com/webhooks/stripe
   ```
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

5. Copy the signing secret
6. In Render Dashboard (pmp-api service settings):
   - Add `STRIPE_WEBHOOK_SECRET` with the signing secret

## Step 7: Verify Deployment

Check your services are healthy:

1. **API Health:** https://pmp-api.onrender.com/api/health
2. **Web Frontend:** https://pmpstudypro.com
3. **Check Render logs:**
   ```bash
   # In Render Dashboard, click each service → Logs tab
   ```

## Local Development (No Docker)

For local dev, you have two options:

### Option A: Use Render Database Remotely

```bash
# Get connection string from Render Dashboard (pmp-postgres service)
export DATABASE_URL="postgresql://..."

# Run locally
npm run dev
```

### Option B: Local PostgreSQL

Install PostgreSQL locally:

```bash
# macOS with Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb pmp_study

# Run migrations
npm run db:generate
npm run db:migrate
npm run db:seed

# Dev mode
npm run dev
```

The app will run on:

- Frontend: http://localhost:3000
- API: http://localhost:3001

## Monitoring & Logs

**Render Dashboard:**

- Each service has a "Logs" tab for real-time logs
- View memory/CPU usage in "Metrics"
- Set up alerts in Settings → Notifications

**Best practices:**

- Check logs after deployment
- Monitor API response times
- Set up error notifications in Render

## Cost Estimate

**Standard tier (recommended):**

- PostgreSQL: ~$15/month (includes 1 GB RAM, auto-backups)
- API Service: ~$7/month (0.5 CPU, 512 MB RAM, 100 GB bandwidth free)
- Web Service: ~$7/month (0.5 CPU, 512 MB RAM, 100 GB bandwidth free)

**Total: ~$29/month**

Use `standard` tier for reliability. Free tier has limitations (auto-sleeps after 15 minutes).

## Troubleshooting

### Database Connection Fails

```bash
# Test connection locally
psql $DATABASE_URL
```

### API Service Won't Start

1. Check Render logs for errors
2. Ensure database migrations ran
3. Verify environment variables are set (especially `DATABASE_URL`)

### Frontend Can't Reach API

1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify `CORS_ORIGIN` on API service includes your domain
3. Check API service health: https://pmp-api.onrender.com/api/health

### Domain Not Working

1. DNS propagation can take 24-48 hours
2. In Render, verify custom domains are added to `pmp-web` service
3. Check SSL certificate status (Render Dashboard → Service Settings → Custom Domains)

## Auto-Deployments

Every push to your GitHub repo `master` branch automatically:

1. Triggers a build on Render
2. Builds shared package, then API & Web services
3. Runs health checks
4. Deploys if healthy

To disable auto-deploy: Render Dashboard → Service → Settings → Auto-Deploy

## Next Steps

1. **Update CLAUDE.md** with Render-specific notes
2. **Remove Docker** from local development (optional)
3. **Set up monitoring** via Render alerts
4. **Backup strategy** - Render has automatic daily backups for Standard tier

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [render.yaml Spec](https://render.com/docs/infrastructure-as-code)
- [Node.js on Render](https://render.com/docs/deploy-node-express)
- [Next.js on Render](https://render.com/docs/deploy-next)
