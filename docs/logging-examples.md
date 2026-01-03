# Logging Examples

## Table of Contents

- [Basic Logging](#basic-logging)
- [Error Handling](#error-handling)
- [Request Logging](#request-logging)
- [Authentication Logging](#authentication-logging)
- [Database Operations](#database-operations)
- [External API Calls](#external-api-calls)
- [Business Events](#business-events)
- [Performance Monitoring](#performance-monitoring)
- [Security Events](#security-events)

## Basic Logging

### Simple Info Log

```typescript
import { getLogger } from './logging';

const logger = getLogger();

logger.info('Application started');
logger.info('Server listening on port 3001');
logger.info('Database connected');
```

### Warning Log

```typescript
logger.warn('High memory usage detected', {
  memory_usage: '90%',
  heap_used: '450MB',
  heap_total: '500MB',
});
```

### Error Log

```typescript
logger.error('Failed to process payment', error, {
  payment_id: 'pay_123',
  amount: 99.99,
  currency: 'USD',
});
```

## Error Handling

### Database Error

```typescript
try {
  await User.create({ email, password });
  logger.info('User created successfully', { user_id: user.id });
} catch (error) {
  logger.error('Failed to create user', error, {
    email,
    error_code: (error as any).code,
  });
  throw error;
}
```

### Validation Error

```typescript
if (!email || !password) {
  logger.warn('Invalid login attempt', {
    reason: 'missing_credentials',
    has_email: !!email,
    has_password: !!password,
    ip: req.ip,
  });
  return res.status(400).json({ error: 'Invalid credentials' });
}
```

### Network Error

```typescript
try {
  await externalApiCall();
} catch (error) {
  logger.error('External API call failed', error, {
    url: 'https://api.example.com',
    timeout: 5000,
    attempt: retries,
  });
}
```

## Request Logging

### Incoming Request

```typescript
import { Logger } from './logging';

export async function getUserHandler(req: Request, res: Response) {
  logger.info('Get user request', {
    user_id: req.params.id,
    requester_id: (req as any).user?.id,
    ip: req.ip,
    trace_id: Logger.getTraceId(),
  });

  const user = await User.findById(req.params.id);
  res.json(user);
}
```

### Slow Request Warning

```typescript
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (duration > 3000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        threshold: 3000,
      });
    }
  });

  next();
});
```

### Request with Large Payload

```typescript
logger.info('Large payload received', {
  content_length: req.get('content-length'),
  content_type: req.get('content-type'),
  size_bytes: JSON.stringify(req.body).length,
});
```

## Authentication Logging

### Login Success

```typescript
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await authenticateUser(email, password);

  logger.info('User logged in successfully', {
    user_id: user.id,
    email: user.email,
    auth_method: 'email-password',
    ip: req.ip,
    user_agent: req.get('user-agent'),
  });

  res.json({ token: generateToken(user) });
}
```

### Login Failure

```typescript
try {
  await authenticateUser(email, password);
} catch (error) {
  logger.warn('Failed login attempt', {
    email,
    reason: 'invalid_credentials',
    ip: req.ip,
    user_agent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Token Refresh

```typescript
logger.info('Token refreshed', {
  user_id: user.id,
  old_token_expires_at: oldToken.expiresAt,
  new_token_expires_at: newToken.expiresAt,
  refresh_duration: '7d',
});
```

### Logout

```typescript
logger.info('User logged out', {
  user_id: user.id,
  session_duration: session.duration,
  token_expired: false,
});
```

## Database Operations

### Query Execution

```typescript
logger.debug('Database query executed', {
  query: 'SELECT * FROM users WHERE id = ?',
  params: [userId],
  rows: result.rows.length,
  duration: 23,
});
```

### Slow Query Warning

```typescript
const startTime = Date.now();
const result = await db.query('SELECT * FROM orders');
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow database query', {
    query: 'SELECT * FROM orders',
    duration,
    threshold: 1000,
    rows: result.rows.length,
  });
}
```

### Database Connection Error

```typescript
logger.error('Database connection failed', error, {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  max_connections: 100,
  current_connections: currentConnectionCount,
});
```

### Transaction Logging

```typescript
logger.info('Database transaction started', {
  transaction_id: transactionId,
  operations: ['insert_user', 'create_subscription', 'send_welcome_email'],
});

try {
  await transaction.commit();
  logger.info('Transaction committed', { transaction_id });
} catch (error) {
  await transaction.rollback();
  logger.error('Transaction rolled back', error, { transaction_id });
}
```

## External API Calls

### Outgoing Request

```typescript
import { Logger } from './logging';

const traceId = Logger.getTraceId();

logger.info('Calling external API', {
  url: 'https://api.stripe.com/v1/charges',
  method: 'POST',
  trace_id: traceId,
  amount: 99.99,
});

const response = await fetch('https://api.stripe.com/v1/charges', {
  method: 'POST',
  headers: {
    'X-Trace-ID': traceId,
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({ amount: 9999, currency: 'usd' }),
});

logger.info('External API response received', {
  url: 'https://api.stripe.com/v1/charges',
  status: response.status,
  duration: Date.now() - startTime,
});
```

### API Error with Retry

```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const response = await externalApiCall();
    logger.info('External API call succeeded', {
      url: apiUrl,
      attempt,
      total_attempts: maxRetries,
    });
    return response;
  } catch (error) {
    logger.warn('External API call failed, retrying', {
      url: apiUrl,
      attempt,
      max_retries: maxRetries,
      error: error.message,
    });

    if (attempt === maxRetries) {
      logger.error('External API call failed after retries', error, {
        url: apiUrl,
        total_attempts: maxRetries,
      });
      throw error;
    }

    await sleep(1000 * attempt);
  }
}
```

### Webhook Delivery

```typescript
logger.info('Sending webhook', {
  webhook_url: webhookUrl,
  event_type: 'user.created',
  user_id: user.id,
  attempt: 1,
});

try {
  await sendWebhook(webhookUrl, payload);
  logger.info('Webhook delivered successfully', {
    webhook_url: webhookUrl,
    event_type: 'user.created',
    attempt: 1,
  });
} catch (error) {
  logger.error('Webhook delivery failed', error, {
    webhook_url: webhookUrl,
    event_type: 'user.created',
    will_retry: true,
  });
}
```

## Business Events

### User Registration

```typescript
logger.info('User registered', {
  user_id: user.id,
  email: user.email,
  plan: 'free',
  registration_source: 'organic',
  referral_code: req.body.referral_code || null,
});
```

### Subscription Created

```typescript
logger.info('Subscription created', {
  user_id: user.id,
  subscription_id: subscription.id,
  plan: subscription.plan,
  amount: subscription.amount,
  currency: subscription.currency,
  interval: subscription.interval,
});
```

### Payment Success

```typescript
logger.info('Payment successful', {
  payment_id: payment.id,
  user_id: user.id,
  amount: payment.amount,
  currency: payment.currency,
  payment_method: payment.method,
  stripe_charge_id: payment.stripeChargeId,
});
```

### Payment Failure

```typescript
logger.error('Payment failed', error, {
  user_id: user.id,
  amount: 99.99,
  currency: 'USD',
  payment_method: 'card',
  stripe_error_code: error.code,
  stripe_error_type: error.type,
  decline_code: error.decline_code,
});
```

### Upgrade/Downgrade

```typescript
logger.info('Subscription plan changed', {
  user_id: user.id,
  subscription_id: subscription.id,
  old_plan: 'free',
  new_plan: 'premium',
  change_type: 'upgrade',
  reason: 'user_initiated',
});
```

## Performance Monitoring

### Function Execution Time

```typescript
const startTime = Date.now();

await expensiveOperation();

const duration = Date.now() - startTime;

logger.debug('Operation completed', {
  operation: 'expensiveOperation',
  duration,
  threshold: 1000,
  status: duration > 1000 ? 'slow' : 'normal',
});
```

### Cache Hit/Miss

```typescript
const cached = await cache.get(key);

if (cached) {
  logger.debug('Cache hit', {
    key,
    cache_type: 'redis',
    ttl: cached.ttl,
  });
} else {
  logger.debug('Cache miss', {
    key,
    cache_type: 'redis',
    loading_from_db: true,
  });
}
```

### Memory Usage

```typescript
const used = process.memoryUsage();

if (used.heapUsed / used.heapTotal > 0.9) {
  logger.warn('High heap usage', {
    heap_used: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heap_total: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    usage_percentage: `${Math.round((used.heapUsed / used.heapTotal) * 100)}%`,
    threshold: '90%',
  });
}
```

## Security Events

### Rate Limit Exceeded

```typescript
logger.warn('Rate limit exceeded', {
  ip: req.ip,
  user_id: (req as any).user?.id,
  endpoint: req.path,
  method: req.method,
  limit: 100,
  window: '15 minutes',
});
```

### Suspicious Activity

```typescript
logger.warn('Suspicious activity detected', {
  user_id: user.id,
  activity: 'multiple_failed_logins',
  failed_attempts: 5,
  time_window: '5 minutes',
  ip_addresses: ['192.168.1.1', '192.168.1.2'],
  blocked: true,
});
```

### Permission Denied

```typescript
logger.warn('Access denied', {
  user_id: (req as any).user?.id,
  resource: 'user.profile',
  action: 'update',
  target_user_id: req.params.id,
  reason: 'insufficient_permissions',
  required_role: 'admin',
  user_role: (req as any).user?.role,
});
```

### SQL Injection Attempt Detected

```typescript
logger.error('SQL injection attempt detected', new Error('Security'), {
  user_id: (req as any).user?.id,
  ip: req.ip,
  input: req.query.id,
  pattern_detected: "'; DROP TABLE",
  blocked: true,
});
```

## Advanced Examples

### Correlated Logs Across Services

```typescript
// Service A (API Gateway)
const traceId = generateTraceId();
Logger.setTraceId(traceId);

logger.info('Calling Service B', { trace_id: traceId });

await fetch('http://service-b/api', {
  headers: { 'X-Trace-ID': traceId },
});

// Service B
const traceId = req.headers['x-trace-id'];
Logger.setTraceId(traceId);

logger.info('Processing request in Service B', { trace_id: traceId });
```

### Batch Operation Logging

```typescript
logger.info('Starting batch operation', {
  operation: 'send_daily_emails',
  total_users: 1000,
  batch_size: 100,
});

for (let i = 0; i < users.length; i += 100) {
  const batch = users.slice(i, i + 100);

  logger.info('Processing batch', {
    batch_number: Math.floor(i / 100) + 1,
    batch_size: batch.length,
    total_batches: Math.ceil(users.length / 100),
  });

  await sendEmailBatch(batch);
}

logger.info('Batch operation completed', {
  operation: 'send_daily_emails',
  total_users: users.length,
  total_emails_sent: sentCount,
  failed: failedCount,
});
```

### Distributed Transaction

```typescript
const transactionId = uuidv4();

logger.info('Distributed transaction started', {
  transaction_id: transactionId,
  services: ['database', 'stripe', 'email-service'],
});

try {
  await Promise.all([
    updateDatabase(transactionId),
    chargeStripe(transactionId),
    sendEmail(transactionId),
  ]);

  logger.info('Distributed transaction completed', {
    transaction_id: transactionId,
    status: 'success',
  });
} catch (error) {
  logger.error('Distributed transaction failed', error, {
    transaction_id: transactionId,
    status: 'failed',
    compensation_started: true,
  });

  await compensateTransaction(transactionId);
}
```

These examples should help you implement comprehensive logging throughout your application. Remember to always include relevant context and never log sensitive information!
