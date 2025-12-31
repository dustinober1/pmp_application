import { Router, Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const domainIdSchema = z.object({
    id: z.string().uuid('Invalid domain ID'),
});

const taskIdSchema = z.object({
    taskId: z.string().uuid('Invalid task ID'),
});

const sectionIdSchema = z.object({
    sectionId: z.string().uuid('Invalid section ID'),
});

/**
 * GET /api/domains
 * Get all domains
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const domains = await contentService.getDomains();
        res.json({
            success: true,
            data: { domains },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/domains/:id
 * Get domain by ID with tasks
 */
router.get(
    '/:id',
    validateParams(domainIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const domain = await contentService.getDomainById(req.params.id!);

            if (!domain) {
                res.status(404).json({
                    success: false,
                    error: { code: 'CONTENT_001', message: 'Domain not found' },
                });
                return;
            }

            res.json({
                success: true,
                data: { domain },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/domains/:id/tasks
 * Get tasks by domain
 */
router.get(
    '/:id/tasks',
    validateParams(domainIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await contentService.getTasksByDomain(req.params.id!);
            res.json({
                success: true,
                data: { tasks },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/domains/tasks/:taskId/study-guide
 * Get study guide for a task
 */
router.get(
    '/tasks/:taskId/study-guide',
    validateParams(taskIdSchema),
    optionalAuthMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const studyGuide = await contentService.getStudyGuide(req.params.taskId!);

            if (!studyGuide) {
                res.status(404).json({
                    success: false,
                    error: { code: 'CONTENT_003', message: 'Study guide not found' },
                });
                return;
            }

            res.json({
                success: true,
                data: { studyGuide },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/domains/progress/sections/:sectionId/complete
 * Mark a section as complete
 */
router.post(
    '/progress/sections/:sectionId/complete',
    authMiddleware,
    validateParams(sectionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await contentService.markSectionComplete(req.user!.userId, req.params.sectionId!);
            res.json({
                success: true,
                message: 'Section marked as complete',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/domains/progress
 * Get user's study progress
 */
router.get(
    '/progress',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const progress = await contentService.getUserProgress(req.user!.userId);
            res.json({
                success: true,
                data: { progress },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
