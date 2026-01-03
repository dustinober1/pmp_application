import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { env } from "../config/env";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware to check if user is an admin
 * In production, this should check against a role in the database
 * For now, uses environment variable whitelist
 */
export function adminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    throw AppError.unauthorized("Authentication required", "ADMIN_001");
  }

  // Check if user email is in admin whitelist
  const adminEmails =
    env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

  // Also check if email domain is allowed (e.g., *@admin.example.com)
  const isAdmin =
    adminEmails.includes(req.user.email.toLowerCase()) ||
    adminEmails.some(
      (email) =>
        email.startsWith("*@") &&
        req.user!.email.toLowerCase().endsWith(email.substring(1)),
    );

  if (!isAdmin) {
    throw AppError.forbidden("Admin access required", "ADMIN_002");
  }

  req.isAdmin = true;
  next();
}

/**
 * Optional admin middleware - sets isAdmin flag but doesn't block
 */
export function optionalAdminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next();
    return;
  }

  const adminEmails =
    env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

  req.isAdmin =
    adminEmails.includes(req.user!.email.toLowerCase()) ||
    adminEmails.some(
      (email) =>
        email.startsWith("*@") && req.user!.email.endsWith(email.substring(1)),
    );

  next();
}
