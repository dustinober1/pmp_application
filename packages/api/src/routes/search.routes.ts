import { FastifyInstance } from "fastify";
import { contentService } from "../services/content.service";
import { optionalAuthMiddleware } from "../middleware/auth.middleware";

const searchQuerySchema = {
  type: "object",
  properties: {
    q: { type: "string", minLength: 2 },
    limit: { type: "integer" },
  },
  required: ["q"],
};

export async function searchRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      schema: { querystring: searchQuerySchema },
      preHandler: [optionalAuthMiddleware as any],
    },
    async (request, reply) => {
      const q = (request.query as any).q;
      const limit = (request.query as any).limit || 20;
      const results = await contentService.searchContent(q, limit);
      reply.send({
        success: true,
        data: {
          query: q,
          results,
          count: results.length,
        },
      });
    },
  );
}
