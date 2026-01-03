# Performance Analysis with OpenTelemetry Traces

## Using Distributed Traces for Performance Optimization

This guide shows how to use OpenTelemetry traces to identify and fix performance issues in your PMP Study Application.

## Accessing Traces

### Local Development

1. **Jaeger UI:**

```bash
# Start tracing infrastructure
docker-compose up -d otel-collector jaeger

# Access Jaeger
open http://localhost:16686
```

2. **Search for Traces:**

- Service: `pmp-api` or `pmp-web`
- Operation: Select the endpoint you want to analyze
- Lookback: Select time range (last hour, day, etc.)
- Click "Find Traces"

3. **Analyze a Trace:**

- Click on a trace to see the waterfall view
- Each span shows duration and timeline
- Parent-child relationships show call flow

## Performance Patterns

### 1. Database Query Performance

#### Problem: N+1 Queries

**Trace Characteristics:**

- Many parallel database spans with similar duration
- Total duration >> individual query duration
- Pattern: 1 query followed by N similar queries

**Example Trace:**

```
GET /api/domains (500ms)
├── prisma.domain.findMany (50ms)
├── prisma.flashcard.count (45ms)  × 50
└── prisma.question.count (48ms)   × 50
```

**Solution:**

```typescript
// BEFORE - N+1 queries
const domains = await prisma.domain.findMany();
for (const domain of domains) {
  domain.flashcardCount = await prisma.flashcard.count({
    where: { domainId: domain.id },
  });
  domain.questionCount = await prisma.question.count({
    where: { domainId: domain.id },
  });
}

// AFTER - Single query with include
const domains = await prisma.domain.findMany({
  include: {
    _count: {
      select: {
        flashcards: true,
        questions: true,
      },
    },
  },
});
```

#### Problem: Missing Index

**Trace Characteristics:**

- Single database query taking long time (100ms-1s)
- Query complexity increases with data size
- `db.statement` shows SELECT without index usage

**Example Trace:**

```
GET /api/search?q=process (800ms)
└── prisma.question.findMany (750ms)  ← Should be <50ms
    └── db.statement: SELECT * FROM "Question" WHERE content LIKE '%process%'
```

**Solution:**

```sql
-- Add index for search
CREATE INDEX idx_question_content ON "Question"(content);
CREATE INDEX idx_question_content_gin ON "Question" USING gin(content gin_trgm_ops);
```

#### Problem: Large Result Sets

**Trace Characteristics:**

- Database query returns thousands of rows
- Serialization time increases
- Memory usage spikes

**Example Trace:**

```
GET /api/flashcards (1200ms)
├── prisma.flashcard.findMany (800ms)
└── JSON.stringify (400ms)  ← Serializing 10,000 records
```

**Solution:**

```typescript
// Add pagination
const flashcards = await prisma.flashcard.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
});
```

### 2. External API Performance

#### Problem: Sequential API Calls

**Trace Characteristics:**

- Multiple sequential external API spans
- Total duration = sum of all API calls
- No parallelization

**Example Trace:**

```
POST /api/stripe/create-checkout (2000ms)
├── stripe.customers.create (400ms)
├── stripe.products.create (400ms)
├── stripe.prices.create (400ms)
└── stripe.checkout.sessions.create (400ms)
```

**Solution:**

```typescript
// BEFORE - Sequential
const customer = await stripe.customers.create(params);
const product = await stripe.products.create(params);
const price = await stripe.prices.create(params);
const session = await stripe.checkout.sessions.create(params);

// AFTER - Parallel where possible
const [customer, product, price] = await Promise.all([
  stripe.customers.create(customerParams),
  stripe.products.create(productParams),
  stripe.prices.create(priceParams),
]);
const session = await stripe.checkout.sessions.create(sessionParams);
```

#### Problem: No Caching

**Trace Characteristics:**

- Same external API called repeatedly
- Each call takes similar time
- No cache hit spans visible

**Example Trace:**

```
GET /api/dashboard (1500ms)
├── stripe.subscriptions.retrieve (500ms)
├── stripe.invoices.list (400ms)
└── GET /api/dashboard (1500ms)
    ├── stripe.subscriptions.retrieve (500ms)  ← Called again!
    └── stripe.invoices.list (400ms)            ← Called again!
```

**Solution:**

