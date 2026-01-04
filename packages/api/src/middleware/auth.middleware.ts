import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@pmp/shared";
import { AUTH_ERRORS } from "@pmp/shared";
import { env } from "../config/env";
import { AppError } from "./error.middleware";
import prisma from "../config/database";
import { ACCESS_TOKEN_COOKIE } from "../utils/authCookies";

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
    const cookieToken = request.cookies?.[ACCESS_TOKEN_COOKIE];

    const token = bearerToken || cookieToken;

    if (!token) {
      throw AppError.unauthorized(
        AUTH_ERRORS.AUTH_005.message,
        AUTH_ERRORS.AUTH_005.code,
      );
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

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

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw AppError.forbidden(
          AUTH_ERRORS.AUTH_004.message,
          AUTH_ERRORS.AUTH_004.code,
          `Account is locked until ${user.lockedUntil.toISOString()}`,
        );
      }

      if (!user.emailVerified && !request.url.startsWith("/api/auth")) {
        throw AppError.forbidden(
          AUTH_ERRORS.AUTH_006.message,
          AUTH_ERRORS.AUTH_006.code,
        );
      }

      (request as any).user = decoded;
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
    throw error;
  }
}

export function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): void {
  const authHeader = request.headers.authorization;

  const bearerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;
  const cookieToken = request.cookies?.[ACCESS_TOKEN_COOKIE];

  const token = bearerToken || cookieToken;

  if (!token) {
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (request as any).user = decoded;
  } catch {
    // Token invalid, but optional auth - continue without user
  }
}
