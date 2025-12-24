import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import questionRoutes from './routes/questions';
import flashcardRoutes from './routes/flashcards';
import practiceRoutes from './routes/practice';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const SERVICE_NAME = 'questions-service';

// Logger
const log = {
    info: (msg: string) => console.log(`[${SERVICE_NAME}] ${new Date().toISOString()} INFO: ${msg}`),
    warn: (msg: string) => console.warn(`[${SERVICE_NAME}] ${new Date().toISOString()} WARN: ${msg}`),
    error: (msg: string) => console.error(`[${SERVICE_NAME}] ${new Date().toISOString()} ERROR: ${msg}`),
    http: (msg: string) => console.log(`[${SERVICE_NAME}] ${new Date().toISOString()} HTTP: ${msg}`),
};

// Correlation ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
});

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));

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
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    log.info(`📚 Questions Service running on port ${PORT}`);
});

export default app;
