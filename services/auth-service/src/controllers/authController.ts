import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../services/database';
import { generateToken } from '../middleware/auth';

// Error class
class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                code: this.code,
                status: this.statusCode,
            },
        };
    }
}

// Refresh token helpers
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const generateRefreshToken = (): string => crypto.randomBytes(64).toString('hex');
const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            throw new AuthError('All fields are required', 400, 'BAD_REQUEST');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new AuthError('Email already registered', 409, 'CONFLICT');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                role: 'USER',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(refreshToken),
                expiresAt,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
            },
        });

        res.status(201).json({
            message: 'Registration successful',
            user,
            token: accessToken,
            refreshToken,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Registration error:', error);
        next(new AuthError('Registration failed', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AuthError('Email and password are required', 400, 'BAD_REQUEST');
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new AuthError('Invalid email or password', 401, 'UNAUTHORIZED');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            throw new AuthError('Invalid email or password', 401, 'UNAUTHORIZED');
        }

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(refreshToken),
                expiresAt,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
            },
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token: accessToken,
            refreshToken,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Login error:', error);
        next(new AuthError('Login failed', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            throw new AuthError('Refresh token is required', 400, 'BAD_REQUEST');
        }

        const tokenHash = hashToken(token);

        const storedToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            throw new AuthError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
        }

        // Generate new tokens
        const newAccessToken = generateToken(storedToken.user);
        const newRefreshToken = generateRefreshToken();

        // Rotate: revoke old, create new
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await prisma.refreshToken.create({
            data: {
                userId: storedToken.userId,
                tokenHash: hashToken(newRefreshToken),
                expiresAt,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
            },
        });

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Token refresh error:', error);
        next(new AuthError('Token refresh failed', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Get current user
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthError('Authentication required', 401, 'UNAUTHORIZED');
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        testSessions: true,
                        flashCardReviews: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AuthError('User not found', 404, 'NOT_FOUND');
        }

        res.json({
            user,
            stats: {
                testsCompleted: user._count.testSessions,
                flashcardsReviewed: user._count.flashCardReviews,
            },
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Get me error:', error);
        next(new AuthError('Failed to get profile', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Update profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthError('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { firstName, lastName } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(firstName && { firstName: firstName.trim() }),
                ...(lastName && { lastName: lastName.trim() }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Update profile error:', error);
        next(new AuthError('Failed to update profile', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthError('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new AuthError('Current and new password are required', 400, 'BAD_REQUEST');
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            throw new AuthError('User not found', 404, 'NOT_FOUND');
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
            throw new AuthError('Current password is incorrect', 401, 'UNAUTHORIZED');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash },
        });

        // Revoke all refresh tokens
        await prisma.refreshToken.updateMany({
            where: { userId: req.user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        res.json({ message: 'Password changed successfully. Please log in again.' });
    } catch (error) {
        if (error instanceof AuthError) {
            return next(error);
        }
        console.error('Change password error:', error);
        next(new AuthError('Failed to change password', 500, 'INTERNAL_ERROR'));
    }
};

/**
 * Logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken: token, logoutAll } = req.body;

        if (req.user && logoutAll) {
            await prisma.refreshToken.updateMany({
                where: { userId: req.user.id, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        } else if (token) {
            const tokenHash = hashToken(token);
            await prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.json({ message: 'Logged out successfully' });
    }
};
