/**
 * Adaptive Learning API Routes
 *
 * Provides endpoints for the Adaptive Learning Engine functionality.
 * All routes require authentication.
 */

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  getLearningProfile,
  getRecommendedQuestions,
  getKnowledgeGaps,
  getRecentInsights,
} from "../controllers/adaptiveController";
import {
  getQuestionsSchema,
  getGapsSchema,
  getInsightsSchema,
  validateDifficultyRange,
} from "../schemas/adaptive.schema";

const router = Router();

// =============================================================================
// Authentication Middleware
// =============================================================================
// All adaptive learning routes require authentication
router.use(authenticateToken);

// =============================================================================
// Adaptive Learning Profile Routes
// =============================================================================

/**
 * GET /api/adaptive/profile
 *
 * Get user's complete learning profile including:
 * - Domain mastery levels with trends
 * - Knowledge gaps with priorities
 * - Recent insights
 *
 * Creates default profile if not exists (mastery = 50%)
 *
 * Requirements: 6.1, 6.5
 */
router.get("/profile", getLearningProfile);

// =============================================================================
// Question Selection Routes
// =============================================================================

/**
 * GET /api/adaptive/questions
 *
 * Get recommended questions for adaptive practice session.
 * Implements 60/25/15 distribution (gap/maintenance/stretch).
 *
 * Query Parameters:
 * - count: Number of questions (1-50, default: 10)
 * - domainFilter: UUID of specific domain (optional)
 * - difficultyMin: Minimum difficulty (EASY|MEDIUM|HARD, optional)
 * - difficultyMax: Maximum difficulty (EASY|MEDIUM|HARD, optional)
 * - excludeRecentDays: Days to exclude recently answered questions (0-30, default: 7)
 *
 * Requirements: 6.2
 */
router.get(
  "/questions",
  validateResult(getQuestionsSchema),
  (req, res, next) => {
    // Custom validation for difficulty range
    try {
      validateDifficultyRange(req.query);
      next();
    } catch (error) {
      res.status(400).json({
        error: {
          message:
            error instanceof Error ? error.message : "Invalid difficulty range",
          code: "VALIDATION_ERROR",
          status: 400,
        },
      });
    }
  },
  getRecommendedQuestions,
);

// =============================================================================
// Knowledge Gap Routes
// =============================================================================

/**
 * GET /api/adaptive/gaps
 *
 * Get prioritized knowledge gaps for the user.
 * Gaps are ranked by severity and exam weight.
 *
 * Query Parameters:
 * - limit: Maximum number of gaps to return (1-20, default: 10)
 *
 * Requirements: 6.3
 */
router.get("/gaps", validateResult(getGapsSchema), getKnowledgeGaps);

// =============================================================================
// Insights Routes
// =============================================================================

/**
 * GET /api/adaptive/insights
 *
 * Get recent insights for the user including:
 * - Performance trends
 * - Accuracy alerts
 * - Milestone celebrations
 * - Recommendations
 *
 * Query Parameters:
 * - limit: Maximum number of insights to return (1-50, default: 20)
 *
 * Requirements: 6.4
 */
router.get("/insights", validateResult(getInsightsSchema), getRecentInsights);

export default router;
