import { Request, Response, NextFunction } from 'express';
import { SUBSCRIPTION_ERRORS } from '@pmp/shared';
import { requireTier, requireFeature } from './tier.middleware';
// import { AppError } from './error.middleware';
import prisma from '../config/database';

// Mock dependencies
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    userSubscription: {
      findUnique: jest.fn(),
    },
  },
}));

describe('requireTier middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authentication check', () => {
    it('should throw unauthorized error if user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requireTier('mid-level');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });
  });

  describe('tier verification - free tier', () => {
    it('should allow access if user has exact required tier (free)', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'free',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('free');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.userSubscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { tier: true },
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should default to free tier if user has no subscription', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      const middleware = requireTier('free');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access if user has free tier but requires mid-level', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'free',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('mid-level');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_003.message,
          code: SUBSCRIPTION_ERRORS.SUB_003.code,
          statusCode: 403,
          suggestion: 'Upgrade to mid-level tier or higher to access this feature',
        })
      );
    });
  });

  describe('tier verification - mid-level tier', () => {
    it('should allow access if user has mid-level tier and requires mid-level', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'mid-level',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('mid-level');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access if user has mid-level tier and requires free', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'mid-level',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('free');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access if user has mid-level tier but requires high-end', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'mid-level',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('high-end');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_003.message,
          code: SUBSCRIPTION_ERRORS.SUB_003.code,
          statusCode: 403,
          suggestion: 'Upgrade to high-end tier or higher to access this feature',
        })
      );
    });
  });

  describe('tier verification - high-end tier', () => {
    it('should allow access if user has high-end tier and requires high-end', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'high-end',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('high-end');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access if user has high-end tier and requires mid-level', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'high-end',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('mid-level');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access if user has high-end tier but requires corporate', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'high-end',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('corporate');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_003.message,
          code: SUBSCRIPTION_ERRORS.SUB_003.code,
          statusCode: 403,
          suggestion: 'Upgrade to corporate tier or higher to access this feature',
        })
      );
    });
  });

  describe('tier verification - corporate tier', () => {
    it('should allow access if user has corporate tier and requires corporate', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'corporate',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('corporate');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access if user has corporate tier and requires any lower tier', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        tier: {
          name: 'corporate',
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireTier('free');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const middleware = requireTier('mid-level');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
        })
      );
    });
  });
});

describe('requireFeature middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authentication check', () => {
    it('should throw unauthorized error if user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });
  });

  describe('subscription status check', () => {
    it('should block access if subscription is cancelled', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'cancelled',
        tier: {
          features: {
            mockExams: true,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_004.message,
          code: SUBSCRIPTION_ERRORS.SUB_004.code,
          statusCode: 403,
          suggestion: 'Please renew your subscription to access this feature',
        })
      );
    });

    it('should block access if subscription is expired', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'expired',
        tier: {
          features: {
            mockExams: true,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_004.message,
          code: SUBSCRIPTION_ERRORS.SUB_004.code,
          statusCode: 403,
        })
      );
    });

    it('should allow access if subscription is active', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'active',
        tier: {
          features: {
            mockExams: true,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access if subscription is in grace period', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'grace_period',
        tier: {
          features: {
            mockExams: true,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('feature availability - boolean features', () => {
    it('should allow access if boolean feature is enabled', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'active',
        tier: {
          features: {
            mockExams: true,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block access if boolean feature is disabled', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'active',
        tier: {
          features: {
            mockExams: false,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUBSCRIPTION_ERRORS.SUB_003.message,
          code: SUBSCRIPTION_ERRORS.SUB_003.code,
          statusCode: 403,
          suggestion: 'Upgrade your subscription to access this feature',
        })
      );
    });
  });

  describe('feature availability - numeric features', () => {
    it('should allow access if numeric feature has a value (does not check limit)', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'active',
        tier: {
          features: {
            flashcardsLimit: 100,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('flashcardsLimit');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access even if numeric feature is 0', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockSubscription = {
        userId: 'user-123',
        status: 'active',
        tier: {
          features: {
            flashcardsLimit: 0,
          },
        },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      const middleware = requireFeature('flashcardsLimit');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('no subscription', () => {
    it('should allow access if user has no subscription and feature is not checked', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      const middleware = requireFeature('flashcardsLimit');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        tierId: 'tier-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const middleware = requireFeature('mockExams');
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection failed',
        })
      );
    });
  });
});
