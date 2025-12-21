import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  getDomains,
} from '../controllers/questionController';

const router = Router();

router.get('/', getQuestions);
router.get('/domains', getDomains);
router.get('/:id', getQuestionById);

export default router;