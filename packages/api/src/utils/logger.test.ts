/**
 * Tests for logger utility
 * Target: 90%+ coverage
 */

import { logger } from "./logger";

// Mock winston to avoid actual file writes
jest.mock("winston", () => {
  const mockFormat = {
    colorize: jest.fn(() => mockFormat),
    printf: jest.fn(() => mockFormat),
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    errors: jest.fn(),
    simple: jest.fn(),
  };

  const mockTransport = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  return {
    format: mockFormat,
    transports: {
      Console: jest.fn(() => mockTransport),
      File: jest.fn(() => mockTransport),
    },
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  };
});

describe("Logger Utility", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("info logging", () => {
    it("should log info messages", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      logger.info("Test info message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log info with metadata", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      logger.info("Test with metadata", { userId: "123", action: "test" });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("error logging", () => {
    it("should log error messages", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logger.error("Test error message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log error with Error object", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("Test error");

      logger.error("Error occurred", error);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log error with metadata", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logger.error("Error with metadata", {
        code: "TEST_ERROR",
        userId: "123",
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("warn logging", () => {
    it("should log warning messages", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      logger.warn("Test warning message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log warning with metadata", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      logger.warn("Warning with metadata", {
        deprecated: true,
        version: "1.0",
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("debug logging", () => {
    it("should log debug messages in development", () => {
      process.env.NODE_ENV = "development";
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation();

      logger.debug("Test debug message");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should log debug with metadata", () => {
      process.env.NODE_ENV = "development";
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation();

      logger.debug("Debug with metadata", { step: 1, data: "test" });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
