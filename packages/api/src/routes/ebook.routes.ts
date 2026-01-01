import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { ebookService } from '../services/ebook.service';
import { ebookProgressService } from '../services/ebook-progress.service';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import prisma from '../config/database';
import type { TierName } from '@pmp/shared';
import { z } from 'zod';

const router = Router();

// Validators
const updateProgressSchema = z.object({
  chapterSlug: z.string().min(1, 'Chapter slug is required'),
  sectionSlug: z.string().min(1, 'Section slug is required'),
});

/**
 * GET /api/ebook
 * Get all chapters (accessible to all users, premium indicator shown)
 */
router.get(
  '/',
  optionalAuthMiddleware,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const chapters = await ebookService.getAllChapters();

      res.json({
        success: true,
        data: { chapters, count: chapters.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ebook/chapters/:slug
 * Get chapter details with all sections (metadata only, no content)
 */
router.get(
  '/chapters/:slug',
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Chapter slug is required' },
        });
        return;
      }
      const chapter = await ebookService.getChapterBySlug(slug);

      res.json({
        success: true,
        data: { chapter },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ebook/chapters/:chapterSlug/sections/:sectionSlug
 * Get a single section's full content with access control
 */
router.get(
  '/chapters/:chapterSlug/sections/:sectionSlug',
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chapterSlug, sectionSlug } = req.params;
      if (!chapterSlug || !sectionSlug) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Chapter and section slugs are required' },
        });
        return;
      }

      // Get user's tier from subscription
      let userTier: TierName | null = null;
      if (req.user?.userId) {
        const subscription = await prisma.userSubscription.findUnique({
          where: { userId: req.user.userId },
          include: { tier: true },
        });
        userTier = (subscription?.tier?.name as TierName) || 'free';
      }

      const section = await ebookService.getSectionBySlug(chapterSlug, sectionSlug, userTier);

      // Track progress for authenticated users
      if (req.user?.userId) {
        // Don't await - fire and forget for better performance
        ebookProgressService
          .updateProgress(req.user.userId, chapterSlug, sectionSlug)
          .catch(error => {
            console.error('Failed to update ebook progress:', error);
          });
      }

      res.json({
        success: true,
        data: { section },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ebook/search
 * Search across ebook content
 * Query params: q (search query)
 */
router.get(
  '/search',
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;

      // Get user's tier from subscription
      let userTier: TierName | null = null;
      if (req.user?.userId) {
        const subscription = await prisma.userSubscription.findUnique({
          where: { userId: req.user.userId },
          include: { tier: true },
        });
        userTier = (subscription?.tier?.name as TierName) || 'free';
      }

      if (typeof q !== 'string') {
        res.json({
          success: true,
          data: { results: [], count: 0 },
        });
        return;
      }

      const results = await ebookService.searchContent(q, userTier);

      res.json({
        success: true,
        data: { results, count: results.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ebook/progress
 * Update reading progress
 * Body: { chapterSlug, sectionSlug }
 * Creates UserEbookProgress if not exists
 * Updates lastChapterId, lastSectionId
 * Adds sectionId to completedSections array
 */
router.post(
  '/progress',
  authMiddleware,
  validateBody(updateProgressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chapterSlug, sectionSlug } = req.body;
      const progress = await ebookProgressService.updateProgress(
        req.user!.userId,
        chapterSlug,
        sectionSlug
      );

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ebook/progress
 * Get current user's progress
 * Returns lastChapterId, lastSectionId, completedSections array
 * Calculates overall progress percentage
 */
router.get('/progress', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await ebookProgressService.getProgress(req.user!.userId);

    res.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ebook/progress/chapter/:chapterSlug
 * Get progress for specific chapter
 * Returns which sections are completed
 * Shows chapter progress percentage
 */
router.get(
  '/progress/chapter/:chapterSlug',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chapterSlug } = req.params;
      if (!chapterSlug) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARAMS', message: 'Chapter slug is required' },
        });
        return;
      }
      const progress = await ebookProgressService.getChapterProgress(req.user!.userId, chapterSlug);

      res.json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ebook/progress/complete
 * Mark a section as completed
 * Body: { chapterSlug, sectionSlug }
 */
router.post(
  '/progress/complete',
  authMiddleware,
  validateBody(updateProgressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chapterSlug, sectionSlug } = req.body;
      await ebookProgressService.markSectionComplete(req.user!.userId, chapterSlug, sectionSlug);

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
 * POST /api/ebook/progress/reset
 * Reset all progress for current user
 */
router.post(
  '/progress/reset',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ebookProgressService.resetProgress(req.user!.userId);

      res.json({
        success: true,
        message: 'Progress reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
