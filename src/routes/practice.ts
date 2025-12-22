import { Router } from 'express';
import {
  getPracticeTests,
  getPracticeTestById,
  startTestSession,
  submitAnswer,
  toggleFlag,
  completeTestSession,
  getSessionReview,
  getUserSessions,
  getTestSessionById,
} from '../controllers/practiceController';

const router = Router();

router.get('/tests', getPracticeTests);
router.get('/tests/:id', getPracticeTestById);
router.post('/sessions/start', startTestSession);
router.post('/sessions/answer', submitAnswer);
router.post('/sessions/flag', toggleFlag);
router.put('/sessions/:sessionId/complete', completeTestSession);
router.get('/sessions/:sessionId/review', getSessionReview);
router.get('/sessions/user/:userId', getUserSessions);
router.get('/sessions/:sessionId', getTestSessionById);

export default router;