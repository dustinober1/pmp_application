import { Router } from 'express';
import {
  getPracticeTests,
  getPracticeTestById,
  startTestSession,
  submitAnswer,
  completeTestSession,
  getUserSessions,
  getTestSessionById,
} from '../controllers/practiceController';

const router = Router();

router.get('/tests', getPracticeTests);
router.get('/tests/:id', getPracticeTestById);
router.post('/sessions/start', startTestSession);
router.post('/sessions/answer', submitAnswer);
router.put('/sessions/:sessionId/complete', completeTestSession);
router.get('/sessions/user/:userId', getUserSessions);
router.get('/sessions/:sessionId', getTestSessionById);

export default router;