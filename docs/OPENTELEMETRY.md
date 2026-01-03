# OpenTelemetry Distributed Tracing Documentation

Complete distributed tracing implementation for the PMP Study Application with full visibility from frontend through API to database and external services.

## Quick Links

- [Quick Start Guide](./opentelemetry-quickstart.md) - Get started in 5 minutes
- [Implementation Guide](./opentelemetry-implementation-guide.md) - Complete implementation details
- [Performance Analysis](./opentelemetry-performance-analysis.md) - Optimize with traces
- [AWS X-Ray Setup](./opentelemetry-aws-xray.md) - Production deployment guide

## Overview

This implementation provides:

### Automatic Instrumentation

- HTTP/HTTPS requests (Express, Next.js)
- PostgreSQL queries (Prisma/pg driver)
- Redis operations (ioredis)
- Stripe API calls
- Browser fetch/XMLHttpRequest

### Manual Instrumentation

- Custom business logic spans
- External API calls
- Database operations
- User interactions

### Trace Backends

- **Local Development:** Jaeger (http://localhost:16686)
- **Production:** AWS X-Ray
- **Metrics:** Prometheus + Grafana

## Getting Started

### 1. Start Local Tracing

```bash
# Start tracing infrastructure
docker-compose up -d otel-collector jaeger prometheus grafana

# Verify services
docker-compose ps

# Access tools
# Jaeger: http://localhost:16686
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3002
```

### 2. Start Application

```bash
# Start API with tracing
docker-compose up api

# Start Web with tracing
docker-compose up web
```

### 3. Generate Traces

Open your browser to http://localhost:3000 and use the application. All requests are automatically traced!

### 4. View Traces

Go to http://localhost:16686, select service `pmp-api` or `pmp-web`, and click "Find Traces".

## Key Files

### API (`packages/api`)

```
src/
├── config/
│   └── opentelemetry.ts          # OpenTelemetry SDK config
├── utils/
│   └── tracing.ts                # Tracing utilities & helpers
└── services/
    ├── stripe.service.ts         # Original service
    └── stripe.service.traced.ts  # Instrumented example
```

### Web (`packages/web`)

```
src/lib/
├── opentelemetry.ts              # Browser tracing config
├── opentelemetry-provider.tsx    # React provider
└── opentelemetry-hooks.ts        # React hooks
```

## Usage Examples

### API - Manual Span

```typescript
import { withSpan, setUserContext, setDatabaseContext } from '../utils/tracing';

async function createUser(userId: string, data: UserData) {
  return withSpan('user.create', async span => {
    setUserContext(span, { id: userId });

    const user = await withSpan('user.create.db', async dbSpan => {
      setDatabaseContext(dbSpan, {
        table: 'User',
        operation: 'create',
      });
      return prisma.user.create({ data });
    });

    span.addEvent('user.created', { user_id: userId });
    return user;
  });
}
```

### Web - React Hook

```typescript
import { useApiTracer } from '@/lib/opentelemetry-hooks';

function MyComponent() {
  const { traceApiCall } = useApiTracer();

  const handleSubmit = async () => {
    await traceApiCall('/api/users', 'POST', async () => {
      return fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    });
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

## Features

### Trace Propagation

- W3C Trace Context format
- Automatic frontend-to-backend propagation
- Distributed context across services

### Sampling

- Development: 100% sampling
- Production: Smart sampling (100% critical, 10% default)
- Configurable per route

### Performance Monitoring

- P50, P95, P99 latency metrics
- Database query performance
- External API call tracking
- Error rate monitoring

## Production Deployment

See [AWS X-Ray Setup Guide](./opentelemetry-aws-xray.md) for:

- IAM permissions
- X-Ray daemon deployment
- Sampling strategy
- Cost optimization
- CloudWatch integration

## Support

For issues:

1. Check the [troubleshooting section](./opentelemetry-implementation-guide.md#troubleshooting)
2. Review [quick start guide](./opentelemetry-quickstart.md)
3. Check logs: `docker-compose logs -f otel-collector`
4. Verify setup with test traces

## Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [AWS X-Ray](https://docs.aws.amazon.com/xray/)

---

**Happy Tracing! 🎯**
