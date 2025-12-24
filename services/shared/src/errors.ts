/**
 * Custom error class for microservices
 */
export class ServiceError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                status: this.statusCode,
                ...(this.details && { details: this.details }),
            },
        };
    }
}

/**
 * Factory for creating common error types
 */
export const ErrorFactory = {
    badRequest: (message = 'Bad request', details?: Record<string, unknown>) =>
        new ServiceError(message, 400, 'BAD_REQUEST', true, details),

    unauthorized: (message = 'Authentication required') =>
        new ServiceError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message = 'Access denied') =>
        new ServiceError(message, 403, 'FORBIDDEN'),

    notFound: (resource = 'Resource') =>
        new ServiceError(`${resource} not found`, 404, 'NOT_FOUND'),

    conflict: (message = 'Resource already exists') =>
        new ServiceError(message, 409, 'CONFLICT'),

    tooManyRequests: (message = 'Too many requests') =>
        new ServiceError(message, 429, 'TOO_MANY_REQUESTS'),

    internal: (message = 'Internal server error') =>
        new ServiceError(message, 500, 'INTERNAL_ERROR', false),

    serviceUnavailable: (service: string) =>
        new ServiceError(`${service} is currently unavailable`, 503, 'SERVICE_UNAVAILABLE'),
};
