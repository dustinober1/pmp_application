/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `practice_questions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "practice_questions" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "methodology" TEXT,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "privacy_consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cookieConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyPolicyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "consentIpAddress" TEXT,
    "consentUserAgent" TEXT,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "withdrawnAt" TIMESTAMP(3),
    "withdrawnReason" TEXT,

    CONSTRAINT "privacy_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '7 days',
    "downloadUrl" TEXT,
    "fileSize" INTEGER,
    "errorMessage" TEXT,
    "processedBy" TEXT,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_deletion_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gracePeriodEnds" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '30 days',
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "deletionReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "softDeletedAt" TIMESTAMP(3),
    "hardDeleteScheduledFor" TIMESTAMP(3),
    "processedBy" TEXT,

    CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_audit_logs" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "performedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "privacy_consent_userId_key" ON "privacy_consent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "data_export_requests_requestId_key" ON "data_export_requests"("requestId");

-- CreateIndex
CREATE INDEX "data_export_requests_userId_status_idx" ON "data_export_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "data_export_requests_status_idx" ON "data_export_requests"("status");

-- CreateIndex
CREATE INDEX "data_export_requests_expiresAt_idx" ON "data_export_requests"("expiresAt");

-- CreateIndex
CREATE INDEX "account_deletion_requests_userId_status_idx" ON "account_deletion_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "account_deletion_requests_status_idx" ON "account_deletion_requests"("status");

-- CreateIndex
CREATE INDEX "account_deletion_requests_gracePeriodEnds_idx" ON "account_deletion_requests"("gracePeriodEnds");

-- CreateIndex
CREATE INDEX "privacy_audit_logs_userId_actionType_idx" ON "privacy_audit_logs"("userId", "actionType");

-- CreateIndex
CREATE INDEX "privacy_audit_logs_entityType_entityId_idx" ON "privacy_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "privacy_audit_logs_createdAt_idx" ON "privacy_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "practice_questions_externalId_key" ON "practice_questions"("externalId");

-- AddForeignKey
ALTER TABLE "privacy_consent" ADD CONSTRAINT "privacy_consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_export_requests" ADD CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
