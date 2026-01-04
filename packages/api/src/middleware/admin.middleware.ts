import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "./error.middleware";
import { env } from "../config/env";

declare module "fastify" {
  interface FastifyRequest {
    isAdmin?: boolean;
  }
}

export async function adminMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const user = (request as any).user;
  if (!user) {
    throw AppError.unauthorized("Authentication required", "ADMIN_001");
  }

  const adminEmails =
    env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

  const isAdmin =
    adminEmails.includes(user.email.toLowerCase()) ||
    adminEmails.some(
      (email: string) =>
        email.startsWith("*@") &&
        user.email.toLowerCase().endsWith(email.substring(1)),
    );

  if (!isAdmin) {
    throw AppError.forbidden("Admin access required", "ADMIN_002");
  }

  request.isAdmin = true;
}

export function optionalAdminMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): void {
  const user = (request as any).user;
  if (!user) {
    return;
  }

  const adminEmails =
    env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

  request.isAdmin =
    adminEmails.includes(user.email.toLowerCase()) ||
    adminEmails.some(
      (email: string) =>
        email.startsWith("*@") && user.email.endsWith(email.substring(1)),
    );
}
