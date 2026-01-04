import type { FastifyInstance } from "fastify";
import prisma from "../config/database";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      reply.send({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          database: "connected",
        },
      });
    } catch {
      reply.status(503).send({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          database: "disconnected",
        },
        error: "Database connection failed",
      });
    }
  });

  app.get("/live", async (_request, reply) => {
    reply.send({ status: "alive" });
  });

  app.get("/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      reply.send({ status: "ready" });
    } catch {
      reply.status(503).send({ status: "not ready" });
    }
  });
}
