import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import type { AccountDeletionRequest as AccountDeletionRequestType } from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { PRIVACY_ERRORS } from "@pmp/shared";
import { logger } from "../utils/logger";

const GRACE_PERIOD_DAYS = 30;

export class AccountDeletionService {
  /**
   * Request account deletion
   */
  async requestDeletion(
    userId: string,
    deletionData: {
      reason?: string;
      confirmPassword: string;
    },
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<AccountDeletionRequestType> {
    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound("User not found", "USER_NOT_FOUND");
    }

    const isPasswordValid = await bcrypt.compare(
      deletionData.confirmPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid password", "INVALID_PASSWORD");
    }

    // Check for existing pending deletion
    const existingDeletion = await prisma.accountDeletionRequest.findFirst({
      where: {
        userId,
        status: { in: ["pending", "processing"] },
      },
    });

    if (existingDeletion) {
      throw AppError.conflict(
        PRIVACY_ERRORS.PRIVACY_003.message,
        PRIVACY_ERRORS.PRIVACY_003.code,
      );
    }

    // Create deletion request
    const gracePeriodEnds = new Date();
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + GRACE_PERIOD_DAYS);

    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        userId,
        status: "pending",
        deletionReason: deletionData.reason,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        gracePeriodEnds,
      },
    });

    // Log the request
    await prisma.privacyAuditLog.create({
      data: {
        actionType: "account_deletion",
        entityType: "deletion_request",
        entityId: deletionRequest.id,
        userId,
        performedBy: userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        requestId: deletionRequest.id,
        details: { reason: deletionData.reason },
      },
    });

    logger.info(`Account deletion requested for user ${userId}`, {
      requestId: deletionRequest.id,
      gracePeriodEnds,
    });

    // TODO: Send confirmation email with cancellation link

    return {
      id: deletionRequest.id,
      userId: deletionRequest.userId,
      status: deletionRequest.status as any,
      requestedAt: deletionRequest.requestedAt,
      gracePeriodEnds: deletionRequest.gracePeriodEnds,
      completedAt: deletionRequest.completedAt || undefined,
      cancelledAt: deletionRequest.cancelledAt || undefined,
      deletionReason: deletionRequest.deletionReason || undefined,
      ipAddress: deletionRequest.ipAddress || undefined,
      userAgent: deletionRequest.userAgent || undefined,
      softDeletedAt: deletionRequest.softDeletedAt || undefined,
      hardDeleteScheduledFor:
        deletionRequest.hardDeleteScheduledFor || undefined,
      processedBy: deletionRequest.processedBy || undefined,
    };
  }

  /**
   * Cancel account deletion (within grace period)
   */
  async cancelDeletion(
    userId: string,
    requestId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!deletionRequest || deletionRequest.userId !== userId) {
      throw AppError.notFound(
        "Deletion request not found",
        "DELETION_NOT_FOUND",
      );
    }

    if (deletionRequest.status !== "pending") {
      throw AppError.badRequest(
        "Cannot cancel deletion that is already in progress",
        "DELETION_IN_PROGRESS",
      );
    }

    if (deletionRequest.gracePeriodEnds < new Date()) {
      throw AppError.badRequest(
        PRIVACY_ERRORS.PRIVACY_005.message,
        PRIVACY_ERRORS.PRIVACY_005.code,
      );
    }

    await prisma.accountDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    // Log cancellation
    await prisma.privacyAuditLog.create({
      data: {
        actionType: "account_deletion",
        entityType: "deletion_request",
        entityId: requestId,
        userId,
        performedBy: userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        details: { action: "cancelled" },
        status: "cancelled",
      },
    });

    logger.info(`Account deletion cancelled for user ${userId}`, { requestId });

    // TODO: Send cancellation confirmation email
  }

  /**
   * Get deletion status
   */
  async getDeletionStatus(
    userId: string,
  ): Promise<AccountDeletionRequestType | null> {
    const deletionRequest = await prisma.accountDeletionRequest.findFirst({
      where: {
        userId,
        status: { in: ["pending", "processing"] },
      },
      orderBy: { requestedAt: "desc" },
    });

    if (!deletionRequest) return null;

    return {
      id: deletionRequest.id,
      userId: deletionRequest.userId,
      status: deletionRequest.status as any,
      requestedAt: deletionRequest.requestedAt,
      gracePeriodEnds: deletionRequest.gracePeriodEnds,
      completedAt: deletionRequest.completedAt || undefined,
      cancelledAt: deletionRequest.cancelledAt || undefined,
      deletionReason: deletionRequest.deletionReason || undefined,
      ipAddress: deletionRequest.ipAddress || undefined,
      userAgent: deletionRequest.userAgent || undefined,
      softDeletedAt: deletionRequest.softDeletedAt || undefined,
      hardDeleteScheduledFor:
        deletionRequest.hardDeleteScheduledFor || undefined,
      processedBy: deletionRequest.processedBy || undefined,
    };
  }

  /**
   * Process soft delete (anonymize data)
   */
  private async softDelete(
    userId: string,
    deletionRequestId: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      // Anonymize user data
      const anonymousId = `deleted-${uuidv4()}`;
      const anonymousEmail = `deleted-${anonymousId}@deleted.local`;

      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymousEmail,
          name: "Deleted User",
          passwordHash: "", // Remove password hash
          emailVerified: false,
          emailVerifyToken: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      // Anonymize subscription
      await tx.userSubscription.updateMany({
        where: { userId },
        data: {
          status: "cancelled",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          paypalSubscriptionId: null,
        },
      });

      // Mark deletion request as processing
      await tx.accountDeletionRequest.update({
        where: { id: deletionRequestId },
        data: {
          status: "processing",
          softDeletedAt: new Date(),
        },
      });

      // Log soft delete
      await tx.privacyAuditLog.create({
        data: {
          actionType: "account_soft_deleted",
          entityType: "user",
          entityId: userId,
          userId,
          performedBy: "system",
          details: { deletionRequestId, anonymousId },
        },
      });
    });

    logger.info(`Soft delete completed for user ${userId}`);
  }

  /**
   * Process hard delete (complete removal)
   * This should be run after grace period + legal retention
   * @internal Reserved for future background job implementation
   */
  // @ts-ignore - Reserved for future background job implementation
  private async hardDelete(
    userId: string,
    deletionRequestId: string,
  ): Promise<void> {
    // Note: Due to foreign key constraints, cascading deletes will handle most data
    // Payment transactions should be kept for legal requirements (anonymized)

    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      // Anonymize payment transactions instead of deleting (legal requirement)
      await tx.paymentTransaction.updateMany({
        where: { userId },
        data: {
          paypalOrderId: `deleted-${uuidv4()}`,
          paypalPayerId: null,
        },
      });

      // Delete user (cascade will handle related records)
      await tx.user.delete({
        where: { id: userId },
      });

      // Mark deletion as completed
      await tx.accountDeletionRequest.update({
        where: { id: deletionRequestId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Log hard delete
      await tx.privacyAuditLog.create({
        data: {
          actionType: "account_hard_deleted",
          entityType: "user",
          entityId: userId,
          performedBy: "system",
          details: { deletionRequestId },
        },
      });
    });

    logger.info(`Hard delete completed for user ${userId}`);
  }

  /**
   * Admin: Get all deletion requests
   */
  async getAllDeletions(filters?: {
    status?: "pending" | "processing" | "completed" | "cancelled";
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ deletions: AccountDeletionRequestType[]; total: number }> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    const [deletions, total] = await Promise.all([
      prisma.accountDeletionRequest.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
      }),
      prisma.accountDeletionRequest.count({ where }),
    ]);

    return {
      deletions: deletions.map((del: typeof deletions[0]) => ({
        id: del.id,
        userId: del.userId,
        status: del.status as any,
        requestedAt: del.requestedAt,
        gracePeriodEnds: del.gracePeriodEnds,
        completedAt: del.completedAt || undefined,
        cancelledAt: del.cancelledAt || undefined,
        deletionReason: del.deletionReason || undefined,
        ipAddress: del.ipAddress || undefined,
        userAgent: del.userAgent || undefined,
        softDeletedAt: del.softDeletedAt || undefined,
        hardDeleteScheduledFor: del.hardDeleteScheduledFor || undefined,
        processedBy: del.processedBy || undefined,
      })),
      total,
    };
  }

  /**
   * Admin: Process deletion immediately (bypass grace period)
   */
  async adminProcessDeletion(
    deletionRequestId: string,
    adminUserId: string,
    force: boolean = false,
  ): Promise<void> {
    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { id: deletionRequestId },
    });

    if (!deletionRequest) {
      throw AppError.notFound(
        "Deletion request not found",
        "DELETION_NOT_FOUND",
      );
    }

    if (deletionRequest.status === "completed") {
      throw AppError.badRequest(
        "Deletion already completed",
        "DELETION_ALREADY_COMPLETED",
      );
    }

    if (!force && deletionRequest.gracePeriodEnds > new Date()) {
      throw AppError.badRequest(
        "Grace period has not ended. Use force=true to bypass.",
        "GRACE_PERIOD_ACTIVE",
      );
    }

    // Process soft delete
    await this.softDelete(deletionRequest.userId, deletionRequestId);

    // Schedule hard delete for legal retention period (e.g., 7 years for tax records)
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 7);

    await prisma.accountDeletionRequest.update({
      where: { id: deletionRequestId },
      data: {
        hardDeleteScheduledFor: retentionDate,
        processedBy: adminUserId,
      },
    });

    logger.info(
      `Deletion ${deletionRequestId} processed by admin ${adminUserId}`,
      {
        hardDeleteScheduledFor: retentionDate,
      },
    );

    // TODO: Schedule background job for hard delete at retentionDate
  }

  /**
   * Process pending deletions (cron job)
   * This should be run daily to process deletions whose grace period has ended
   */
  async processPendingDeletions(): Promise<{ processed: number }> {
    const pendingDeletions = await prisma.accountDeletionRequest.findMany({
      where: {
        status: "pending",
        gracePeriodEnds: { lte: new Date() },
      },
    });

    let processed = 0;
    for (const deletion of pendingDeletions) {
      try {
        await this.softDelete(deletion.userId, deletion.id);

        // Schedule hard delete
        const retentionDate = new Date();
        retentionDate.setFullYear(retentionDate.getFullYear() + 7);

        await prisma.accountDeletionRequest.update({
          where: { id: deletion.id },
          data: {
            hardDeleteScheduledFor: retentionDate,
          },
        });

        processed++;
      } catch (error) {
        logger.error(`Failed to process deletion ${deletion.id}`, { error });
      }
    }

    logger.info(`Processed ${processed} pending deletions`);
    return { processed };
  }
}

export const accountDeletionService = new AccountDeletionService();
