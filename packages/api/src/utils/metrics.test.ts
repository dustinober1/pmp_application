/**
 * Tests for metrics utility (Prometheus)
 * Target: 85%+ coverage
 */

import http from 'http';
import { metricsRegistry, recordHttpRequest, recordDbQuery, startMetricsServer } from './metrics';

// Mock prom-client
jest.mock('prom-client', () => {
  const mockCounter = {
    inc: jest.fn(),
  };

  const mockHistogram = {
    observe: jest.fn(),
    startTimer: jest.fn(() => jest.fn(() => undefined)),
  };

  const mockGauge = {
    set: jest.fn(),
    inc: jest.fn(),
    dec: jest.fn(),
  };

  const mockRegistry = {
    registerMetric: jest.fn(),
    clear: jest.fn(),
    merge: jest.fn(),
    resetMetrics: jest.fn(),
    getMetricsAsJSON: jest.fn(() => ({ metrics: [] })),
    metrics: [],
  };

  return {
    Counter: jest.fn(() => mockCounter),
    Histogram: jest.fn(() => mockHistogram),
    Gauge: jest.fn(() => mockGauge),
    Registry: jest.fn(() => mockRegistry),
    register: mockRegistry,
    collectDefaultMetrics: jest.fn(() => mockRegistry),
  };
});

describe('Metrics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('metricsRegistry', () => {
    it('should be defined', () => {
      expect(metricsRegistry).toBeDefined();
    });

    it('should have registerMetric method', () => {
      expect(typeof metricsRegistry.registerMetric).toBe('function');
    });
  });

  describe('recordHttpRequest', () => {
    it('should record HTTP request metrics', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordHttpRequest('GET', '/api/test', 200, 123);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle different status codes', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordHttpRequest('POST', '/api/users', 201, 456);
      recordHttpRequest('DELETE', '/api/users/123', 404, 78);
      recordHttpRequest('PUT', '/api/users/123', 500, 234);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle different HTTP methods', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordHttpRequest('GET', '/api/test', 200, 100);
      recordHttpRequest('POST', '/api/test', 201, 150);
      recordHttpRequest('PUT', '/api/test', 200, 125);
      recordHttpRequest('PATCH', '/api/test', 200, 130);
      recordHttpRequest('DELETE', '/api/test', 204, 80);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('recordDbQuery', () => {
    it('should record database query metrics', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordDbQuery('user', 'findUnique', 50);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle different query types', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordDbQuery('user', 'findUnique', 45);
      recordDbQuery('user', 'findMany', 123);
      recordDbQuery('user', 'create', 67);
      recordDbQuery('user', 'update', 89);
      recordDbQuery('user', 'delete', 34);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle different models', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      recordDbQuery('user', 'findUnique', 50);
      recordDbQuery('ebookChapter', 'findMany', 78);
      recordDbQuery('userSubscription', 'findUnique', 56);
      recordDbQuery('practiceSession', 'create', 123);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('startMetricsServer', () => {
    it('should start metrics server on specified port', () => {
      const listenSpy = jest.fn().mockImplementation((port, callback) => callback?.());
      const createServerSpy = jest.spyOn(http, 'createServer').mockImplementation(() => ({
        listen: listenSpy,
      }));

      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      startMetricsServer(9091);

      expect(listenSpy).toHaveBeenCalledWith(9091, expect.any(Function));

      listenSpy.mockRestore();
      createServerSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should log metrics server start', () => {
      const listenSpy = jest.fn().mockImplementation((port, callback) => callback?.());
      jest.spyOn(http, 'createServer').mockImplementation(() => ({
        listen: listenSpy,
      }));

      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      startMetricsServer(9091);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Metrics server'));

      listenSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle server errors gracefully', () => {
      const listenSpy = jest.fn().mockImplementation(() => {
        throw new Error('Port in use');
      });
      jest.spyOn(http, 'createServer').mockImplementation(() => ({
        listen: listenSpy,
      }));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => startMetricsServer(9091)).not.toThrow();

      listenSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
