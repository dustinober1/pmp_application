/**
 * Tests for CSRF middleware
 * Target: 90%+ coverage
 */

import { csrfMiddleware } from './csrf.middleware';
import { AppError } from './error.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('CSRF Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      headers: {},
      baseUrl: '/api',
      path: '/test',
      cookies: {},
    };
    mockResponse = {};
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('csrfMiddleware', () => {
    it('should allow safe methods without CSRF check', () => {
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

      safeMethods.forEach(method => {
        mockRequest.method = method;
        mockNext.mockClear();

        csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    it('should allow requests with Bearer token', () => {
      mockRequest.method = 'POST';
      mockRequest.headers = {
        authorization: 'Bearer valid-jwt-token',
      };

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow exempt paths without CSRF', () => {
      const exemptPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-email',
        '/api/auth/csrf',
        '/api/health',
      ];

      exemptPaths.forEach(path => {
        mockRequest.method = 'POST';
        mockRequest.path = path.replace('/api', '');
        mockRequest.baseUrl = '/api';
        mockNext.mockClear();

        csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    it('should validate CSRF token for non-exempt POST requests', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.baseUrl = '';
      mockRequest.headers = {
        'x-csrf-token': 'valid-token',
      };
      (mockRequest as any).cookies = {
        pmp_csrf_token: 'valid-token',
      };

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject POST requests without CSRF cookie', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.baseUrl = '';
      mockRequest.headers = {};
      (mockRequest as any).cookies = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('CSRF validation failed', 'CSRF_001')
      );
    });

    it('should reject POST requests without CSRF header', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.baseUrl = '';
      mockRequest.headers = {};
      (mockRequest as any).cookies = {
        pmp_csrf_token: 'cookie-token',
      };

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('CSRF validation failed', 'CSRF_001')
      );
    });

    it('should reject POST requests with mismatched CSRF tokens', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/users';
      mockRequest.baseUrl = '';
      mockRequest.headers = {
        'x-csrf-token': 'header-token',
      };
      (mockRequest as any).cookies = {
        pmp_csrf_token: 'different-cookie-token',
      };

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('CSRF validation failed', 'CSRF_001')
      );
    });

    it('should require CSRF for all state-changing methods', () => {
      const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

      stateChangingMethods.forEach(method => {
        mockRequest.method = method;
        mockRequest.path = '/api/users';
        mockRequest.baseUrl = '';
        mockRequest.headers = {};
        (mockRequest as any).cookies = {};
        mockNext.mockClear();

        csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          AppError.forbidden('CSRF validation failed', 'CSRF_001')
        );
      });
    });

    it('should handle OPTIONS requests safely', () => {
      mockRequest.method = 'OPTIONS';
      mockRequest.path = '/api/users';
      mockRequest.headers = {};
      (mockRequest as any).cookies = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle HEAD requests safely', () => {
      mockRequest.method = 'HEAD';
      mockRequest.path = '/api/users';
      mockRequest.headers = {};
      (mockRequest as any).cookies = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('CSRF exemption scenarios', () => {
    it('should exempt auth endpoints during login flow', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/auth/login';
      mockRequest.baseUrl = '/api';
      mockRequest.headers = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should exempt health check endpoint', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/health';
      mockRequest.baseUrl = '/api';
      mockRequest.headers = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not exempt non-listed endpoints', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/protected/action';
      mockRequest.baseUrl = '';
      mockRequest.headers = {};
      (mockRequest as any).cookies = {};

      csrfMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        AppError.forbidden('CSRF validation failed', 'CSRF_001')
      );
    });
  });
});
