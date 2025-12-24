import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const QUESTIONS_SERVICE_URL = process.env.QUESTIONS_SERVICE_URL || 'http://localhost:3002';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003';

// Logger (simplified for gateway)
const log = {
    info: (msg: string) => console.log(`[GATEWAY] ${new Date().toISOString()} INFO: ${msg}`),
    warn: (msg: string) => console.warn(`[GATEWAY] ${new Date().toISOString()} WARN: ${msg}`),
    error: (msg: string) => console.error(`[GATEWAY] ${new Date().toISOString()} ERROR: ${msg}`),
    http: (msg: string) => console.log(`[GATEWAY] ${new Date().toISOString()} HTTP: ${msg}`),
};

// Correlation ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
});

// Security
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            log.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts.' },
});

app.use(generalLimiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        log.http(`${req.headers['x-correlation-id']} ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
    const services = [
        { name: 'auth', url: AUTH_SERVICE_URL },
        { name: 'questions', url: QUESTIONS_SERVICE_URL },
        { name: 'analytics', url: ANALYTICS_SERVICE_URL },
    ];

    const health: {
        status: string;
        timestamp: string;
        services: Record<string, { status: string; latency?: number }>;
    } = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {},
    };

    for (const service of services) {
        try {
            const start = Date.now();
            const response = await fetch(`${service.url}/health`);
            const latency = Date.now() - start;

            if (response.ok) {
                health.services[service.name] = { status: 'healthy', latency };
            } else {
                health.services[service.name] = { status: 'unhealthy' };
                health.status = 'DEGRADED';
            }
        } catch {
            health.services[service.name] = { status: 'unreachable' };
            health.status = 'DEGRADED';
        }
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
});

// Proxy configuration
const createProxy = (target: string, pathRewrite?: Record<string, string>): Options => ({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
        proxyReq: (proxyReq, req) => {
            // Forward correlation ID
            const correlationId = req.headers['x-correlation-id'];
            if (correlationId) {
                proxyReq.setHeader('X-Correlation-ID', correlationId as string);
            }
            // Forward auth header
            const authHeader = req.headers.authorization;
            if (authHeader) {
                proxyReq.setHeader('Authorization', authHeader);
            }
        },
        error: (err, req, res) => {
            log.error(`Proxy error: ${err.message}`);
            if (res && 'status' in res) {
                (res as Response).status(503).json({
                    error: { message: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' }
                });
            }
        },
    },
});

// Route to Auth Service
app.use('/api/auth', authLimiter, createProxyMiddleware(createProxy(AUTH_SERVICE_URL, {
    '^/api/auth': '/api/auth',
})));

// Route to Questions Service (questions, flashcards, practice)
app.use('/api/questions', createProxyMiddleware(createProxy(QUESTIONS_SERVICE_URL, {
    '^/api/questions': '/api/questions',
})));

app.use('/api/flashcards', createProxyMiddleware(createProxy(QUESTIONS_SERVICE_URL, {
    '^/api/flashcards': '/api/flashcards',
})));

app.use('/api/practice', createProxyMiddleware(createProxy(QUESTIONS_SERVICE_URL, {
    '^/api/practice': '/api/practice',
})));

app.use('/api/admin', createProxyMiddleware(createProxy(QUESTIONS_SERVICE_URL, {
    '^/api/admin': '/api/admin',
})));

// Route to Analytics Service (progress, dashboard)
app.use('/api/progress', createProxyMiddleware(createProxy(ANALYTICS_SERVICE_URL, {
    '^/api/progress': '/api/progress',
})));

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    log.error(`Error: ${err.message}`);
    res.status(500).json({
        error: { message: 'Internal gateway error', code: 'GATEWAY_ERROR' }
    });
});

// Start server
app.listen(PORT, () => {
    log.info(`🚀 API Gateway running on port ${PORT}`);
    log.info(`📡 Auth Service: ${AUTH_SERVICE_URL}`);
    log.info(`📡 Questions Service: ${QUESTIONS_SERVICE_URL}`);
    log.info(`📡 Analytics Service: ${ANALYTICS_SERVICE_URL}`);
});

export default app;
