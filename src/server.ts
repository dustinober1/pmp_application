import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import Logger from './utils/logger';
import { prisma } from './services/database';
import { cache } from './services/cache';
import { swaggerSpec } from './config/swagger';
import { correlationIdMiddleware } from './middleware/correlationId';
import { AppError } from './utils/AppError';
import v1Routes from './routes/v1';
import { observability } from './services/observability';
import { checkDatabaseHealth } from './services/database';

// Load environment variables
dotenv.config();

// =============================================================================
// Environment Validation
// =============================================================================
const requiredEnvVars = ['JWT_SECRET'];
const recommendedEnvVars = ['ALLOWED_ORIGINS', 'DATABASE_URL', 'REDIS_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    Logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

for (const envVar of recommendedEnvVars) {
  if (!process.env[envVar]) {
    Logger.warn(`Recommended environment variable not set: ${envVar}`);
  }
}

// Validate ALLOWED_ORIGINS is set in production
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  Logger.error('ALLOWED_ORIGINS must be set in production');
  process.exit(1);
}

// =============================================================================
// Initialize Express App
// =============================================================================
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy for proper rate limiting behind reverse proxy
if (isProd) {
  app.set('trust proxy', 1);
}

// =============================================================================
// Correlation ID for Request Tracking (Observability)
// =============================================================================
app.use(correlationIdMiddleware);

// =============================================================================
// Metrics Middleware (Observability)
// =============================================================================
app.use(observability.metricsMiddleware());

// =============================================================================
// Prometheus Metrics Endpoint
// =============================================================================
app.get('/metrics', (req: Request, res: Response) => observability.getMetrics(req, res));

// =============================================================================
// Response Compression
// =============================================================================
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
  })
);

// =============================================================================
// Security Middleware - Helmet Configuration
// =============================================================================
app.use(
  helmet({
    // Content Security Policy - Prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Prevent MIME type sniffing
    noSniff: true,
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // HTTP Strict Transport Security - Forces HTTPS
    hsts: isProd
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false,
    // Prevent IE from executing downloads in site's context
    ieNoOpen: true,
    // Disable DNS prefetching
    dnsPrefetchControl: { allow: false },
    // Don't allow the app to be embedded in iframes
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    // Referrer policy for privacy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // Cross-Origin settings
    crossOriginEmbedderPolicy: false, // Disable for Swagger UI compatibility
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

// =============================================================================
// CORS Configuration
// =============================================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Warn in production if using default origins
if (isProd && !process.env.ALLOWED_ORIGINS) {
  Logger.warn('Using default CORS origins in production - this is insecure!');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      // In production, you might want to be stricter here
      if (!origin) {
        if (isProd) {
          Logger.debug('Request with no origin received');
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    exposedHeaders: ['X-Correlation-ID'],
    maxAge: 86400, // 24 hours - browsers can cache preflight requests
  })
);

// =============================================================================
// Rate Limiting
// =============================================================================
// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // More lenient in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health', // Don't rate limit health checks
  keyGenerator: (req) => {
    // Use X-Forwarded-For in production behind proxy
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

app.use(generalLimiter);

// =============================================================================
// Request Logging
// =============================================================================
morgan.token('correlation-id', (req: Request) => req.correlationId || '-');
app.use(
  morgan(':correlation-id :method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message: string) => Logger.http(message.trim()),
    },
    skip: (req) => req.path === '/health', // Don't log health checks
  })
);

// =============================================================================
// Body Parsing
// =============================================================================
app.use(
  express.json({
    limit: '10mb',
    strict: true, // Only accept arrays and objects
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 1000,
  })
);

// =============================================================================
// API Documentation (disable in production if desired)
// =============================================================================
if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'PMP Application API Docs',
    })
  );
}

// =============================================================================
// Health Check Endpoint
// =============================================================================
app.get('/health', async (req: Request, res: Response) => {
  interface HealthStatus {
    status: 'OK' | 'DEGRADED' | 'DOWN';
    timestamp: string;
    version: string;
    uptime: number;
    environment: string;
    services: {
      database: { status: string; latencyMs?: number; message?: string };
      redis: { status: string; latencyMs?: number; message?: string };
    };
  }

  const [dbHealth, redisHealth] = await Promise.all([checkDatabaseHealth(), cache.healthCheck()]);

  const isDegraded = dbHealth.status !== 'healthy' || redisHealth.status !== 'healthy';
  const isDown = dbHealth.status !== 'healthy' && redisHealth.status !== 'healthy';

  const health: HealthStatus = {
    status: isDown ? 'DOWN' : isDegraded ? 'DEGRADED' : 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbHealth.status,
        latencyMs: dbHealth.latencyMs,
        message: dbHealth.message,
      },
      redis: {
        status: redisHealth.status,
        latencyMs: redisHealth.latencyMs,
        message: redisHealth.message,
      },
    },
  };

  const statusCode = isDown ? 503 : 200;
  res.status(statusCode).json(health);
});

// =============================================================================
// API Routes - Versioned
// =============================================================================
// Version 1 API (current stable)
app.use('/api/v1', v1Routes);

// Alias /api/* to latest version (currently v1) for backward compatibility
app.use('/api', v1Routes);

// API versioning info endpoint
app.get('/api/versions', (req: Request, res: Response) => {
  res.json({
    current: 'v1',
    supported: ['v1'],
    deprecated: [],
    docs: '/api-docs',
  });
});

// =============================================================================
// 404 Handler
// =============================================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
      status: 404,
    },
  });
});

// =============================================================================
// Global Error Handler
// =============================================================================
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

const errorHandler: ErrorRequestHandler = (
  err: ErrorWithStatus | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Check if it's our custom AppError
  if (err instanceof AppError) {
    Logger.warn(`AppError: ${err.message}`, {
      code: err.code,
      path: req.path,
      correlationId: req.correlationId,
    });
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle other errors with statusCode/code properties
  if ('statusCode' in err && 'code' in err && err.statusCode && err.code) {
    Logger.warn(`Error: ${err.message}`, {
      code: err.code,
      path: req.path,
      correlationId: req.correlationId,
    });
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.statusCode,
      },
    });
    return;
  }

  // Log unexpected errors
  Logger.error(`Unexpected error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    correlationId: req.correlationId,
  });

  // Don't expose internal errors in production
  const message = isProd ? 'Internal server error' : err.message;

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      status: statusCode,
    },
  });
};

app.use(errorHandler);

// =============================================================================
// Graceful Shutdown
// =============================================================================
const gracefulShutdown = async (signal: string) => {
  Logger.info(`Received ${signal}, closing connections...`);

  // Give existing requests time to complete
  setTimeout(async () => {
    try {
      await prisma.$disconnect();
      Logger.info('Database connection closed');
    } catch (error) {
      Logger.error('Error closing database connection', error);
    }
    process.exit(0);
  }, 10000); // 10 second grace period
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', { promise, reason });
});

// =============================================================================
// Start Server
// =============================================================================
app.listen(PORT, () => {
  Logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  Logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
    Logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  }
});

export default app;
