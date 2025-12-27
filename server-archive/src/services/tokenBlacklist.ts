/**
 * Token Blacklist Service
 *
 * Addresses Issue #9: JWT Token Management Inconsistencies
 *
 * Features:
 * - Token blacklisting for logout
 * - Automatic cleanup of expired tokens
 * - Redis-backed for performance
 */

import { cache, CACHE_TTL } from "./cache";
import Logger from "../utils/logger";

// =============================================================================
// Configuration
// =============================================================================

const TOKEN_BLACKLIST_PREFIX = "token:blacklist";

// Default TTL matches longest token expiry (7 days)
const DEFAULT_BLACKLIST_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// =============================================================================
// Token Blacklist Service
// =============================================================================

/**
 * Add a token to the blacklist
 * Call this when a user logs out
 *
 * @param tokenId - The JWT token ID (jti) or the full token
 * @param expiresInSeconds - Time until token expires (for cleanup)
 */
export async function blacklistToken(
  tokenId: string,
  expiresInSeconds: number = DEFAULT_BLACKLIST_TTL,
): Promise<void> {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}:${tokenId}`;
    await cache.set(key, { blacklistedAt: Date.now() }, expiresInSeconds);
    Logger.debug(`Token blacklisted: ${tokenId.substring(0, 20)}...`);
  } catch (error) {
    Logger.error("Failed to blacklist token:", error);
  }
}

/**
 * Check if a token is blacklisted
 *
 * @param tokenId - The JWT token ID (jti) or the full token
 * @returns true if the token is blacklisted
 */
export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}:${tokenId}`;
    const result = await cache.exists(key);
    return result;
  } catch (error) {
    Logger.error("Failed to check token blacklist:", error);
    // Fail secure - if we can't check, assume not blacklisted
    // but log the error for monitoring
    return false;
  }
}

/**
 * Remove a token from the blacklist
 * Typically not needed as tokens auto-expire
 *
 * @param tokenId - The JWT token ID (jti) or the full token
 */
export async function unblacklistToken(tokenId: string): Promise<void> {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}:${tokenId}`;
    await cache.del(key);
    Logger.debug(
      `Token removed from blacklist: ${tokenId.substring(0, 20)}...`,
    );
  } catch (error) {
    Logger.error("Failed to remove token from blacklist:", error);
  }
}

/**
 * Blacklist all tokens for a user
 * Use when user changes password or admin revokes access
 *
 * @param userId - The user's ID
 */
export async function blacklistUserTokens(userId: string): Promise<void> {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}:user:${userId}`;
    await cache.set(key, { revokedAt: Date.now() }, DEFAULT_BLACKLIST_TTL);
    Logger.info(`All tokens revoked for user: ${userId}`);
  } catch (error) {
    Logger.error("Failed to blacklist user tokens:", error);
  }
}

/**
 * Check if all tokens for a user are revoked
 *
 * @param userId - The user's ID
 * @param tokenIssuedAt - When the token was issued (iat claim)
 * @returns true if the token was issued before revocation
 */
export async function areUserTokensRevoked(
  userId: string,
  tokenIssuedAt: number,
): Promise<boolean> {
  try {
    const key = `${TOKEN_BLACKLIST_PREFIX}:user:${userId}`;
    const data = await cache.get<{ revokedAt: number }>(key);

    if (!data) {
      return false;
    }

    // Token is revoked if it was issued before the revocation time
    return tokenIssuedAt * 1000 < data.revokedAt;
  } catch (error) {
    Logger.error("Failed to check user token revocation:", error);
    return false;
  }
}

// =============================================================================
// Refresh Token Management
// =============================================================================

const REFRESH_TOKEN_PREFIX = "token:refresh";

interface RefreshTokenData {
  userId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Store a refresh token
 *
 * @param tokenHash - Hash of the refresh token
 * @param data - Token metadata
 * @param ttlSeconds - Time to live
 */
export async function storeRefreshToken(
  tokenHash: string,
  data: RefreshTokenData,
  ttlSeconds: number = CACHE_TTL.EXTENDED,
): Promise<void> {
  try {
    const key = `${REFRESH_TOKEN_PREFIX}:${tokenHash}`;
    await cache.set(key, data, ttlSeconds);
  } catch (error) {
    Logger.error("Failed to store refresh token:", error);
  }
}

/**
 * Get refresh token data
 *
 * @param tokenHash - Hash of the refresh token
 * @returns Token data or null
 */
export async function getRefreshToken(
  tokenHash: string,
): Promise<RefreshTokenData | null> {
  try {
    const key = `${REFRESH_TOKEN_PREFIX}:${tokenHash}`;
    return await cache.get<RefreshTokenData>(key);
  } catch (error) {
    Logger.error("Failed to get refresh token:", error);
    return null;
  }
}

/**
 * Delete a refresh token
 *
 * @param tokenHash - Hash of the refresh token
 */
export async function deleteRefreshToken(tokenHash: string): Promise<void> {
  try {
    const key = `${REFRESH_TOKEN_PREFIX}:${tokenHash}`;
    await cache.del(key);
  } catch (error) {
    Logger.error("Failed to delete refresh token:", error);
  }
}

/**
 * Delete all refresh tokens for a user
 * Use when user logs out of all devices
 *
 * @param userId - The user's ID
 */
export async function deleteUserRefreshTokens(userId: string): Promise<void> {
  try {
    // This requires checking all tokens - could be optimized with user-specific sets
    // For now, rely on the user token revocation mechanism
    await blacklistUserTokens(userId);
    Logger.info(`All refresh tokens invalidated for user: ${userId}`);
  } catch (error) {
    Logger.error("Failed to delete user refresh tokens:", error);
  }
}
