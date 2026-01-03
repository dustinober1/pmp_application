# GDPR/CCPA Implementation Guide

## Quick Start

This guide explains how to set up and use the GDPR/CCPA compliance features.

---

## Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

**Required Environment Variables:**

```bash
# Admin emails for admin dashboard access
ADMIN_EMAILS=admin@example.com,*@company.com

# Database URL
DATABASE_URL=postgresql://user:password@localhost:5432/pmp_db

# JWT secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

---

## Database Setup

### 1. Generate Prisma Migration

```bash
cd packages/api
npx prisma migrate dev --name add-gdpr-ccpa-tables
```

### 2. Run Migration

```bash
npx prisma migrate deploy
```

### 3. Verify Tables

```bash
npx prisma studio
```

**Expected Tables:**

- `privacy_consent`
- `data_export_requests`
- `account_deletion_requests`
- `privacy_audit_logs`

---

## API Routes

### User-Facing Endpoints

#### Consent Management

```bash
# Get consent status
GET /api/privacy/consent

# Update consent
PUT /api/privacy/consent
{
  "cookieConsent": true,
  "privacyPolicyAccepted": true,
  "termsAccepted": true
}

# Withdraw consent
POST /api/privacy/consent/withdraw
{
  "reason": "No longer want tracking"
}
```

#### Data Export

```bash
# Request data export
POST /api/privacy/data-export
{
  "includePaymentHistory": true,
  "includeActivityLogs": true,
  "emailMe": false
}

# Get export history
GET /api/privacy/data-export

# Get export status
GET /api/privacy/data-export/:requestId

# Download export
GET /api/privacy/data-export/:requestId/download
```

#### Account Deletion

```bash
# Request account deletion
POST /api/privacy/delete-account
{
  "confirmPassword": "current-password",
  "reason": "Closing account"
}

# Get deletion status
GET /api/privacy/delete-account

# Cancel deletion
POST /api/privacy/delete-account/cancel
{
  "requestId": "deletion-uuid"
}
```

### Admin Endpoints

All admin endpoints require admin privileges (email in `ADMIN_EMAILS`).

```bash
# Get compliance dashboard
GET /api/admin/privacy/dashboard

# Get all export requests
GET /api/admin/privacy/exports?status=pending&limit=20

# Process export manually
POST /api/admin/privacy/exports/process
{
  "requestId": "export-uuid"
}

# Get all deletion requests
GET /api/admin/privacy/deletions?status=pending

# Process deletion
POST /api/admin/privacy/deletions/process
{
  "requestId": "deletion-uuid",
  "force": false
}

# Get audit logs
GET /api/admin/privacy/audit-logs?limit=50

# Get user compliance summary
GET /api/admin/privacy/users/:userId

# Process pending deletions (cron)
POST /api/admin/privacy/process-pending
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test consent.service.test.ts
npm test data-export.service.test.ts
npm test account-deletion.service.test.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Test privacy routes
npm test privacy.routes.test.ts

# Test API endpoints
curl -X GET http://localhost:3000/api/privacy/consent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Manual Testing

```bash
# 1. Request data export
curl -X POST http://localhost:3000/api/privacy/data-export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"includePaymentHistory": true}'

# 2. Request account deletion
curl -X POST http://localhost:3000/api/privacy/delete-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"confirmPassword": "your-password", "reason": "Test"}'

# 3. Get admin dashboard
curl -X GET http://localhost:3000/api/admin/privacy/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Background Jobs

### Process Pending Deletions

Set up a cron job to process pending deletions daily:

```bash
# Add to crontab
0 2 * * * curl -X POST http://localhost:3000/api/admin/privacy/process-pending \
  -H "Authorization: Bearer CRON_JWT_TOKEN"
```

**Or use node-cron:**

```typescript
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const { accountDeletionService } = await import('./services');
  const result = await accountDeletionService.processPendingDeletions();
  console.log(`Processed ${result.processed} deletions`);
});
```

### Cleanup Expired Exports

```typescript
// Run daily
cron.schedule('0 3 * * *', async () => {
  const prisma = await import('./config/database');
  const deleted = await prisma.default.dataExportRequest.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  console.log(`Deleted ${deleted.count} expired exports`);
});
```

---

## Monitoring

### Audit Logs

Monitor all privacy-related actions:

```typescript
// Get recent activity
const logs = await prisma.privacyAuditLog.findMany({
  orderBy: { createdAt: 'desc' },
  take: 100,
});

// Filter by action type
const exportLogs = await prisma.privacyAuditLog.findMany({
  where: { actionType: 'data_export' },
});

// Filter by date range
const todayLogs = await prisma.privacyAuditLog.findMany({
  where: {
    createdAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  },
});
```

### Metrics

Track key compliance metrics:

```typescript
// Export statistics
const totalExports = await prisma.dataExportRequest.count();
const pendingExports = await prisma.dataExportRequest.count({
  where: { status: 'pending' },
});
const avgProcessingTime = await getAverageProcessingTime();

