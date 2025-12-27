import { Request, Response, NextFunction } from "express";
import { prisma, checkDatabaseHealth } from "../services/database";
import { cache } from "../services/cache";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";
import os from "os";

interface ServiceHealth {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs?: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface SystemHealthResponse {
  status: "OK" | "DEGRADED" | "DOWN";
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
  system: {
    cpuUsage: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    loadAverage: number[];
  };
  metrics: {
    activeUsers: number;
    totalUsers: number;
    activeSessions: number;
    recentErrors: number;
    avgApiResponseTime: number;
  };
}

/**
 * Get detailed system health information
 * GET /api/admin/health/detailed
 */
export const getDetailedHealth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const startTime = Date.now();

    // Check database and Redis health in parallel
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      cache.healthCheck(),
    ]);

    // Get system metrics
    const cpus = os.cpus();
    const cpuUsage =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (total - idle) / total;
      }, 0) / cpus.length;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Get application metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [totalUsers, activeUsers, activeSessions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          testSessions: {
            some: {
              startedAt: { gte: oneDayAgo },
            },
          },
        },
      }),
      prisma.userTestSession.count({
        where: {
          status: "IN_PROGRESS",
          startedAt: { gte: oneHourAgo },
        },
      }),
    ]);

    const isDegraded =
      dbHealth.status !== "healthy" || redisHealth.status !== "healthy";
    const isDown =
      dbHealth.status !== "healthy" && redisHealth.status !== "healthy";

    const response: SystemHealthResponse = {
      status: isDown ? "DOWN" : isDegraded ? "DEGRADED" : "OK",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: dbHealth.status as "healthy" | "degraded" | "unhealthy",
          latencyMs: dbHealth.latencyMs,
          message: dbHealth.message,
        },
        redis: {
          status: redisHealth.status as "healthy" | "degraded" | "unhealthy",
          latencyMs: redisHealth.latencyMs,
          message: redisHealth.message,
        },
      },
      system: {
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage: {
          used: usedMem,
          total: totalMem,
          percentage: Math.round((usedMem / totalMem) * 100),
        },
        loadAverage: os.loadavg(),
      },
      metrics: {
        activeUsers,
        totalUsers,
        activeSessions,
        recentErrors: 0, // Would integrate with Sentry API in production
        avgApiResponseTime: Date.now() - startTime,
      },
    };

    const statusCode = isDown ? 503 : 200;
    res.status(statusCode).json(response);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching detailed health:", error);
    next(ErrorFactory.internal("Failed to fetch system health"));
  }
};

/**
 * Get database query performance metrics
 * GET /api/admin/health/database
 */
export const getDatabaseMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const metrics: Record<string, { count: number; avgTime?: number }> = {};

    // Get table counts and approximate sizes
    const tableCounts = await Promise.all([
      prisma.user.count().then((count) => ({ table: "users", count })),
      prisma.question.count().then((count) => ({ table: "questions", count })),
      prisma.flashCard
        .count()
        .then((count) => ({ table: "flashcards", count })),
      prisma.userTestSession
        .count()
        .then((count) => ({ table: "test_sessions", count })),
      prisma.userAnswer
        .count()
        .then((count) => ({ table: "user_answers", count })),
      prisma.flashCardReview
        .count()
        .then((count) => ({ table: "flashcard_reviews", count })),
    ]);

    tableCounts.forEach(({ table, count }) => {
      metrics[table] = { count };
    });

    // Get recent session statistics
    const recentSessions = await prisma.userTestSession.groupBy({
      by: ["status"],
      _count: true,
      where: {
        startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      tableCounts: metrics,
      recentSessionStats: recentSessions,
      connectionPool: {
        status: "healthy",
        message: "Prisma manages connection pooling automatically",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching database metrics:", error);
    next(ErrorFactory.internal("Failed to fetch database metrics"));
  }
};

/**
 * Get API response time history
 * GET /api/admin/health/api-metrics
 */
export const getApiMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // This would typically come from a metrics store like Prometheus
    // For now, return placeholder data structure
    res.json({
      message: "API metrics available via Prometheus at /metrics endpoint",
      prometheusEndpoint: "/metrics",
      grafanaDashboard: process.env.GRAFANA_URL || null,
      sampleMetrics: {
        requestsPerMinute: "Available in Prometheus",
        avgResponseTime: "Available in Prometheus",
        errorRate: "Available in Prometheus",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching API metrics:", error);
    next(ErrorFactory.internal("Failed to fetch API metrics"));
  }
};
