import { FastifyInstance } from "fastify";
import { ebookService } from "../services/ebook.service";
import { ebookProgressService } from "../services/ebook-progress.service";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";
import prisma from "../config/database";
import type { TierName } from "@pmp/shared";

const updateProgressSchema = {
  type: "object",
  properties: {
    chapterSlug: { type: "string", minLength: 1 },
    sectionSlug: { type: "string", minLength: 1 },
  },
  required: ["chapterSlug", "sectionSlug"],
};

async function getUserTier(
  userId: string | undefined,
): Promise<TierName | null> {
  if (!userId) return null;
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { tier: true },
  });
  return (subscription?.tier?.name as TierName) || "free";
}

export async function ebookRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [optionalAuthMiddleware as any] },
    async (_request, reply) => {
      const chapters = await ebookService.getAllChapters();
      reply.send({ success: true, data: { chapters, count: chapters.length } });
    },
  );

  app.get(
    "/chapters/:slug",
    { preHandler: [optionalAuthMiddleware as any] },
    async (request, reply) => {
      const { slug } = request.params as any;
      if (!slug) {
        reply
          .status(400)
          .send({
            success: false,
            error: {
              code: "INVALID_PARAMS",
              message: "Chapter slug is required",
            },
          });
        return;
      }
      const chapter = await ebookService.getChapterBySlug(slug);
      reply.send({ success: true, data: { chapter } });
    },
  );

  app.get(
    "/chapters/:chapterSlug/sections/:sectionSlug",
    { preHandler: [optionalAuthMiddleware as any] },
    async (request, reply) => {
      const { chapterSlug, sectionSlug } = request.params as any;
      if (!chapterSlug || !sectionSlug) {
        reply
          .status(400)
          .send({
            success: false,
            error: {
              code: "INVALID_PARAMS",
              message: "Chapter and section slugs are required",
            },
          });
        return;
      }
      const userId = (request as any).user?.userId;
      const userTier = await getUserTier(userId);
      const section = await ebookService.getSectionBySlug(
        chapterSlug,
        sectionSlug,
        userTier,
      );
      if (userId) {
        ebookProgressService
          .updateProgress(userId, chapterSlug, sectionSlug)
          .catch(console.error);
      }
      reply.send({ success: true, data: { section } });
    },
  );

  app.get(
    "/search",
    { preHandler: [optionalAuthMiddleware as any] },
    async (request, reply) => {
      const { q, page, limit } = request.query as any;
      const userId = (request as any).user?.userId;
      const userTier = await getUserTier(userId);
      if (!q) {
        reply.send({
          success: true,
          data: {
            results: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
        return;
      }
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const validatedPage = Math.max(1, pageNum);
      const validatedLimit = Math.max(1, Math.min(100, limitNum));
      const searchResults = await ebookService.searchContent(q, userTier, {
        page: validatedPage,
        limit: validatedLimit,
      });
      reply.send({ success: true, data: searchResults });
    },
  );

  app.post(
    "/progress",
    {
      preHandler: [authMiddleware as any],
      schema: { body: updateProgressSchema },
    },
    async (request, reply) => {
      const { chapterSlug, sectionSlug } = request.body as any;
      const progress = await ebookProgressService.updateProgress(
        (request as any).user.userId,
        chapterSlug,
        sectionSlug,
      );
      reply.send({ success: true, data: { progress } });
    },
  );

  app.get(
    "/progress",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const progress = await ebookProgressService.getProgress(
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { progress } });
    },
  );

  app.get(
    "/progress/chapter/:chapterSlug",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const { chapterSlug } = request.params as any;
      if (!chapterSlug) {
        reply
          .status(400)
          .send({
            success: false,
            error: {
              code: "INVALID_PARAMS",
              message: "Chapter slug is required",
            },
          });
        return;
      }
      const progress = await ebookProgressService.getChapterProgress(
        (request as any).user.userId,
        chapterSlug,
      );
      reply.send({ success: true, data: { progress } });
    },
  );

  app.post(
    "/progress/complete",
    {
      preHandler: [authMiddleware as any],
      schema: { body: updateProgressSchema },
    },
    async (request, reply) => {
      const { chapterSlug, sectionSlug } = request.body as any;
      await ebookProgressService.markSectionComplete(
        (request as any).user.userId,
        chapterSlug,
        sectionSlug,
      );
      reply.send({ success: true, message: "Section marked as complete" });
    },
  );

  app.post(
    "/progress/reset",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      await ebookProgressService.resetProgress((request as any).user.userId);
      reply.send({ success: true, message: "Progress reset successfully" });
    },
  );
}
