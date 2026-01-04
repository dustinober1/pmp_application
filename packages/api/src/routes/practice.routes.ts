import type { FastifyInstance } from "fastify";
import { practiceService } from "../services/practice.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireFeature } from "../middleware/tier.middleware";
import { PMP_EXAM } from "@pmp/shared";

const startSessionSchema = {
  type: "object",
  properties: {
    domainIds: { type: "array", items: { type: "string", format: "uuid" } },
    taskIds: { type: "array", items: { type: "string", format: "uuid" } },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    questionCount: { type: "integer", minimum: 5, maximum: 50 },
    mode: { type: "string", enum: ["practice", "timed", "mock_exam"] },
  },
};

const submitAnswerSchema = {
  type: "object",
  properties: {
    selectedOptionId: { type: "string", format: "uuid" },
    timeSpentMs: { type: "number", minimum: 0 },
  },
  required: ["selectedOptionId", "timeSpentMs"],
};

const sessionIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
};

const questionIdSchema = {
  type: "object",
  properties: {
    questionId: { type: "string", format: "uuid" },
  },
  required: ["questionId"],
};

const startMockExamSchema = {
  type: "object",
  properties: {
    examId: { type: "integer", minimum: 1, maximum: 6 },
  },
};

export async function practiceRoutes(app: FastifyInstance) {
  app.post(
    "/sessions",
    {
      preHandler: [authMiddleware],
      schema: { body: startSessionSchema },
    },
    async (request, reply) => {
      const result = await practiceService.startSession(
        (request as any).user.userId,
        request.body as any,
      );

      reply.status(201).send({
        success: true,
        data: {
          sessionId: result.sessionId,
          totalQuestions: result.totalQuestions,
        },
      });
    },
  );

  app.get(
    "/sessions/:id/questions",
    {
      preHandler: [authMiddleware],
      schema: {
        params: sessionIdSchema,
        querystring: {
          type: "object",
          properties: {
            offset: { type: "integer", minimum: 0 },
            limit: { type: "integer", minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (request, reply) => {
      const offset = (request.query as any).offset || 0;
      const limit = (request.query as any).limit || 20;

      const result = await practiceService.getSessionQuestions(
        (request.params as any).id,
        (request as any).user.userId,
        offset,
        limit,
      );

      reply.send({
        success: true,
        data: result,
      });
    },
  );

  app.get(
    "/sessions/:id/streak",
    {
      preHandler: [authMiddleware],
      schema: { params: sessionIdSchema },
    },
    async (request, reply) => {
      const streak = await practiceService.getSessionStreak(
        (request.params as any).id,
        (request as any).user.userId,
      );

      reply.send({
        success: true,
        data: streak,
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
      const session = await practiceService.getSession(
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
    "/sessions/:id/answers/:questionId",
    {
      preHandler: [authMiddleware],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            questionId: { type: "string", format: "uuid" },
          },
          required: ["id", "questionId"],
        },
        body: submitAnswerSchema,
      },
    },
    async (request, reply) => {
      const result = await practiceService.submitAnswer(
        (request.params as any).id,
        (request.params as any).questionId,
        (request as any).user.userId,
        (request.body as any).selectedOptionId,
        (request.body as any).timeSpentMs,
      );

      reply.send({
        success: true,
        data: { result },
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
      const result = await practiceService.completeSession(
        (request.params as any).id,
        (request as any).user.userId,
      );

      reply.send({
        success: true,
        data: { result },
        message: "Session completed",
      });
    },
  );

  app.get(
    "/mock-exams",
    { preHandler: [authMiddleware] },
    async (_request, reply) => {
      const exams = await practiceService.getAvailableMockExams();
      reply.send({
        success: true,
        data: {
          exams,
          count: exams.length,
        },
      });
    },
  );

  app.post(
    "/mock-exams",
    {
      preHandler: [authMiddleware, requireFeature("mockExams")],
      schema: { body: startMockExamSchema },
    },
    async (request, reply) => {
      const { examId } = request.body as any;
      const result = await practiceService.startMockExam(
        (request as any).user.userId,
        examId,
      );

      reply.status(201).send({
        success: true,
        data: {
          sessionId: result.sessionId,
          totalQuestions: result.totalQuestions,
          startedAt: result.startedAt,
          examName: result.examName,
          timeLimitMs: PMP_EXAM.TIME_LIMIT_MINUTES * 60 * 1000,
        },
      });
    },
  );

  app.get(
    "/flagged",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const questions = await practiceService.getFlaggedQuestions(
        (request as any).user.userId,
      );

      reply.send({
        success: true,
        data: { questions, count: questions.length },
      });
    },
  );

  app.post(
    "/questions/:questionId/flag",
    {
      preHandler: [authMiddleware],
      schema: { params: questionIdSchema },
    },
    async (request, reply) => {
      await practiceService.flagQuestion(
        (request as any).user.userId,
        (request.params as any).questionId,
      );

      reply.send({
        success: true,
        message: "Question flagged for review",
      });
    },
  );

  app.delete(
    "/questions/:questionId/flag",
    {
      preHandler: [authMiddleware],
      schema: { params: questionIdSchema },
    },
    async (request, reply) => {
      await practiceService.unflagQuestion(
        (request as any).user.userId,
        (request.params as any).questionId,
      );

      reply.send({
        success: true,
        message: "Question unflagged",
      });
    },
  );

  app.get(
    "/stats",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const stats = await practiceService.getPracticeStats(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { stats },
      });
    },
  );
}
