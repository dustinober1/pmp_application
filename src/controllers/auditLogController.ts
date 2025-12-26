import { Request, Response, NextFunction } from "express";
import {
  auditLogService,
  AuditAction,
  EntityType,
} from "../services/auditLogService";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";

/**
 * Get audit logs with pagination and filtering
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const result = await auditLogService.getLogs({
      page: Number(page),
      limit: Math.min(Number(limit), 100), // Max 100 per page
      userId: userId as string,
      action: action as AuditAction,
      entityType: entityType as EntityType,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching audit logs:", error);
    next(ErrorFactory.internal("Failed to fetch audit logs"));
  }
};

/**
 * Get a single audit log entry
 * GET /api/admin/audit-logs/:id
 */
export const getAuditLogById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const log = await auditLogService.getLogById(id);

    if (!log) {
      throw ErrorFactory.notFound("Audit log entry not found");
    }

    res.json(log);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching audit log:", error);
    next(ErrorFactory.internal("Failed to fetch audit log"));
  }
};

/**
 * Get audit log statistics
 * GET /api/admin/audit-logs/stats
 */
export const getAuditLogStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const stats = await auditLogService.getStats(Number(days));
    res.json(stats);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching audit log stats:", error);
    next(ErrorFactory.internal("Failed to fetch audit log statistics"));
  }
};

/**
 * Export audit logs
 * GET /api/admin/audit-logs/export
 */
export const exportAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      format = "json",
    } = req.query;

    const logs = await auditLogService.exportLogs({
      userId: userId as string,
      action: action as AuditAction,
      entityType: entityType as EntityType,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Timestamp",
        "User ID",
        "User Email",
        "Action",
        "Entity Type",
        "Entity ID",
        "IP Address",
      ];
      const csvRows = [
        headers.join(","),
        ...logs.map(
          (log: {
            id: string;
            createdAt: Date;
            userId: string | null;
            userEmail: string | null;
            action: string;
            entityType: string;
            entityId: string | null;
            ipAddress: string | null;
          }) =>
            [
              log.id,
              log.createdAt.toISOString(),
              log.userId || "",
              log.userEmail || "",
              log.action,
              log.entityType,
              log.entityId || "",
              log.ipAddress || "",
            ]
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(","),
        ),
      ];

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
      );
      res.send(csvRows.join("\n"));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.json`,
      );
      res.json(logs);
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error exporting audit logs:", error);
    next(ErrorFactory.internal("Failed to export audit logs"));
  }
};
