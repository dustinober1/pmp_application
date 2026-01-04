import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AnalyticsService } from "../services/analytics.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const analyticsService = new AnalyticsService();

const timeRangeSchema = z
  .enum(["24h", "7d", "30d", "90d", "all"])
  .default("30d");
const analyticsQuerySchema = z.object({
  timeRange: timeRangeSchema,
  domainId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware as any);

  app.get(
    "/learning/overview",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const query = analyticsQuerySchema.parse(request.query);
      const queryAny = request.query as any;
      const limit = queryAny.limit ? parseInt(queryAny.limit) : 100;

      const data = await analyticsService.getStudentLearningAnalytics({
        timeRange: query.timeRange,
        limit,
      });

      reply.send({
        success: true,
        data,
      });
    },
  );

  app.get("/learning/user/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const user = (request as any).user;
    const isAdmin = (request as any).isAdmin;

    if (user.userId !== userId && !isAdmin) {
      reply.status(403).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only access your own analytics",
        },
      });
      return;
    }

    const data = await analyticsService.getUserLearningAnalytics(userId);

    reply.send({
      success: true,
      data,
    });
  });

  app.get(
    "/learning/domain/:domainId",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const { domainId } = request.params as { domainId: string };

      const data = await analyticsService.getDomainLearningAnalytics(domainId);

      reply.send({
        success: true,
        data,
      });
    },
  );

  app.get(
    "/flashcards/overview",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const query = analyticsQuerySchema.parse(request.query);

      const data = await analyticsService.getFlashcardAnalytics({
        timeRange: query.timeRange,
        domainId: query.domainId,
        taskId: query.taskId,
      });

      reply.send({
        success: true,
        data,
      });
    },
  );

  app.get("/flashcards/user/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const user = (request as any).user;
    const isAdmin = (request as any).isAdmin;

    if (user.userId !== userId && !isAdmin) {
      reply.status(403).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only access your own analytics",
        },
      });
      return;
    }

    const data = await analyticsService.getUserFlashcardAnalytics(userId);

    reply.send({
      success: true,
      data,
    });
  });

  app.get(
    "/questions/overview",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const query = analyticsQuerySchema.parse(request.query);

      const data = await analyticsService.getQuestionAnalytics({
        timeRange: query.timeRange,
        domainId: query.domainId,
        taskId: query.taskId,
        difficulty: query.difficulty,
      });

      reply.send({
        success: true,
        data,
      });
    },
  );

  app.get("/questions/user/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const user = (request as any).user;
    const isAdmin = (request as any).isAdmin;

    if (user.userId !== userId && !isAdmin) {
      reply.status(403).send({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You can only access your own analytics",
        },
      });
      return;
    }

    const data = await analyticsService.getUserQuestionAnalytics(userId);

    reply.send({
      success: true,
      data,
    });
  });

  app.get(
    "/system/overview",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const query = analyticsQuerySchema.parse(request.query);

      const data = await analyticsService.getSystemPerformanceMetrics({
        timeRange: query.timeRange,
      });

      reply.send({
        success: true,
        data,
      });
    },
  );

  app.get(
    "/dashboard",
    { preHandler: [adminMiddleware as any] },
    async (request, reply) => {
      const query = analyticsQuerySchema.parse(request.query);

      const [
        learningAnalytics,
        flashcardAnalytics,
        questionAnalytics,
        systemMetrics,
      ] = await Promise.all([
        analyticsService.getStudentLearningAnalytics({
          timeRange: query.timeRange,
          limit: 50,
        }),
        analyticsService.getFlashcardAnalytics({
          timeRange: query.timeRange,
        }),
        analyticsService.getQuestionAnalytics({
          timeRange: query.timeRange,
        }),
        analyticsService.getSystemPerformanceMetrics({
          timeRange: query.timeRange,
        }),
      ]);

      reply.send({
        success: true,
        data: {
          learning: learningAnalytics,
          flashcards: flashcardAnalytics,
          questions: questionAnalytics,
          system: systemMetrics,
        },
      });
    },
  );
}