// Deletion statistics
const totalDeletions = await prisma.accountDeletionRequest.count();
const inGracePeriod = await prisma.accountDeletionRequest.count({
  where: {
    status: 'pending',
    gracePeriodEnds: { gt: new Date() },
  },
});
```

---

## Email Templates

### Data Export Request Confirmation

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      .button {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Data Export Request Confirmation</h1>
      <p>Your data export has been requested.</p>
      <p><strong>Request ID:</strong> {{requestId}}</p>
      <p><strong>Expires:</strong> {{expiresAt}}</p>
      <p>We will notify you when your export is ready for download.</p>
      <p>This link will expire in 7 days.</p>
    </div>
  </body>
</html>
```

### Export Ready Notification

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="container">
      <h1>Your Data Export is Ready</h1>
      <p>Your personal data export is now available for download.</p>
      <a href="{{downloadUrl}}" class="button">Download Export</a>
      <p><strong>Expires:</strong> {{expiresAt}}</p>
      <p>Please download your data before the link expires.</p>
    </div>
  </body>
</html>
```

### Account Deletion Request

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="container">
      <h1>Account Deletion Requested</h1>
      <p>Your account deletion request has been received.</p>
      <p><strong>Request ID:</strong> {{requestId}}</p>
      <p><strong>Grace Period Ends:</strong> {{gracePeriodEnds}}</p>
      <p>Your account will be permanently deleted after 30 days.</p>
      <p>To cancel this request, <a href="{{cancelUrl}}">click here</a>.</p>
      <p>If you did not request this deletion, please contact us immediately.</p>
    </div>
  </body>
</html>
```

---

## Configuration

### Rate Limiting

Adjust rate limits in route handlers:

```typescript
const privacyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Retention Periods

Configure in services:

```typescript
// Data Export Service
const EXPORT_RETENTION_DAYS = 7;
const RATE_LIMIT_HOURS = 24;

// Account Deletion Service
const GRACE_PERIOD_DAYS = 30;
const LEGAL_RETENTION_YEARS = 7;
```

### Admin Access

Configure admin emails:

```bash
# .env
ADMIN_EMAILS=admin@example.com,privacy@company.com,*@admin.example.com
```

---

## Troubleshooting

### Export Failed

**Issue:** Export status shows "failed"

**Solution:**

1. Check error message: `GET /api/privacy/data-export/:requestId`
2. Verify database connection
3. Check background job logs
4. Retry: `POST /api/admin/privacy/exports/process`

### Deletion Stuck

**Issue:** Deletion status stuck in "pending"

**Solution:**

1. Run cron job: `POST /api/admin/privacy/process-pending`
2. Manually process: `POST /api/admin/privacy/deletions/process`
3. Check grace period end date

### Rate Limit Exceeded

**Issue:** "Too many requests" error

**Solution:**

1. Wait for rate limit window to expire
2. Admin can bypass: Use admin endpoints
3. Adjust rate limit in code if needed

### Admin Access Denied

**Issue:** "Admin access required" error

**Solution:**

1. Add email to `ADMIN_EMAILS` in `.env`
2. Restart server
3. Clear JWT and login again

---

## Production Checklist

### Before Launch

- [ ] Run database migrations
- [ ] Configure admin emails
- [ ] Set up cron jobs
- [ ] Configure email service
- [ ] Test all endpoints
- [ ] Review audit logs
- [ ] Set up monitoring alerts

### Post-Launch

- [ ] Monitor export requests daily
- [ ] Process pending deletions daily
- [ ] Review audit logs weekly
- [ ] Update compliance documentation quarterly
- [ ] Conduct security audit annually

### Legal Review

- [ ] Legal review of privacy policy
- [ ] GDPR representative appointed (if required)
- [ ] CCPA "Do Not Sell" link added
- [ ] Cookie consent banner reviewed
- [ ] Data processing agreements signed

---

## Support

### Documentation

- API Docs: `/docs/api/privacy-api.md`
- Compliance: `/docs/compliance/gdpr-ccpa-compliance.md`
- This Guide: `/docs/compliance/IMPLEMENTATION_GUIDE.md`

### Contact

- Email: privacy@pmpstudy.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

## Example Implementation Sequence

```bash
# 1. Set up database
npx prisma migrate dev

# 2. Run tests
npm test

# 3. Start server
npm run dev

# 4. Test consent flow
curl -X PUT http://localhost:3000/api/privacy/consent \
  -H "Content-Type: application/json" \
  -d '{"cookieConsent": true, "privacyPolicyAccepted": true, "termsAccepted": true}'

# 5. Test data export
curl -X POST http://localhost:3000/api/privacy/data-export \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. Test account deletion
curl -X POST http://localhost:3000/api/privacy/delete-account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"confirmPassword": "password"}'

# 7. Check admin dashboard
curl -X GET http://localhost:3000/api/admin/privacy/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

**Last Updated:** January 1, 2026
**Version:** 1.0
