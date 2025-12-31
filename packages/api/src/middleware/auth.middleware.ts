import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AUTH_ERRORS } from '@pmp/shared';
import { env } from '../config/env';
import { AppError } from './error.middleware';
import prisma from '../config/database';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized(AUTH_ERRORS.AUTH_005.message, AUTH_ERRORS.AUTH_005.code);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, lockedUntil: true },
      });

      if (!user) {
        throw AppError.unauthorized(AUTH_ERRORS.AUTH_005.message, AUTH_ERRORS.AUTH_005.code);
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw AppError.forbidden(
          AUTH_ERRORS.AUTH_004.message,
          AUTH_ERRORS.AUTH_004.code,
          `Account is locked until ${user.lockedUntil.toISOString()}`
        );
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError instanceof AppError) throw jwtError;
      throw AppError.unauthorized(AUTH_ERRORS.AUTH_005.message, AUTH_ERRORS.AUTH_005.code);
    }
  } catch (error) {
    next(error);
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid, but optional auth - continue without user
  }

  next();
}
