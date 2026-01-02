import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  consentUpdateSchema,
  consentWithdrawSchema,
  dataExportRequestSchema,
  accountDeletionRequestSchema,
  cancelDeletionSchema,
} from '../validators/privacy.validator';
import {
  consentService,
  dataExportService,
  accountDeletionService,
} from '../services';

const router = Router();

// Rate limiting for sensitive operations
const privacyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many privacy requests, please try again later',
    },
  },
});

/**
 * GET /api/privacy/consent
 * Get user's current consent status
 */
router.get('/consent', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consent = await consentService.getUserConsent(req.user!.userId);
    res.json({
      success: true,
      data: { consent },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/privacy/consent
 * Update or create consent
 */
router.put(
  '/consent',
  authMiddleware,
  validateBody(consentUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const consent = await consentService.updateConsent(
        req.user!.userId,
        req.body,
        metadata
      );

      res.json({
        success: true,
        data: { consent },
        message: 'Consent updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/privacy/consent/withdraw
 * Withdraw consent
 */
router.post(
  '/consent/withdraw',
  authMiddleware,
  privacyRateLimiter,
  validateBody(consentWithdrawSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      await consentService.withdrawConsent(req.user!.userId, req.body.reason, metadata);

      res.json({
        success: true,
        message: 'Consent withdrawn successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/privacy/data-export
 * Request data export
 */
router.post(
  '/data-export',
  authMiddleware,
  privacyRateLimiter,
  validateBody(dataExportRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const exportRequest = await dataExportService.requestExport(
        req.user!.userId,
        req.body,
        metadata
      );

      res.status(201).json({
        success: true,
        data: { exportRequest },
        message: 'Data export requested. You will receive an email when it is ready.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/privacy/data-export
 * Get user's export history
 */
router.get('/data-export', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await dataExportService.getExportHistory(req.user!.userId);
    res.json({
      success: true,
      data: { exports: history },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/privacy/data-export/:requestId
 * Get export status
 */
router.get(
  '/data-export/:requestId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exportRequest = await dataExportService.getExportStatus(
        req.user!.userId,
        req.params.requestId
      );

      res.json({
        success: true,
        data: { exportRequest },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/privacy/data-export/:requestId/download
 * Download exported data
 */
router.get(
  '/data-export/:requestId/download',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = await dataExportService.downloadExport(
        req.user!.userId,
        req.params.requestId
      );

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="user-data-export-${req.user!.userId}-${Date.now()}.json"`
      );

      res.send(userData);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/privacy/delete-account
 * Request account deletion
 */
router.post(
  '/delete-account',
  authMiddleware,
  privacyRateLimiter,
  validateBody(accountDeletionRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const deletionRequest = await accountDeletionService.requestDeletion(
        req.user!.userId,
        req.body,
        metadata
      );

      res.status(201).json({
        success: true,
        data: { deletionRequest },
        message:
          'Account deletion requested. Your account will be deleted after 30 days. You will receive a confirmation email.',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/privacy/delete-account
 * Get account deletion status
 */
router.get(
  '/delete-account',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletionRequest = await accountDeletionService.getDeletionStatus(req.user!.userId);

      res.json({
        success: true,
        data: { deletionRequest },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/privacy/delete-account/cancel
 * Cancel account deletion
 */
router.post(
  '/delete-account/cancel',
  authMiddleware,
  validateBody(cancelDeletionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      await accountDeletionService.cancelDeletion(
        req.user!.userId,
        req.body.requestId,
        metadata
      );

      res.json({
        success: true,
        message: 'Account deletion cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
