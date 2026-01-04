import { FastifyInstance } from "fastify";
import type { FormulaCategory } from "@pmp/shared";
import { formulaService } from "../services/formula.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireFeature } from "../middleware/tier.middleware";

const formulaIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
};

const categoryQuerySchema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["earned_value", "scheduling", "cost", "communication", "other"],
    },
  },
};

const calculateSchema = {
  type: "object",
  properties: {
    inputs: { type: "object", additionalProperties: { type: "number" } },
  },
  required: ["inputs"],
};

export async function formulaRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authMiddleware as any],
      schema: { querystring: categoryQuerySchema },
    },
    async (request, reply) => {
      const category = (request.query as any).category as
        | FormulaCategory
        | undefined;
      const formulas = await formulaService.getFormulas(category);
      reply.send({
        success: true,
        data: { formulas, count: formulas.length },
      });
    },
  );

  app.get("/variables", async (_request, reply) => {
    const variables = formulaService.getEVMVariables();
    reply.send({
      success: true,
      data: { variables },
    });
  });

  app.get(
    "/:id",
    {
      preHandler: [authMiddleware as any],
      schema: { params: formulaIdSchema },
    },
    async (request, reply) => {
      const formula = await formulaService.getFormulaById(
        (request.params as any).id,
      );

      if (!formula) {
        reply.status(404).send({
          success: false,
          error: { code: "FORMULA_001", message: "Formula not found" },
        });
        return;
      }

      reply.send({
        success: true,
        data: { formula },
      });
    },
  );

  app.get(
    "/:id/questions",
    {
      preHandler: [authMiddleware as any],
      schema: { params: formulaIdSchema },
    },
    async (request, reply) => {
      const limit = (request.query as any).limit || 10;
      const questionIds = await formulaService.getRelatedQuestions(
        (request.params as any).id,
        limit,
      );

      reply.send({
        success: true,
        data: { questionIds, count: questionIds.length },
      });
    },
  );

  app.post(
    "/:id/calculate",
    {
      preHandler: [
        authMiddleware as any,
        requireFeature("formulaCalculator") as any,
      ],
      schema: { params: formulaIdSchema, body: calculateSchema },
    },
    async (request, reply) => {
      const result = await formulaService.calculateFormula(
        (request.params as any).id,
        (request.body as any).inputs,
      );

      reply.send({
        success: true,
        data: { result },
      });
    },
  );
}
