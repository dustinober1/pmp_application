# OpenTelemetry Distributed Tracing Implementation Guide

## Overview

This guide covers the OpenTelemetry distributed tracing implementation for the PMP Study Application, providing full visibility from the frontend through the API to the database and external services.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ Next.js Web │────▶│  API Server │
│  (Tracing)  │     │  (Tracing)   │     │  (Tracing)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                                          ┌──────────┐
                                          │ Database │
                                          │   Redis  │
                                          │  Stripe  │
                                          └─────┬────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  OTLP Collector       │
                                    │  (otel-collector)     │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Jaeger / AWS X-Ray    │
                                    │  (Trace Backend)      │
                                    └───────────────────────┘
```

## Components

### 1. API Instrumentation (`packages/api`)

**Files:**
- `/packages/api/src/config/opentelemetry.ts` - OpenTelemetry SDK configuration
- `/packages/api/src/utils/tracing.ts` - Tracing utilities and helpers
- `/packages/api/src/services/stripe.service.traced.ts` - Example of manual instrumentation

**Automatic Instrumentation:**
- HTTP/HTTPS requests (Express)
- PostgreSQL queries (Prisma/pg)
- Redis operations (ioredis)
- External API calls (Stripe)

**Manual Spans:**
```typescript
import { withSpan, setExternalApiContext, setUserContext } from '../utils/tracing';

async function createUser(userId: string, data: UserData) {
  return withSpan('service.createUser', async (span) => {
    // Add user context
    setUserContext(span, { id: userId });

    // Business logic
    const user = await prisma.user.create({ ... });

    // Add event
    span.addEvent('user.created', { user_id: userId });

    return user;
  });
}
```

### 2. Web Instrumentation (`packages/web`)

**Files:**
- `/packages/web/src/lib/opentelemetry.ts` - Browser tracing configuration
- `/packages/web/src/lib/opentelemetry-provider.tsx` - React provider
- `/packages/web/src/lib/opentelemetry-hooks.ts` - React hooks

**Automatic Instrumentation:**
- Fetch API calls
- XMLHttpRequest calls
- User interactions (click, submit, change)

**Usage in Components:**
```typescript
import { OpenTelemetryProvider } from '@/lib/opentelemetry-provider';
import { useApiTracer, useInteractionTracker } from '@/lib/opentelemetry-hooks';

function MyComponent() {
  const { traceApiCall } = useApiTracer();
  const { trackClick } = useInteractionTracker();

  const handleClick = async () => {
    trackClick('submit-button', 'button');

    await traceApiCall('/api/users', 'POST', async () => {
      return fetch('/api/users', { method: 'POST', ... });
    });
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### 3. Trace Propagation

Traces are automatically propagated using W3C Trace Context headers:
- `traceparent` - Contains trace ID, span ID, and trace flags
- `tracestate` - Vendor-specific trace data

**Frontend sends:**
```javascript
fetch('/api/users', {
  headers: {
    'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
  }
});
```

**API receives and extracts:**
```typescript
// Automatic via OpenTelemetry instrumentation
const span = trace.getActiveSpan();
const traceId = span.spanContext().traceId;
```

## Environment Variables

### API (`.env`)
```bash
# Service identification
OTEL_SERVICE_NAME=pmp-api
OTEL_SERVICE_VERSION=1.0.0

# Exporter configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_PROTOCOL=grpc

# Resource attributes
OTEL_RESOURCE_ATTRIBUTES=service.name=pmp-api,deployment.environment=development

# Sampling (optional)
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.3
```

### Web (`.env.local`)
```bash
# Browser tracing
NEXT_PUBLIC_OTEL_SERVICE_NAME=pmp-web
NEXT_PUBLIC_OTEL_SERVICE_VERSION=1.0.0
NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

## Manual Span Creation

### API - Creating Spans

```typescript
import {
  withSpan,
  createSpan,
  setUserContext,
  setDatabaseContext,
  setExternalApiContext,
  setBusinessContext,
  addEvent,
  recordError
} from '../utils/tracing';

// Method 1: Using withSpan (auto-start and end)
async function processPayment(userId: string, amount: number) {
  return withSpan('payment.process', async (span) => {
    // Set context
    setBusinessContext(span, {
      feature: 'payment',
      action: 'process',
    });
    setUserContext(span, { id: userId });

    // Database operation with nested span
    const payment = await withSpan('payment.createRecord', async (dbSpan) => {
      setDatabaseContext(dbSpan, {
        table: 'Payment',
        operation: 'create',
      });
      return prisma.payment.create({ ... });
    });

    // External API call
    await withSpan('payment.stripeCharge', async (apiSpan) => {
      setExternalApiContext(apiSpan, {
        name: 'Stripe',
        method: 'POST',
        url: 'https://api.stripe.com/v1/charges',
      });
      return stripe.charges.create({ ... });
    });

    addEvent('payment.completed', { payment_id: payment.id });
    return payment;
  });
}

// Method 2: Manual span control
function longRunningOperation() {
  const span = createSpan('operation.longRunning');
  try {
    // Do work
    span.addEvent('operation.started');
    // ...
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    recordError(error as Error, {
      'operation.type': 'long_running',
    });
    throw error;
  } finally {
    span.end();
  }
}
```

### Web - Creating Spans

```typescript
import {
  withSpan,
  setUserContext,
  setPageContext,
  addEvent,
  recordError
} from '@/lib/opentelemetry';

// Track page navigation
function trackPageView(path: string) {
  withSpan(`page.view:${path}`, (span) => {
    setPageContext({
      path,
      title: document.title,
      referrer: document.referrer,
    });
  });
}

// Track user action
async function handleFormSubmit(formData: FormData) {
  return withSpan('form.submit:login', async (span) => {
    span.setAttributes({
      'form.name': 'login',
      'form.fields_count': Object.keys(formData).length,
    });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      addEvent('form.submitted', { success: response.ok });
      return response;
    } catch (error) {
      recordError(error as Error, { 'form.name': 'login' });
      throw error;
    }
  });
}
```

## Adding Spans to Existing Code

### Example: Instrumenting a Service

**Before:**
```typescript
export class UserService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }
}
```

**After:**
```typescript
import { withSpan, setDatabaseContext } from '../utils/tracing';

