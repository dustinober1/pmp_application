import { v4 as uuidv4 } from "uuid";
import type {
  UserDataExport,
  DataExportRequest as DataExportRequestType,
} from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { PRIVACY_ERRORS } from "@pmp/shared";
import { logger } from "../utils/logger";

const EXPORT_RETENTION_DAYS = 7;
const RATE_LIMIT_HOURS = 24;

export class DataExportService {
  /**
   * Request data export
   */
  async requestExport(
    userId: string,
    options: {
      includePaymentHistory?: boolean;
      includeActivityLogs?: boolean;
      emailMe?: boolean;
    } = {},
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<DataExportRequestType> {
    // Check if there's a pending export
    const pendingExport = await prisma.dataExportRequest.findFirst({
      where: {
        userId,
        status: { in: ["pending", "processing"] },
      },
    });

    if (pendingExport) {
      throw AppError.conflict(
        PRIVACY_ERRORS.PRIVACY_001.message,
        PRIVACY_ERRORS.PRIVACY_001.code,
      );
    }

    // Rate limiting check
    const recentExport = await prisma.dataExportRequest.findFirst({
      where: {
        userId,
        status: "completed",
        requestedAt: {
          gte: new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000),
        },
      },
    });

    if (recentExport) {
      throw AppError.tooManyRequests(
        `You can request an export once every ${RATE_LIMIT_HOURS} hours. Please try again later.`,
        "RATE_LIMITED",
      );
    }

    // Create export request
    const requestId = uuidv4();
    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        userId,
        requestId,
        status: "pending",
        expiresAt: new Date(
          Date.now() + EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    // Log the request
    await prisma.privacyAuditLog.create({
      data: {
        actionType: "data_export",
        entityType: "export_request",
        entityId: exportRequest.id,
        userId,
        performedBy: userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        requestId,
        details: options,
      },
    });

    logger.info(`Data export requested for user ${userId}`, { requestId });

    // TODO: Queue background job for processing
    // For now, mark as processing immediately
    await this.processExport(exportRequest.id, options);

    return {
      id: exportRequest.id,
      userId: exportRequest.userId,
      status: exportRequest.status as any,
      requestId: exportRequest.requestId,
      requestedAt: exportRequest.requestedAt,
      completedAt: exportRequest.completedAt || undefined,
      expiresAt: exportRequest.expiresAt,
      downloadUrl: exportRequest.downloadUrl || undefined,
      fileSize: exportRequest.fileSize || undefined,
      errorMessage: exportRequest.errorMessage || undefined,
      processedBy: exportRequest.processedBy || undefined,
    };
  }

  /**
   * Get export status
   */
  async getExportStatus(
    userId: string,
    requestId: string,
  ): Promise<DataExportRequestType> {
    const exportRequest = await prisma.dataExportRequest.findUnique({
      where: { requestId },
    });

    if (!exportRequest || exportRequest.userId !== userId) {
      throw AppError.notFound(
        PRIVACY_ERRORS.PRIVACY_002.message,
        PRIVACY_ERRORS.PRIVACY_002.code,
      );
    }

    return {
      id: exportRequest.id,
      userId: exportRequest.userId,
      status: exportRequest.status as any,
      requestId: exportRequest.requestId,
      requestedAt: exportRequest.requestedAt,
      completedAt: exportRequest.completedAt || undefined,
      expiresAt: exportRequest.expiresAt,
      downloadUrl: exportRequest.downloadUrl || undefined,
      fileSize: exportRequest.fileSize || undefined,
      errorMessage: exportRequest.errorMessage || undefined,
      processedBy: exportRequest.processedBy || undefined,
    };
  }

  /**
   * Get user's export history
   */
  async getExportHistory(userId: string): Promise<DataExportRequestType[]> {
    const exports = await prisma.dataExportRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
      take: 10,
    });

