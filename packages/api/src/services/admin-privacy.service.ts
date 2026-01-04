import type {
  AdminComplianceDashboard,
  AdminExportStats,
  AdminDeletionStats,
  PrivacyAuditLog as PrivacyAuditLogType,
} from "@pmp/shared";
import prisma from "../config/database";

export class AdminPrivacyService {
  /**
   * Get compliance dashboard data
   */
  async getDashboard(): Promise<AdminComplianceDashboard> {
    const [
      exportStats,
      deletionStats,
      recentActivity,
      pendingExports,
      pendingDeletions,
    ] = await Promise.all([
      this.getExportStats(),
      this.getDeletionStats(),
      this.getRecentAuditLogs(20),
      this.getPendingExports(10),
      this.getPendingDeletions(10),
    ]);

    return {
      exportStats,
      deletionStats,
      recentActivity,
      pendingExports,
      pendingDeletions,
    };
  }

  /**
   * Get export statistics
   */
  async getExportStats(): Promise<AdminExportStats> {
    const [totalRequests, pendingRequests, completedExports, failedExports] =
      await Promise.all([
        prisma.dataExportRequest.count(),
        prisma.dataExportRequest.count({ where: { status: "pending" } }),
        prisma.dataExportRequest.count({ where: { status: "completed" } }),
        prisma.dataExportRequest.count({ where: { status: "failed" } }),
      ]);

    // Calculate average processing time (in minutes)
    const completedExportsWithTime = await prisma.dataExportRequest.findMany({
      where: {
        status: "completed",
        completedAt: { not: null },
      },
      select: {
        requestedAt: true,
        completedAt: true,
      },
    });

    const averageProcessingTime =
      completedExportsWithTime.length > 0
        ? completedExportsWithTime.reduce(
            (acc: number, exp: (typeof completedExportsWithTime)[0]) => {
              const time =
                exp.completedAt!.getTime() - exp.requestedAt.getTime();
              return acc + time;
            },
            0,
          ) /
          completedExportsWithTime.length /
          (1000 * 60)
        : 0;

    return {
      totalRequests,
      pendingRequests,
      completedExports,
      failedExports,
      averageProcessingTime: Math.round(averageProcessingTime),
    };
  }

  /**
   * Get deletion statistics
   */
  async getDeletionStats(): Promise<AdminDeletionStats> {
    const [
      totalRequests,
      pendingRequests,
      completedDeletions,
      cancelledDeletions,
    ] = await Promise.all([
      prisma.accountDeletionRequest.count(),
      prisma.accountDeletionRequest.count({ where: { status: "pending" } }),
      prisma.accountDeletionRequest.count({ where: { status: "completed" } }),
      prisma.accountDeletionRequest.count({ where: { status: "cancelled" } }),
    ]);

    // Count requests in grace period
    const inGracePeriod = await prisma.accountDeletionRequest.count({
      where: {
        status: "pending",
        gracePeriodEnds: { gt: new Date() },
      },
    });

    return {
      totalRequests,
      pendingRequests,
      inGracePeriod,
      completedDeletions,
      cancelledDeletions,
    };
  }

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(limit: number = 50): Promise<PrivacyAuditLogType[]> {
    const logs = await prisma.privacyAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return logs.map((log: (typeof logs)[0]) => ({
      id: log.id,
      actionType: log.actionType as any,
      entityType: log.entityType as any,
      entityId: log.entityId,
      userId: log.userId || undefined,
      performedBy: log.performedBy || undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      requestId: log.requestId || undefined,
      details: (log.details as Record<string, unknown>) || undefined,
      status: log.status as any,
      createdAt: log.createdAt,
    }));
  }

  /**
   * Get pending export requests
   */
  async getPendingExports(limit: number = 10): Promise<any[]> {
    const exports = await prisma.dataExportRequest.findMany({
      where: { status: { in: ["pending", "processing"] } },
      orderBy: { requestedAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return exports.map((exp: (typeof exports)[0]) => ({
      id: exp.id,
      userId: exp.userId,
      user: exp.user,
      status: exp.status,
      requestId: exp.requestId,
      requestedAt: exp.requestedAt,
    }));
  }

  /**
   * Get pending deletion requests
   */
  async getPendingDeletions(limit: number = 10): Promise<any[]> {
    const deletions = await prisma.accountDeletionRequest.findMany({
      where: { status: { in: ["pending", "processing"] } },
      orderBy: { requestedAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return deletions.map((del: (typeof deletions)[0]) => ({
      id: del.id,
      userId: del.userId,
      user: del.user,
      status: del.status,
      requestedAt: del.requestedAt,
      gracePeriodEnds: del.gracePeriodEnds,
      deletionReason: del.deletionReason,
    }));
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    actionType?: string;
    entityType?: string;
    userId?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ logs: PrivacyAuditLogType[]; total: number }> {
    const where: any = {};
    if (filters.actionType) where.actionType = filters.actionType;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.privacyAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.privacyAuditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log: (typeof logs)[0]) => ({
        id: log.id,
        actionType: log.actionType as any,
        entityType: log.entityType as any,
        entityId: log.entityId,
        userId: log.userId || undefined,
        performedBy: log.performedBy || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        requestId: log.requestId || undefined,
        details: (log.details as Record<string, unknown>) || undefined,
        status: log.status as any,
        createdAt: log.createdAt,
      })),
      total,
    };
  }

  /**
   * Get user compliance summary
   */
  async getUserComplianceSummary(userId: string): Promise<{
    consent: any;
    exports: number;
    deletions: number;
    recentActivity: PrivacyAuditLogType[];
  }> {
    const [consent, exportCount, deletionCount, recentActivity] =
      await Promise.all([
        prisma.privacyConsent.findUnique({
          where: { userId },
        }),
        prisma.dataExportRequest.count({ where: { userId } }),
        prisma.accountDeletionRequest.count({ where: { userId } }),
        prisma.privacyAuditLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    return {
      consent: consent || null,
      exports: exportCount,
      deletions: deletionCount,
      recentActivity: recentActivity.map((log: (typeof recentActivity)[0]) => ({
        id: log.id,
        actionType: log.actionType as any,
        entityType: log.entityType as any,
        entityId: log.entityId,
        userId: log.userId || undefined,
        performedBy: log.performedBy || undefined,
        ipAddress: log.ipAddress || undefined,
        userAgent: log.userAgent || undefined,
        requestId: log.requestId || undefined,
        details: (log.details as Record<string, unknown>) || undefined,
        status: log.status as any,
        createdAt: log.createdAt,
      })),
    };
  }
}

export const adminPrivacyService = new AdminPrivacyService();
