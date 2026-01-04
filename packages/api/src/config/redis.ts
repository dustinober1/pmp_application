import Redis from "ioredis";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      logger.warn("REDIS_URL not configured - caching disabled");
      return createMockRedis();
    }

    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
      });

      redisClient.on("error", (err) => {
        logger.error("Redis error:", err);
      });

      redisClient.on("connect", () => {
        logger.info("Redis connected");
      });

      redisClient.on("disconnect", () => {
        logger.warn("Redis disconnected");
      });

      return redisClient;
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      return createMockRedis();
    }
  }

  return redisClient;
}

/**
 * Create a mock Redis client for when Redis is not available
 * This ensures the application works even without Redis
 */
function createMockRedis(): Redis {
  const mock = {
    get: async (): Promise<string | null> => null,
    set: async (): Promise<"OK"> => "OK",
    setex: async (): Promise<"OK"> => "OK",
    del: async (): Promise<number> => 0,
    exists: async (): Promise<number> => 0,
    keys: async (): Promise<string[]> => [],
    flushall: async (): Promise<"OK"> => "OK",
    expire: async (): Promise<number> => 0,
    ttl: async (): Promise<number> => -1,
  } as any;

  return mock;
}

/**
 * Cache helper with automatic JSON serialization
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const data = await redis.get(key);

  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error("Failed to parse cached data:", error);
    return null;
  }
}

/**
 * Cache helper with automatic JSON serialization
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300,
): Promise<void> {
  const redis = getRedisClient();
  const serialized = JSON.stringify(value);
  await redis.setex(key, ttlSeconds, serialized);
}

/**
 * Delete cache key(s)
 */
export async function cacheDel(key: string | string[]): Promise<void> {
  const redis = getRedisClient();
  const keys = Array.isArray(key) ? key : [key];
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * Invalidate cache by pattern
 * Use carefully - can be slow with many keys
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  const redis = getRedisClient();
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
    logger.info(
      `Invalidated ${keys.length} cache keys matching pattern: ${pattern}`,
    );
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && process.env.REDIS_URL !== undefined;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis connection closed");
  }
}
