import crypto from "crypto";
import { prisma } from "./database";
import Logger from "../utils/logger";

const DEFAULT_RESET_TOKEN_TTL_MINUTES = 60;
const DEFAULT_RESET_TOKEN_BYTES = 32;

const resetTokenTtlMinutes = Number.parseInt(
  process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ||
    String(DEFAULT_RESET_TOKEN_TTL_MINUTES),
  10,
);
const resetTokenBytes = Number.parseInt(
  process.env.PASSWORD_RESET_TOKEN_BYTES || String(DEFAULT_RESET_TOKEN_BYTES),
  10,
);

const getResetExpiry = (): Date => {
  const ttlMinutes = Number.isFinite(resetTokenTtlMinutes)
    ? resetTokenTtlMinutes
    : DEFAULT_RESET_TOKEN_TTL_MINUTES;
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
};

const getTokenBytes = (): number => {
  return Number.isFinite(resetTokenBytes)
    ? resetTokenBytes
    : DEFAULT_RESET_TOKEN_BYTES;
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const createPasswordResetToken = async (
  userId: string,
  userAgent?: string,
  ipAddress?: string,
): Promise<string> => {
  const token = crypto.randomBytes(getTokenBytes()).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = getResetExpiry();

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  Logger.info(`Password reset token issued for user: ${userId}`);

  return token;
};

export const findValidPasswordResetToken = async (token: string) => {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return null;
  }

  if (record.usedAt) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return null;
  }

  return record;
};

export const markPasswordResetTokenUsed = async (
  tokenId: string,
): Promise<boolean> => {
  const result = await prisma.passwordResetToken.updateMany({
    where: { id: tokenId, usedAt: null },
    data: { usedAt: new Date() },
  });

  return result.count > 0;
};
