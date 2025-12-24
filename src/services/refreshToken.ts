import crypto from 'crypto';
import { prisma } from './database';
import Logger from '../utils/logger';

// Refresh token configuration
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_LENGTH = 64;

/**
 * Generate a cryptographically secure refresh token
 */
export const generateRefreshToken = (): string => {
    return crypto.randomBytes(REFRESH_TOKEN_LENGTH).toString('hex');
};

/**
 * Hash a refresh token for storage
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Store a refresh token for a user
 */
export const storeRefreshToken = async (
    userId: string,
    token: string,
    userAgent?: string,
    ipAddress?: string
): Promise<void> => {
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
            userAgent,
            ipAddress,
        },
    });

    Logger.debug(`Refresh token stored for user: ${userId}`);
};

/**
 * Validate a refresh token and return the associated user
 */
export const validateRefreshToken = async (token: string): Promise<{
    userId: string;
    tokenId: string;
} | null> => {
    const tokenHash = hashToken(token);

    const refreshToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
            user: {
                select: { id: true, email: true, role: true },
            },
        },
    });

    if (!refreshToken) {
        Logger.warn('Refresh token not found');
        return null;
    }

    // Check if token is revoked
    if (refreshToken.revokedAt) {
        Logger.warn(`Attempted use of revoked refresh token for user: ${refreshToken.userId}`);
        return null;
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
        Logger.warn(`Expired refresh token for user: ${refreshToken.userId}`);
        // Clean up expired token
        await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
        return null;
    }

    return {
        userId: refreshToken.userId,
        tokenId: refreshToken.id,
    };
};

/**
 * Revoke a specific refresh token
 */
export const revokeRefreshToken = async (tokenId: string): Promise<void> => {
    await prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
    });
    Logger.info(`Refresh token revoked: ${tokenId}`);
};

/**
 * Revoke all refresh tokens for a user (useful for password changes or logout all devices)
 */
export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
    Logger.info(`All refresh tokens revoked for user: ${userId}`);
};

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { revokedAt: { not: null } },
            ],
        },
    });
    Logger.info(`Cleaned up ${result.count} expired/revoked refresh tokens`);
    return result.count;
};

/**
 * Rotate a refresh token (invalidate old, create new) - prevents token reuse attacks
 */
export const rotateRefreshToken = async (
    oldTokenId: string,
    userId: string,
    userAgent?: string,
    ipAddress?: string
): Promise<string> => {
    // Revoke the old token
    await revokeRefreshToken(oldTokenId);

    // Generate and store new token
    const newToken = generateRefreshToken();
    await storeRefreshToken(userId, newToken, userAgent, ipAddress);

    return newToken;
};
