import type { FastifyInstance } from "fastify";
import { dashboardService } from "../services/dashboard.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireTier } from "../middleware/tier.middleware";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const dashboard = await dashboardService.getDashboardData(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { dashboard },
      });
    },
  );

  app.get(
    "/streak",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const streak = await dashboardService.getStudyStreak(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { streak },
      });
    },
  );

  app.get(
    "/progress",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const domainProgress = await dashboardService.getDomainProgress(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { domainProgress },
      });
    },
  );

  app.get(
    "/activity",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const limit = (request.query as any).limit || 10;
      const activity = await dashboardService.getRecentActivity(
        (request as any).user.userId,
        limit,
      );
      reply.send({
        success: true,
        data: { activity, count: activity.length },
      });
    },
  );

  app.get(
    "/reviews",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const limit = (request.query as any).limit || 10;
      const reviews = await dashboardService.getUpcomingReviews(
        (request as any).user.userId,
        limit,
      );
      reply.send({
        success: true,
        data: { reviews, count: reviews.length },
      });
    },
  );

  app.get(
    "/weak-areas",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const weakAreas = await dashboardService.getWeakAreas(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { weakAreas, count: weakAreas.length },
      });
    },
  );

  app.get(
    "/readiness",
    { preHandler: [authMiddleware as any, requireTier("pro") as any] },
    async (request, reply) => {
      const readiness = await dashboardService.getReadinessScore(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { readiness },
      });
    },
  );

  app.get(
    "/recommendations",
    { preHandler: [authMiddleware as any, requireTier("pro") as any] },
    async (request, reply) => {
      const recommendations = await dashboardService.getRecommendations(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { recommendations, count: recommendations.length },
      });
    },
  );
}
