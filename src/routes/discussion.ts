import { Router } from "express";
import {
  adminHideComment,
  adminVerifyComment,
  createComment,
  deleteComment,
  getComments,
  reportComment,
  unvoteComment,
  updateComment,
  voteComment,
} from "../controllers/discussionController";
import {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  adminModerateCommentSchema,
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  reportCommentSchema,
  updateCommentSchema,
  voteCommentSchema,
} from "../schemas/discussion.schema";

const router = Router();

// Public list with optional auth to show vote state for logged-in users
router.get(
  "/questions/:id/comments",
  optionalAuth as any,
  validateResult(getCommentsSchema),
  getComments,
);

// Authenticated comment actions
router.post(
  "/questions/:id/comments",
  authenticateToken as any,
  validateResult(createCommentSchema),
  createComment,
);

router.put(
  "/comments/:id",
  authenticateToken as any,
  validateResult(updateCommentSchema),
  updateComment,
);

router.delete(
  "/comments/:id",
  authenticateToken as any,
  validateResult(deleteCommentSchema),
  deleteComment,
);

router.post(
  "/comments/:id/vote",
  authenticateToken as any,
  validateResult(voteCommentSchema),
  voteComment,
);

router.delete(
  "/comments/:id/vote",
  authenticateToken as any,
  validateResult(voteCommentSchema),
  unvoteComment,
);

router.post(
  "/comments/:id/report",
  authenticateToken as any,
  validateResult(reportCommentSchema),
  reportComment,
);

// Admin moderation actions
router.put(
  "/admin/comments/:id/hide",
  authenticateToken as any,
  requireAdmin as any,
  validateResult(adminModerateCommentSchema),
  adminHideComment,
);

router.put(
  "/admin/comments/:id/verify",
  authenticateToken as any,
  requireAdmin as any,
  validateResult(adminModerateCommentSchema),
  adminVerifyComment,
);

export default router;
