# Deployment Checklist - Render

Use this checklist to deploy PMP Study Pro to Render with your custom domain.

## Pre-Deployment (15 minutes)

- [ ] Create Render account at https://render.com
- [ ] Generate JWT secrets:
  ```bash
  openssl rand -base64 32  # Copy output for JWT_SECRET
  openssl rand -base64 32  # Copy output for JWT_REFRESH_SECRET
  ```
- [ ] Get these API keys from your providers:
  - [ ] Stripe Secret Key (`sk_test_...` or `sk_live_...`)
  - [ ] Stripe Webhook Secret (`whsec_...`)
  - [ ] PayPal Client ID (sandbox or live)
  - [ ] PayPal Client Secret
- [ ] Have pmpstudypro.com domain ready
- [ ] Ensure GitHub repo is private and you have access

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
- [ ] Review the services it will create (PostgreSQL, API, Web)
- [ ] Click "Create" or "Deploy"

*Render will create all three services automatically from render.yaml*

### 3. Set Environment Variables/Secrets

Once services are created:

**For pmp-api service:**
1. Go to Render Dashboard → pmp-api → Environment
2. Add these environment variables:
   ```
   JWT_SECRET                 (paste generated value)
   JWT_REFRESH_SECRET         (paste generated value)
   STRIPE_SECRET_KEY          (from Stripe Dashboard)
   STRIPE_WEBHOOK_SECRET      (from Stripe Dashboard)
   PAYPAL_CLIENT_ID           (from PayPal)
   PAYPAL_CLIENT_SECRET       (from PayPal)
   ```

**For pmp-web service:**
1. Go to Render Dashboard → pmp-web → Environment
2. Add:
   ```
   NEXT_PUBLIC_PAYPAL_CLIENT_ID    (same as API service)
   ```

### 4. Run Database Migrations

The API service's `buildCommand` in render.yaml should handle migrations, but if needed:

1. Get PostgreSQL connection string from Render dashboard (pmp-postgres service)
2. Locally, run:
   ```bash
   export DATABASE_URL="postgresql://..."
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

### 5. Wait for Services to Build

- [ ] Check Render Dashboard for build progress
- [ ] Wait for all three services to show "Live"
- [ ] Check logs if any service fails:
  - Click service → "Logs" tab
  - Look for error messages

### 6. Test API Health

Once API service is live:
- [ ] Visit `https://pmp-api.onrender.com/api/health`
- [ ] Should return `{"status": "ok"}`
- [ ] If fails, check logs for database connection errors

### 7. Set Up Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint: `https://pmp-api.onrender.com/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy the signing secret (Whsec_...)
6. In Render (pmp-api service):
   - Add `STRIPE_WEBHOOK_SECRET` with the copied value

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

*Note: If you want API on subdomain (api.pmpstudypro.com), that requires additional DNS setup*

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

| Problem | Solution |
|---------|----------|
| **Services won't deploy** | Check logs. Usually missing env vars or database issues. |
| **API can't reach database** | Verify `DATABASE_URL` is set in API environment. |
| **Domain not working (404)** | Wait 24-48 hours for DNS propagation. Check Render custom domains. |
| **API returns 500 errors** | Check pmp-api logs. Usually database migration failed. |
| **Frontend shows blank page** | Check browser console. Likely `NEXT_PUBLIC_API_URL` is wrong. |
| **Stripe webhooks not firing** | Verify webhook endpoint is correct. Check Stripe dashboard logs. |

## Cost Summary

With `standard` tier (recommended):

| Service | Cost/Month |
|---------|-----------|
| PostgreSQL (standard) | ~$15 |
| API Service (0.5 CPU) | ~$7 |
| Web Service (0.5 CPU) | ~$7 |
| **Total** | **~$29** |

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
