import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTier } from '../middleware/tier.middleware';

const router = Router();

/**
 * GET /api/dashboard
 * Get user's dashboard data
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await dashboardService.getDashboardData(req.user!.userId);

    res.json({
      success: true,
      data: { dashboard },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/streak
 * Get user's study streak
 */
router.get('/streak', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const streak = await dashboardService.getStudyStreak(req.user!.userId);

    res.json({
      success: true,
      data: { streak },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/progress
 * Get domain progress
 */
router.get('/progress', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const domainProgress = await dashboardService.getDomainProgress(req.user!.userId);

    res.json({
      success: true,
      data: { domainProgress },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/activity
 * Get recent activity
 */
router.get('/activity', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10;
    const activity = await dashboardService.getRecentActivity(req.user!.userId, limit);

    res.json({
      success: true,
      data: { activity, count: activity.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/reviews
 * Get upcoming flashcard reviews
 */
router.get('/reviews', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10;
    const reviews = await dashboardService.getUpcomingReviews(req.user!.userId, limit);

    res.json({
      success: true,
      data: { reviews, count: reviews.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/weak-areas
 * Get weak areas
 */
router.get(
  '/weak-areas',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weakAreas = await dashboardService.getWeakAreas(req.user!.userId);

      res.json({
        success: true,
        data: { weakAreas, count: weakAreas.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/dashboard/readiness
 * Get exam readiness score (Mid-Level+ tier)
 */
router.get(
  '/readiness',
  authMiddleware,
  requireTier('mid-level'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const readiness = await dashboardService.getReadinessScore(req.user!.userId);

      res.json({
        success: true,
        data: { readiness },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/dashboard/recommendations
 * Get personalized recommendations (High-End+ tier)
 */
router.get(
  '/recommendations',
  authMiddleware,
  requireTier('high-end'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendations = await dashboardService.getRecommendations(req.user!.userId);

      res.json({
        success: true,
        data: { recommendations, count: recommendations.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
