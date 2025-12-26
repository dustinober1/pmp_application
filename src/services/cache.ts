/**
 * Enhanced Cache Service with Redis
 *
 * Addresses Issue #6: Inconsistent Caching Strategy
 *
 * Features:
 * - Standardized TTL constants
 * - Pattern-based cache invalidation
 * - Namespace-based key management
 * - Health checks and metrics
 * - Graceful degradation on Redis failure
 */

import { createClient, RedisClientType } from "redis";
import Logger from "../utils/logger";

// =============================================================================
// Standardized TTL Constants (in seconds)
// =============================================================================

export const CACHE_TTL = {
  // Short-lived data (frequently changing)
  SHORT: 60, // 1 minute

  // Medium-lived data (semi-static)
  MEDIUM: 300, // 5 minutes

  // Long-lived data (rarely changing)
  LONG: 3600, // 1 hour

  // Extended cache (static data)
  EXTENDED: 86400, // 24 hours

  // Specific data types
  FLASHCARDS: 300, // 5 minutes
  QUESTIONS: 600, // 10 minutes
  USER_PROGRESS: 60, // 1 minute (changes frequently)
  DOMAINS: 3600, // 1 hour (rarely changes)
  PRACTICE_TESTS: 600, // 10 minutes
  USER_SESSION: 1800, // 30 minutes

  // Auth-related
  LOCKOUT: 900, // 15 minutes
  RATE_LIMIT: 900, // 15 minutes
} as const;

// =============================================================================
// Cache Key Prefixes
// =============================================================================

export const CACHE_PREFIX = {
  FLASHCARDS: "flashcards",
  QUESTIONS: "questions",
  DOMAINS: "domains",
  PROGRESS: "progress",
  TESTS: "tests",
  USER: "user",
  SESSION: "session",
  LOCKOUT: "lockout",
} as const;

// =============================================================================
// Cache Service Class
// =============================================================================

class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private connectionRetries: number = 0;
  private maxRetries: number = 5;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > this.maxRetries) {
            Logger.error("Redis max reconnection attempts reached");
            return new Error("Max retries reached");
          }
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    this.client.on("error", (err) => {
      Logger.error("Redis Client Error", err);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      Logger.info("Redis Client Connected");
      this.isConnected = true;
      this.connectionRetries = 0;
    });

    this.client.on("reconnecting", () => {
      this.connectionRetries++;
      Logger.warn(`Redis reconnecting (attempt ${this.connectionRetries})`);
    });

    this.client.on("end", () => {
      Logger.warn("Redis connection closed");
      this.isConnected = false;
    });
  }

  private async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (error) {
      Logger.error("Failed to connect to Redis", error);
    }
  }

  // =============================================================================
  // Core Operations
  // =============================================================================

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      Logger.error(`Cache GET error for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  public async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = CACHE_TTL.MEDIUM,
  ): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
    } catch (error) {
      Logger.error(`Cache SET error for key: ${key}`, error);
    }
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      Logger.error(`Cache DEL error for key: ${key}`, error);
    }
  }

  // =============================================================================
  // Pattern-Based Operations
  // =============================================================================

  /**
   * Delete all keys matching a pattern
   * Use with caution - KEYS command can be slow on large datasets
   */
  public async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(keys);
      Logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      return keys.length;
    } catch (error) {
      Logger.error(`Cache DEL pattern error: ${pattern}`, error);
      return 0;
    }
  }

  /**
   * Invalidate cache by prefix (namespace)
   * Example: invalidatePrefix('flashcards') deletes all flashcard caches
   */
  public async invalidatePrefix(prefix: string): Promise<number> {
    return this.delPattern(`${prefix}:*`);
  }

  /**
   * Invalidate user-specific cache
   */
  public async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.delPattern(`${CACHE_PREFIX.PROGRESS}:${userId}:*`),
      this.delPattern(`${CACHE_PREFIX.USER}:${userId}:*`),
      this.delPattern(`${CACHE_PREFIX.SESSION}:${userId}:*`),
    ]);
    Logger.debug(`Invalidated all cache for user: ${userId}`);
  }

  // =============================================================================
  // Utility Operations
  // =============================================================================

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      Logger.error(`Cache EXISTS error for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get TTL for a key (in seconds)
   */
  public async ttl(key: string): Promise<number> {
    if (!this.isConnected) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      Logger.error(`Cache TTL error for key: ${key}`, error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  public async incr(key: string): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      return await this.client.incr(key);
    } catch (error) {
      Logger.error(`Cache INCR error for key: ${key}`, error);
      return 0;
    }
  }

  /**
   * Set expiration on an existing key
   */
  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.expire(key, ttlSeconds);
      return Boolean(result);
    } catch (error) {
      Logger.error(`Cache EXPIRE error for key: ${key}`, error);
      return false;
    }
  }

  // =============================================================================
  // Health & Metrics
  // =============================================================================

  /**
   * Check Redis health
   */
  public async healthCheck(): Promise<{
    status: string;
    latencyMs: number;
    message?: string;
  }> {
    const start = Date.now();

    if (!this.isConnected) {
      return {
        status: "unhealthy",
        latencyMs: 0,
        message: "Not connected",
      };
    }

    try {
      await this.client.ping();
      return {
        status: "healthy",
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<Record<string, unknown> | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const info = await this.client.info("memory");
      const keyCount = await this.client.dbSize();

      return {
        isConnected: this.isConnected,
        keyCount,
        memoryInfo: info,
      };
    } catch (error) {
      Logger.error("Failed to get cache stats", error);
      return null;
    }
  }

  /**
   * Check connection status
   */
  public isHealthy(): boolean {
    return this.isConnected;
  }

  // =============================================================================
  // Shutdown
  // =============================================================================

  /**
   * Gracefully disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      Logger.info("Redis client disconnected gracefully");
    } catch (error) {
      Logger.error("Error disconnecting Redis client", error);
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const cache = new CacheService();

// =============================================================================
// Cache Key Builders
// =============================================================================

/**
 * Build a cache key with namespace
 */
export function buildCacheKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  return [prefix, ...parts].join(":");
}

/**
 * Build user-specific cache key
 */
export function buildUserCacheKey(
  prefix: string,
  userId: string,
  ...parts: (string | number)[]
): string {
  return buildCacheKey(prefix, userId, ...parts);
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await cache.disconnect();
});
