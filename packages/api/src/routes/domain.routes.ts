import { FastifyInstance } from "fastify";
import { contentService } from "../services/content.service";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const domainIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
};

const taskIdSchema = {
  type: "object",
  properties: {
    taskId: { type: "string", format: "uuid" },
  },
  required: ["taskId"],
};

const sectionIdSchema = {
  type: "object",
  properties: {
    sectionId: { type: "string", format: "uuid" },
  },
  required: ["sectionId"],
};

export async function domainRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    const domains = await contentService.getDomains();
    reply.send({
      success: true,
      data: { domains },
    });
  });

  app.get(
    "/:id",
    { schema: { params: domainIdSchema } },
    async (request, reply) => {
      const domain = await contentService.getDomainById(
        (request.params as any).id,
      );

      if (!domain) {
        reply.status(404).send({
          success: false,
          error: { code: "CONTENT_001", message: "Domain not found" },
        });
        return;
      }

      reply.send({
        success: true,
        data: { domain },
      });
    },
  );

  app.get(
    "/:id/tasks",
    { schema: { params: domainIdSchema } },
    async (request, reply) => {
      const tasks = await contentService.getTasksByDomain(
        (request.params as any).id,
      );
      reply.send({
        success: true,
        data: { tasks },
      });
    },
  );

  app.get(
    "/tasks/:taskId/study-guide",
    {
      schema: { params: taskIdSchema },
      preHandler: [optionalAuthMiddleware as any],
    },
    async (request, reply) => {
      const studyGuide = await contentService.getStudyGuide(
        (request.params as any).taskId,
      );

      if (!studyGuide) {
        reply.status(404).send({
          success: false,
          error: { code: "CONTENT_003", message: "Study guide not found" },
        });
        return;
      }

      reply.send({
        success: true,
        data: { studyGuide },
      });
    },
  );

  app.post(
    "/progress/sections/:sectionId/complete",
    {
      schema: { params: sectionIdSchema },
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      await contentService.markSectionComplete(
        (request as any).user.userId,
        (request.params as any).sectionId,
      );
      reply.send({
        success: true,
        message: "Section marked as complete",
      });
    },
  );

  app.get(
    "/progress",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const progress = await contentService.getUserProgress(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { progress },
      });
    },
  );
}
