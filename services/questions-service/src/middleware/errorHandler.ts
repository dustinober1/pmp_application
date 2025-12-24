import { Request, Response, NextFunction } from 'express';

interface ServiceError extends Error {
    statusCode?: number;
    code?: string;
    toJSON?: () => object;
}

export const errorHandler = (
    err: ServiceError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err.statusCode && err.code) {
        res.status(err.statusCode).json(err.toJSON ? err.toJSON() : {
            error: {
                message: err.message,
                code: err.code,
                status: err.statusCode,
            },
        });
        return;
    }

    console.error('Unexpected error:', err);

    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(500).json({
        error: {
            message,
            code: 'INTERNAL_ERROR',
            status: 500,
        },
    });
};
