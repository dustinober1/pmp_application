import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFoundHandler } from './error.middleware';
import { GENERIC_ERRORS } from '@pmp/shared';

describe('AppError class', () => {
  describe('constructor', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(
        'Test error',
        'TEST_001',
        400,
        { field: 'email' },
        'Please check your input'
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_001');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email' });
      expect(error.suggestion).toBe('Please check your input');
      expect(error).toBeInstanceOf(Error);
      expect(error.stack).toBeDefined();
    });

    it('should default statusCode to 500 if not provided', () => {
      const error = new AppError('Server error', 'SERVER_001');

      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
      expect(error.suggestion).toBeUndefined();
    });
  });

  describe('static factory methods', () => {
    describe('badRequest', () => {
      it('should create 400 error', () => {
        const error = AppError.badRequest('Invalid input', 'INVALID_001');

        expect(error.message).toBe('Invalid input');
        expect(error.code).toBe('INVALID_001');
        expect(error.statusCode).toBe(400);
        expect(error.details).toBeUndefined();
      });

      it('should create 400 error with details', () => {
        const details = { errors: [{ field: 'email', message: 'Invalid format' }] };
        const error = AppError.badRequest('Validation failed', 'VALIDATION_ERROR', details);

        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual(details);
      });

      it('should use default code if not provided', () => {
        const error = AppError.badRequest('Bad request');

        expect(error.code).toBe('BAD_REQUEST');
        expect(error.statusCode).toBe(400);
      });
    });

    describe('unauthorized', () => {
      it('should create 401 error', () => {
        const error = AppError.unauthorized('Please login', 'AUTH_001');

        expect(error.message).toBe('Please login');
        expect(error.code).toBe('AUTH_001');
        expect(error.statusCode).toBe(401);
      });

      it('should use default message and code if not provided', () => {
        const error = AppError.unauthorized();

        expect(error.message).toBe('Authentication required');
        expect(error.code).toBe('UNAUTHORIZED');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('forbidden', () => {
      it('should create 403 error', () => {
        const error = AppError.forbidden('Access denied', 'FORBIDDEN_001');

        expect(error.message).toBe('Access denied');
        expect(error.code).toBe('FORBIDDEN_001');
        expect(error.statusCode).toBe(403);
      });

      it('should create 403 error with suggestion', () => {
        const error = AppError.forbidden(
          'Insufficient permissions',
          'PERM_001',
          'Contact your administrator'
        );

        expect(error.statusCode).toBe(403);
        expect(error.suggestion).toBe('Contact your administrator');
      });

      it('should use default code if not provided', () => {
        const error = AppError.forbidden('Forbidden');

        expect(error.code).toBe('FORBIDDEN');
      });
    });

    describe('notFound', () => {
      it('should create 404 error', () => {
        const error = AppError.notFound('Resource not found', 'NOT_FOUND_001');

        expect(error.message).toBe('Resource not found');
        expect(error.code).toBe('NOT_FOUND_001');
        expect(error.statusCode).toBe(404);
      });

      it('should use default code if not provided', () => {
        const error = AppError.notFound('Not found');

        expect(error.code).toBe('NOT_FOUND');
      });
    });

    describe('conflict', () => {
      it('should create 409 error', () => {
        const error = AppError.conflict('Email already exists', 'CONFLICT_001');

        expect(error.message).toBe('Email already exists');
        expect(error.code).toBe('CONFLICT_001');
        expect(error.statusCode).toBe(409);
      });

      it('should create 409 error with suggestion', () => {
        const error = AppError.conflict(
          'Resource already exists',
          'DUP_001',
          'Try a different identifier'
        );

        expect(error.statusCode).toBe(409);
        expect(error.suggestion).toBe('Try a different identifier');
      });

      it('should use default code if not provided', () => {
        const error = AppError.conflict('Conflict');

        expect(error.code).toBe('CONFLICT');
      });
    });

    describe('internal', () => {
      it('should create 500 error', () => {
        const error = AppError.internal('Database connection failed');

        expect(error.message).toBe('Database connection failed');
        expect(error.code).toBe(GENERIC_ERRORS.INTERNAL_ERROR.code);
        expect(error.statusCode).toBe(500);
      });

      it('should use default message if not provided', () => {
        const error = AppError.internal();

        expect(error.message).toBe('An unexpected error occurred');
        expect(error.code).toBe(GENERIC_ERRORS.INTERNAL_ERROR.code);
      });
    });
  });
});

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      requestId: 'test-request-id',
    };
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();

    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('AppError handling', () => {
    it('should handle AppError with all properties', () => {
      const error = AppError.badRequest(
        'Validation failed',
        'VAL_001',
        { fields: ['email'] }
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: { fields: ['email'] },
          suggestion: undefined,
        },
        timestamp: expect.any(String),
        requestId: 'test-request-id',
      });
    });

    it('should handle AppError with suggestion', () => {
      const error = AppError.forbidden(
        'Upgrade required',
        'SUB_001',
        'Please upgrade to premium'
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            suggestion: 'Please upgrade to premium',
          }),
        })
      );
    });

    it('should log error with timestamp and requestId', () => {
      const error = AppError.internal('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] \[test-request-id\] Error:/),
        error
      );
    });

    it('should use "unknown" if requestId is missing', () => {
      const error = AppError.internal('Test error');
      mockRequest.requestId = undefined;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'unknown',
        })
      );
    });
  });

  describe('Prisma error handling', () => {
    it('should handle PrismaClientKnownRequestError', () => {
      const prismaError = new Error('Prisma error');
      prismaError.name = 'PrismaClientKnownRequestError';

      errorHandler(prismaError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          code: 'DATABASE_ERROR',
          message: 'A database error occurred',
        },
        timestamp: expect.any(String),
        requestId: 'test-request-id',
      });
    });
  });

  describe('Zod error handling', () => {
    it('should handle ZodError', () => {
      const zodError = new Error(JSON.stringify([
        { field: 'email', message: 'Invalid email' }
      ]));
      zodError.name = 'ZodError';

      errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            errors: [{ field: 'email', message: 'Invalid email' }],
          },
        },
        timestamp: expect.any(String),
        requestId: 'test-request-id',
      });
    });
  });

  describe('generic error handling', () => {
    it('should handle generic Error in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Something went wrong');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          code: GENERIC_ERRORS.INTERNAL_ERROR.code,
          message: GENERIC_ERRORS.INTERNAL_ERROR.message,
        },
        timestamp: expect.any(String),
        requestId: 'test-request-id',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should expose error message in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Detailed error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          code: GENERIC_ERRORS.INTERNAL_ERROR.code,
          message: 'Detailed error message',
        },
        timestamp: expect.any(String),
        requestId: 'test-request-id',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle error with no message', () => {
      const error = new Error();

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: GENERIC_ERRORS.INTERNAL_ERROR.code,
          }),
        })
      );
    });
  });

  describe('response format', () => {
    it('should include ISO timestamp', () => {
      const error = AppError.internal('Test');
      const beforeTimestamp = new Date().toISOString();

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const response = jsonMock.mock.calls[0][0];
      const afterTimestamp = new Date().toISOString();

      expect(response.timestamp).toBeDefined();
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(response.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTimestamp).getTime()
      );
      expect(new Date(response.timestamp).getTime()).toBeLessThanOrEqual(
        new Date(afterTimestamp).getTime()
      );
    });
  });
});

describe('notFoundHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/non-existent',
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should create 404 AppError with route information', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Route GET /api/non-existent not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      })
    );
  });

  it('should handle POST request', () => {
    mockRequest.method = 'POST';
    Object.defineProperty(mockRequest, 'path', { value: '/api/users' });

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Route POST /api/users not found',
      })
    );
  });

  it('should handle DELETE request', () => {
    mockRequest.method = 'DELETE';
    Object.defineProperty(mockRequest, 'path', { value: '/api/items/123' });

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Route DELETE /api/items/123 not found',
      })
    );
  });

  it('should handle root path', () => {
    mockRequest.method = 'GET';
    Object.defineProperty(mockRequest, 'path', { value: '/' });

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Route GET / not found',
      })
    );
  });
});
