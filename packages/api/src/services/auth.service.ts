import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import type {
  RegisterInput,
  LoginInput,
  AuthResult,
  TokenPair,
  UserProfile,
  TierName,
} from "@pmp/shared";
import prisma from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { AUTH_ERRORS } from "@pmp/shared";
import { logger } from "../utils/logger";

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.conflict(
        AUTH_ERRORS.AUTH_002.message,
        AUTH_ERRORS.AUTH_002.code,
        "Please login instead",
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        emailVerifyToken: uuidv4(),
      },
    });

    // Create free tier subscription
    const freeTier = await prisma.subscriptionTier.findFirst({
      where: { name: "free" },
    });

    if (freeTier) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          tierId: freeTier.id,
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });
    }

    // Generate tokens
    const tierName = (freeTier?.name as TierName) || "free";
    const tokens = await this.generateTokens(user.id, user.email, tierName);

    // TODO: Send verification email

    return {
      user: { ...this.sanitizeUser(user), tier: tierName },
      tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginInput): Promise<AuthResult> {
    const email = credentials.email.toLowerCase();
    const rememberMe = credentials.rememberMe ?? false;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: {
          include: { tier: true },
        },
      },
    });

    if (!user) {
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_003.message,
        AUTH_ERRORS.AUTH_003.code,
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw AppError.forbidden(
        AUTH_ERRORS.AUTH_004.message,
        AUTH_ERRORS.AUTH_004.code,
        `Account locked until ${user.lockedUntil.toISOString()}`,
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updates: { failedLoginAttempts: number; lockedUntil?: Date } = {
        failedLoginAttempts: newFailedAttempts,
      };

      // Lock account if max attempts reached
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_003.message,
        AUTH_ERRORS.AUTH_003.code,
      );
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Check email verification (optional - can be enforced later)
    // if (!user.emailVerified) {
    //   throw AppError.forbidden(AUTH_ERRORS.AUTH_006.message, AUTH_ERRORS.AUTH_006.code);
    // }

    // Generate tokens with rememberMe flag for longer session
    const tierName = (user.subscription?.tier?.name as TierName) || "free";
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      tierName,
      rememberMe,
    );

    return {
      user: { ...this.sanitizeUser(user), tier: tierName },
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Find the refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            subscription: {
              include: { tier: true },
            },
          },
        },
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Delete expired token if found
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    // Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const tierName =
      (storedToken.user.subscription?.tier?.name as TierName) || "free";
    return this.generateTokens(
      storedToken.userId,
      storedToken.user.email,
      tierName,
    );
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } else {
      // Delete all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send password reset email
    if (env.NODE_ENV !== "production") {
      logger.info(`Password reset token for ${email}: ${token}`);
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.expiresAt < new Date() ||
      resetRecord.usedAt
    ) {
      throw AppError.badRequest(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all refresh tokens
      prisma.refreshToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw AppError.badRequest(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });
  }

  /**
   * Generate a new email verification token for the current user.
   *
   * Note: This service currently only rotates the stored token. In production, this should
   * send an email via a transactional email provider.
   */
  async resendVerification(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user) {
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    if (user.emailVerified) {
      return null;
    }

    const emailVerifyToken = uuidv4();

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken },
    });

    return emailVerifyToken;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    tierId: string,
    rememberMe: boolean = false,
  ): Promise<TokenPair> {
    // When rememberMe is true, use longer expiration times
    // Access token: 15 minutes normal, 1 hour when remembered
    // Refresh token: 7 days normal, 30 days when remembered
    const accessExpiresIn = rememberMe ? "1h" : env.JWT_EXPIRES_IN;
    const refreshExpiresIn = rememberMe ? "30d" : env.JWT_REFRESH_EXPIRES_IN;
    const refreshMaxAgeMs = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    const accessTokenExpiresInSeconds = rememberMe ? 60 * 60 : 15 * 60; // 1 hour or 15 minutes

    const accessToken = jwt.sign({ userId, email, tierId }, env.JWT_SECRET, {
      expiresIn: accessExpiresIn as jwt.SignOptions["expiresIn"],
    });

    const refreshToken = jwt.sign(
      { userId, type: "refresh" },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: refreshExpiresIn as jwt.SignOptions["expiresIn"],
      },
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + refreshMaxAgeMs),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresInSeconds,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { tier: true },
        },
      },
    });

    if (!user) return null;

    const tierName = (user.subscription?.tier?.name as TierName) || "free";
    return { ...this.sanitizeUser(user), tier: tierName };
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Omit<UserProfile, "tier"> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
