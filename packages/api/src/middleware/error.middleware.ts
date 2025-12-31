import { Request, Response, NextFunction } from 'express';
import { ErrorResponseBody, GENERIC_ERRORS } from '@pmp/shared';

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;
    public readonly suggestion?: string;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        details?: Record<string, unknown>,
        suggestion?: string
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.suggestion = suggestion;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string, code: string = 'BAD_REQUEST', details?: Record<string, unknown>): AppError {
        return new AppError(message, code, 400, details);
    }

    static unauthorized(message: string = 'Authentication required', code: string = 'UNAUTHORIZED'): AppError {
        return new AppError(message, code, 401);
    }

    static forbidden(message: string, code: string = 'FORBIDDEN', suggestion?: string): AppError {
        return new AppError(message, code, 403, undefined, suggestion);
    }

    static notFound(message: string, code: string = 'NOT_FOUND'): AppError {
        return new AppError(message, code, 404);
    }

    static conflict(message: string, code: string = 'CONFLICT', suggestion?: string): AppError {
        return new AppError(message, code, 409, undefined, suggestion);
    }

    static internal(message: string = 'An unexpected error occurred'): AppError {
        return new AppError(message, GENERIC_ERRORS.INTERNAL_ERROR.code, 500);
    }
}

export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void {
    const timestamp = new Date().toISOString();
    const requestId = req.requestId || 'unknown';

    // Log error
    console.error(`[${timestamp}] [${requestId}] Error:`, err);

    if (err instanceof AppError) {
        const response: ErrorResponseBody = {
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                suggestion: err.suggestion,
            },
            timestamp,
            requestId,
        };

        res.status(err.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const response: ErrorResponseBody = {
            error: {
                code: 'DATABASE_ERROR',
                message: 'A database error occurred',
            },
            timestamp,
            requestId,
        };

        res.status(400).json(response);
        return;
    }

    // Handle validation errors (Zod)
    if (err.name === 'ZodError') {
        const response: ErrorResponseBody = {
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: { errors: JSON.parse(err.message) },
            },
            timestamp,
            requestId,
        };

        res.status(400).json(response);
        return;
    }

    // Generic error response
    const response: ErrorResponseBody = {
        error: {
            code: GENERIC_ERRORS.INTERNAL_ERROR.code,
            message: process.env.NODE_ENV === 'production'
                ? GENERIC_ERRORS.INTERNAL_ERROR.message
                : err.message,
        },
        timestamp,
        requestId,
    };

    res.status(500).json(response);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    const error = AppError.notFound(`Route ${req.method} ${req.path} not found`);
    next(error);
}
