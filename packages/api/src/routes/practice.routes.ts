import { Router, Request, Response, NextFunction } from 'express';
import { practiceService } from '../services/practice.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/tier.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const startSessionSchema = z.object({
    domainIds: z.array(z.string().uuid()).optional(),
    taskIds: z.array(z.string().uuid()).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    questionCount: z.number().min(5).max(50).optional().default(20),
    mode: z.enum(['practice', 'timed', 'mock_exam']).optional().default('practice'),
});

const submitAnswerSchema = z.object({
    selectedOptionId: z.string().uuid('Invalid option ID'),
    timeSpentMs: z.number().min(0),
});

const sessionIdSchema = z.object({
    id: z.string().uuid('Invalid session ID'),
});

const questionIdSchema = z.object({
    questionId: z.string().uuid('Invalid question ID'),
});

/**
 * POST /api/practice/sessions
 * Start a new practice session
 */
router.post(
    '/sessions',
    authMiddleware,
    validateBody(startSessionSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await practiceService.startSession(req.user!.userId, req.body);

            res.status(201).json({
                success: true,
                data: {
                    sessionId: result.sessionId,
                    questions: result.questions,
                    questionCount: result.questions.length,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/practice/sessions/:id/answers/:questionId
 * Submit an answer for a question
 */
router.post(
    '/sessions/:id/answers/:questionId',
    authMiddleware,
    validateParams(z.object({
        id: z.string().uuid(),
        questionId: z.string().uuid(),
    })),
    validateBody(submitAnswerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await practiceService.submitAnswer(
                req.params.id!,
                req.params.questionId!,
                req.user!.userId,
                req.body.selectedOptionId,
                req.body.timeSpentMs
            );

            res.json({
                success: true,
                data: { result },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/practice/sessions/:id/complete
 * Complete a practice session
 */
router.post(
    '/sessions/:id/complete',
    authMiddleware,
    validateParams(sessionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await practiceService.completeSession(req.params.id!, req.user!.userId);

            res.json({
                success: true,
                data: { result },
                message: 'Session completed',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/practice/mock-exams
 * Start a mock exam (High-End/Corporate tier)
 */
router.post(
    '/mock-exams',
    authMiddleware,
    requireFeature('mockExams'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await practiceService.startMockExam(req.user!.userId);

            res.status(201).json({
                success: true,
                data: {
                    sessionId: result.sessionId,
                    questions: result.questions,
                    questionCount: result.questions.length,
                    timeLimit: 230 * 60 * 1000, // 230 minutes in ms
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/practice/flagged
 * Get flagged questions
 */
router.get(
    '/flagged',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const questions = await practiceService.getFlaggedQuestions(req.user!.userId);

            res.json({
                success: true,
                data: { questions, count: questions.length },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/practice/questions/:questionId/flag
 * Flag a question for review
 */
router.post(
    '/questions/:questionId/flag',
    authMiddleware,
    validateParams(questionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await practiceService.flagQuestion(req.user!.userId, req.params.questionId!);

            res.json({
                success: true,
                message: 'Question flagged for review',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/practice/questions/:questionId/flag
 * Unflag a question
 */
router.delete(
    '/questions/:questionId/flag',
    authMiddleware,
    validateParams(questionIdSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await practiceService.unflagQuestion(req.user!.userId, req.params.questionId!);

            res.json({
                success: true,
                message: 'Question unflagged',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/practice/stats
 * Get user's practice statistics
 */
router.get(
    '/stats',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await practiceService.getPracticeStats(req.user!.userId);

            res.json({
                success: true,
                data: { stats },
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
