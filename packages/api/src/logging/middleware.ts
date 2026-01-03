/**
 * Express middleware for request logging and trace ID management
 */

import type { Request, Response, NextFunction } from 'express';
import { getLogger, generateTraceId, Logger } from './logger';

/**
 * Extend Express Request to include trace ID and start time
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      trace_id?: string;
      user_id?: string | number;
      start_time?: number;
    }
  }
}

/**
 * Middleware to add trace ID to every request
 */
export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract trace ID from header or generate new one
  const traceId = generateTraceId(req.headers['x-trace-id'] as string);

  // Set trace ID on request
  req.trace_id = traceId;

  // Set trace ID in logger context
  Logger.setTraceId(traceId);

  // Add trace ID to response header for client-side tracking
  res.setHeader('X-Trace-ID', traceId);

  next();
}

/**
 * Middleware to add user ID to request context
 */
export function userIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Extract user ID from request if authenticated
  const userId = (req as any).user?.id || (req as any).userId;

  if (userId) {
    req.user_id = userId;
    Logger.setUserId(userId);
  }

  next();
}

/**
 * Middleware to log all HTTP requests
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const logger = getLogger();
  const startTime = Date.now();
  req.start_time = startTime;

  logger.http('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    user_agent: req.get('user-agent'),
    trace_id: req.trace_id,
    user_id: req.user_id,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Select log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', undefined, {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        trace_id: req.trace_id,
        user_id: req.user_id,
      });
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        trace_id: req.trace_id,
        user_id: req.user_id,
      });
    } else {
      logger.info('Request completed successfully', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        trace_id: req.trace_id,
        user_id: req.user_id,
      });
    }
  });

  next();
}

/**
 * Middleware to log errors
 */
export function errorLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = getLogger();
  const duration = req.start_time ? Date.now() - req.start_time : 0;

  logger.error(`Unhandled error: ${err.message}`, err, {
    method: req.method,
    path: req.path,
    status: res.statusCode || 500,
    duration,
    ip: req.ip,
    trace_id: req.trace_id,
    user_id: req.user_id,
  });

  next(err);
}

/**
 * Combined middleware with all logging features
 */
export function loggingMiddleware() {
  return [traceIdMiddleware, userIdMiddleware, requestLoggingMiddleware] as const;
}

/**
 * Middleware to clear context after request completes
 */
export function contextCleanupMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    Logger.clearContext();
  });

  next();
}
