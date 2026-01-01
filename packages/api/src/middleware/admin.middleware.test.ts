import type { Request, Response, NextFunction } from 'express';
import { adminMiddleware, optionalAdminMiddleware } from './admin.middleware';

// Mock dependencies
jest.mock('../config/env', () => ({
  env: {
    ADMIN_EMAILS: 'admin@example.com,superadmin@example.com,*@admin.company.com',
  },
}));

describe('adminMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('authentication check', () => {
    it('should throw unauthorized error if user is not authenticated', () => {
      mockRequest.user = undefined;

      expect(() => {
        adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(
        expect.objectContaining({
          message: 'Authentication required',
          code: 'ADMIN_001',
          statusCode: 401,
        })
      );

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('admin authorization - exact email match', () => {
    it('should allow access if user email is in admin whitelist', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access for second admin email in whitelist', () => {
      mockRequest.user = {
        userId: 'admin-456',
        email: 'superadmin@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should be case-insensitive for email comparison', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'ADMIN@EXAMPLE.COM',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should be case-insensitive with mixed case email', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'Admin@Example.Com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('admin authorization - domain wildcard match', () => {
    it('should allow access if user email matches domain wildcard', () => {
      mockRequest.user = {
        userId: 'admin-789',
        email: 'john@admin.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access for different user on same admin domain', () => {
      mockRequest.user = {
        userId: 'admin-999',
        email: 'jane@admin.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should be case-insensitive for domain wildcard matching', () => {
      mockRequest.user = {
        userId: 'admin-789',
        email: 'JOHN@ADMIN.COMPANY.COM',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('admin authorization - denied access', () => {
    it('should throw forbidden error if user email is not in whitelist', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'user@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(
        expect.objectContaining({
          message: 'Admin access required',
          code: 'ADMIN_002',
          statusCode: 403,
        })
      );

      expect(mockRequest.isAdmin).toBeUndefined();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access if email domain does not match wildcard', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'user@other.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(
        expect.objectContaining({
          message: 'Admin access required',
          code: 'ADMIN_002',
          statusCode: 403,
        })
      );
    });

    it('should deny access if email only partially matches domain', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'user@notadmin.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(
        expect.objectContaining({
          message: 'Admin access required',
          code: 'ADMIN_002',
          statusCode: 403,
        })
      );
    });
  });

  describe('empty admin whitelist', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.doMock('../config/env', () => ({
        env: {
          ADMIN_EMAILS: undefined,
        },
      }));
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should deny access if ADMIN_EMAILS is undefined', async () => {
      const { adminMiddleware: middleware } = await import('./admin.middleware');

      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(
        expect.objectContaining({
          message: 'Admin access required',
          code: 'ADMIN_002',
          statusCode: 403,
        })
      );
    });
  });
});

describe('optionalAdminMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('no user authenticated', () => {
    it('should continue without setting isAdmin flag if no user', () => {
      mockRequest.user = undefined;

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('admin user authenticated', () => {
    it('should set isAdmin to true if user is in admin whitelist', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set isAdmin to true if user matches domain wildcard', () => {
      mockRequest.user = {
        userId: 'admin-789',
        email: 'john@admin.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should be case-insensitive when checking admin status', () => {
      mockRequest.user = {
        userId: 'admin-123',
        email: 'ADMIN@EXAMPLE.COM',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('non-admin user authenticated', () => {
    it('should set isAdmin to false if user is not in whitelist', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'user@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(false);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set isAdmin to false if user domain does not match wildcard', () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'user@other.company.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      optionalAdminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(false);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('empty admin whitelist', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.doMock('../config/env', () => ({
        env: {
          ADMIN_EMAILS: '',
        },
      }));
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should set isAdmin to false if ADMIN_EMAILS is empty', async () => {
      const { optionalAdminMiddleware: middleware } = await import('./admin.middleware');

      mockRequest.user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.isAdmin).toBe(false);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
