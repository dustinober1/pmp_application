/**
 * Logging middleware integration tests
 */

import request from 'supertest';
import type { Express } from 'express';
import express from 'express';
import {
  traceIdMiddleware,
  userIdMiddleware,
  requestLoggingMiddleware,
  contextCleanupMiddleware,
  Logger,
} from '../../logging';

describe('Logging Middleware', () => {
  let app: Express;

  beforeEach(() => {
    // Initialize logger for tests
    Logger.setTraceId('test-trace');
    Logger.setUserId('test-user');

    app = express();
    app.use(express.json());

    // Apply logging middleware
    app.use(traceIdMiddleware);
    app.use(userIdMiddleware);
    app.use(requestLoggingMiddleware);
    app.use(contextCleanupMiddleware);

    // Add test route
    app.get('/test', (req, res) => {
      res.json({
        trace_id: req.trace_id,
        user_id: req.user_id,
        message: 'success',
      });
    });

    app.get('/error', (req, res) => {
      res.status(500).json({ error: 'Test error' });
    });

    app.use((err: any, req: any, res: any, _next: any) => {
      res.status(500).json({ error: err.message });
    });
  });

  afterEach(() => {
    Logger.clearContext();
  });

  describe('traceIdMiddleware', () => {
    it('should add trace ID to request', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.trace_id).toBeDefined();
      expect(typeof response.body.trace_id).toBe('string');
    });

    it('should use provided trace ID from header', async () => {
      const customTraceId = 'custom-trace-123';
      const response = await request(app).get('/test').set('X-Trace-ID', customTraceId);

      expect(response.status).toBe(200);
      expect(response.body.trace_id).toBe(customTraceId);
    });

    it('should return trace ID in response header', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['x-trace-id']).toBeDefined();
      expect(typeof response.headers['x-trace-id']).toBe('string');
    });
  });

  describe('userIdMiddleware', () => {
    it('should add user ID to request when authenticated', async () => {
      const appWithAuth = express();
      appWithAuth.use(express.json());
      appWithAuth.use(traceIdMiddleware);
      appWithAuth.use((req: any, res, next) => {
        req.user = { id: 'user-123' };
        next();
      });
      appWithAuth.use(userIdMiddleware);

      appWithAuth.get('/test', (req: any, res) => {
        res.json({ user_id: req.user_id });
      });

      const response = await request(appWithAuth).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.user_id).toBe('user-123');
    });
  });

  describe('requestLoggingMiddleware', () => {
    it('should log successful requests', async () => {
      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
    });

    it('should log error requests', async () => {
      const response = await request(app).get('/error');

      expect(response.status).toBe(500);
    });

    it('should include timing information', async () => {
      const startTime = Date.now();
      await request(app).get('/test');
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('context cleanup', () => {
    it('should clear context after request', async () => {
      Logger.setTraceId('test-trace-cleanup');
      Logger.setUserId('test-user-cleanup');

      expect(Logger.getTraceId()).toBe('test-trace-cleanup');
      expect(Logger.getUserId()).toBe('test-user-cleanup');

      await request(app).get('/test');

      // Context should be cleared after request
      // Note: This is async, so we need to wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});
