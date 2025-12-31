import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateBody, validateQuery, validateParams } from './validation.middleware';

describe('validate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('body validation', () => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      age: z.number().min(18).optional(),
    });

    it('should validate and pass through valid body data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate body with optional fields omitted', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail validation with invalid email format', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.stringContaining('email'),
              }),
            ]),
          },
        })
      );
    });

    it('should fail validation with password too short', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'short',
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: expect.stringContaining('8'),
              }),
            ]),
          },
        })
      );
    });

    it('should fail validation with missing required fields', () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
              }),
            ]),
          },
        })
      );
    });

    it('should fail validation with multiple errors', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: 'short',
        age: 15,
      };

      const middleware = validate(bodySchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({ field: 'email' }),
              expect.objectContaining({ field: 'password' }),
              expect.objectContaining({ field: 'age' }),
            ]),
          },
        })
      );
    });

    it('should strip unknown fields from validated data', () => {
      const strictSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        unknownField: 'should be removed',
      };

      const middleware = validate(strictSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRequest.body).not.toHaveProperty('unknownField');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('query validation', () => {
    const querySchema = z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(100)),
      search: z.string().optional(),
    });

    it('should validate and transform valid query parameters', () => {
      mockRequest.query = {
        page: '2',
        limit: '20',
        search: 'test query',
      };

      const middleware = validate(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).toEqual({
        page: 2,
        limit: 20,
        search: 'test query',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate query with optional parameters omitted', () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const middleware = validate(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).toEqual({
        page: 1,
        limit: 10,
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail validation with invalid query parameter type', () => {
      mockRequest.query = {
        page: 'not-a-number',
        limit: '10',
      };

      const middleware = validate(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        })
      );
    });

    it('should fail validation with out of range query parameter', () => {
      mockRequest.query = {
        page: '0',
        limit: '10',
      };

      const middleware = validate(querySchema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'page',
              }),
            ]),
          },
        })
      );
    });
  });

  describe('params validation', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
      slug: z.string().min(1),
    });

    it('should validate valid route parameters', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'my-post',
      };

      const middleware = validate(paramsSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'my-post',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail validation with invalid UUID', () => {
      mockRequest.params = {
        id: 'not-a-uuid',
        slug: 'my-post',
      };

      const middleware = validate(paramsSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'id',
                message: expect.stringContaining('uuid'),
              }),
            ]),
          },
        })
      );
    });

    it('should fail validation with empty required param', () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: '',
      };

      const middleware = validate(paramsSchema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        })
      );
    });
  });

  describe('nested object validation', () => {
    const nestedSchema = z.object({
      user: z.object({
        name: z.object({
          first: z.string(),
          last: z.string().min(1),
        }),
        email: z.string().email(),
      }),
      metadata: z.object({
        tags: z.array(z.string()),
      }),
    });

    it('should validate nested objects successfully', () => {
      mockRequest.body = {
        user: {
          name: {
            first: 'John',
            last: 'Doe',
          },
          email: 'john@example.com',
        },
        metadata: {
          tags: ['tag1', 'tag2'],
        },
      };

      const middleware = validate(nestedSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should report nested field path in validation errors', () => {
      mockRequest.body = {
        user: {
          name: {
            first: 'John',
            last: '',
          },
          email: 'invalid-email',
        },
        metadata: {
          tags: ['tag1'],
        },
      };

      const middleware = validate(nestedSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          details: {
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'user.name.last',
              }),
              expect.objectContaining({
                field: 'user.email',
              }),
            ]),
          },
        })
      );
    });
  });

  describe('non-ZodError handling', () => {
    it('should pass through non-Zod errors to next middleware', () => {
      const errorSchema = z.object({}).refine(() => {
        throw new Error('Custom non-Zod error');
      });

      mockRequest.body = {};

      const middleware = validate(errorSchema, 'body');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom non-Zod error',
        })
      );
    });
  });

  describe('helper functions', () => {
    it('validateBody should validate body by default', () => {
      const schema = z.object({ name: z.string() });
      mockRequest.body = { name: 'test' };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('validateQuery should validate query parameters', () => {
      const schema = z.object({ search: z.string() });
      mockRequest.query = { search: 'test' };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('validateParams should validate route parameters', () => {
      const schema = z.object({ id: z.string() });
      mockRequest.params = { id: '123' };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
