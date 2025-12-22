import { Router } from 'express';
import {
  getFlashcards,
  getFlashcardById,
  getFlashcardCategories,
  getDueCards,
  reviewCard,
  getStudyStats,
  updateDailyGoals,
} from '../controllers/flashcardController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, getFlashcards);
router.get('/categories', getFlashcardCategories);

// Protected routes (require authentication)
router.get('/due', authenticateToken, getDueCards);
router.get('/stats', authenticateToken, getStudyStats);
router.put('/goals', authenticateToken, updateDailyGoals);
router.post('/:id/review', authenticateToken, reviewCard);

// Get single flashcard (public)
router.get('/:id', getFlashcardById);

export default router;