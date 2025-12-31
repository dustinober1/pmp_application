import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { validateBody } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
    '/register',
    validateBody(registerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Registration successful. Please verify your email.',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
    '/login',
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await authService.login(req.body);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
    '/refresh',
    validateBody(refreshTokenSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tokens = await authService.refreshToken(req.body.refreshToken);
            res.json({
                success: true,
                data: { tokens },
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout - invalidate refresh token
 */
router.post(
    '/logout',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.body.refreshToken;
            await authService.logout(req.user!.userId, refreshToken);
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
    '/forgot-password',
    validateBody(forgotPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.requestPasswordReset(req.body.email);
            res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post(
    '/reset-password',
    validateBody(resetPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.resetPassword(req.body.token, req.body.newPassword);
            res.json({
                success: true,
                message: 'Password reset successful. You can now login with your new password.',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
    '/verify-email',
    validateBody(verifyEmailSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authService.verifyEmail(req.body.token);
            res.json({
                success: true,
                message: 'Email verified successfully.',
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
    '/me',
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
    }
);

export default router;
