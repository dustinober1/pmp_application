import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                firstName: string;
                lastName: string;
            };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Fetch user from database to ensure they still exist and get latest data
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            next();
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
            },
        });

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Token invalid, but we continue without user
        next();
    }
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Generate refresh token (longer lived)
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

export { JWT_SECRET };
