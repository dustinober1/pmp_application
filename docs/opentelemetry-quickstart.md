# OpenTelemetry Quick Start Guide

Get started with distributed tracing in 5 minutes.

## Installation

### 1. Start Tracing Infrastructure

```bash
# Start OpenTelemetry Collector and Jaeger
docker-compose up -d otel-collector jaeger prometheus grafana

# Verify services are running
docker-compose ps
```

**Access Points:**

- Jaeger UI: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)

### 2. Configure Environment Variables

**For API (`.env`):**

```bash
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=pmp-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_RESOURCE_ATTRIBUTES=service.name=pmp-api,deployment.environment=development
```

**For Web (`.env.local`):**

```bash
# Browser OpenTelemetry
NEXT_PUBLIC_OTEL_SERVICE_NAME=pmp-web
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### 3. Start Your Application

```bash
# Start API with tracing
docker-compose up api

# Start Web with tracing
docker-compose up web
```

## Generate Your First Trace

### Option 1: Automatic (No Code Changes)

Open your browser and navigate to:

```
http://localhost:3000
```

Any API call will automatically generate a trace!

### Option 2: Manual Instrumentation

**API:**

```typescript
// packages/api/src/routes/health.routes.ts
import { withSpan } from '../utils/tracing';

router.get('/api/health', async (req, res) => {
  return withSpan('health.check', async span => {
    span.setAttributes({
      'health.status': 'ok',
      'health.timestamp': Date.now(),
    });

    res.json({ status: 'ok', timestamp: Date.now() });
  });
});
```

**Web:**

```typescript
// packages/web/src/app/page.tsx
'use client';

import { useApiTracer } from '@/lib/opentelemetry-hooks';

export default function HomePage() {
  const { traceApiCall } = useApiTracer();

  const fetchData = async () => {
    await traceApiCall('/api/health', 'GET', async () => {
      return fetch('/api/health').then(r => r.json());
    });
  };

  return (
    <button onClick={fetchData}>Check Health</button>
  );
}
```

## View Your Trace

1. **Open Jaeger:**

   ```
   http://localhost:16686
   ```

2. **Search for Traces:**
   - Service: `pmp-api`
   - Operation: `GET /api/health`
   - Click "Find Traces"

3. **Click on a trace** to see the waterfall view

4. **Explore spans:**
   - Click on each span for details
   - View attributes, events, and timelines
   - See parent-child relationships

## What You Should See

### Trace Structure

```
┌─────────────────────────────────────────────────┐
│ GET /api/health (25ms)                          │
├─────────────────────────────────────────────────┤
│  health.check (20ms)                            │
│  ├── db.healthCheck (15ms)                      │
│  └── cache.get (2ms)                            │
└─────────────────────────────────────────────────┘
```

### Span Details

**Attributes:**

```
http.method: GET
http.route: /api/health
http.status_code: 200
http.url: http://localhost:3001/api/health
health.status: ok
```

**Events:**

```
health.check.started
health.check.completed
```

## Common Use Cases

### 1. Track Database Queries

```typescript
import { withSpan, setDatabaseContext } from '../utils/tracing';

router.get('/api/users/:id', async (req, res) => {
  return withSpan('users.getById', async span => {
    span.setAttribute('user.id', req.params.id);

    const user = await withSpan('users.query', async dbSpan => {
      setDatabaseContext(dbSpan, {
        table: 'User',
        operation: 'findUnique',
      });

      return prisma.user.findUnique({
        where: { id: req.params.id },
      });
    });

    res.json(user);
  });
});
```

### 2. Track External API Calls

```typescript
import { withSpan, setExternalApiContext } from '../utils/tracing';

async function createStripeCheckout(userId: string) {
  return withSpan('stripe.createCheckout', async (span) => {
    setExternalApiContext(span, {
      name: 'Stripe',
      method: 'POST',
      url: 'https://api.stripe.com/v1/checkout/sessions',
    });

    const session = await stripe.checkout.sessions.create({...});

    span.addEvent('checkout.created', {
      session_id: session.id,
      user_id: userId,
    });

    return session;
  });
}
```

### 3. Track Business Operations

```typescript
import { withSpan, setUserContext, setBusinessContext } from '../utils/tracing';

