import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  adminExportQuerySchema,
  adminDeletionQuerySchema,
  adminProcessExportSchema,
  adminProcessDeletionSchema,
  auditLogQuerySchema,
} from "../validators/privacy.validator";
import {
  dataExportService,
  accountDeletionService,
  adminPrivacyService,
} from "../services";

export async function adminPrivacyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware as any);
  app.addHook("preHandler", adminMiddleware as any);

  app.get("/dashboard", async (_request, reply) => {
    const dashboard = await adminPrivacyService.getDashboard();
    reply.send({
      success: true,
      data: dashboard,
    });
  });

  app.get(
    "/exports",
    {
      schema: { querystring: adminExportQuerySchema },
    },
    async (request, reply) => {
      const result = await dataExportService.getAllExports(request.query);
      reply.send({
        success: true,
        data: result,
      });
    },
  );

  app.post(
    "/exports/process",
    {
      schema: { body: adminProcessExportSchema },
    },
    async (request, reply) => {
      await dataExportService.adminProcessExport(
        (request.body as any).requestId,
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        message: "Export processed successfully",
      });
    },
  );

  app.get(
    "/deletions",
    {
      schema: { querystring: adminDeletionQuerySchema },
    },
    async (request, reply) => {
      const result = await accountDeletionService.getAllDeletions(
        request.query,
      );
      reply.send({
        success: true,
        data: result,
      });
    },
  );

  app.post(
    "/deletions/process",
    {
      schema: { body: adminProcessDeletionSchema },
    },
    async (request, reply) => {
      await accountDeletionService.adminProcessDeletion(
        (request.body as any).requestId,
        (request as any).user.userId,
        (request.body as any).force,
      );
      reply.send({
        success: true,
        message: "Deletion processed successfully",
      });
    },
  );

  app.get(
    "/audit-logs",
    {
      schema: { querystring: auditLogQuerySchema },
    },
    async (request, reply) => {
      const result = await adminPrivacyService.getAuditLogs(request.query);
      reply.send({
        success: true,
        data: result,
      });
    },
  );

  app.get("/users/:userId", async (request, reply) => {
    const userId = (request.params as any).userId;
    const summary = await adminPrivacyService.getUserComplianceSummary(userId);
    reply.send({
      success: true,
      data: summary,
    });
  });

  app.post("/process-pending", async (_request, reply) => {
    const result = await accountDeletionService.processPendingDeletions();
    reply.send({
      success: true,
      data: result,
      message: `Processed ${result.processed} pending deletions`,
    });
  });
}
