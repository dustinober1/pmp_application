import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
            startTime?: number;
        }
    }
}

/**
 * Middleware to add correlation ID to each request
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const existingCorrelationId = req.headers['x-correlation-id'] as string;
    const correlationId = existingCorrelationId || uuidv4();

    req.correlationId = correlationId;
    req.startTime = Date.now();

    res.setHeader('X-Correlation-ID', correlationId);

    next();
};

/**
 * Response time logging middleware
 */
export const responseTimeMiddleware = (serviceName: string, logger: any) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        res.on('finish', () => {
            const duration = req.startTime ? Date.now() - req.startTime : 0;
            logger.http(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
                correlationId: req.correlationId,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration,
            });
        });
        next();
    };
};
