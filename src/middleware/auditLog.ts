import { Request, Response, NextFunction } from "express";
import {
  auditLogService,
  AuditAction,
  EntityType,
} from "../services/auditLogService";

/**
 * Middleware to log admin actions automatically
 */
export const auditLogMiddleware = (
  action: AuditAction,
  entityType: EntityType,
  getEntityId?: (req: Request) => string | undefined,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (body: unknown) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = getEntityId ? getEntityId(req) : req.params.id;

        auditLogService.log({
          userId: req.user?.id,
          userEmail: req.user?.email,
          action,
          entityType,
          entityId,
          newValues: req.body,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
        });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper to create audit log entry manually in controllers
 */
export const logAdminAction = async (
  req: Request,
  action: AuditAction,
  entityType: EntityType,
  entityId?: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
) => {
  await auditLogService.log({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  });
};
