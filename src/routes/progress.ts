import { Router } from "express";
import {
  getDashboard,
  getDomainProgress,
  recordActivity,
  getHistory,
} from "../controllers/progress";
import { authenticateToken } from "../middleware/auth";
import { validateResult } from "../middleware/validation";
import {
  domainIdSchema,
  recordActivitySchema,
  historyQuerySchema,
} from "../schemas/progress.schema";

const router = Router();

// All progress routes require authentication
router.use(authenticateToken);

// Dashboard overview
router.get("/", getDashboard);

// Historical performance data
router.get("/history", validateResult(historyQuerySchema), getHistory);

// Domain-specific progress
router.get(
  "/domain/:domainId",
  validateResult(domainIdSchema),
  getDomainProgress,
);

// Record study activity (updates streak)
router.post("/activity", validateResult(recordActivitySchema), recordActivity);

export default router;
