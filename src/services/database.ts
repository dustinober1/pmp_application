/**
 * Prisma Database Service with Connection Pooling
 *
 * Addresses Issue #32: No Database Connection Pooling Configuration
 *
 * Connection pooling is configured via DATABASE_URL parameters:
 * - connection_limit: Maximum connections in the pool
 * - pool_timeout: Seconds to wait for a connection
 * - connect_timeout: Seconds to wait for connection establishment
 *
 * Example DATABASE_URL:
 * postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
 */

import { PrismaClient, Prisma } from '@prisma/client';
import Logger from '../utils/logger';

// =============================================================================
// Configuration
// =============================================================================

const isProd = process.env.NODE_ENV === 'production';

// Connection pool settings (read from env with defaults)
const POOL_CONFIG = {
  // Maximum number of connections in the pool
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  // Pool timeout in seconds (how long to wait for a connection)
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '20', 10),
  // Connect timeout in seconds
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10', 10),
  // Idle timeout for connections in seconds
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '300', 10),
};

// Log levels based on environment
const logLevels: Prisma.LogLevel[] = isProd
  ? ['error', 'warn']
  : ['query', 'info', 'warn', 'error'];

// =============================================================================
// Singleton Pattern
// =============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with optimized settings
 */
const createPrismaClient = (): PrismaClient => {
  // Build connection URL with pool parameters if not already included
  let databaseUrl = process.env.DATABASE_URL || '';

  // Check if pool parameters are already in URL
  if (!databaseUrl.includes('connection_limit')) {
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl += `${separator}connection_limit=${POOL_CONFIG.connectionLimit}`;
    databaseUrl += `&pool_timeout=${POOL_CONFIG.poolTimeout}`;
    databaseUrl += `&connect_timeout=${POOL_CONFIG.connectTimeout}`;
  }

  const client = new PrismaClient({
    log: logLevels.map((level) => ({
      emit: 'event' as const,
      level,
    })),
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  // =============================================================================
  // Event Logging
  // =============================================================================

  // Log queries in development (with timing)
  if (!isProd) {
    client.$on('query', (e: Prisma.QueryEvent) => {
      if (e.duration > 100) {
        Logger.warn(`Slow query (${e.duration}ms): ${e.query.substring(0, 200)}...`);
      } else {
        Logger.debug(`Query (${e.duration}ms): ${e.query.substring(0, 100)}...`);
      }
    });
  }

  // Log warnings and errors in all environments
  client.$on('warn', (e) => {
    Logger.warn('Prisma warning:', e);
  });

  client.$on('error', (e) => {
    Logger.error('Prisma error:', e);
  });

  // Log info events
  client.$on('info', (e) => {
    Logger.info('Prisma info:', e);
  });

  return client;
};

// =============================================================================
// Export Singleton
// =============================================================================

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reloading)
if (!isProd) {
  globalForPrisma.prisma = prisma;
}

// =============================================================================
// Health Check & Metrics
// =============================================================================

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  message?: string;
}

/**
 * Check database health and latency
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get database metrics
 */
export async function getDatabaseMetrics() {
  try {
    // Get active connections (PostgreSQL specific)
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_stat_activity 
      WHERE datname = current_database() 
      AND state = 'active'
    `;

    const activeConnections = Number(result[0]?.count || 0);

    return {
      activeConnections,
      maxConnections: POOL_CONFIG.connectionLimit,
      poolTimeout: POOL_CONFIG.poolTimeout,
      connectTimeout: POOL_CONFIG.connectTimeout,
    };
  } catch (error) {
    Logger.error('Failed to get database metrics:', error);
    return null;
  }
}

// =============================================================================
// Graceful Shutdown
// =============================================================================

/**
 * Disconnect from database gracefully
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    Logger.info('Database disconnected gracefully');
  } catch (error) {
    Logger.error('Error disconnecting from database:', error);
  }
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

// =============================================================================
// Transaction Helpers
// =============================================================================

// Re-export transaction type for use in controllers
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Configuration for Prisma transactions
 */
export const TRANSACTION_CONFIG = {
  maxWait: 5000, // Maximum time to wait for acquiring a connection (ms)
  timeout: 10000, // Maximum time for transaction to complete (ms)
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
};

// Log pool configuration on startup
Logger.info('Database connection pool configured:', {
  connectionLimit: POOL_CONFIG.connectionLimit,
  poolTimeout: `${POOL_CONFIG.poolTimeout}s`,
  connectTimeout: `${POOL_CONFIG.connectTimeout}s`,
  idleTimeout: `${POOL_CONFIG.idleTimeout}s`,
  environment: isProd ? 'production' : 'development',
});
