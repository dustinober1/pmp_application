# Structured Logging Guide

## Overview

This application uses a production-grade structured logging solution powered by Winston with AWS CloudWatch integration. All logs are JSON-formatted and include correlation IDs for distributed tracing.

## Features

- **Structured JSON Logging**: All logs are formatted as JSON for easy parsing
- **Multiple Transports**: Console, file, and CloudWatch logging
- **Request Correlation**: Automatic trace ID generation and propagation
- **Sensitive Data Redaction**: Automatic sanitization of passwords, tokens, and PII
- **Environment-Aware**: Different formats for development and production
- **CloudWatch Integration**: Automatic log streaming to AWS CloudWatch Logs

## Quick Start

### Basic Usage

```typescript
import { getLogger } from './logging';

const logger = getLogger();

// Simple logging
logger.info('User logged in');
logger.error('Database connection failed', error);
logger.warn('High memory usage');

// Logging with metadata
logger.info('Request received', {
  method: 'GET',
  path: '/api/users',
  user_id: 'user-123',
});

// Error logging with context
logger.error(
  'Payment processing failed',
  error,
  {
    payment_id: 'pay-123',
    amount: 99.99,
    currency: 'USD',
  }
);
```

### Trace ID Management

```typescript
import { Logger, generateTraceId } from './logging';

// Set trace ID for request context
const traceId = generateTraceId(req.headers['x-trace-id']);
Logger.setTraceId(traceId);

// Get current trace ID
const currentTraceId = Logger.getTraceId();

// Set user ID
Logger.setUserId('user-123');
const currentUserId = Logger.getUserId();

// Clear context (usually after request completes)
Logger.clearContext();
```

### Child Loggers with Context

```typescript
import { childLogger } from './logging';

// Create child logger with additional context
const userLogger = childLogger({
  service_name: 'user-service',
  component: 'authentication',
});

// All logs from child logger include parent context
userLogger.info('User authenticated', {
  user_id: 'user-123',
  auth_method: 'oauth',
});
```

## Log Levels

The logger supports the following log levels (in order of severity):

1. **error** - Error events that might still allow the application to continue
2. **warn** - Potentially harmful situations
3. **info** - Informational messages highlighting application progress
4. **http** - HTTP request/response logging (automatic)
5. **debug** - Fine-grained informational events for debugging

### Setting Log Level

```typescript
import { getLogger } from './logging';

const logger = getLogger();

// Change log level at runtime
logger.setLevel('debug');  // Most verbose
logger.setLevel('info');   // Normal operation
logger.setLevel('error');  // Only errors
```

## Middleware Integration

### Express Setup

```typescript
import express from 'express';
import { initializeLogger, loggingMiddleware, contextCleanupMiddleware } from './logging';
import { createLoggerConfig } from './logging/config';

// Initialize logger
const config = createLoggerConfig();
initializeLogger(config);

const app = express();

// Apply logging middleware
app.use(...loggingMiddleware());
app.use(contextCleanupMiddleware);

// Your routes...
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

### What the Middleware Does

1. **traceIdMiddleware**:
   - Generates or extracts trace ID from `X-Trace-ID` header
   - Adds trace ID to request object
   - Sets trace ID in logger context
   - Returns trace ID in response header

2. **userIdMiddleware**:
   - Extracts user ID from authenticated request
   - Sets user ID in logger context
   - Includes user ID in all logs for the request

3. **requestLoggingMiddleware**:
   - Logs all incoming HTTP requests
   - Logs response status codes
   - Tracks request duration
   - Uses appropriate log level based on status code

4. **contextCleanupMiddleware**:
   - Clears trace ID and user ID after request completes
   - Prevents memory leaks

## Log Structure

### Development Format

```
2024-01-01 12:00:00 [info]: User logged in (trace_id=abc-123, user_id=user-456)
```

### Production Format (JSON)

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": {
    "trace_id": "abc-123",
    "user_id": "user-456",
    "environment": "production",
    "service_name": "pmp-api"
  },
  "metadata": {
    "method": "POST",
    "path": "/api/auth/login"
  }
}
```

