import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/database';
import Logger from '../utils/logger';
import { isTokenBlacklisted, areUserTokensRevoked } from '../services/tokenBlacklist';

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

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
};

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
  jti?: string; // JWT ID (for blacklisting)
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

    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;

    // Check if this specific token is blacklisted (logout)
    const tokenId = decoded.jti || token;
    if (await isTokenBlacklisted(tokenId)) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }

    // Check if all user tokens were revoked (password change, admin action)
    if (decoded.iat && (await areUserTokensRevoked(decoded.userId, decoded.iat))) {
      res.status(401).json({ error: 'Session has been invalidated' });
      return;
    }

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
    Logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
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

    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;

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
  } catch {
    // Token invalid, but we continue without user
    next();
  }
};

/**
 * Generate JWT token for a user
 * Short-lived access token (15 minutes) - use with refresh tokens
 */
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Short-lived access token for better security
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
};

/**
 * Generate a longer-lived token (for backward compatibility)
 * Used when refresh tokens are not being used
 */
export const generateLongLivedToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export { getJwtSecret };
