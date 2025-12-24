import { z } from 'zod';

// Domain ID param schema
export const domainIdSchema = z.object({
    params: z.object({
        domainId: z.string().uuid('Invalid domain ID'),
    }),
});

// Record activity schema
export const recordActivitySchema = z.object({
    body: z.object({
        type: z.enum(['flashcard', 'question', 'test'] as const),
        count: z.number().int().min(1).max(1000).default(1),
    }),
});

// History query schema
export const historyQuerySchema = z.object({
    query: z.object({
        days: z.coerce.number().int().min(1).max(365).default(30),
    }),
});
