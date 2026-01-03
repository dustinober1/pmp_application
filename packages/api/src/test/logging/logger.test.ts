/**
 * Logger unit tests
 */

import { Logger, initializeLogger, createLogger } from "../../logging/logger";
import type { LoggerConfig } from "../../logging/types";

describe("Logger", () => {
  let logger: Logger;
  let testConfig: LoggerConfig;

  beforeEach(() => {
    testConfig = {
      level: "debug",
      environment: "test",
      serviceName: "pmp-api-test",
      enableCloudWatch: false,
      cloudWatchLogGroup: "/test/pmp-api",
      cloudWatchLogStream: "test-stream",
      sanitizeFields: ["password", "secret"],
    };

    logger = createLogger(testConfig);
  });

  afterEach(() => {
    Logger.clearContext();
  });

  describe("log levels", () => {
    it("should log debug messages", () => {
      expect(() => logger.debug("Debug message")).not.toThrow();
    });

    it("should log info messages", () => {
      expect(() => logger.info("Info message")).not.toThrow();
    });

    it("should log warn messages", () => {
      expect(() => logger.warn("Warning message")).not.toThrow();
    });

    it("should log error messages", () => {
      expect(() => logger.error("Error message")).not.toThrow();
    });

    it("should log error with Error object", () => {
      const error = new Error("Test error");
      expect(() => logger.error("Error occurred", error)).not.toThrow();
    });
  });

  describe("context management", () => {
    it("should set and get trace ID", () => {
      const traceId = "test-trace-123";
      Logger.setTraceId(traceId);
      expect(Logger.getTraceId()).toBe(traceId);
    });

    it("should set and get user ID", () => {
      const userId = "user-123";
      Logger.setUserId(userId);
      expect(Logger.getUserId()).toBe(userId);
    });

    it("should clear context", () => {
      Logger.setTraceId("trace-123");
      Logger.setUserId("user-123");
      Logger.clearContext();

      expect(Logger.getTraceId()).toBeUndefined();
      expect(Logger.getUserId()).toBeUndefined();
    });
  });

  describe("metadata logging", () => {
    it("should log with metadata", () => {
      expect(() =>
        logger.info("Request received", {
          method: "GET",
          path: "/api/test",
          status: 200,
        }),
      ).not.toThrow();
    });

    it("should log error with metadata", () => {
      const error = new Error("Test error");
      expect(() =>
        logger.error("Request failed", error, {
          method: "POST",
          path: "/api/test",
        }),
      ).not.toThrow();
    });
  });

  describe("child logger", () => {
    it("should create child logger with additional context", () => {
      const child = logger.child({
        service_name: "child-service",
        custom_field: "custom-value",
      });

      expect(child).toBeInstanceOf(Logger);
      expect(() => child.info("Child log message")).not.toThrow();
    });
  });

  describe("log level changes", () => {
    it("should change log level at runtime", () => {
      logger.setLevel("error");
      expect(() => logger.debug("Should not log")).not.toThrow();
      expect(() => logger.info("Should not log")).not.toThrow();
      expect(() => logger.error("Should log")).not.toThrow();
    });
  });
});

describe("Logger initialization", () => {
  it("should initialize default logger", () => {
    const config = {
      level: "info" as const,
      environment: "test",
      serviceName: "pmp-api",
      enableCloudWatch: false,
      cloudWatchLogGroup: "/test/api",
      cloudWatchLogStream: "test",
      sanitizeFields: [],
    };

    const logger = initializeLogger(config);
    expect(logger).toBeInstanceOf(Logger);
  });
});
