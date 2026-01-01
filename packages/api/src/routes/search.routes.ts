import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { contentService } from '../services/content.service';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation.middleware';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 20)),
});

/**
 * GET /api/search
 * Search across all content
 */
router.get(
  '/',
  validateQuery(searchQuerySchema),
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query.q as string;
      const limit = req.query.limit as unknown as number;
      const results = await contentService.searchContent(q, limit);
      res.json({
        success: true,
        data: {
          query: q,
          results,
          count: results.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
