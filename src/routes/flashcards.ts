import { Router } from 'express';
import {
  getFlashcards,
  getFlashcardById,
  getFlashcardCategories,
} from '../controllers/flashcardController';

const router = Router();

router.get('/', getFlashcards);
router.get('/categories', getFlashcardCategories);
router.get('/:id', getFlashcardById);

export default router;