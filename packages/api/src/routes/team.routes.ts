import { FastifyInstance } from "fastify";
import { teamService } from "../services/team.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireTier } from "../middleware/tier.middleware";

const teamIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
};

const createTeamSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    licenseCount: { type: "integer", minimum: 5, maximum: 1000 },
  },
  required: ["name"],
};

const inviteMemberSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
  },
  required: ["email"],
};

const memberIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    memberId: { type: "string", format: "uuid" },
  },
  required: ["id", "memberId"],
};

const updateRoleSchema = {
  type: "object",
  properties: {
    role: { type: "string", enum: ["admin", "member"] },
  },
  required: ["role"],
};

const acceptInvitationSchema = {
  type: "object",
  properties: {
    token: { type: "string", minLength: 1 },
  },
  required: ["token"],
};

const goalIdSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    goalId: { type: "string", format: "uuid" },
  },
  required: ["id", "goalId"],
};

const createGoalSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["completion", "accuracy", "study_time"] },
    target: { type: "number", minimum: 1, maximum: 1000 },
    deadline: { type: "string" },
  },
  required: ["type", "target", "deadline"],
};

const reportOptionsSchema = {
  type: "object",
  properties: {
    startDate: { type: "string" },
    endDate: { type: "string" },
    format: { type: "string", enum: ["json", "csv"] },
  },
};

export async function teamRoutes(app: FastifyInstance) {
  const corporateTierMiddleware = [
    authMiddleware as any,
    requireTier("corporate") as any,
  ];

  app.get(
    "/",
    { preHandler: corporateTierMiddleware },
    async (request, reply) => {
      const teams = await teamService.getUserTeams(
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        data: { teams, count: teams.length },
      });
    },
  );

  app.post(
    "/",
    { preHandler: corporateTierMiddleware, schema: { body: createTeamSchema } },
    async (request, reply) => {
      const team = await teamService.createTeam(
        (request as any).user.userId,
        request.body as any,
      );
      reply.status(201).send({
        success: true,
        data: { team },
        message: "Team created successfully",
      });
    },
  );

  app.get(
    "/:id",
    { preHandler: corporateTierMiddleware, schema: { params: teamIdSchema } },
    async (request, reply) => {
      const team = await teamService.getTeam(
        (request.params as any).id,
        (request as any).user.userId,
      );
      if (!team) {
        reply.status(404).send({
          success: false,
          error: { code: "TEAM_001", message: "Team not found" },
        });
        return;
      }
      reply.send({ success: true, data: { team } });
    },
  );

  app.get(
    "/:id/dashboard",
    { preHandler: corporateTierMiddleware, schema: { params: teamIdSchema } },
    async (request, reply) => {
      const dashboard = await teamService.getTeamDashboard(
        (request.params as any).id,
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { dashboard } });
    },
  );

  app.post(
    "/:id/invitations",
    {
      preHandler: corporateTierMiddleware,
      schema: { params: teamIdSchema, body: inviteMemberSchema },
    },
    async (request, reply) => {
      const invitation = await teamService.inviteMember(
        (request.params as any).id,
        (request as any).user.userId,
        (request.body as any).email,
      );
      reply.status(201).send({
        success: true,
        data: { invitation },
        message: "Invitation sent successfully",
      });
    },
  );

  app.post(
    "/invitations/accept",
    { schema: { body: acceptInvitationSchema } },
    async (request, reply) => {
      await teamService.acceptInvitation(
        (request.body as any).token,
        (request as any).user.userId,
      );
      reply.send({
        success: true,
        message: "Invitation accepted successfully",
      });
    },
  );

  app.delete(
    "/:id/members/:memberId",
    { preHandler: corporateTierMiddleware, schema: { params: memberIdSchema } },
    async (request, reply) => {
      await teamService.removeMember(
        (request.params as any).id,
        (request as any).user.userId,
        (request.params as any).memberId,
      );
      reply.send({ success: true, message: "Member removed successfully" });
    },
  );

  app.patch(
    "/:id/members/:memberId/role",
    {
      preHandler: corporateTierMiddleware,
      schema: { params: memberIdSchema, body: updateRoleSchema },
    },
    async (request, reply) => {
      await teamService.updateMemberRole(
        (request.params as any).id,
        (request as any).user.userId,
        (request.params as any).memberId,
        (request.body as any).role,
      );
      reply.send({
        success: true,
        message: "Member role updated successfully",
      });
    },
  );

  app.post(
    "/:id/alerts/:alertId/acknowledge",
    {
      preHandler: corporateTierMiddleware,
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            alertId: { type: "string", format: "uuid" },
          },
          required: ["id", "alertId"],
        },
      },
    },
    async (request, reply) => {
      await teamService.acknowledgeAlert(
        (request.params as any).alertId,
        (request as any).user.userId,
      );
      reply.send({ success: true, message: "Alert acknowledged" });
    },
  );

  app.get(
    "/:id/goals",
    { preHandler: corporateTierMiddleware, schema: { params: teamIdSchema } },
    async (request, reply) => {
      const goals = await teamService.getGoals(
        (request.params as any).id,
        (request as any).user.userId,
      );
      reply.send({ success: true, data: { goals, count: goals.length } });
    },
  );

  app.post(
    "/:id/goals",
    {
      preHandler: corporateTierMiddleware,
      schema: { params: teamIdSchema, body: createGoalSchema },
    },
    async (request, reply) => {
      const goal = await teamService.createGoal(
        (request.params as any).id,
        (request as any).user.userId,
        request.body as any,
      );
      reply
        .status(201)
        .send({
          success: true,
          data: { goal },
          message: "Goal created successfully",
        });
    },
  );

  app.delete(
    "/:id/goals/:goalId",
    { preHandler: corporateTierMiddleware, schema: { params: goalIdSchema } },
    async (request, reply) => {
      await teamService.deleteGoal(
        (request.params as any).id,
        (request as any).user.userId,
        (request.params as any).goalId,
      );
      reply.send({ success: true, message: "Goal deleted successfully" });
    },
  );

  app.delete(
    "/:id/members/:memberId/preserve",
    { preHandler: corporateTierMiddleware, schema: { params: memberIdSchema } },
    async (request, reply) => {
      const result = await teamService.removeMemberWithDataPreservation(
        (request.params as any).id,
        (request as any).user.userId,
        (request.params as any).memberId,
      );
      reply.send({ success: true, data: result, message: result.message });
    },
  );

  app.post(
    "/:id/reports",
    {
      preHandler: corporateTierMiddleware,
      schema: { params: teamIdSchema, body: reportOptionsSchema },
    },
    async (request, reply) => {
      const report = await teamService.generateReport(
        (request.params as any).id,
        (request as any).user.userId,
        request.body as any,
      );
      if ((request.body as any).format === "csv" && report.csvData) {
        reply.header("Content-Type", "text/csv");
        reply.header(
          "Content-Disposition",
          `attachment; filename="team-report-${report.teamId}-${new Date().toISOString().split("T")[0]}.csv"`,
        );
        reply.send(report.csvData);
        return;
      }
      reply.send({ success: true, data: { report } });
    },
  );

  app.get(
    "/:id/reports",
    { preHandler: corporateTierMiddleware, schema: { params: teamIdSchema } },
    async (request, reply) => {
      const report = await teamService.generateReport(
        (request.params as any).id,
        (request as any).user.userId,
        { format: "json" },
      );
      reply.send({ success: true, data: { report } });
    },
  );
}
