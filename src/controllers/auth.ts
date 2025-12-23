import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/database';
import { generateToken } from '../middleware/auth';
import Logger from '../utils/logger';
import { AppError, ErrorFactory } from '../utils/AppError';

/**
 * Register a new user
 * POST /api/auth/register
 * Validation handled by Zod middleware using registerSchema
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw ErrorFactory.conflict('Email already registered');
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
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

        // Generate token
        const token = generateToken(user);

        Logger.info(`New user registered: ${user.email}`);

        res.status(201).json({
            message: 'Registration successful',
            user,
            token,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Registration error:', error);
        next(ErrorFactory.internal('Registration failed'));
    }
};

/**
 * Login user
 * POST /api/auth/login
 * Validation handled by Zod middleware using loginSchema
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // Use same error for both cases to prevent user enumeration
            throw ErrorFactory.unauthorized('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            throw ErrorFactory.unauthorized('Invalid email or password');
        }

        // Generate token
        const token = generateToken(user);

        Logger.info(`User logged in: ${user.email}`);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Login error:', error);
        next(ErrorFactory.internal('Login failed'));
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        // Get full user data with stats
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
            throw ErrorFactory.notFound('User');
        }

        // Get progress stats
        const progress = await prisma.userProgress.findMany({
            where: { userId: req.user.id },
            include: {
                domain: {
                    select: {
                        name: true,
                        color: true,
                    },
                },
            },
        });

        res.json({
            user,
            progress,
            stats: {
                testsCompleted: user._count.testSessions,
                flashcardsReviewed: user._count.flashCardReviews,
            },
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Get me error:', error);
        next(ErrorFactory.internal('Failed to get user profile'));
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 * Validation handled by Zod middleware using updateProfileSchema
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
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

        Logger.info(`User profile updated: ${updatedUser.email}`);

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Update profile error:', error);
        next(ErrorFactory.internal('Failed to update profile'));
    }
};

/**
 * Change password
 * PUT /api/auth/password
 * Validation handled by Zod middleware using changePasswordSchema
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw ErrorFactory.unauthorized();
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password hash
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            throw ErrorFactory.notFound('User');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
            throw ErrorFactory.unauthorized('Current password is incorrect');
        }

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash },
        });

        Logger.info(`User password changed: ${user.email}`);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        Logger.error('Change password error:', error);
        next(ErrorFactory.internal('Failed to change password'));
    }
};

/**
 * Logout (for client-side token invalidation tracking, if needed)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    // With JWT, logout is handled client-side by removing the token
    // This endpoint exists for API consistency and potential future token blacklisting
    res.json({ message: 'Logged out successfully' });
};