```typescript
// Add Redis caching
async function getSubscription(userId: string) {
  return withSpan('cache.get', async (span) => {
    const cached = await redis.get(`subscription:${userId}`);
    if (cached) {
      span.addEvent('cache.hit');
      return JSON.parse(cached);
    }

    span.addEvent('cache.miss');
    const subscription = await stripe.subscriptions.retrieve(...);

    await redis.setex(
      `subscription:${userId}`,
      3600, // 1 hour
      JSON.stringify(subscription)
    );

    return subscription;
  });
}
```

### 3. Application Performance

#### Problem: Slow Serial Operations

**Trace Characteristics:**

- Sequential spans that could be parallel
- Overall duration is sum of durations
- No dependencies between operations

**Example Trace:**

```
GET /api/dashboard (800ms)
├── getFlashcards (200ms)
├── getQuestions (200ms)
├── getProgress (200ms)
└── getSubscription (200ms)
```

**Solution:**

```typescript
// BEFORE - Sequential
const flashcards = await getFlashcards(userId);
const questions = await getQuestions(userId);
const progress = await getProgress(userId);
const subscription = await getSubscription(userId);

// AFTER - Parallel
const [flashcards, questions, progress, subscription] = await Promise.all([
  getFlashcards(userId),
  getQuestions(userId),
  getProgress(userId),
  getSubscription(userId),
]);
```

#### Problem: Inefficient Data Processing

**Trace Characteristics:**

- Long processing spans
- High CPU usage
- Multiple iterations over data

**Example Trace:**

```
GET /api/practice/generate (2000ms)
├── prisma.question.findMany (100ms)
└── generatePracticeQuestions (1900ms)  ← Too slow
    ├── filter by difficulty (500ms)
    ├── filter by domain (500ms)
    └── shuffle and select (900ms)
```

**Solution:**

```typescript
// Push filtering to database
const questions = await prisma.question.findMany({
  where: {
    difficulty: request.difficulty,
    domainId: request.domainId,
  },
  take: request.count,
  orderBy: { createdAt: "desc" },
});

// Use database-level random sampling
const questions = await prisma.$queryRaw`
  SELECT * FROM "Question"
  WHERE "difficulty" = ${difficulty}
  AND "domainId" = ${domainId}
  ORDER BY RANDOM()
  LIMIT ${count}
`;
```

## Trace Analysis Workflow

### Step 1: Identify Slow Endpoints

**In Jaeger:**

```
1. Select service: pmp-api
2. Sort by: Longest Duration
3. Look for P95, P99 percentiles > 1000ms
```

**Example Findings:**

- `GET /api/search` - P95: 2000ms (too slow)
- `POST /api/practice/generate` - P95: 3000ms (too slow)
- `GET /api/flashcards` - P95: 800ms (acceptable)

### Step 2: Analyze the Trace

**Click on a slow trace and examine:**

1. **Find the bottleneck:**
   - Which span has the longest duration?
   - Is it a database query, external API, or processing?

2. **Check for patterns:**
   - N+1 queries (many similar spans)
   - Sequential calls (waterfall pattern)
   - Missing cache (repeated calls)

3. **Look at attributes:**
   - `db.statement` - See the actual SQL
   - `http.url` - Identify which external API
   - `error.message` - Check for retries

### Step 3: Measure Before Optimization

**Record metrics:**

```
Endpoint: GET /api/search
Current P95: 2000ms
Current P99: 3500ms
Bottleneck: Database query (db.statement shown in span)
```

### Step 4: Implement Fix

**Example: Add database index**

```sql
CREATE INDEX idx_question_content_gin
ON "Question" USING gin(content gin_trgm_ops);
```

### Step 5: Verify Improvement

**Compare traces:**

```
Before: GET /api/search (2000ms)
After:  GET /api/search (150ms)  ← 13x faster!
```

## Common Performance Issues

### 1. Database Connection Pool Exhaustion

**Trace:**

```
Many requests waiting for database connection
Spans show "acquiring connection" taking 100ms+
```

**Solution:**

```typescript
// Increase connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  log: ["query", "error", "warn"],
});
```

**Connection String:**

```
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&connection_limit=20&pool_timeout=20"
```

### 2. Memory Leaks

**Trace:**

```
Increasing memory usage over time
GC pauses visible in traces
Event loop delays
```

**Solution:**

