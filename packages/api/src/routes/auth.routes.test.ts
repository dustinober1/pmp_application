/**
 * Comprehensive integration tests for auth.routes
 * Targeting 100% code coverage
 *
 * Tests all routes:
 * - GET /csrf
 * - POST /register
 * - POST /login
 * - POST /refresh
 * - POST /logout
 * - POST /forgot-password
 * - POST /reset-password
 * - POST /verify-email
 * - POST /resend-verification
 * - GET /me
 */

import type { Express } from 'express';
import express from 'express';
import request from 'supertest';
import authRoutes from './auth.routes';
import { authService } from '../services/auth.service';
import { errorHandler } from '../middleware/error.middleware';
import { AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AUTH_ERRORS } from '@pmp/shared';

// Mock dependencies
jest.mock('../services/auth.service');
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock environment
jest.mock('../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-minimum-32-characters-long',
  },
}));

describe('Auth Routes Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());

    // Add request ID for error handling
    app.use((req, _res, next) => {
      req.requestId = 'test-request-id';
      next();
    });

    // Mount auth routes
    app.use('/api/auth', authRoutes);

    // Add error handler
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/csrf', () => {
    it('should issue a CSRF token and set cookie', async () => {
      const response = await request(app).get('/api/auth/csrf');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.csrfToken).toBe('string');
      expect(response.body.data.csrfToken.length).toBeGreaterThan(0);

      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([expect.stringContaining('pmp_csrf_token=')])
      );

      const csrfCookie = (response.headers['set-cookie'] as string[]).find(cookie =>
        cookie.startsWith('pmp_csrf_token=')
      );
      expect(csrfCookie).toContain(`pmp_csrf_token=${response.body.data.csrfToken}`);
    });
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      email: 'newuser@example.com',
      password: 'Password123',
      name: 'New User',
    };

    it('should register a new user successfully', async () => {
      const mockResult = {
        user: {
          id: 'user-1',
          email: 'newuser@example.com',
          name: 'New User',
          emailVerified: false,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 900,
        },
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).post('/api/auth/register').send(validRegisterData);

      expect(response.status).toBe(201);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('pmp_access_token=access-token'),
          expect.stringContaining('pmp_refresh_token=refresh-token'),
          expect.stringContaining('pmp_csrf_token='),
        ])
      );
      expect(response.body).toEqual({
        success: true,
        data: { user: mockResult.user, expiresIn: mockResult.tokens.expiresIn },
        message: 'Registration successful. Please verify your email.',
      });
      expect(authService.register).toHaveBeenCalledWith(validRegisterData);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should return 400 for password without uppercase letter', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password without lowercase letter', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'PASSWORD123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password without number', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'PasswordABC',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password exceeding 64 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'P'.repeat(65) + 'assword123',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for name exceeding 100 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'A'.repeat(101),
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle service errors', async () => {
      const error = AppError.conflict('Email already exists', 'EMAIL_EXISTS');
      (authService.register as jest.Mock).mockRejectedValue(error);

      const response = await request(app).post('/api/auth/register').send(validRegisterData);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
      expect(response.body.error.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'user@example.com',
      password: 'Password123',
    };

    it('should login user successfully', async () => {
      const mockResult = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Test User',
          emailVerified: true,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 900,
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).post('/api/auth/login').send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('pmp_access_token=access-token'),
          expect.stringContaining('pmp_refresh_token=refresh-token'),
          expect.stringContaining('pmp_csrf_token='),
        ])
      );
      expect(response.body).toEqual({
        success: true,
        data: { user: mockResult.user, expiresIn: mockResult.tokens.expiresIn },
      });
      expect(authService.login).toHaveBeenCalledWith(validLoginData);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'user@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'user@example.com',
        password: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid credentials error', async () => {
      const error = AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
      (authService.login as jest.Mock).mockRejectedValue(error);

      const response = await request(app).post('/api/auth/login').send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should handle account locked error', async () => {
      const error = AppError.forbidden('Account is locked', 'ACCOUNT_LOCKED');
      (authService.login as jest.Mock).mockRejectedValue(error);

      const response = await request(app).post('/api/auth/login').send(validLoginData);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      };

      (authService.refreshToken as jest.Mock).mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('pmp_access_token=new-access-token'),
          expect.stringContaining('pmp_refresh_token=new-refresh-token'),
          expect.stringContaining('pmp_csrf_token='),
        ])
      );
      expect(response.body).toEqual({
        success: true,
        data: { expiresIn: mockTokens.expiresIn },
      });
      expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should return 400 for empty refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({ refreshToken: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid refresh token error', async () => {
      const error = AppError.unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
      (authService.refreshToken as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'refresh-token-to-invalidate' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
      expect(authService.logout).toHaveBeenCalledWith(userId, 'refresh-token-to-invalidate');
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid bearer token format', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'InvalidFormat token')
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 401 for invalid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 401 when user does not exist', async () => {
      const token = jwt.sign({ userId: 'non-existent', email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 403 when user account is locked', async () => {
      const userId = 'user-1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: futureDate,
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_004.code);
    });

    it('should allow logout when account lock has expired', async () => {
      const userId = 'user-1';
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: pastDate,
      });

      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(200);
      expect(authService.logout).toHaveBeenCalledWith(userId, 'refresh-token');
    });

    it('should handle logout without refresh token in body', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(200);
      expect(authService.logout).toHaveBeenCalledWith(userId, undefined);
    });

    it('should handle service errors during logout', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      const error = AppError.internal('Database error during logout');
      (authService.logout as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'refresh-token' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should request password reset successfully', async () => {
      (authService.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
      expect(authService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(authService.requestPasswordReset).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/forgot-password').send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('SMTP server error');
      (authService.requestPasswordReset as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should return same message for non-existent email (security)', async () => {
      // Service should handle this internally without throwing
      (authService.requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'If an account exists with this email, a password reset link has been sent.'
      );
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const validResetData = {
      token: 'valid-reset-token',
      newPassword: 'NewPassword123',
    };

    it('should reset password successfully', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post('/api/auth/reset-password').send(validResetData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
      expect(authService.resetPassword).toHaveBeenCalledWith('valid-reset-token', 'NewPassword123');
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ newPassword: 'NewPassword123' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: '', newPassword: 'NewPassword123' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for new password without uppercase', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for new password without lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'PASSWORD123' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for new password without number', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'PasswordABC' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for new password exceeding 64 characters', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
          newPassword: 'P'.repeat(65) + 'assword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid token error', async () => {
      const error = AppError.badRequest('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
      (authService.resetPassword as jest.Mock).mockRejectedValue(error);

      const response = await request(app).post('/api/auth/reset-password').send(validResetData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_RESET_TOKEN');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      (authService.verifyEmail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-verification-token' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Email verified successfully.',
      });
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-verification-token');
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app).post('/api/auth/verify-email').send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty token', async () => {
      const response = await request(app).post('/api/auth/verify-email').send({ token: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid verification token error', async () => {
      const error = AppError.badRequest(
        'Invalid or expired verification token',
        'INVALID_VERIFICATION_TOKEN'
      );
      (authService.verifyEmail as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_VERIFICATION_TOKEN');
    });

    it('should handle already verified email error', async () => {
      const error = AppError.badRequest('Email already verified', 'EMAIL_ALREADY_VERIFIED');
      (authService.verifyEmail as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'valid-token' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_VERIFIED');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should resend verification token for current user (non-production)', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.resendVerification as jest.Mock).mockResolvedValue('new-verification-token');

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('new-verification-token');
      expect(authService.resendVerification).toHaveBeenCalledWith(userId);
    });

    it('should return success when email is already verified', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.resendVerification as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({});
      expect(response.body.message).toBe('Email is already verified.');
      expect(authService.resendVerification).toHaveBeenCalledWith(userId);
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await request(app).post('/api/auth/resend-verification').send({});

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile successfully', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(userId);
      expect(response.body.data.user.email).toBe('user@example.com');
      expect(response.body.data.user.name).toBe('Test User');
      expect(response.body.data.user.emailVerified).toBe(true);
      expect(authService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should return 401 for missing authorization header', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
      expect(authService.getUserById).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 401 for expired JWT token', async () => {
      const token = jwt.sign(
        { userId: 'user-1', email: 'user@example.com' },
        env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 401 when user does not exist', async () => {
      const token = jwt.sign({ userId: 'deleted-user', email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should return 403 when user account is locked', async () => {
      const userId = 'user-1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: futureDate,
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_004.code);
      expect(response.body.error.suggestion).toContain('Account is locked until');
    });

    it('should handle service errors', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      const error = AppError.notFound('User not found', 'USER_NOT_FOUND');
      (authService.getUserById as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('Error Handling', () => {
    it('should include timestamp and requestId in error responses', async () => {
      const error = AppError.badRequest('Test error', 'TEST_ERROR');
      (authService.login as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'Password123' });

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('requestId', 'test-request-id');
      expect(response.body).toHaveProperty('error');
    });

    it('should handle generic errors with 500 status', async () => {
      const error = new Error('Unexpected error');
      (authService.login as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'Password123' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Request Validation Edge Cases', () => {
    it('should handle request with wrong content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('not json');

      // Should fail validation because body won't be parsed
      expect(response.status).toBe(400);
    });

    it('should handle empty request body', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle extra fields in request body', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
        tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 900 },
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        extraField: 'should be ignored',
      });

      // Zod strips extra fields by default
      expect(response.status).toBe(201);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
    });
  });

  describe('Authentication Middleware Edge Cases', () => {
    it('should handle Bearer token with extra spaces', async () => {
      const userId = 'user-1';
      const token = jwt.sign({ userId, email: 'user@example.com' }, env.JWT_SECRET);

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        lockedUntil: null,
      });

      (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer  ${token}`); // Extra space

      // Should fail because substring(7) expects exactly one space
      expect(response.status).toBe(401);
    });

    it('should handle authorization header without Bearer prefix', async () => {
      const token = jwt.sign({ userId: 'user-1', email: 'user@example.com' }, env.JWT_SECRET);

      const response = await request(app).get('/api/auth/me').set('Authorization', token);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });

    it('should handle case-sensitive Bearer keyword', async () => {
      const token = jwt.sign({ userId: 'user-1', email: 'user@example.com' }, env.JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `bearer ${token}`); // lowercase

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(AUTH_ERRORS.AUTH_005.code);
    });
  });
});
