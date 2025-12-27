import { Router } from "express";
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
} from "../controllers/practiceController";
import { validateResult } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import {
  startSessionSchema,
  submitAnswerSchema,
  toggleFlagSchema,
  completeSessionSchema,
} from "../schemas/practice.schema";

const router = Router();

// Protect all practice routes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.use(authenticateToken as any);

router.get("/tests", getPracticeTests);
router.get("/tests/:id", getPracticeTestById);
router.post(
  "/sessions/start",
  validateResult(startSessionSchema),
  startTestSession,
);
router.post(
  "/sessions/answer",
  validateResult(submitAnswerSchema),
  submitAnswer,
);
router.post("/sessions/flag", validateResult(toggleFlagSchema), toggleFlag);
router.put(
  "/sessions/:sessionId/complete",
  validateResult(completeSessionSchema),
  completeTestSession,
);
router.get("/sessions/:sessionId/review", getSessionReview);
router.get("/sessions/user/:userId", getUserSessions);
router.get("/sessions/:sessionId", getTestSessionById);

export default router;