### Error Log Format

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "context": {
    "trace_id": "abc-123",
    "environment": "production",
    "service_name": "pmp-api"
  },
  "error": {
    "name": "ConnectionError",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "code": "ETIMEDOUT"
  }
}
```

## Sensitive Data Redaction

The logger automatically redacts sensitive fields from log metadata:

```typescript
import { getLogger } from './logging';

const logger = getLogger();

// Password automatically redacted
logger.info('User registration', {
  email: 'user@example.com',
  password: 'secret123',  // Automatically becomes '*********'
});

// API keys redacted
logger.info('API request', {
  url: 'https://api.example.com',
  apiKey: 'sk-1234567890',  // Automatically becomes '************'
});
```

### Default Redacted Fields

- `password`, `passwd`
- `secret`
- `token`, `accessToken`, `refreshToken`
- `apiKey`, `api_key`, `apikey`
- `authorization`
- `privateKey`, `private_key`
- `ssn`, `socialSecurityNumber`
- `creditCard`, `cvv`

### Custom Sanitization

```typescript
import { sanitize, createSanitizationRules } from './logging';

// Custom sanitization rules
const customRules = createSanitizationRules(
  ['customField1', 'customField2'],
  '[HIDDEN]'
);

const data = {
  customField1: 'sensitive-data',
  publicField: 'public-data',
};

const sanitized = sanitize(data, customRules);
// Result: { customField1: '[HIDDEN]', publicField: 'public-data' }
```

## CloudWatch Integration

### Configuration

Set these environment variables:

```bash
# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# CloudWatch Configuration
LOG_LEVEL=info
NODE_ENV=production
```

### Log Groups

Logs are organized into CloudWatch log groups:

- **API Logs**: `/pmp-app/api`
- **Web Logs**: `/pmp-app/web`

### Log Streams

Each instance/pod creates its own log stream:

```
production-ip-192-168-1-1
production-ip-192-168-1-2
staging-pod-abc123
```

### Querying Logs in CloudWatch

```sql
-- Find all errors in the last hour
fields @timestamp, level, message, context.trace_id
| filter level = "error"
| sort @timestamp desc
| limit 100

-- Find requests by trace ID
fields @timestamp, level, message, context.user_id
| filter context.trace_id = "abc-123"
| sort @timestamp asc

-- Find slow requests (> 1 second)
fields @timestamp, message, metadata.duration
| filter metadata.duration > 1000
| sort @timestamp desc
```

## Configuration

### Logger Configuration

```typescript
import type { LoggerConfig } from './logging';

const config: LoggerConfig = {
  level: 'info',                    // Minimum log level
  environment: 'production',        // Environment name
  serviceName: 'pmp-api',          // Service identifier
  enableCloudWatch: true,          // Enable CloudWatch transport
  cloudWatchLogGroup: '/pmp-app/api', // CloudWatch log group
  cloudWatchLogStream: 'production-instance-1', // Log stream name
  sanitizeFields: [                // Fields to redact
    'password',
    'secret',
    'token',
  ],
};
```

### Environment-Based Configuration

```typescript
import { createLoggerConfig, createWebLoggerConfig } from './logging/config';

// API configuration
const apiConfig = createLoggerConfig();

// Web client configuration
const webConfig = createWebLoggerConfig();

// Initialize with config
import { initializeLogger } from './logging';
initializeLogger(apiConfig);
```

## Best Practices

### 1. Always Include Context

```typescript
// Good
logger.info('User created', {
  user_id: user.id,
  email: user.email,
  plan: user.plan,
});

// Less useful
logger.info('User created');
```

### 2. Use Appropriate Log Levels

```typescript
logger.debug('Cache lookup', { key: 'user-123' });  // Detailed debugging
logger.info('User logged in');                      // Normal operation
logger.warn('High memory usage', { memory: '90%' }); // Potential issue
logger.error('Database error', err);                // Critical failure
```

### 3. Don't Log Sensitive Data

```typescript
// Bad - password will be in logs
logger.info('User login', {
  email: user.email,
  password: user.password,  // DON'T DO THIS
});

