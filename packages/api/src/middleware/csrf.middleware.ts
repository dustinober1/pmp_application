import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { CSRF_TOKEN_COOKIE } from "../utils/authCookies";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_EXEMPT_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/csrf",
  "/api/health",
]);

export function csrfMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const fullPath = `${req.baseUrl}${req.path}`;
  if (CSRF_EXEMPT_PATHS.has(fullPath)) {
    next();
    return;
  }

  const csrfCookie = (req as Request & { cookies?: Record<string, string> })
    .cookies?.[CSRF_TOKEN_COOKIE];
  const csrfHeader = req.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    next(AppError.forbidden("CSRF validation failed", "CSRF_001"));
    return;
  }

  next();
}
