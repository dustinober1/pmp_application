import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  consentService,
  dataExportService,
  accountDeletionService,
} from "../services";

const consentUpdateSchema = {
  type: "object",
  properties: {
    analytics: { type: "boolean" },
    marketing: { type: "boolean" },
    thirdParty: { type: "boolean" },
  },
};

const consentWithdrawSchema = {
  type: "object",
  properties: {
    reason: { type: "string" },
  },
};

const dataExportRequestSchema = {
  type: "object",
  properties: {
    format: { type: "string", enum: ["json", "csv"] },
  },
};

const accountDeletionRequestSchema = {
  type: "object",
  properties: {
    reason: { type: "string" },
    confirmEmail: { type: "string" },
  },
  required: ["confirmEmail"],
};

const cancelDeletionSchema = {
  type: "object",
  properties: {
    requestId: { type: "string" },
  },
  required: ["requestId"],
};

export async function privacyRoutes(app: FastifyInstance) {
  app.get(
    "/consent",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const consent = await consentService.getUserConsent(
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { consent } });
    },
  );

  app.put(
    "/consent",
    {
      preHandler: [authMiddleware as any],
      schema: { body: consentUpdateSchema },
    },
    async (request, reply) => {
      const metadata = {
        ipAddress: (request as any).ip,
        userAgent: request.headers["user-agent"],
      };
      const consent = await consentService.updateConsent(
        (request as any).user.userId,
        request.body as any,
        metadata,
      );
      reply.send({
        success: true,
        data: { consent },
        message: "Consent updated successfully",
      });
    },
  );

  app.post(
    "/consent/withdraw",
    {
      preHandler: [authMiddleware as any],
      schema: { body: consentWithdrawSchema },
    },
    async (request, reply) => {
      const metadata = {
        ipAddress: (request as any).ip,
        userAgent: request.headers["user-agent"],
      };
      await consentService.withdrawConsent(
        (request as any).user.userId,
        (request.body as any).reason,
        metadata,
      );
      reply.send({ success: true, message: "Consent withdrawn successfully" });
    },
  );

  app.post(
    "/data-export",
    {
      preHandler: [authMiddleware as any],
      schema: { body: dataExportRequestSchema },
    },
    async (request, reply) => {
      const metadata = {
        ipAddress: (request as any).ip,
        userAgent: request.headers["user-agent"],
      };
      const exportRequest = await dataExportService.requestExport(
        (request as any).user.userId,
        request.body as any,
        metadata,
      );
      reply
        .status(201)
        .send({
          success: true,
          data: { exportRequest },
          message:
            "Data export requested. You will receive an email when it is ready.",
        });
    },
  );

  app.get(
    "/data-export",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const history = await dataExportService.getExportHistory(
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { exports: history } });
    },
  );

  app.get(
    "/data-export/:requestId",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const requestId = (request.params as any).requestId;
      const exportRequest = await dataExportService.getExportStatus(
        (request as any).user.userId,
        requestId,
      );
      reply.send({ success: true, data: { exportRequest } });
    },
  );

  app.get(
    "/data-export/:requestId/download",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const requestId = (request.params as any).requestId;
      const userData = await dataExportService.downloadExport(
        (request as any).user.userId,
        requestId,
      );
      reply.header("Content-Type", "application/json");
      reply.header(
        "Content-Disposition",
        `attachment; filename="user-data-export-${(request as any).user.userId}-${Date.now()}.json"`,
      );
      reply.send(userData);
    },
  );

  app.post(
    "/delete-account",
    {
      preHandler: [authMiddleware as any],
      schema: { body: accountDeletionRequestSchema },
    },
    async (request, reply) => {
      const metadata = {
        ipAddress: (request as any).ip,
        userAgent: request.headers["user-agent"],
      };
      const deletionRequest = await accountDeletionService.requestDeletion(
        (request as any).user.userId,
        request.body as any,
        metadata,
      );
      reply
        .status(201)
        .send({
          success: true,
          data: { deletionRequest },
          message:
            "Account deletion requested. Your account will be deleted after 30 days. You will receive a confirmation email.",
        });
    },
  );

  app.get(
    "/delete-account",
    { preHandler: [authMiddleware as any] },
    async (request, reply) => {
      const deletionRequest = await accountDeletionService.getDeletionStatus(
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { deletionRequest } });
    },
  );

  app.post(
    "/delete-account/cancel",
    {
      preHandler: [authMiddleware as any],
      schema: { body: cancelDeletionSchema },
    },
    async (request, reply) => {
      const metadata = {
        ipAddress: (request as any).ip,
        userAgent: request.headers["user-agent"],
      };
      await accountDeletionService.cancelDeletion(
        (request as any).user.userId,
        (request.body as any).requestId,
        metadata,
      );
      reply.send({
        success: true,
        message: "Account deletion cancelled successfully",
      });
    },
  );
}