```typescript
// Ensure spans are ended
const span = createSpan("operation");
try {
  // Do work
} finally {
  span.end(); // Always end span!
}
```

**Better - use withSpan:**

```typescript
withSpan("operation", async (span) => {
  // Auto-cleanup
});
```

### 3. Slow Middleware

**Trace:**

```
/auth middleware (500ms)  ← Too slow!
└── validateToken (450ms)
└── getUser (50ms)
```

**Solution:**

```typescript
// Add caching to auth validation
async function validateToken(token: string) {
  const cached = await redis.get(`auth:${token}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const user = await jwt.verify(token, ...);
  await redis.setex(`auth:${token}`, 300, JSON.stringify(user));
  return user;
}
```

## Performance Targets

### Response Time Targets (P95)

| Endpoint Type   | Target  | Action Required      |
| --------------- | ------- | -------------------- |
| Static data GET | < 100ms | Optimize if > 200ms  |
| Search GET      | < 500ms | Optimize if > 1000ms |
| Create POST     | < 300ms | Optimize if > 600ms  |
| Webhook POST    | < 200ms | Optimize if > 400ms  |
| Dashboard GET   | < 800ms | Optimize if > 1500ms |

### Database Query Targets

| Query Type           | Target  | Action Required       |
| -------------------- | ------- | --------------------- |
| Primary key lookup   | < 10ms  | Check index if > 20ms |
| Single record find   | < 50ms  | Optimize if > 100ms   |
| List with pagination | < 100ms | Optimize if > 200ms   |
| Full-text search     | < 500ms | Optimize if > 1000ms  |

### External API Targets

| API Type        | Target   | Action Required       |
| --------------- | -------- | --------------------- |
| Stripe API call | < 500ms  | Add cache if > 1000ms |
| PayPal API call | < 600ms  | Add cache if > 1200ms |
| Email sending   | < 2000ms | Queue if > 3000ms     |

## Alerting

### Jaeger Alerts

Create alerts for:

1. **High Error Rate:** > 5% of traces contain errors
2. **Slow P95:** Response time > 2x target
3. **Trace Spike:** Sudden increase in trace count

### Grafana Alerts

```yaml
# Example alert
- alert: HighAPIResponseTime
  expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High API response time (P95 > 1s)"
    description: "P95 response time is {{ $value }}s"
```

## Continuous Optimization

### Weekly Performance Review

1. **Check slowest traces:**

   ```
   Jaeger → Service: pmp-api → Sort by Duration → Last 7 days
   ```

2. **Identify top 3 bottlenecks**

3. **Create optimization tickets**

4. **Implement fixes**

5. **Verify improvement**

### Monthly Performance Report

Track metrics over time:

```
Date        | P50  | P95  | P99  | Error Rate | Throughput
------------|------|------|------|------------|------------
2025-01-01  | 50ms | 200ms| 400ms| 0.1%       | 100 req/s
2025-02-01  | 45ms | 180ms| 350ms| 0.08%      | 120 req/s
2025-03-01  | 40ms | 150ms| 280ms| 0.05%      | 150 req/s
```

## Tools and Shortcuts

### Quick Trace Search

```bash
# Find slowest traces in last hour
curl http://localhost:16686/api/traces?service=pmp-api&lookback=1h&limit=10

# Find traces by operation
curl "http://localhost:16686/api/traces?service=pmp-api&operation=POST%20%2Fapi%2Fusers"
```

### Export Traces for Analysis

```bash
# Export trace to JSON
curl http://localhost:16686/api/traces/{trace_id} > trace.json

# Analyze with jq
jq '.resourceSpans[].scopeSpans[].spans | map(select(.duration > 1000000))' trace.json
```

### Performance Testing with Tracing

```bash
# Run load test while tracing
k6 run --out json=results.json scripts/load-test.js

# Analyze traces during test
# Jaeger should show many parallel traces
# Look for bottlenecks under load
```

## Summary

Key takeaways:

1. **Always trace** before optimizing
2. **Find the bottleneck** using traces
3. **Fix the actual problem**, not symptoms
4. **Measure improvement** with before/after traces
5. **Monitor continuously** for regressions

By systematically analyzing traces, you can:

- Identify performance issues quickly
- Make data-driven optimization decisions
- Verify improvements objectively
- Maintain performance over time

Happy tracing!
