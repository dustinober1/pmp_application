import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const data = req[part];
            const validated = schema.parse(data);
            req[part] = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                next(
                    AppError.badRequest('Validation failed', 'VALIDATION_ERROR', {
                        errors: details,
                    })
                );
                return;
            }
            next(error);
        }
    };
}

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