async function processPayment(userId: string, amount: number) {
  return withSpan('payment.process', async span => {
    setBusinessContext(span, {
      feature: 'payment',
      action: 'process',
    });
    setUserContext(span, { id: userId });

    span.setAttributes({
      'payment.amount': amount,
      'payment.currency': 'USD',
    });

    // Processing logic...

    span.addEvent('payment.completed', {
      user_id: userId,
      amount: amount,
    });

    return result;
  });
}
```

## Testing Your Setup

### 1. Verify Collector Connection

```bash
# Check collector health
curl http://localhost:13133/health

# Should return:
# {"status":"ok"}
```

### 2. Send Test Trace

```bash
# API health check
curl http://localhost:3001/api/health

# Should generate trace visible in Jaeger
```

### 3. Check Trace Propagation

```typescript
// Test frontend to backend trace propagation
// Run this in browser console
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log(data));

// Check Jaeger - you should see:
// - Browser span
// - HTTP span to /api/health
// - API handler span
// All linked with same trace ID!
```

## Troubleshooting

### No Traces Appearing

**1. Check services are running:**

```bash
docker-compose ps

# All services should be "Up"
```

**2. Check environment variables:**

```bash
# API
docker-compose exec api env | grep OTEL

# Should show:
# OTEL_SERVICE_NAME=pmp-api
# OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
```

**3. Check collector logs:**

```bash
docker-compose logs -f otel-collector

# Look for errors or connection issues
```

**4. Verify trace export:**

```bash
# Send test request
curl http://localhost:3001/api/health

# Immediately check Jaeger
# http://localhost:16686
# Service: pmp-api
# Operation: GET /api/health
```

### Missing Context in Traces

**Problem:** User ID or other attributes not showing

**Solution:** Ensure you're setting attributes:

```typescript
const span = trace.getActiveSpan();
if (span) {
  span.setAttribute('user.id', userId);
}
```

### Browser Tracing Not Working

**1. Check browser console for errors:**

```javascript
// Should see:
// [OpenTelemetry] Browser tracing initialized
```

**2. Verify environment variables:**

```bash
# Check .env.local
cat packages/web/.env.local

# Should have:
# NEXT_PUBLIC_OTEL_SERVICE_NAME=pmp-web
# NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**3. Check CORS configuration:**

```yaml
# config/otel-collector-config.yaml
receivers:
  otlp/https:
    protocols:
      http:
        cors:
          allowed_origins:
            - http://localhost:3000 # Must match your frontend URL
```

## Next Steps

### 1. Add Custom Spans

Start instrumenting critical paths:

- Authentication flows
- Payment processing
- Search functionality
- Dashboard loading

### 2. Set Up Dashboards

1. **Access Grafana:** http://localhost:3002
2. **Add Jaeger datasource**
3. **Create dashboard** for:
   - Request latency
   - Error rate
   - Throughput
   - Database performance

### 3. Configure Alerts

Set up alerts for:

- P95 latency > 1s
- Error rate > 5%
- Trace spike detection

### 4. Production Setup

For AWS deployment:

```typescript
// Use AWS X-Ray exporter
import { AWSXRayExporter } from '@opentelemetry/exporter-aws-xray';

const traceExporter = new AWSXRayExporter({
  region: 'us-east-1',
});
```

## Useful Commands

```bash
# Start all tracing services
docker-compose up -d otel-collector jaeger prometheus grafana

# Stop tracing services
docker-compose stop otel-collector jaeger prometheus grafana

# View collector logs
docker-compose logs -f otel-collector

# View Jaeger logs
docker-compose logs -f jaeger

# Restart tracing
docker-compose restart otel-collector

# Check trace stats
curl http://localhost:8888/metrics
```

## Resources

- **Full Documentation:** `/docs/opentelemetry-implementation-guide.md`
- **Performance Analysis:** `/docs/opentelemetry-performance-analysis.md`
- **OpenTelemetry Docs:** https://opentelemetry.io/docs/
- **Jaeger Docs:** https://www.jaegertracing.io/docs/

## Getting Help

1. **Check logs:** `docker-compose logs -f otel-collector`
2. **Verify setup:** Run through troubleshooting steps
3. **Test connectivity:** Ensure services can communicate
4. **Check documentation:** See full implementation guide

Happy tracing! 🚀
