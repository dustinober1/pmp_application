import type {
  ConsentUpdateInput,
  PrivacyConsent as PrivacyConsentType,
} from "@pmp/shared";
import prisma from "../config/database";
import { logger } from "../utils/logger";

export class ConsentService {
  /**
   * Get user's current consent status
   */
  async getUserConsent(userId: string): Promise<PrivacyConsentType | null> {
    const consent = await prisma.privacyConsent.findUnique({
      where: { userId },
    });

    if (!consent) return null;

    return {
      id: consent.id,
      userId: consent.userId,
      cookieConsent: consent.cookieConsent,
      privacyPolicyAccepted: consent.privacyPolicyAccepted,
      termsAccepted: consent.termsAccepted,
      consentVersion: consent.consentVersion,
      consentIpAddress: consent.consentIpAddress || undefined,
      consentUserAgent: consent.consentUserAgent || undefined,
      consentedAt: consent.consentedAt,
      updatedAt: consent.updatedAt,
      withdrawnAt: consent.withdrawnAt || undefined,
      withdrawnReason: consent.withdrawnReason || undefined,
    };
  }

  /**
   * Update or create user consent
   */
  async updateConsent(
    userId: string,
    consentData: ConsentUpdateInput,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<PrivacyConsentType> {
    const existing = await prisma.privacyConsent.findUnique({
      where: { userId },
    });

    const consentRecord = existing
      ? await prisma.privacyConsent.update({
          where: { userId },
          data: {
            cookieConsent: consentData.cookieConsent,
            privacyPolicyAccepted: consentData.privacyPolicyAccepted,
            termsAccepted: consentData.termsAccepted,
            consentIpAddress: metadata?.ipAddress,
            consentUserAgent: metadata?.userAgent,
            // Clear withdrawal if consent is being given again
            withdrawnAt: consentData.cookieConsent
              ? null
              : existing.withdrawnAt,
            withdrawnReason: consentData.cookieConsent
              ? null
              : existing.withdrawnReason,
          },
        })
      : await prisma.privacyConsent.create({
          data: {
            userId,
            cookieConsent: consentData.cookieConsent,
            privacyPolicyAccepted: consentData.privacyPolicyAccepted,
            termsAccepted: consentData.termsAccepted,
            consentIpAddress: metadata?.ipAddress,
            consentUserAgent: metadata?.userAgent,
          },
        });

    // Log consent action
    await prisma.privacyAuditLog.create({
      data: {
        actionType: consentData.cookieConsent
          ? "consent_given"
          : "consent_withdrawn",
        entityType: "consent",
        entityId: consentRecord.id,
        userId,
        performedBy: userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        details: { ...consentData },
      },
    });

    logger.info(`Consent updated for user ${userId}`, {
      cookieConsent: consentData.cookieConsent,
      privacyPolicy: consentData.privacyPolicyAccepted,
      terms: consentData.termsAccepted,
    });

    return {
      id: consentRecord.id,
      userId: consentRecord.userId,
      cookieConsent: consentRecord.cookieConsent,
      privacyPolicyAccepted: consentRecord.privacyPolicyAccepted,
      termsAccepted: consentRecord.termsAccepted,
      consentVersion: consentRecord.consentVersion,
      consentIpAddress: consentRecord.consentIpAddress || undefined,
      consentUserAgent: consentRecord.consentUserAgent || undefined,
      consentedAt: consentRecord.consentedAt,
      updatedAt: consentRecord.updatedAt,
      withdrawnAt: consentRecord.withdrawnAt || undefined,
      withdrawnReason: consentRecord.withdrawnReason || undefined,
    };
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    userId: string,
    reason?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const consent = await prisma.privacyConsent.findUnique({
      where: { userId },
    });

    if (!consent) {
      return; // No consent to withdraw
    }

    await prisma.privacyConsent.update({
      where: { userId },
      data: {
        cookieConsent: false,
        privacyPolicyAccepted: false,
        termsAccepted: false,
        withdrawnAt: new Date(),
        withdrawnReason: reason,
      },
    });

    // Log withdrawal
    await prisma.privacyAuditLog.create({
      data: {
        actionType: "consent_withdrawn",
        entityType: "consent",
        entityId: consent.id,
        userId,
        performedBy: userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        details: { reason },
      },
    });

    logger.info(`Consent withdrawn for user ${userId}`, { reason });
  }

  /**
   * Check if user has given consent
   */
  async hasConsent(
    userId: string,
    consentType: "cookies" | "privacy" | "terms",
  ): Promise<boolean> {
    const consent = await prisma.privacyConsent.findUnique({
      where: { userId },
    });

    if (!consent) return false;

    // Check if consent has been withdrawn
    if (consent.withdrawnAt) return false;

    switch (consentType) {
      case "cookies":
        return consent.cookieConsent;
      case "privacy":
        return consent.privacyPolicyAccepted;
      case "terms":
        return consent.termsAccepted;
      default:
        return false;
    }
  }
}

export const consentService = new ConsentService();
