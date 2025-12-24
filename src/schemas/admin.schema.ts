import { z } from 'zod';

// Pagination schema (reusable)
export const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
    }),
});

// User ID param schema
export const userIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
});

// Update user role schema
export const updateUserRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID'),
    }),
    body: z.object({
        role: z.enum(['USER', 'ADMIN'] as const).describe('Role must be USER or ADMIN'),
    }),
});

// Create question schema
export const createQuestionSchema = z.object({
    body: z.object({
        domainId: z.string().uuid('Invalid domain ID'),
        questionText: z.string().min(10, 'Question text must be at least 10 characters').max(5000),
        scenario: z.string().max(5000).optional(),
        choices: z.string().min(10, 'Choices are required'),
        correctAnswerIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(10, 'Explanation must be at least 10 characters').max(5000),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
        methodology: z.enum(['PREDICTIVE', 'AGILE', 'HYBRID']).default('HYBRID'),
    }),
});

// Update question schema
export const updateQuestionSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid question ID'),
    }),
    body: z.object({
        questionText: z.string().min(10).max(5000).optional(),
        scenario: z.string().max(5000).optional().nullable(),
        choices: z.string().min(10).optional(),
        correctAnswerIndex: z.number().int().min(0).max(3).optional(),
        explanation: z.string().min(10).max(5000).optional(),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        methodology: z.enum(['PREDICTIVE', 'AGILE', 'HYBRID']).optional(),
        isActive: z.boolean().optional(),
    }),
});

// Question ID param schema
export const questionIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid question ID'),
    }),
});

// Create practice test schema
export const createTestSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Test name is required').max(200),
        description: z.string().min(1, 'Description is required').max(1000),
        totalQuestions: z.number().int().min(10).max(230).default(185),
        timeLimitMinutes: z.number().int().min(30).max(300).default(230),
    }),
});

// Update practice test schema
export const updateTestSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid test ID'),
    }),
    body: z.object({
        name: z.string().min(1).max(200).optional(),
        description: z.string().min(1).max(1000).optional(),
        totalQuestions: z.number().int().min(10).max(230).optional(),
        timeLimitMinutes: z.number().int().min(30).max(300).optional(),
        isActive: z.boolean().optional(),
    }),
});

// Test ID param schema
export const testIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid test ID'),
    }),
});
