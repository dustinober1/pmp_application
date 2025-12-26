import { Router } from "express";
import {
  getFlashcards,
  getFlashcardById,
  getFlashcardCategories,
  getDueCards,
  reviewCard,
  getStudyStats,
  updateDailyGoals,
} from "../controllers/flashcardController";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  getFlashcardsSchema,
  flashcardIdSchema,
  reviewFlashcardSchema,
  dueCardsSchema,
  updateGoalsSchema,
} from "../schemas/flashcard.schema";

const router = Router();

// Public routes (with optional auth for personalization)
router.get(
  "/",
  optionalAuth,
  validateResult(getFlashcardsSchema),
  getFlashcards,
);
router.get("/categories", getFlashcardCategories);

// Protected routes (require authentication)
router.get(
  "/due",
  authenticateToken,
  validateResult(dueCardsSchema),
  getDueCards,
);
router.get("/stats", authenticateToken, getStudyStats);
router.put(
  "/goals",
  authenticateToken,
  validateResult(updateGoalsSchema),
  updateDailyGoals,
);
router.post(
  "/:id/review",
  authenticateToken,
  validateResult(reviewFlashcardSchema),
  reviewCard,
);

// Get single flashcard (public)
router.get("/:id", validateResult(flashcardIdSchema), getFlashcardById);

export default router;
