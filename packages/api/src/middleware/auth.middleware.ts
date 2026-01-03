import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@pmp/shared";
import { AUTH_ERRORS } from "@pmp/shared";
import { env } from "../config/env";
import { AppError } from "./error.middleware";
import prisma from "../config/database";
import { ACCESS_TOKEN_COOKIE } from "../utils/authCookies";

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
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
    const cookieToken = (req as Request & { cookies?: Record<string, string> })
      .cookies?.[ACCESS_TOKEN_COOKIE];

    const token = bearerToken || cookieToken;

    if (!token) {
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          lockedUntil: true,
          emailVerified: true,
        },
      });

      if (!user) {
        throw AppError.unauthorized(
          AUTH_ERRORS.AUTH_005.message,
          AUTH_ERRORS.AUTH_005.code,
        );
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw AppError.forbidden(
          AUTH_ERRORS.AUTH_004.message,
          AUTH_ERRORS.AUTH_004.code,
          `Account is locked until ${user.lockedUntil.toISOString()}`,
        );
      }

      // Enforce email verification for non-auth routes
      if (!user.emailVerified && !req.baseUrl.startsWith("/api/auth")) {
        throw AppError.forbidden(
          AUTH_ERRORS.AUTH_006.message,
          AUTH_ERRORS.AUTH_006.code,
        );
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError instanceof AppError) throw jwtError;
      if (
        jwtError instanceof Error &&
        jwtError.name !== "JsonWebTokenError" &&
        jwtError.name !== "TokenExpiredError"
      )
        throw jwtError;
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }
  } catch (error) {
    next(error);
  }
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  const bearerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
  const cookieToken = (req as Request & { cookies?: Record<string, string> })
    .cookies?.[ACCESS_TOKEN_COOKIE];

  const token = bearerToken || cookieToken;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid, but optional auth - continue without user
  }

  next();
}
