import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import Logger, { createRequestLogger } from './utils/logger';
import { prisma } from './services/database';
import { cache } from './services/cache';
import { swaggerSpec } from './config/swagger';
import { correlationIdMiddleware } from './middleware/correlationId';
import questionRoutes from './routes/questions';
import flashcardRoutes from './routes/flashcards';
import practiceRoutes from './routes/practice';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    Logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Correlation ID for request tracking (observability)
app.use(correlationIdMiddleware);

// Response compression for performance
app.use(compression());

// Security Middleware
app.use(helmet());

// CORS Configuration with domain whitelisting
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      Logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

app.use(generalLimiter);

// Logging with correlation ID
morgan.token('correlation-id', (req: express.Request) => req.correlationId || '-');
app.use(morgan(':correlation-id :method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message: string) => Logger.http(message.trim()),
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PMP Application API Docs',
}));

// Comprehensive Health check endpoint
app.get('/health', async (req, res) => {
  const health: {
    status: string;
    timestamp: string;
    services: {
      database: { status: string; message?: string };
      redis: { status: string; message?: string };
    };
  } = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = { status: 'healthy' };
  } catch (error) {
    health.services.database = { status: 'unhealthy', message: 'Connection failed' };
    health.status = 'DEGRADED';
  }

  // Check Redis
  try {
    const testValue = await cache.get('health-check-test');
    health.services.redis = { status: 'healthy' };
  } catch (error) {
    health.services.redis = { status: 'unhealthy', message: 'Connection failed' };
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API routes with auth rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  // Check if it's our custom AppError
  if (err.statusCode && err.code) {
    Logger.warn(`AppError: ${err.message}`, { code: err.code, path: req.path });
    res.status(err.statusCode).json(err.toJSON ? err.toJSON() : {
      error: {
        message: err.message,
        code: err.code,
        status: err.statusCode,
      },
    });
    return;
  }

  // Log unexpected errors
  Logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' && !err.status
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      status: err.status || 500,
    },
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  Logger.info('Received shutdown signal, closing connections...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  Logger.info(`🚀 Server running on port ${PORT}`);
  Logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  Logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

export default app;