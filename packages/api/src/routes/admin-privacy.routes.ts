import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  validateBody,
  validateQuery,
} from "../middleware/validation.middleware";
import {
  adminExportQuerySchema,
  adminDeletionQuerySchema,
  adminProcessExportSchema,
  adminProcessDeletionSchema,
  auditLogQuerySchema,
} from "../validators/privacy.validator";
import {
  dataExportService,
  accountDeletionService,
  adminPrivacyService,
} from "../services";

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

/**
 * GET /api/admin/privacy/dashboard
 * Get compliance dashboard
 */
router.get(
  "/dashboard",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboard = await adminPrivacyService.getDashboard();
      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/admin/privacy/exports
 * Get all data export requests
 */
router.get(
  "/exports",
  validateQuery(adminExportQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dataExportService.getAllExports(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/admin/privacy/exports/process
 * Manually process a data export
 */
router.post(
  "/exports/process",
  validateBody(adminProcessExportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dataExportService.adminProcessExport(
        req.body.requestId,
        req.user!.userId,
      );
      res.json({
        success: true,
        message: "Export processed successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/admin/privacy/deletions
 * Get all account deletion requests
 */
router.get(
  "/deletions",
  validateQuery(adminDeletionQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await accountDeletionService.getAllDeletions(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/admin/privacy/deletions/process
 * Manually process an account deletion
 */
router.post(
  "/deletions/process",
  validateBody(adminProcessDeletionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await accountDeletionService.adminProcessDeletion(
        req.body.requestId,
        req.user!.userId,
        req.body.force,
      );
      res.json({
        success: true,
        message: "Deletion processed successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/admin/privacy/audit-logs
 * Get privacy audit logs
 */
router.get(
  "/audit-logs",
  validateQuery(auditLogQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminPrivacyService.getAuditLogs(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/admin/privacy/users/:userId
 * Get user compliance summary
 */
router.get(
  "/users/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const summary =
        await adminPrivacyService.getUserComplianceSummary(userId);
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/admin/privacy/process-pending
 * Process all pending deletions (cron job endpoint)
 */
router.post(
  "/process-pending",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await accountDeletionService.processPendingDeletions();
      res.json({
        success: true,
        data: result,
        message: `Processed ${result.processed} pending deletions`,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