export class UserService {
  async getUserById(id: string) {
    return withSpan('user.getById', async (span) => {
      span.setAttribute('user.id', id);

      const user = await withSpan('user.getById.query', async (dbSpan) => {
        setDatabaseContext(dbSpan, {
          table: 'User',
          operation: 'findUnique',
        });

        return prisma.user.findUnique({
          where: { id },
        });
      });

      if (user) {
        span.addEvent('user.found', { user_id: id });
      } else {
        span.addEvent('user.not_found', { user_id: id });
      }

      return user;
    });
  }
}
```

### Example: Instrumenting a Route Handler

**Before:**
```typescript
router.get('/users/:id', async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json(user);
});
```

**After:**
```typescript
router.get('/users/:id', async (req, res) => {
  return withSpan('route.getUser', async (span) => {
    span.setAttributes({
      'http.route': '/users/:id',
      'user.id': req.params.id,
    });

    try {
      const user = await userService.getById(req.params.id);
      span.addEvent('user.retrieved', { user_id: req.params.id });
      res.json(user);
    } catch (error) {
      recordError(error as Error, {
        'route': '/users/:id',
        'user.id': req.params.id,
      });
      throw error;
    }
  });
});
```

## Best Practices

### 1. Span Naming
- **Use dot notation**: `service.method.action`
- **Be specific**: `payment.process` instead of `payment`
- **Use lowercase**: `stripe.createCheckoutSession`

**Good:**
```typescript
withSpan('user.create', ...)
withSpan('stripe.charge.create', ...)
withSpan('database.query.user.findByEmail', ...)
```

**Bad:**
```typescript
withSpan('doWork', ...)
withSpan('function1', ...)
withSpan('Stripe API Call', ...)
```

### 2. Attributes
- **Use semantic conventions**: Follow [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/)
- **Be consistent**: Use the same attribute names across services
- **Add business context**: Include feature names, action types

**Required attributes:**
```typescript
// HTTP
'http.method', 'http.route', 'http.status_code', 'http.url'

// Database
'db.system', 'db.name', 'db.table', 'db.operation', 'db.statement'

// User
'user.id', 'user.email', 'user.tier'

// Errors
'error.type', 'error.message'
```

### 3. Events
- **Mark important moments**: `user.created`, `payment.completed`
- **Use descriptive names**: `cache.hit`, `cache.miss`
- **Include attributes**: `event.name: { key: value }`

### 4. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  recordError(error as Error, {
    'operation.name': ' createUser',
    'operation.phase': 'database',
  });
  throw error;
}
```

## Sampling Strategy

The current implementation uses a tiered sampling strategy:

**Development (100%):**
```typescript
if (DEPLOYMENT_ENVIRONMENT === 'development') {
  return true; // Sample everything
}
```

**Production:**
```typescript
// Critical paths - 100%
if (route.includes('/api/stripe') || route.includes('/api/subscriptions')) {
  return true;
}

// Health checks - 10%
if (route.includes('/api/health')) {
  return Math.random() < 0.1;
}

// Default - 30%
return Math.random() < 0.3;
```

## Viewing Traces

### Local Development (Jaeger)

1. Start the tracing stack:
```bash
docker-compose up -d otel-collector jaeger prometheus grafana
```

2. Start your application:
```bash
docker-compose up api web
```

3. Access Jaeger UI:
```
http://localhost:16686
```

4. Search for traces:
- Select service: `pmp-api` or `pmp-web`
- Choose operation: (e.g., `POST /api/users`)
- Click "Find Traces"

### Production (AWS X-Ray)

**Setup:**
```typescript
// In packages/api/src/config/opentelemetry.ts
import { AWSXRayExporter } from '@opentelemetry/exporter-aws-xray';

const traceExporter = new AWSXRayExporter({
  region: 'us-east-1',
});
```

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords"
    ],
    "Resource": "*"
  }]
}
```

### Monitoring with Grafana

1. Access Grafana:
```
http://localhost:3002
```

2. Login with:
- Username: `admin`
- Password: `admin`

3. Explore:
- Dashboards → Trace Analysis
- Explore → Select Jaeger datasource
- Search by trace ID or service

## Troubleshooting

### No Traces Appearing

1. **Check Collector Health:**
```bash
curl http://localhost:13133/health
```

2. **Check Collector Logs:**
```bash
docker-compose logs -f otel-collector
```

3. **Verify Environment Variables:**
```bash
# API
echo $OTEL_EXPORTER_OTLP_ENDPOINT
echo $OTEL_SERVICE_NAME

# Web
echo $NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT
```

4. **Test Trace Export:**
```bash
# Send test trace
curl -X POST http://localhost:4318/v1/traces \
  -H 'Content-Type: application/json' \
  -d '{"resourceSpans":[]}'
```

### Missing Context in Traces

**Problem:** User ID not appearing in traces

**Solution:** Ensure context is set in middleware:
```typescript
// middleware/auth.middleware.ts
export async function authMiddleware(req, res, next) {
  const user = await getUser(req);
  if (user) {
    const span = getActiveSpan();
    span?.setAttributes({
      'user.id': user.id,
      'user.email': user.email,
      'user.tier': user.tier,
    });
  }
  next();
}
```

### High Memory Usage

**Problem:** Collector using too much memory

**Solution:** Adjust batch configuration:
```yaml
# config/otel-collector-config.yaml
processors:
  batch:
    timeout: 10s  # Increase from 5s
    send_batch_size: 5000  # Decrease from 10000
```

## Performance Impact

### Overhead Analysis

**Automatic Instrumentation:**
- HTTP: ~1-2% overhead
- Database: ~2-3% overhead
- Total API impact: ~3-5%

**Manual Spans:**
- Negligible (<0.1%)
- Only adds metadata
- No significant performance impact

**Best Practices:**
1. Use sampling in production
2. Avoid creating too many spans
3. Don't span tight loops
4. Use events instead of spans for high-frequency operations

### Optimization Tips

```typescript
// BAD - Spans in tight loop
for (let i = 0; i < 1000; i++) {
  withSpan('process.item', async () => processItem(i));
}

// GOOD - Single span with event
withSpan('process.items', async (span) => {
  for (let i = 0; i < 1000; i++) {
    await processItem(i);
  }
  span.addEvent('items.processed', { count: 1000 });
});
```

## Next Steps

1. **Enable Tracing in Production:**
   - Configure AWS X-Ray exporter
   - Set appropriate sampling rates
   - Add IAM permissions

2. **Create Dashboards:**
   - Build Grafana dashboards for trace analysis
   - Set up alerts for high error rates
   - Monitor trace latency percentiles

3. **Analyze Performance:**
   - Identify slow database queries
   - Find N+1 query problems
   - Detect external API delays
   - Track business metrics

4. **Continuous Improvement:**
   - Review traces regularly
   - Add instrumentation to bottlenecks
   - Optimize based on trace insights
   - Share findings with team

## Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [Semantic Conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [AWS X-Ray](https://docs.aws.amazon.com/xray/)
