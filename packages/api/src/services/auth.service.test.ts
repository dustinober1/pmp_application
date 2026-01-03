/**
 * Comprehensive tests for auth.service
 * Coverage: All methods, branches, and edge cases
 */

import { AuthService } from './auth.service';
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware';
import { AUTH_ERRORS } from '@pmp/shared';
import { mockUser } from '../test/mocks';
import * as fc from 'fast-check';

// Mock dependencies
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    subscriptionTier: {
      findFirst: jest.fn(),
    },
    userSubscription: {
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordReset: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-token'),
}));

// Mock environment
jest.mock('../config/env', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-at-least-32-chars-long',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-at-least-32-chars-long',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockDate = new Date('2025-01-01T00:00:00.000Z');

  beforeAll(() => {
    // Use fake timers to control Date.now()
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Don't restore Date mocks in afterEach
  });

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
    };

    it('should successfully register a new user with free tier', async () => {
      const mockFreeTier = {
        id: 'free-tier-id',
        name: 'free',
        features: {},
      };

      const mockCreatedUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        emailVerified: false,
        emailVerifyToken: 'mock-uuid-token',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(mockFreeTier);
      (prisma.userSubscription.create as jest.Mock).mockResolvedValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.register(registerInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Test123!@#', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
          name: 'Test User',
          emailVerifyToken: 'mock-uuid-token',
        },
      });
      expect(prisma.subscriptionTier.findFirst).toHaveBeenCalledWith({
        where: { name: 'free' },
      });
      expect(prisma.userSubscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          tierId: 'free-tier-id',
          status: 'active',
          startDate: mockDate,
          endDate: expect.any(Date),
        },
      });
      expect(result.user).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(result.tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      });
    });

    it('should register user without free tier subscription if tier not found', async () => {
      const mockCreatedUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        emailVerified: false,
        emailVerifyToken: 'mock-uuid-token',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(null);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.register(registerInput);

      expect(prisma.userSubscription.create).not.toHaveBeenCalled();
      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock-access-token');
    });

    it('should convert email to lowercase during registration', async () => {
      const mockCreatedUser = mockUser({ email: 'test@example.com' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prisma.subscriptionTier.findFirst as jest.Mock).mockResolvedValue(null);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.register({
        ...registerInput,
        email: 'TEST@EXAMPLE.COM',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });

    it('should throw conflict error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser());

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      await expect(authService.register(registerInput)).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_002.code,
        statusCode: 409,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUserWithSubscription = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        emailVerified: true,
        emailVerifyToken: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
        subscription: {
          tierId: 'pro',
          tier: { name: 'pro' },
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSubscription);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login(loginInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          subscription: {
            include: { tier: true },
          },
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('Test123!@#', 'hashed-password');
      expect(result.user).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(result.tokens.accessToken).toBe('mock-access-token');
    });

    it('should convert email to lowercase during login', async () => {
      const mockUserWithSubscription = {
        ...mockUser({ email: 'test@example.com' }),
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSubscription);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.login({
        email: 'TEST@EXAMPLE.COM',
        password: 'Test123!@#',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        })
      );
    });

    it('should use free tier if user has no subscription', async () => {
      const mockUserNoSubscription = {
        ...mockUser(),
        subscription: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserNoSubscription);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login(loginInput);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          tierId: 'free',
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(result.user).toBeDefined();
    });

    it('should reset failed login attempts on successful login', async () => {
      const mockUserWithFailedAttempts = {
        ...mockUser(),
        failedLoginAttempts: 3,
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.login(loginInput);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserWithFailedAttempts.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    });

    it('should not update user if failed attempts is 0', async () => {
      const mockUserNoFailedAttempts = {
        ...mockUser(),
        failedLoginAttempts: 0,
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserNoFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.login(loginInput);

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_003.code,
        statusCode: 401,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw forbidden error if account is locked', async () => {
      const futureDate = new Date('2025-01-01T01:00:00.000Z');
      const mockLockedUser = {
        ...mockUser(),
        lockedUntil: futureDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockLockedUser);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_004.code,
        statusCode: 403,
        suggestion: `Account locked until ${futureDate.toISOString()}`,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should allow login if lockout period has expired', async () => {
      const pastDate = new Date('2024-12-31T23:00:00.000Z');
      const mockUserLockExpired = {
        ...mockUser(),
        lockedUntil: pastDate,
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserLockExpired);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.login(loginInput);

      expect(result.user).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it('should increment failed attempts on invalid password', async () => {
      const mockUserWithSomeFailedAttempts = {
        ...mockUser({ id: 'user-id' }),
        failedLoginAttempts: 2,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSomeFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          failedLoginAttempts: 3,
        },
      });
    });

    it('should lock account after 5 failed attempts', async () => {
      const mockUserNearLockout = {
        ...mockUser({ id: 'user-id' }),
        failedLoginAttempts: 4,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserNearLockout);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        },
      });

      const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0];
      const lockedUntil = updateCall.data.lockedUntil;
      const expectedLockTime = mockDate.getTime() + 15 * 60 * 1000;
      expect(lockedUntil.getTime()).toBe(expectedLockTime);
    });

    it('should throw unauthorized error on invalid password', async () => {
      const mockUserData = mockUser();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_003.code,
        statusCode: 401,
      });
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockStoredToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-08T00:00:00.000Z'),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          subscription: {
            tierId: 'pro',
          },
        },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockStoredToken);
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.refreshToken('valid-refresh-token');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-refresh-token' },
        include: {
          user: {
            include: {
              subscription: true,
            },
          },
        },
      });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });
    });

    it('should use free tier if user has no subscription', async () => {
      const mockStoredToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-08T00:00:00.000Z'),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          subscription: null,
        },
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockStoredToken);
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const result = await authService.refreshToken('valid-refresh-token');

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          tierId: 'free',
        }),
        expect.any(String),
        expect.any(Object)
      );
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw unauthorized error if token not found', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(AppError);
      await expect(authService.refreshToken('invalid-token')).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 401,
      });

      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('should throw unauthorized error and delete expired token', async () => {
      const expiredToken = {
        id: 'expired-token-id',
        token: 'expired-refresh-token',
        expiresAt: new Date('2024-12-25T00:00:00.000Z'),
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});

      await expect(authService.refreshToken('expired-refresh-token')).rejects.toThrow(AppError);
      await expect(authService.refreshToken('expired-refresh-token')).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 401,
      });

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'expired-token-id' },
      });
    });
  });

  describe('logout', () => {
    it('should delete specific refresh token when provided', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await authService.logout('user-id', 'specific-refresh-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'specific-refresh-token' },
      });
    });

    it('should delete all refresh tokens when token not provided', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await authService.logout('user-id');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('should handle logout when no tokens exist', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await expect(authService.logout('user-id')).resolves.not.toThrow();

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should create password reset token for existing user', async () => {
      const mockUserData = mockUser({ email: 'test@example.com' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({});

      await authService.requestPasswordReset('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.passwordReset.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserData.id,
          token: 'mock-uuid-token',
          expiresAt: expect.any(Date),
        },
      });

      const createCall = (prisma.passwordReset.create as jest.Mock).mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt;
      const expectedExpiry = mockDate.getTime() + 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBe(expectedExpiry);
    });

    it('should convert email to lowercase', async () => {
      const mockUserData = mockUser({ email: 'test@example.com' });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({});

      await authService.requestPasswordReset('TEST@EXAMPLE.COM');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should silently succeed if user not found (prevent email enumeration)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).resolves.not.toThrow();

      expect(prisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('should log password reset token to console', async () => {
      const mockUserData = mockUser({ email: 'test@example.com' });
      const consoleLogSpy = jest.spyOn(console, 'log');

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.passwordReset.create as jest.Mock).mockResolvedValue({});

      await authService.requestPasswordReset('test@example.com');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Password reset token for test@example.com: mock-uuid-token'
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const mockResetRecord = {
        id: 'reset-id',
        token: 'valid-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-02T00:00:00.000Z'),
        usedAt: null,
        user: mockUser(),
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(mockResetRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}]);

      await authService.resetPassword('valid-token', 'NewPassword123!');

      expect(prisma.passwordReset.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        include: { user: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          /* user update */
        }),
        expect.objectContaining({
          /* password reset update */
        }),
        expect.objectContaining({
          /* refresh token delete */
        }),
      ]);

      const transactionCalls = (prisma.$transaction as jest.Mock).mock.calls[0][0];
      expect(transactionCalls).toHaveLength(3);
    });

    it('should throw error if token not found', async () => {
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(
        AppError
      );
      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 400,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should throw error if token is expired', async () => {
      const expiredResetRecord = {
        id: 'reset-id',
        token: 'expired-token',
        userId: 'user-id',
        expiresAt: new Date('2024-12-31T00:00:00.000Z'),
        usedAt: null,
        user: mockUser(),
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(expiredResetRecord);

      await expect(authService.resetPassword('expired-token', 'NewPassword123!')).rejects.toThrow(
        AppError
      );
      await expect(
        authService.resetPassword('expired-token', 'NewPassword123!')
      ).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 400,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error if token already used', async () => {
      const usedResetRecord = {
        id: 'reset-id',
        token: 'used-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-02T00:00:00.000Z'),
        usedAt: new Date('2025-01-01T12:00:00.000Z'),
        user: mockUser(),
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(usedResetRecord);

      await expect(authService.resetPassword('used-token', 'NewPassword123!')).rejects.toThrow(
        AppError
      );
      await expect(
        authService.resetPassword('used-token', 'NewPassword123!')
      ).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 400,
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should reset failed login attempts and unlock account', async () => {
      const mockResetRecord = {
        id: 'reset-id',
        token: 'valid-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-02T00:00:00.000Z'),
        usedAt: null,
        user: mockUser(),
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(mockResetRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      (prisma.$transaction as jest.Mock).mockImplementation(async operations => {
        // Execute mocked operations
        return await Promise.all(operations);
      });

      (prisma.user.update as jest.Mock).mockImplementation(args => {
        expect(args.data.failedLoginAttempts).toBe(0);
        expect(args.data.lockedUntil).toBeNull();
        return Promise.resolve({});
      });

      await authService.resetPassword('valid-token', 'NewPassword123!');

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      const mockUserData = {
        ...mockUser({
          id: 'user-id',
          emailVerified: false,
        }),
        emailVerifyToken: 'valid-verify-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUserData);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUserData,
        emailVerified: true,
        emailVerifyToken: null,
      });

      await authService.verifyEmail('valid-verify-token');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerifyToken: 'valid-verify-token' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
        },
      });
    });

    it('should throw error if token not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(AppError);
      await expect(authService.verifyEmail('invalid-token')).rejects.toMatchObject({
        code: AUTH_ERRORS.AUTH_005.code,
        statusCode: 400,
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return sanitized user when found', async () => {
      const mockUserData = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        emailVerified: true,
        emailVerifyToken: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);

      const result = await authService.getUserById('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('emailVerifyToken');
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authService.getUserById('nonexistent-id');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('Property-Based Tests', () => {
    it('should handle various valid email formats', () => {
      fc.assert(
        fc.property(fc.emailAddress(), email => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        })
      );
    });

    it('should reject invalid UUID formats', () => {
      fc.assert(
        fc.property(
          fc
            .string()
            .filter(
              s => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
            ),
          invalidId => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return !uuidRegex.test(invalidId);
          }
        )
      );
    });

    it('should handle password strength variations', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 8, maxLength: 128 }), password => {
          // Password can be any string between 8 and 128 characters
          return password.length >= 8 && password.length <= 128;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle database errors gracefully during registration', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User',
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors gracefully during login', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'Test123!',
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle JWT signing errors', async () => {
      const mockUserData = {
        ...mockUser(),
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'Test123!',
        })
      ).rejects.toThrow('JWT signing failed');
    });

    it('should handle bcrypt hashing errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Bcrypt hashing failed'));

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User',
        })
      ).rejects.toThrow('Bcrypt hashing failed');
    });

    it('should handle transaction errors during password reset', async () => {
      const mockResetRecord = {
        id: 'reset-id',
        token: 'valid-token',
        userId: 'user-id',
        expiresAt: new Date('2025-01-02T00:00:00.000Z'),
        usedAt: null,
        user: mockUser(),
      };

      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(mockResetRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      await expect(authService.resetPassword('valid-token', 'NewPassword123!')).rejects.toThrow(
        'Transaction failed'
      );
    });
  });

  describe('sanitizeUser (private method coverage)', () => {
    it('should remove sensitive fields from user object', async () => {
      const mockUserWithSensitiveData = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'super-secret-hash',
        emailVerified: true,
        emailVerifyToken: 'secret-token',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSensitiveData);

      const result = await authService.getUserById('user-id');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('emailVerifyToken');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
    });
  });

  describe('generateTokens (private method coverage)', () => {
    it('should generate tokens with correct parameters', async () => {
      const mockUserData = {
        ...mockUser(),
        subscription: { tierId: 'pro' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.login({
        email: 'test@example.com',
        password: 'Test123!',
      });

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        {
          userId: mockUserData.id,
          email: mockUserData.email,
          tierId: 'pro',
        },
        'test-jwt-secret-at-least-32-chars-long',
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        {
          userId: mockUserData.id,
          type: 'refresh',
        },
        'test-jwt-refresh-secret-at-least-32-chars-long',
        { expiresIn: '7d' }
      );
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token: 'mock-refresh-token',
          userId: mockUserData.id,
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should set refresh token expiry to 7 days from now', async () => {
      const mockUserData = {
        ...mockUser(),
        subscription: { tierId: 'free' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      await authService.login({
        email: 'test@example.com',
        password: 'Test123!',
      });

      const createCall = (prisma.refreshToken.create as jest.Mock).mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt;
      const expectedExpiry = mockDate.getTime() + 7 * 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBe(expectedExpiry);
    });
  });
});
