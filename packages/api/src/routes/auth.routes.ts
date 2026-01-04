import type { FastifyInstance } from "fastify";
import { authService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator";
import {
  clearAuthCookies,
  generateCsrfToken,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
  setCsrfCookie,
} from "../utils/authCookies";
import { AUTH_ERRORS } from "@pmp/shared";
import { env } from "../config/env";

export async function authRoutes(app: FastifyInstance) {
  const authRateLimiter = {
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 20 : 100,
  };

  app.get("/csrf", async (_request, reply) => {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(reply, csrfToken);
    reply.send({ success: true, data: { csrfToken } });
  });

  app.post(
    "/register",
    {
      config: { rateLimit: authRateLimiter },
      schema: { body: registerSchema },
    },
    async (request, reply) => {
      const result = await authService.register(request.body as any);
      const csrfToken = generateCsrfToken();
      setAuthCookies(reply, result.tokens);
      setCsrfCookie(reply, csrfToken);
      reply.status(201).send({
        success: true,
        data: { user: result.user, expiresIn: result.tokens.expiresIn },
        message: "Registration successful. Please verify your email.",
      });
    },
  );

  app.post(
    "/login",
    {
      config: { rateLimit: authRateLimiter },
      schema: { body: loginSchema },
    },
    async (request, reply) => {
      const result = await authService.login(request.body as any);
      const csrfToken = generateCsrfToken();
      setAuthCookies(reply, result.tokens);
      setCsrfCookie(reply, csrfToken);
      reply.send({
        success: true,
        data: { user: result.user, expiresIn: result.tokens.expiresIn },
      });
    },
  );

  app.post(
    "/refresh",
    {
      config: { rateLimit: authRateLimiter },
      schema: { body: refreshTokenSchema },
    },
    async (request, reply) => {
      const cookies = request.cookies as Record<string, string>;
      const cookieRefreshToken = cookies?.[REFRESH_TOKEN_COOKIE];
      const refreshToken =
        cookieRefreshToken || (request.body as any).refreshToken;

      if (!refreshToken) {
        reply.status(401).send({
          error: {
            code: AUTH_ERRORS.AUTH_005.code,
            message: AUTH_ERRORS.AUTH_005.message,
          },
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      const csrfToken = generateCsrfToken();
      setAuthCookies(reply, tokens);
      setCsrfCookie(reply, csrfToken);
      reply.send({
        success: true,
        data: { expiresIn: tokens.expiresIn },
      });
    },
  );

  app.post(
    "/logout",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const cookies = request.cookies as Record<string, string>;
      const cookieRefreshToken = cookies?.[REFRESH_TOKEN_COOKIE];
      const refreshToken =
        cookieRefreshToken || (request.body as any).refreshToken;
      await authService.logout((request as any).user.userId, refreshToken);
      clearAuthCookies(reply);
      reply.send({
        success: true,
        message: "Logged out successfully",
      });
    },
  );

  app.post(
    "/forgot-password",
    {
      config: { rateLimit: authRateLimiter },
      schema: { body: forgotPasswordSchema },
    },
    async (request, reply) => {
      await authService.requestPasswordReset((request.body as any).email);
      reply.send({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    },
  );

  app.post(
    "/reset-password",
    {
      config: { rateLimit: authRateLimiter },
      schema: { body: resetPasswordSchema },
    },
    async (request, reply) => {
      await authService.resetPassword(
        (request.body as any).token,
        (request.body as any).newPassword,
      );
      reply.send({
        success: true,
        message:
          "Password reset successful. You can now login with your new password.",
      });
    },
  );

  app.post(
    "/verify-email",
    { schema: { body: verifyEmailSchema } },
    async (request, reply) => {
      await authService.verifyEmail((request.body as any).token);
      reply.send({
        success: true,
        message: "Email verified successfully.",
      });
    },
  );

  app.post(
    "/resend-verification",
    { config: { rateLimit: authRateLimiter }, preHandler: [authMiddleware] },
    async (request, reply) => {
      const token = await authService.resendVerification(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: env.NODE_ENV !== "production" && token ? { token } : {},
        message: token
          ? "Verification email sent. Please check your inbox."
          : "Email is already verified.",
      });
    },
  );

  app.get("/me", { preHandler: [authMiddleware] }, async (request, reply) => {
    const user = await authService.getUserById((request as any).user.userId);
    reply.send({
      success: true,
      data: { user },
    });
  });
}
