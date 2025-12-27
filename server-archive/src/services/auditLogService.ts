import { prisma } from "./database";
import Logger from "../utils/logger";

export type AuditAction =
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_ROLE_CHANGE"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "QUESTION_CREATE"
  | "QUESTION_UPDATE"
  | "QUESTION_DELETE"
  | "FLASHCARD_CREATE"
  | "FLASHCARD_UPDATE"
  | "FLASHCARD_DELETE"
  | "TEST_CREATE"
  | "TEST_UPDATE"
  | "TEST_DELETE"
  | "COMMENT_HIDE"
  | "COMMENT_VERIFY"
  | "COMMENT_DELETE"
  | "SYSTEM_CONFIG_CHANGE";

export type EntityType =
  | "USER"
  | "QUESTION"
  | "FLASHCARD"
  | "TEST"
  | "COMMENT"
  | "SYSTEM";

export interface AuditLogEntry {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
}

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          userEmail: entry.userEmail,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          oldValues: entry.oldValues
            ? JSON.parse(JSON.stringify(entry.oldValues))
            : null,
          newValues: entry.newValues
            ? JSON.parse(JSON.stringify(entry.newValues))
            : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata
            ? JSON.parse(JSON.stringify(entry.metadata))
            : null,
        },
      });
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      Logger.error("Failed to create audit log entry:", error);
    }
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getLogs(query: AuditLogQuery) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }
    if (action) {
      where.action = action;
    }
    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit log by ID
   */
  async getLogById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getLogsForEntity(entityType: EntityType, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get recent audit logs for a user
   */
  async getLogsForUser(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Export audit logs as JSON
   */
  async exportLogs(query: AuditLogQuery) {
    const { userId, action, entityType, startDate, endDate } = query;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }
    if (action) {
      where.action = action;
    }
    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get audit log statistics
   */
  async getStats(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalLogs, actionCounts, entityCounts, recentLogs] =
      await Promise.all([
        prisma.auditLog.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.auditLog.groupBy({
          by: ["action"],
          _count: true,
          where: { createdAt: { gte: startDate } },
        }),
        prisma.auditLog.groupBy({
          by: ["entityType"],
          _count: true,
          where: { createdAt: { gte: startDate } },
        }),
        prisma.auditLog.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    return {
      period: `Last ${days} days`,
      totalLogs,
      byAction: actionCounts.map((a: { action: string; _count: number }) => ({
        action: a.action,
        count: a._count,
      })),
      byEntity: entityCounts.map(
        (e: { entityType: string; _count: number }) => ({
          entityType: e.entityType,
          count: e._count,
        }),
      ),
      recentActivity: recentLogs,
    };
  }
}

export const auditLogService = new AuditLogService();
