import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authService } from "../services/auth.service";
import { validateBody } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator";
import {
  clearAuthCookies,
  generateCsrfToken,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  setCsrfCookie,
} from "../utils/authCookies";
import { AppError } from "../middleware/error.middleware";
import { AUTH_ERRORS } from "@pmp/shared";
import { env } from "../config/env";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 20 : 100, // Higher limit in development
  skip: () => env.NODE_ENV === "test",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many authentication attempts, please try again later",
    },
  },
});

/**
 * GET /api/auth/csrf
 * Issue/refresh CSRF token cookie (double-submit pattern)
 */
router.get("/csrf", (_req: Request, res: Response) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  res.json({ success: true, data: { csrfToken } });
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      const csrfToken = generateCsrfToken();
      setAuthCookies(res, result.tokens);
      setCsrfCookie(res, csrfToken);
      res.status(201).json({
        success: true,
        data: { user: result.user, expiresIn: result.tokens.expiresIn },
        message: "Registration successful. Please verify your email.",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      const csrfToken = generateCsrfToken();
      setAuthCookies(res, result.tokens);
      setCsrfCookie(res, csrfToken);
      res.json({
        success: true,
        data: { user: result.user, expiresIn: result.tokens.expiresIn },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  "/refresh",
  authRateLimiter,
  validateBody(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookieRefreshToken = (
        req as Request & { cookies?: Record<string, string> }
      ).cookies?.[REFRESH_TOKEN_COOKIE];
      const refreshToken = cookieRefreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw AppError.unauthorized(
          AUTH_ERRORS.AUTH_005.message,
          AUTH_ERRORS.AUTH_005.code,
        );
      }

      const tokens = await authService.refreshToken(refreshToken);
      const csrfToken = generateCsrfToken();
      setAuthCookies(res, tokens);
      setCsrfCookie(res, csrfToken);
      res.json({
        success: true,
        data: { expiresIn: tokens.expiresIn },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/logout
 * Logout - invalidate refresh token
 */
router.post(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookieRefreshToken = (
        req as Request & { cookies?: Record<string, string> }
      ).cookies?.[REFRESH_TOKEN_COOKIE];
      const refreshToken = cookieRefreshToken || req.body.refreshToken;
      await authService.logout(req.user!.userId, refreshToken);
      clearAuthCookies(res);
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.requestPasswordReset(req.body.email);
      res.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post(
  "/reset-password",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json({
        success: true,
        message:
          "Password reset successful. You can now login with your new password.",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.verifyEmail(req.body.token);
      res.json({
        success: true,
        message: "Email verified successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/resend-verification
 * Rotate email verification token for the current user
 */
router.post(
  "/resend-verification",
  authRateLimiter,
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = await authService.resendVerification(req.user!.userId);

      res.json({
        success: true,
        data: env.NODE_ENV !== "production" && token ? { token } : {},
        message: token
          ? "Verification email sent. Please check your inbox."
          : "Email is already verified.",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getUserById(req.user!.userId);
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
