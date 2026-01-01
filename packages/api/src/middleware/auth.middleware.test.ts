import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@pmp/shared';
import { AUTH_ERRORS } from '@pmp/shared';
import { authMiddleware, optionalAuthMiddleware } from './auth.middleware';
import { AppError } from './error.middleware';
import prisma from '../config/database';
import { env } from '../config/env';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('../config/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes',
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('successful authentication', () => {
    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        lockedUntil: null,
      };

      const mockPayload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', env.JWT_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { id: true, email: true, lockedUntil: true },
      });
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass through if account was previously locked but lock expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        lockedUntil: pastDate,
      };

      const mockPayload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('missing or invalid authorization header', () => {
    it('should throw unauthorized error if authorization header is missing', async () => {
      mockRequest.headers = {};

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });

    it('should throw unauthorized error if authorization header does not start with Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Basic some-credentials',
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });

    it('should throw unauthorized error if authorization header is just "Bearer"', async () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });
  });

  describe('invalid token', () => {
    it('should throw unauthorized error if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });

    it('should throw unauthorized error if token is expired', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      const tokenExpiredError = new Error('jwt expired');
      tokenExpiredError.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw tokenExpiredError;
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });

    it('should throw unauthorized error if token signature is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed-token',
      };

      const jwtError = new Error('invalid signature');
      jwtError.name = 'JsonWebTokenError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });
  });

  describe('user verification', () => {
    it('should throw unauthorized error if user does not exist', async () => {
      const mockPayload: JwtPayload = {
        userId: 'deleted-user-123',
        email: 'deleted@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_005.message,
          code: AUTH_ERRORS.AUTH_005.code,
          statusCode: 401,
        })
      );
    });

    it('should throw forbidden error if user account is locked', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now

      const mockUser = {
        id: 'user-123',
        email: 'locked@example.com',
        lockedUntil: futureDate,
      };

      const mockPayload: JwtPayload = {
        userId: 'user-123',
        email: 'locked@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: AUTH_ERRORS.AUTH_004.message,
          code: AUTH_ERRORS.AUTH_004.code,
          statusCode: 403,
          suggestion: `Account is locked until ${futureDate.toISOString()}`,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should pass AppError through to next middleware', async () => {
      const customError = AppError.forbidden('Custom error', 'CUSTOM_001');

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw customError;
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(customError);
    });

    it('should handle database errors gracefully', async () => {
      const mockPayload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
        })
      );
    });
  });
});

describe('optionalAuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('with valid authorization', () => {
    it('should attach user to request if valid token is provided', () => {
      const mockPayload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', env.JWT_SECRET);
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('without authorization', () => {
    it('should continue without user if no authorization header', () => {
      mockRequest.headers = {};

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic some-credentials',
      };

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if authorization is only "Bearer"', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('with invalid token', () => {
    it('should continue without user if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if token is expired', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      const tokenExpiredError = new Error('jwt expired');
      tokenExpiredError.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw tokenExpiredError;
      });

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if token signature is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
