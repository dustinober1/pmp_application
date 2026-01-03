/**
 * Analytics Routes
 * API endpoints for accessing PMP Study Pro analytics data
 *
 * All endpoints require authentication
 * Admin-only endpoints require admin middleware
 */

import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { z } from "zod";
import { AnalyticsService } from "../services/analytics.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * Validation schemas
 */
const timeRangeSchema = z.enum(["24h", "7d", "30d", "90d", "all"]).default("30d");
const analyticsQuerySchema = z.object({
  timeRange: timeRangeSchema,
  domainId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

// ==================== STUDENT LEARNING ANALYTICS ====================

/**
 * GET /api/analytics/learning/overview
 * Get overall student learning analytics (ADMIN ONLY)
 *
 * Query params:
 * - timeRange: "24h" | "7d" | "30d" | "90d" | "all" (default: "30d")
 * - limit: number of users to return (default: 100)
 */
router.get(
  "/learning/overview",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      const data = await analyticsService.getStudentLearningAnalytics({
        timeRange: query.timeRange,
        limit,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/analytics/learning/user/:userId
 * Get learning analytics for a specific user
 * - Users can access their own analytics
 * - Admins can access any user's analytics
 */
router.get(
  "/learning/user/:userId",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Check if user is requesting their own data or is an admin
      if (req.user?.userId !== userId && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only access your own analytics",
          },
        });
      }

      const data = await analyticsService.getUserLearningAnalytics(userId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/analytics/learning/domain/:domainId
 * Get learning analytics for a specific domain (ADMIN ONLY)
 */
router.get(
  "/learning/domain/:domainId",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { domainId } = req.params;

      const data = await analyticsService.getDomainLearningAnalytics(domainId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ==================== FLASHCARD PERFORMANCE ANALYTICS ====================

/**
 * GET /api/analytics/flashcards/overview
 * Get overall flashcard performance analytics (ADMIN ONLY)
 *
 * Query params:
 * - timeRange: "24h" | "7d" | "30d" | "90d" | "all" (default: "30d")
 * - domainId: optional domain filter
 * - taskId: optional task filter
 */
router.get(
  "/flashcards/overview",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);

      const data = await analyticsService.getFlashcardAnalytics({
        timeRange: query.timeRange,
        domainId: query.domainId,
        taskId: query.taskId,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/analytics/flashcards/user/:userId
 * Get flashcard analytics for a specific user
 * - Users can access their own analytics
 * - Admins can access any user's analytics
 */
router.get(
  "/flashcards/user/:userId",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Check if user is requesting their own data or is an admin
      if (req.user?.userId !== userId && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only access your own analytics",
          },
        });
      }

      const data = await analyticsService.getUserFlashcardAnalytics(userId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ==================== PRACTICE QUESTION INSIGHTS ====================

/**
 * GET /api/analytics/questions/overview
 * Get overall practice question analytics (ADMIN ONLY)
 *
 * Query params:
 * - timeRange: "24h" | "7d" | "30d" | "90d" | "all" (default: "30d")
 * - domainId: optional domain filter
 * - taskId: optional task filter
 * - difficulty: optional difficulty filter ("easy" | "medium" | "hard")
 */
router.get(
  "/questions/overview",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);

      const data = await analyticsService.getQuestionAnalytics({
        timeRange: query.timeRange,
        domainId: query.domainId,
        taskId: query.taskId,
        difficulty: query.difficulty,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/analytics/questions/user/:userId
 * Get question analytics for a specific user
 * - Users can access their own analytics
 * - Admins can access any user's analytics
 */
router.get(
  "/questions/user/:userId",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Check if user is requesting their own data or is an admin
      if (req.user?.userId !== userId && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only access your own analytics",
          },
        });
      }

      const data = await analyticsService.getUserQuestionAnalytics(userId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ==================== SYSTEM PERFORMANCE METRICS ====================

/**
 * GET /api/analytics/system/overview
 * Get system performance metrics (ADMIN ONLY)
 *
 * Query params:
 * - timeRange: "24h" | "7d" | "30d" | "90d" | "all" (default: "24h")
 */
router.get(
  "/system/overview",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);

      const data = await analyticsService.getSystemPerformanceMetrics({
        timeRange: query.timeRange,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/analytics/dashboard
 * Get aggregated analytics data for admin dashboard (ADMIN ONLY)
 * Returns a summary of all analytics categories
 */
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);

      // Fetch all analytics in parallel for better performance
      const [
        learningAnalytics,
        flashcardAnalytics,
        questionAnalytics,
        systemMetrics,
      ] = await Promise.all([
        analyticsService.getStudentLearningAnalytics({
          timeRange: query.timeRange,
          limit: 50,
        }),
        analyticsService.getFlashcardAnalytics({
          timeRange: query.timeRange,
        }),
        analyticsService.getQuestionAnalytics({
          timeRange: query.timeRange,
        }),
        analyticsService.getSystemPerformanceMetrics({
          timeRange: query.timeRange,
        }),
      ]);

      res.json({
        success: true,
        data: {
          learning: learningAnalytics,
          flashcards: flashcardAnalytics,
          questions: questionAnalytics,
          system: systemMetrics,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
