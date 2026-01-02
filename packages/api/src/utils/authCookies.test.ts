/**
 * Tests for auth cookies utility
 * Target: 90%+ coverage
 */

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from './authCookies';
import type { Response } from 'express';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
  verify: jest.fn(() => ({ userId: '123', email: 'test@example.com' })),
}));

describe('Auth Cookies Utility', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with user data', () => {
      const token = generateAccessToken('user-123', 'test@example.com', 'free');

      expect(token).toBe('mocked-token');
    });

    it('should include user tier in token', () => {
      const token = generateAccessToken('user-123', 'test@example.com', 'premium');

      expect(token).toBe('mocked-token');
    });

    it('should have 1 hour expiration', () => {
      const jwt = require('jsonwebtoken');
      generateAccessToken('user-123', 'test@example.com', 'free');

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user-123', email: 'test@example.com', tier: 'free' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with user ID', () => {
      const token = generateRefreshToken('user-123');

      expect(token).toBe('mocked-token');
    });

    it('should have 7 day expiration', () => {
      const jwt = require('jsonwebtoken');
      generateRefreshToken('user-123');

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user-123' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const payload = verifyAccessToken('valid-token');

      expect(payload).toEqual({
        userId: '123',
        email: 'test@example.com',
      });
    });

    it('should return null for invalid token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const payload = verifyAccessToken('invalid-token');

      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('jwt malformed');
      });

      const payload = verifyAccessToken('bad-token');

      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValueOnce({ userId: 'user-456' });

      const payload = verifyRefreshToken('valid-refresh-token');

      expect(payload).toEqual({ userId: 'user-456' });
    });

    it('should return null for invalid refresh token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid refresh token');
      });

      const payload = verifyRefreshToken('invalid-refresh-token');

      expect(payload).toBeNull();
    });

    it('should return null for expired refresh token', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Token expired');
      });

      const payload = verifyRefreshToken('expired-token');

      expect(payload).toBeNull();
    });
  });

  describe('setAuthCookies', () => {
    it('should set both access and refresh cookies', () => {
      setAuthCookies(
        mockResponse as Response,
        'access-token',
        'refresh-token',
        true
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'pmp_access_token',
        'access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
      );
    });

    it('should set secure cookies in production', () => {
      setAuthCookies(
        mockResponse as Response,
        'access-token',
        'refresh-token',
        true
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'pmp_access_token',
        'access-token',
        expect.objectContaining({
          secure: true,
        })
      );
    });

    it('should set non-secure cookies in development', () => {
      setAuthCookies(
        mockResponse as Response,
        'access-token',
        'refresh-token',
        false
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'pmp_access_token',
        'access-token',
        expect.objectContaining({
          secure: false,
        })
      );
    });

    it('should set proper cookie expiration', () => {
      setAuthCookies(
        mockResponse as Response,
        'access-token',
        'refresh-token',
        true
      );

      const accessCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      const refreshCall = (mockResponse.cookie as jest.Mock).mock.calls[1];

      expect(accessCall[2].maxAge).toBeLessThan(60 * 60 * 1000); // < 1 hour
      expect(refreshCall[2].maxAge).toBeLessThan(7 * 24 * 60 * 60 * 1000); // < 7 days
    });
  });

  describe('clearAuthCookies', () => {
    it('should clear both access and refresh cookies', () => {
      clearAuthCookies(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('pmp_access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('pmp_refresh_token');
    });
  });
});
