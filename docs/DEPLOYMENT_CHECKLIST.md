# Deployment Checklist - Render

Use this checklist to deploy PMP Study Pro to Render with your custom domain.

## Pre-Deployment (15 minutes)

- [x] Create Render account at https://render.com
- [x] Generate JWT secrets (saved to `.render-secrets.env`)
- [x] Get these API keys from your providers:
  - [x] Stripe Secret Key (saved to `.render-secrets.env`)
  - [x] Stripe Webhook Secret (created via CLI, saved to `.render-secrets.env`)
- [ ] Have pmpstudypro.com domain ready
- [x] Ensure GitHub repo is private and you have access (dustinober1/pmp_application)

## Deployment Steps (30 minutes)

### 1. Connect GitHub

- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Click "Connect a repository"
- [ ] Select your `pmp_application` private repo
- [ ] Authorize GitHub access if prompted

### 2. Let Render Read render.yaml

- [ ] Render will detect `render.yaml` in root
- [ ] Click "Use Render YAML" option
- [ ] Review the services it will create (API, Web) - **Database is on Neon**
- [ ] Click "Create" or "Deploy"

_Render will create 2 services (API + Web). Database is on Neon free tier._

### 3. Set Environment Variables/Secrets

Once services are created:

**For pmp-api service:**

1. Go to Render Dashboard → pmp-api → Environment
2. Add these environment variables from `.render-secrets.env`:
   ```
   DATABASE_URL               (Neon connection string)
   JWT_SECRET                 (paste generated value)
   JWT_REFRESH_SECRET         (paste generated value)
   STRIPE_SECRET_KEY          (from Stripe CLI)
   STRIPE_WEBHOOK_SECRET      (from Stripe CLI)
   ```

**For pmp-web service:**

1. Go to Render Dashboard → pmp-web → Environment
2. No additional secrets required for Stripe (handled server-side)

### 4. Run Database Migrations

Run migrations against Neon database locally:

```bash
# Copy DATABASE_URL from .render-secrets.env
export DATABASE_URL="postgresql://neondb_owner:...@ep-falling-dew-adw5ts7n.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Wait for Services to Build

- [ ] Check Render Dashboard for build progress
- [ ] Wait for both services to show "Live" (pmp-api, pmp-web)
- [ ] Check logs if any service fails:
  - Click service → "Logs" tab
  - Look for error messages

### 6. Test API Health

Once API service is live:

- [ ] Visit `https://pmp-api.onrender.com/api/health`
- [ ] Should return `{"status": "ok"}`
- [ ] If fails, check logs for database connection errors

### 7. Set Up Stripe Webhooks

**Already created via Stripe CLI!**

Webhook endpoint: `https://pmp-api.onrender.com/webhooks/stripe`

- Endpoint ID: `we_1SlahCR7yUfIbM0W5sNeBi40`
- Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Secret: saved in `.render-secrets.env`

Just add `STRIPE_WEBHOOK_SECRET` from `.render-secrets.env` to pmp-api environment in Render.

### 8. Configure Domain

**At your domain registrar (Namecheap, GoDaddy, etc.):**

Add/update these DNS records:

```
Type: CNAME | Name: pmpstudypro.com         | Value: pmp-web.onrender.com
Type: CNAME | Name: www.pmpstudypro.com     | Value: pmp-web.onrender.com
```

Wait 24-48 hours for DNS to propagate.

**In Render Dashboard (pmp-web service):**

1. Go to Settings → Custom Domains
2. Add both:
   - `pmpstudypro.com`
   - `www.pmpstudypro.com`
3. Render will provision SSL certificates automatically
4. Wait for "SSL Certificate Created" status

### 9. Update CORS & API URLs

Once domain is live:

**On pmp-api service (Environment):**

```
CORS_ORIGIN = https://pmpstudypro.com,https://www.pmpstudypro.com
```

**On pmp-web service (Environment):**

```
NEXT_PUBLIC_API_URL = https://pmp-api.onrender.com/api
```

_Note: If you want API on subdomain (api.pmpstudypro.com), that requires additional DNS setup_

### 10. Verify Live Site

- [ ] Visit https://pmpstudypro.com
- [ ] Should see the PMP Study Pro landing page
- [ ] Test login/signup flow
- [ ] Check browser console for API errors

## Post-Deployment

### Set Up Monitoring

- [ ] In Render Dashboard, each service has a "Logs" tab
- [ ] Set up Slack/email alerts in Settings → Notifications
- [ ] Check logs daily for first week

### Recommended Optimizations

- [ ] Enable auto-deploy (should already be enabled)
- [ ] Set up database backups (Render does daily by default)
- [ ] Monitor API response times in Metrics tab

## Troubleshooting

| Problem                        | Solution                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| **Services won't deploy**      | Check logs. Usually missing env vars or database issues.           |
| **API can't reach database**   | Verify `DATABASE_URL` is set in API environment.                   |
| **Domain not working (404)**   | Wait 24-48 hours for DNS propagation. Check Render custom domains. |
| **API returns 500 errors**     | Check pmp-api logs. Usually database migration failed.             |
| **Frontend shows blank page**  | Check browser console. Likely `NEXT_PUBLIC_API_URL` is wrong.      |
| **Stripe webhooks not firing** | Verify webhook endpoint is correct. Check Stripe dashboard logs.   |

## Cost Summary

With `standard` tier (recommended):

| Service               | Cost/Month |
| --------------------- | ---------- |
| PostgreSQL (standard) | ~$15       |
| API Service (0.5 CPU) | ~$7        |
| Web Service (0.5 CPU) | ~$7        |
| **Total**             | **~$29**   |

Free tier has limitations (auto-sleeps, 512MB RAM). Standard tier is recommended for production.

## Important Notes

1. **Auto-Deploy:** Every push to `master` branch auto-deploys
2. **Scaling:** Services auto-scale with traffic
3. **Backups:** PostgreSQL backs up daily automatically
4. **SSL:** HTTPS is automatic with custom domains
5. **Monitoring:** Check logs regularly for errors

## Next Steps

1. Remove Docker completely from local development (optional)
2. Follow `LOCAL_DEVELOPMENT_NATIVE.md` for local setup
3. Celebrate! You're now on Render! 🎉

## Support

- Render Docs: https://render.com/docs
- Email render support for any platform-specific issues
- Check logs first for any deployment issues

---

**Questions?** See `RENDER_DEPLOYMENT.md` for detailed setup information.