// Good - password automatically redacted
logger.info('User login', {
  email: user.email,
  password: user.password,  // Automatically redacted
});
```

### 4. Use Child Loggers for Components

```typescript
import { childLogger } from './logging';

const paymentLogger = childLogger({
  component: 'payment-processing',
  service_name: 'payment-service',
});

paymentLogger.info('Payment processed', {
  payment_id: 'pay-123',
  amount: 99.99,
});
```

### 5. Always Include Trace IDs in External Calls

```typescript
import { Logger } from './logging';

const traceId = Logger.getTraceId();

// Include trace ID in API calls
await fetch('https://external-api.com', {
  headers: {
    'X-Trace-ID': traceId,
    'Content-Type': 'application/json',
  },
});
```

## Troubleshooting

### Logs Not Appearing in CloudWatch

1. **Check AWS Credentials**:
   ```bash
   echo $AWS_ACCESS_KEY_ID
   echo $AWS_SECRET_ACCESS_KEY
   echo $AWS_REGION
   ```

2. **Check IAM Permissions**:
   - Ensure IAM user has `logs:CreateLogGroup`
   - Ensure IAM user has `logs:CreateLogStream`
   - Ensure IAM user has `logs:PutLogEvents`

3. **Check Log Group Exists**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix /pmp-app
   ```

### Trace ID Not Propagating

1. **Check Middleware Order**:
   ```typescript
   // Correct order
   app.use(traceIdMiddleware);
   app.use(requestLoggingMiddleware);
   ```

2. **Check Response Headers**:
   ```bash
   curl -v http://localhost:3001/api/health
   # Look for: X-Trace-ID: ...
   ```

### Too Many Logs

1. **Adjust Log Level**:
   ```typescript
   logger.setLevel('warn');  // Only warnings and errors
   ```

2. **Set Environment Variable**:
   ```bash
   LOG_LEVEL=error npm start
   ```

## Migration from Old Logger

### Old Code

```typescript
import { logger } from './utils/logger';

logger.info('User logged in');
logger.error('Error occurred');
```

### New Code (Same Import, More Power)

```typescript
import { logger } from './utils/logger';  // Still works!

// Or import directly from new module
import { getLogger } from './logging';

const logger = getLogger();

// Now with metadata support
logger.info('User logged in', {
  user_id: 'user-123',
  ip: '192.168.1.1',
});

// Error logging with context
logger.error('Error occurred', error, {
  context: 'user-registration',
});
```

The old import path still works through a backward-compatible wrapper, but new code should import from `./logging` for better TypeScript support and access to all features.

## Testing

### Mock Logger in Tests

```typescript
import { Logger } from './logging';

beforeEach(() => {
  Logger.setTraceId('test-trace');
  Logger.setUserId('test-user');
});

afterEach(() => {
  Logger.clearContext();
});

test('user endpoint', async () => {
  const response = await request(app)
    .get('/api/users')
    .set('X-Trace-ID', 'test-trace-123');

  expect(response.status).toBe(200);
});
```

### Testing Log Output

```typescript
import { createLogger } from './logging';

const logger = createLogger({
  level: 'debug',
  environment: 'test',
  serviceName: 'test-service',
  enableCloudWatch: false,
  cloudWatchLogGroup: '/test',
  cloudWatchLogStream: 'test-stream',
  sanitizeFields: [],
});

// Log to console during tests
logger.info('Test message');
```

## Performance Considerations

1. **Log in Production**: Keep production logs at `info` level
2. **Debug Only When Needed**: Use `debug` level sparingly in production
3. **Batch CloudWatch Uploads**: Logs are batched every 1 second or 20 entries
4. **File Rotation**: Log files rotate at 10MB with 5 files retained
5. **Async Logging**: Winston uses async transports to avoid blocking

## Further Reading

- [Winston Documentation](https://github.com/winstonjs/winston)
- [CloudWatch Logs Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [Structured Logging Best Practices](https://www.slf4j.org/manual.html)
- [Twelve-Factor App Logging](https://12factor.net/logs)
