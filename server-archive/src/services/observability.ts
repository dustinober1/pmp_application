import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";
import { Request, Response } from "express";
import responseTime from "response-time";
import Logger from "../utils/logger";

/**
 * Observability Service
 *
 * Addresses Issue #24: Missing Observability
 *
 * Provides Prometheus metrics and health monitoring.
 */

class ObservabilityService {
  private registry: Registry;

  // Custom metrics
  private httpRequestCounter: Counter;
  private httpRequestDuration: Histogram;
  private apiVersionCounter: Counter;
  private databaseErrorCounter: Counter;
  private cacheHitCounter: Counter;
  private cacheMissCounter: Counter;

  constructor() {
    this.registry = new Registry();

    // Add default metrics (CPU, Memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Initialize custom metrics
    this.httpRequestCounter = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
      registers: [this.registry],
    });

    this.apiVersionCounter = new Counter({
      name: "api_version_usage_total",
      help: "Total number of requests per API version",
      labelNames: ["version"],
      registers: [this.registry],
    });

    this.databaseErrorCounter = new Counter({
      name: "db_errors_total",
      help: "Total number of database errors",
      labelNames: ["operation", "type"],
      registers: [this.registry],
    });

    this.cacheHitCounter = new Counter({
      name: "cache_hits_total",
      help: "Total number of cache hits",
      labelNames: ["namespace"],
      registers: [this.registry],
    });

    this.cacheMissCounter = new Counter({
      name: "cache_misses_total",
      help: "Total number of cache misses",
      labelNames: ["namespace"],
      registers: [this.registry],
    });
  }

  /**
   * Middleware to track HTTP metrics
   */
  public metricsMiddleware() {
    return responseTime((req: Request, res: Response, time: number) => {
      // Use originalUrl or route path to avoid high cardinality with IDs
      const route = req.route ? req.route.path : req.path;
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      };

      this.httpRequestCounter.inc(labels);
      this.httpRequestDuration.observe(labels, time / 1000); // convert ms to s
    });
  }

  /**
   * Endpoint to expose metrics to Prometheus
   */
  public async getMetrics(_req: Request, res: Response) {
    try {
      res.set("Content-Type", this.registry.contentType);
      res.end(await this.registry.metrics());
    } catch (error) {
      Logger.error("Failed to get metrics:", error);
      res.status(500).send(error);
    }
  }

  /**
   * Track API version usage
   */
  public trackApiVersion(version: string) {
    this.apiVersionCounter.inc({ version });
  }

  /**
   * Track database error
   */
  public trackDatabaseError(operation: string, type: string) {
    this.databaseErrorCounter.inc({ operation, type });
  }

  /**
   * Track cache hit
   */
  public trackCacheHit(namespace: string) {
    this.cacheHitCounter.inc({ namespace });
  }

  /**
   * Track cache miss
   */
  public trackCacheMiss(namespace: string) {
    this.cacheMissCounter.inc({ namespace });
  }
}

export const observability = new ObservabilityService();