    return exports.map((exp) => ({
      id: exp.id,
      userId: exp.userId,
      status: exp.status as any,
      requestId: exp.requestId,
      requestedAt: exp.requestedAt,
      completedAt: exp.completedAt || undefined,
      expiresAt: exp.expiresAt,
      downloadUrl: exp.downloadUrl || undefined,
      fileSize: exp.fileSize || undefined,
      errorMessage: exp.errorMessage || undefined,
      processedBy: exp.processedBy || undefined,
    }));
  }

  /**
   * Process export (generates the data)
   * This would normally run in a background job
   */
  private async processExport(
    exportRequestId: string,
    options: {
      includePaymentHistory?: boolean;
      includeActivityLogs?: boolean;
    },
  ): Promise<void> {
    try {
      // Mark as processing
      await prisma.dataExportRequest.update({
        where: { id: exportRequestId },
        data: { status: "processing" },
      });

      const exportRequest = await prisma.dataExportRequest.findUnique({
        where: { id: exportRequestId },
      });

      if (!exportRequest) throw new Error("Export request not found");

      // Generate comprehensive export
      const userData = await this.generateUserDataExport(
        exportRequest.userId,
        options.includePaymentHistory !== false,
        options.includeActivityLogs !== false,
      );

      // Convert to JSON
      const jsonData = JSON.stringify(userData, null, 2);
      const fileSize = Buffer.byteLength(jsonData, "utf8");

      // In production, this would be uploaded to secure storage
      // For now, we'll store a placeholder URL
      const downloadUrl = `/api/user/data-export/${exportRequest.requestId}/download`;

      // Mark as completed
      await prisma.dataExportRequest.update({
        where: { id: exportRequestId },
        data: {
          status: "completed",
          completedAt: new Date(),
          downloadUrl,
          fileSize,
        },
      });

      logger.info(`Data export completed for user ${exportRequest.userId}`, {
        requestId: exportRequest.requestId,
        fileSize,
      });
    } catch (error) {
      logger.error("Data export processing failed", { error, exportRequestId });
      await prisma.dataExportRequest.update({
        where: { id: exportRequestId },
        data: {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * Generate comprehensive user data export
   */
  private async generateUserDataExport(
    userId: string,
    includePaymentHistory: boolean,
    includeActivityLogs: boolean,
  ): Promise<UserDataExport> {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { tier: true },
        },
        ebookProgress: true,
      },
    });

    if (!user) throw new Error("User not found");

    // Fetch payment history
    let paymentHistory: any[] = [];
    if (includePaymentHistory) {
      const transactions = await prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      paymentHistory = transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt,
      }));
    }

    // Fetch study progress stats
    const [flashcardReviewsCount, questionAttemptsCount] = await Promise.all([
      prisma.flashcardReview.count({ where: { userId } }),
      prisma.questionAttempt.count({ where: { userId } }),
    ]);

    // Fetch practice sessions
    const practiceSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    // Fetch activity logs
    let recentActivity: any[] = [];
    if (includeActivityLogs) {
      const activities = await prisma.studyActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      recentActivity = activities.map((a) => ({
        type: a.activityType,
        targetId: a.targetId,
        createdAt: a.createdAt,
      }));
    }

    // Fetch team memberships
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
      include: { team: true },
    });

    // Construct export
    return {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subscription: user.subscription
        ? {
            tier: user.subscription.tier.name,
            status: user.subscription.status,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
          }
        : undefined,
      paymentHistory,
      studyProgress: {
        completedSections: user.ebookProgress?.completedSections || [],
        lastChapter: user.ebookProgress?.lastChapterId || undefined,
        lastSection: user.ebookProgress?.lastSectionId || undefined,
      },
      flashcardReviews: flashcardReviewsCount,
      questionAttempts: questionAttemptsCount,
      practiceSessions: practiceSessions.map((s) => ({
        id: s.id,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        completedAt: s.completedAt || undefined,
      })),
      recentActivity,
      teamMemberships: teamMemberships.map((m) => ({
        teamName: m.team.name,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      exportGeneratedAt: new Date(),
      exportVersion: "1.0",
    };
  }

  /**
   * Download export data
   */
  async downloadExport(
    userId: string,
    requestId: string,
  ): Promise<UserDataExport> {
    const exportRequest = await prisma.dataExportRequest.findUnique({
      where: { requestId },
    });

    if (!exportRequest || exportRequest.userId !== userId) {
      throw AppError.notFound(
        PRIVACY_ERRORS.PRIVACY_002.message,
        PRIVACY_ERRORS.PRIVACY_002.code,
      );
    }

    if (exportRequest.status !== "completed") {
      throw AppError.badRequest("Export is not ready", "EXPORT_NOT_READY");
    }

    if (exportRequest.expiresAt < new Date()) {
      throw AppError.badRequest("Export has expired", "EXPORT_EXPIRED");
    }

    // Regenerate the export data
    const userData = await this.generateUserDataExport(userId, true, true);

    // Log download
    await prisma.privacyAuditLog.create({
      data: {
        actionType: "data_accessed",
        entityType: "export_request",
        entityId: exportRequest.id,
        userId,
        performedBy: userId,
        details: { requestId },
      },
    });

    return userData;
  }

  /**
   * Admin: Get all export requests
   */
  async getAllExports(filters?: {
    status?: "pending" | "processing" | "completed" | "failed";
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ exports: DataExportRequestType[]; total: number }> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [exports, total] = await Promise.all([
      prisma.dataExportRequest.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
      }),
      prisma.dataExportRequest.count({ where }),
    ]);

    return {
      exports: exports.map((exp) => ({
        id: exp.id,
        userId: exp.userId,
        status: exp.status as any,
        requestId: exp.requestId,
        requestedAt: exp.requestedAt,
        completedAt: exp.completedAt || undefined,
        expiresAt: exp.expiresAt,
        downloadUrl: exp.downloadUrl || undefined,
        fileSize: exp.fileSize || undefined,
        errorMessage: exp.errorMessage || undefined,
        processedBy: exp.processedBy || undefined,
      })),
      total,
    };
  }

  /**
   * Admin: Manually process export
   */
  async adminProcessExport(
    exportRequestId: string,
    adminUserId: string,
  ): Promise<void> {
    const exportRequest = await prisma.dataExportRequest.findUnique({
      where: { id: exportRequestId },
    });

    if (!exportRequest) {
      throw AppError.notFound("Export request not found", "EXPORT_NOT_FOUND");
    }

    if (exportRequest.status === "completed") {
      throw AppError.badRequest(
        "Export already completed",
        "EXPORT_ALREADY_COMPLETED",
      );
    }

    await this.processExport(exportRequestId, {
      includePaymentHistory: true,
      includeActivityLogs: true,
    });

    // Update processed by
    await prisma.dataExportRequest.update({
      where: { id: exportRequestId },
      data: { processedBy: adminUserId },
    });

    logger.info(`Export ${exportRequestId} processed by admin ${adminUserId}`);
  }
}

export const dataExportService = new DataExportService();
