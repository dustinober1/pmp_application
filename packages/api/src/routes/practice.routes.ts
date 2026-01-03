import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { practiceService } from '../services/practice.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/tier.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';
import { PMP_EXAM } from '@pmp/shared';

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

const questionsQuerySchema = z.object({
  offset: z.coerce.number().min(0).optional().default(0),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
});

const startMockExamSchema = z.object({
  examId: z.number().int().min(1).max(6).optional().default(1),
});

/**
 * POST /api/practice/sessions
 * Start a new practice session
 * Returns session metadata only - questions loaded separately via paginated endpoint
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
          totalQuestions: result.totalQuestions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/practice/sessions/:id/questions
 * Get paginated questions for a session
 * Enables lazy loading of questions in batches
 */
router.get(
  '/sessions/:id/questions',
  authMiddleware,
  validateParams(sessionIdSchema),
  validateParams(questionsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await practiceService.getSessionQuestions(
        req.params.id!,
        req.user!.userId,
        offset,
        limit
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/practice/sessions/:id/streak
 * Get current session streak (consecutive correct answers)
 */
router.get(
  '/sessions/:id/streak',
  authMiddleware,
  validateParams(sessionIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streak = await practiceService.getSessionStreak(req.params.id!, req.user!.userId);

      res.json({
        success: true,
        data: streak,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/practice/sessions/:id
 * Get an existing practice session (metadata only, questions loaded separately)
 */
router.get(
  '/sessions/:id',
  authMiddleware,
  validateParams(sessionIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await practiceService.getSession(req.params.id!, req.user!.userId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Session not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: session,
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
  validateParams(
    z.object({
      id: z.string().uuid(),
      questionId: z.string().uuid(),
    })
  ),
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
 * GET /api/practice/mock-exams
 * List available mock exams
 */
router.get(
  '/mock-exams',
  authMiddleware,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const exams = await practiceService.getAvailableMockExams();

      res.json({
        success: true,
        data: {
          exams,
          count: exams.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/practice/mock-exams
 * Start a mock exam (High-End/Corporate tier)
 * Returns session metadata only - questions loaded separately via paginated endpoint
 */
router.post(
  '/mock-exams',
  authMiddleware,
  requireFeature('mockExams'),
  validateBody(startMockExamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { examId } = req.body;
      const result = await practiceService.startMockExam(req.user!.userId, examId);

      res.status(201).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          totalQuestions: result.totalQuestions,
          startedAt: result.startedAt,
          examName: result.examName,
          timeLimitMs: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
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
router.get('/flagged', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await practiceService.getFlaggedQuestions(req.user!.userId);

    res.json({
      success: true,
      data: { questions, count: questions.length },
    });
  } catch (error) {
    next(error);
  }
});

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
router.get('/stats', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await practiceService.getPracticeStats(req.user!.userId);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
