import { Router, Request, Response, NextFunction } from 'express';
import { flashcardService } from '../services/flashcard.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/tier.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import { z } from 'zod';
import { FlashcardRating } from '@pmp/shared';

const router = Router();

// Validation schemas
const flashcardQuerySchema = z.object({
  domainId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50)),
});

const startSessionSchema = z.object({
  domainIds: z.array(z.string().uuid()).optional(),
  taskIds: z.array(z.string().uuid()).optional(),
  cardCount: z.number().min(1).max(100).optional().default(20),
  includeCustom: z.boolean().optional().default(true),
  prioritizeReview: z.boolean().optional().default(true),
});

const recordResponseSchema = z.object({
  rating: z.enum(['know_it', 'learning', 'dont_know']),
  timeSpentMs: z.number().min(0),
});

const createFlashcardSchema = z.object({
  domainId: z.string().uuid('Invalid domain ID'),
  taskId: z.string().uuid('Invalid task ID'),
  front: z.string().min(1, 'Front is required').max(1000),
  back: z.string().min(1, 'Back is required').max(2000),
});

const sessionIdSchema = z.object({
  id: z.string().uuid('Invalid session ID'),
});

/**
 * GET /api/flashcards
 * Get flashcards with optional filters
 */
router.get(
  '/',
  authMiddleware,
  validateQuery(flashcardQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domainId = req.query.domainId as string | undefined;
      const taskId = req.query.taskId as string | undefined;
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 50;

      const flashcards = await flashcardService.getFlashcards({
        domainId,
        taskId,
        userId: req.user!.userId,
        limit,
      });

      res.json({
        success: true,
        data: { flashcards, count: flashcards.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/flashcards/review
 * Get flashcards due for review
 */
router.get('/review', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 20;
    const flashcards = await flashcardService.getDueForReview(req.user!.userId, limit);

    res.json({
      success: true,
      data: { flashcards, count: flashcards.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/flashcards/stats
 * Get user's flashcard review statistics
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await flashcardService.getReviewStats(req.user!.userId);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/flashcards/sessions
 * Start a new flashcard session
 */
router.post(
  '/sessions',
  authMiddleware,
  validateBody(startSessionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await flashcardService.startSession(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          cards: result.cards,
          cardCount: result.cards.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/flashcards/sessions/:id
 * Get an existing session
 */
router.get(
  '/sessions/:id',
  authMiddleware,
  validateParams(sessionIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await flashcardService.getSession(req.params.id!, req.user!.userId);

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
 * POST /api/flashcards/sessions/:id/responses/:cardId
 * Record a response for a flashcard
 */
router.post(
  '/sessions/:id/responses/:cardId',
  authMiddleware,
  validateParams(
    z.object({
      id: z.string().uuid(),
      cardId: z.string().uuid(),
    })
  ),
  validateBody(recordResponseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rating, timeSpentMs } = req.body;
      await flashcardService.recordResponse(
        req.params.id!,
        req.params.cardId!,
        req.user!.userId,
        rating as FlashcardRating,
        timeSpentMs
      );

      res.json({
        success: true,
        message: 'Response recorded',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/flashcards/sessions/:id/complete
 * Complete a flashcard session
 */
router.post(
  '/sessions/:id/complete',
  authMiddleware,
  validateParams(sessionIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await flashcardService.completeSession(req.params.id!);

      res.json({
        success: true,
        data: { stats },
        message: 'Session completed',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/flashcards/custom
 * Create a custom flashcard (High-End/Corporate tier only)
 */
router.post(
  '/custom',
  authMiddleware,
  requireFeature('customFlashcards'),
  validateBody(createFlashcardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flashcard = await flashcardService.createCustomFlashcard(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { flashcard },
        message: 'Custom flashcard created',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
