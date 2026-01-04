import type { FastifyInstance } from "fastify";
import { flashcardService } from "../services/flashcard.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireFeature } from "../middleware/tier.middleware";
import type { FlashcardRating } from "@pmp/shared";

const flashcardQuerySchema = {
  type: "object",
  properties: {
    domainId: { type: "string", format: "uuid" },
    taskId: { type: "string", format: "uuid" },
    limit: { type: "integer" },
  },
};

const startSessionSchema = {
  type: "object",
  properties: {
    domainIds: { type: "array", items: { type: "string", format: "uuid" } },
    taskIds: { type: "array", items: { type: "string", format: "uuid" } },
    cardCount: { type: "integer", minimum: 1, maximum: 100 },
    includeCustom: { type: "boolean" },
    prioritizeReview: { type: "boolean" },
  },
};

const recordResponseSchema = {
  type: "object",
  properties: {
    rating: { type: "string", enum: ["know_it", "learning", "dont_know"] },
    timeSpentMs: { type: "number", minimum: 0 },
  },
  required: ["rating", "timeSpentMs"],
};

const createFlashcardSchema = {
  type: "object",
  properties: {
    domainId: { type: "string", format: "uuid" },
    taskId: { type: "string", format: "uuid" },
    front: { type: "string", minLength: 1, maxLength: 1000 },
    back: { type: "string", minLength: 1, maxLength: 2000 },
  },
  required: ["domainId", "taskId", "front", "back"],
};

const sessionIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
};

export async function flashcardRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authMiddleware],
      schema: { querystring: flashcardQuerySchema },
    },
    async (request, reply) => {
      const domainId = (request.query as any).domainId;
      const taskId = (request.query as any).taskId;
      const limit = (request.query as any).limit;

      const flashcards = await flashcardService.getFlashcards({
        domainId,
        taskId,
        userId: (request as any).user.userId,
        limit,
      });

      reply.send({
        success: true,
        data: { flashcards, count: flashcards.length },
      });
    },
  );

  app.get(
    "/review",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const limit = (request.query as any).limit
        ? parseInt((request.query as any).limit, 10)
        : 20;
      const flashcards = await flashcardService.getDueForReview(
        (request as any).user.userId,
        limit,
      );

      reply.send({
        success: true,
        data: { flashcards, count: flashcards.length },
      });
    },
  );

  app.get(
    "/stats",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const stats = await flashcardService.getReviewStats(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { stats },
      });
    },
  );

  app.post(
    "/sessions",
    {
      preHandler: [authMiddleware],
      schema: { body: startSessionSchema },
    },
    async (request, reply) => {
      const result = await flashcardService.startSession(
        (request as any).user.userId,
        request.body as any,
      );

      reply.status(201).send({
        success: true,
        data: {
          sessionId: result.sessionId,
          cards: result.cards,
          cardCount: result.cards.length,
        },
      });
    },
  );

  app.get(
    "/sessions/:id",
    {
      preHandler: [authMiddleware],
      schema: { params: sessionIdSchema },
    },
    async (request, reply) => {
      const session = await flashcardService.getSession(
        (request.params as any).id,
        (request as any).user.userId,
      );

      if (!session) {
        reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Session not found" },
        });
        return;
      }

      reply.send({
        success: true,
        data: session,
      });
    },
  );

  app.post(
    "/sessions/:id/responses/:cardId",
    {
      preHandler: [authMiddleware],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            cardId: { type: "string", format: "uuid" },
          },
          required: ["id", "cardId"],
        },
        body: recordResponseSchema,
      },
    },
    async (request, reply) => {
      const { rating, timeSpentMs } = request.body as any;
      await flashcardService.recordResponse(
        (request.params as any).id,
        (request.params as any).cardId,
        (request as any).user.userId,
        rating as FlashcardRating,
        timeSpentMs,
      );

      reply.send({
        success: true,
        message: "Response recorded",
      });
    },
  );

  app.post(
    "/sessions/:id/complete",
    {
      preHandler: [authMiddleware],
      schema: { params: sessionIdSchema },
    },
    async (request, reply) => {
      const stats = await flashcardService.completeSession(
        (request.params as any).id,
      );
      reply.send({
        success: true,
        data: { stats },
        message: "Session completed",
      });
    },
  );

  app.post(
    "/custom",
    {
      preHandler: [authMiddleware, requireFeature("customFlashcards")],
      schema: { body: createFlashcardSchema },
    },
    async (request, reply) => {
      const flashcard = await flashcardService.createCustomFlashcard(
        (request as any).user.userId,
        request.body as any,
      );

      reply.status(201).send({
        success: true,
        data: { flashcard },
        message: "Custom flashcard created",
      });
    },
  );
}
