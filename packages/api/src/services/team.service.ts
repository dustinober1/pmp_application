import type { TeamRole, TeamAlertType, CreateTeamInput } from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "../middleware/error.middleware";
import crypto from "crypto";

// Local response types for simplicity
interface TeamResponse {
  id: string;
  name: string;
  adminId: string;
  licenseCount: number;
  members: TeamMemberResponse[];
  createdAt: Date;
}

interface TeamMemberResponse {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamInvitationResponse {
  id: string;
  teamId: string;
  email: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

interface TeamDashboardResponse {
  teamId: string;
  teamName: string;
  totalMembers: number;
  activeMembers: number;
  averageProgress: number;
  averageReadinessScore: number;
  memberStats: MemberStatsResponse[];
  alerts: TeamAlertResponse[];
}

interface MemberStatsResponse {
  memberId: string;
  userId: string;
  userName: string;
  progress: number;
  readinessScore: number;
  lastActiveDate: Date | null;
  studyStreak: number;
}

interface TeamAlertResponse {
  id: string;
  memberId: string;
  memberName: string;
  type: TeamAlertType;
  message: string;
  createdAt: Date;
  acknowledged: boolean;
}

export class TeamService {
  /**
   * Create a new team
   */
  async createTeam(
    adminId: string,
    data: CreateTeamInput,
  ): Promise<TeamResponse> {
    // Verify user has corporate subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: adminId },
      include: { tier: true },
    });

    if (!subscription || subscription.tier.name !== "corporate") {
      throw AppError.forbidden("Corporate subscription required");
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        adminId,
        licenseCount: data.licenseCount || 10,
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    // Add admin as first member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: adminId,
        role: "admin",
      },
    });

    return this.mapTeam(team);
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: string, userId: string): Promise<TeamResponse | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!team) return null;

    // Verify user is a member
    const isMember = team.members.some(
      (m: { userId: string }) => m.userId === userId,
    );
    if (!isMember) {
      throw AppError.forbidden("Not a team member");
    }

    return this.mapTeam(team);
  }

  /**
   * Get teams for a user
   */
  async getUserTeams(userId: string): Promise<TeamResponse[]> {
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });

    return memberships.map((m: { team: any }) => this.mapTeam(m.team));
  }

  /**
   * Invite a member to the team
   */
  async inviteMember(
    teamId: string,
    adminId: string,
    email: string,
  ): Promise<TeamInvitationResponse> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can invite members");
    }

    // Check license count
    if (team.members.length >= team.licenseCount) {
      throw AppError.badRequest("Team license limit reached");
    }

    // Check if email is already invited
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw AppError.badRequest("Invitation already sent to this email");
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const isMember = team.members.some(
        (m: { userId: string }) => m.userId === existingUser.id,
      );
      if (isMember) {
        throw AppError.badRequest("User is already a team member");
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        email,
        token,
        expiresAt,
      },
    });

    // TODO: Send invitation email

    return {
      id: invitation.id,
      teamId: invitation.teamId,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    };
  }

  /**
   * Accept a team invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: { team: { include: { members: true } } },
    });

    if (!invitation) {
      throw AppError.notFound("Invitation not found");
    }

    if (invitation.acceptedAt) {
      throw AppError.badRequest("Invitation already accepted");
    }

    if (invitation.expiresAt < new Date()) {
      throw AppError.badRequest("Invitation has expired");
    }

    // Verify user email matches invitation
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw AppError.forbidden("Invitation is for a different email");
    }

    // Check license count
    if (invitation.team.members.length >= invitation.team.licenseCount) {
      throw AppError.badRequest("Team license limit reached");
    }

    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: "member",
        },
      }),
      prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
  }

  /**
   * Remove a member from the team
   */
  async removeMember(
    teamId: string,
    adminId: string,
    memberId: string,
  ): Promise<void> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can remove members");
    }

    if (memberId === adminId) {
      throw AppError.badRequest("Cannot remove yourself as admin");
    }

    await prisma.teamMember.deleteMany({
      where: { teamId, userId: memberId },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    adminId: string,
    memberId: string,
    role: TeamRole,
  ): Promise<void> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can update roles");
    }

    await prisma.teamMember.updateMany({
      where: { teamId, userId: memberId },
      data: { role },
    });
  }

  /**
   * Get team dashboard
   */
  async getTeamDashboard(
    teamId: string,
    userId: string,
  ): Promise<TeamDashboardResponse> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: true },
        },
        alerts: {
          where: { acknowledged: false },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!team) {
      throw AppError.notFound("Team not found");
    }

    // Verify user is a member
    const isMember = team.members.some(
      (m: { userId: string }) => m.userId === userId,
    );
    if (!isMember) {
      throw AppError.forbidden("Not a team member");
    }

    // Calculate member stats
    const memberStats: MemberStatsResponse[] = await Promise.all(
      team.members.map(async (member: (typeof team.members)[0]) => {
        const [progress, lastActivity] = await Promise.all([
          this.getMemberStudyProgress(member.userId),
          this.getLastActivity(member.userId),
        ]);

        return {
          memberId: member.id,
          userId: member.userId,
          userName: member.user.name,
          progress,
          readinessScore: progress, // Simplified
          lastActiveDate: lastActivity,
          studyStreak: 0, // Would calculate from activities
        };
      }),
    );

    // Calculate team averages
    const activeMembers = memberStats.filter((m) => m.progress > 0);
    const avgProgress =
      activeMembers.length > 0
        ? Math.round(
            activeMembers.reduce(
              (sum: number, m: MemberStatsResponse) => sum + m.progress,
              0,
            ) / activeMembers.length,
          )
        : 0;

    return {
      teamId: team.id,
      teamName: team.name,
      totalMembers: team.members.length,
      activeMembers: activeMembers.length,
      averageProgress: avgProgress,
      averageReadinessScore: avgProgress,
      memberStats,
      alerts: team.alerts.map(
        (a): TeamAlertResponse => ({
          id: a.id,
          type: a.type as TeamAlertType,
          message: a.message,
          memberId: a.memberId,
          memberName: a.memberName,
          createdAt: a.createdAt,
          acknowledged: a.acknowledged,
        }),
      ),
    };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.teamAlert.findUnique({
      where: { id: alertId },
      include: { team: true },
    });

    if (!alert || alert.team.adminId !== userId) {
      throw AppError.forbidden("Only team admin can acknowledge alerts");
    }

    await prisma.teamAlert.update({
      where: { id: alertId },
      data: { acknowledged: true },
    });
  }

  /**
   * Helper: Get member study progress
   */
  private async getMemberStudyProgress(userId: string): Promise<number> {
    const totalSections = await prisma.studySection.count();
    const completedSections = await prisma.studyProgress.count({
      where: { userId, completed: true },
    });

    return totalSections > 0
      ? Math.round((completedSections / totalSections) * 100)
      : 0;
  }

  /**
   * Helper: Get last activity timestamp
   */
  private async getLastActivity(userId: string): Promise<Date | null> {
    const activity = await prisma.studyActivity.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return activity?.createdAt || null;
  }

  /**
   * Helper: Map Prisma team to response type
   */
  private mapTeam(team: {
    id: string;
    name: string;
    adminId: string;
    licenseCount: number;
    createdAt: Date;
    members: Array<{
      id: string;
      userId: string;
      teamId: string;
      role: string;
      joinedAt: Date;
      user: { id: string; name: string; email: string };
    }>;
  }): TeamResponse {
    return {
      id: team.id,
      name: team.name,
      adminId: team.adminId,
      licenseCount: team.licenseCount,
      members: team.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        teamId: m.teamId,
        role: m.role as TeamRole,
        joinedAt: m.joinedAt,
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
        },
      })),
      createdAt: team.createdAt,
    };
  }

  /**
   * Create a team goal
   */
  async createGoal(
    teamId: string,
    adminId: string,
    data: { type: string; target: number; deadline: Date },
  ): Promise<{ id: string; type: string; target: number; deadline: Date }> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can create goals");
    }

    const goal = await prisma.teamGoal.create({
      data: {
        teamId,
        type: data.type,
        target: data.target,
        deadline: data.deadline,
      },
    });

    return {
      id: goal.id,
      type: goal.type,
      target: goal.target,
      deadline: goal.deadline,
    };
  }

  /**
   * Get team goals with progress
   */
  async getGoals(
    teamId: string,
    userId: string,
  ): Promise<
    Array<{
      id: string;
      type: string;
      target: number;
      deadline: Date;
      currentProgress: number;
      isComplete: boolean;
    }>
  > {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, goals: true },
    });

    if (!team) {
      throw AppError.notFound("Team not found");
    }

    const isMember = team.members.some(
      (m: { userId: string }) => m.userId === userId,
    );
    if (!isMember) {
      throw AppError.forbidden("Not a team member");
    }

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      team.goals.map(async (goal: (typeof team.goals)[0]) => {
        const progress = await this.calculateGoalProgress(
          team.id,
          goal.type,
          team.members.length,
        );
        return {
          id: goal.id,
          type: goal.type,
          target: goal.target,
          deadline: goal.deadline,
          currentProgress: progress,
          isComplete: progress >= goal.target,
        };
      }),
    );

    return goalsWithProgress;
  }

  /**
   * Delete a team goal
   */
  async deleteGoal(
    teamId: string,
    adminId: string,
    goalId: string,
  ): Promise<void> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can delete goals");
    }

    await prisma.teamGoal.delete({
      where: { id: goalId },
    });
  }

  /**
   * Remove member with data preservation (11.5)
   * Removes access but preserves historical data
   */
  async removeMemberWithDataPreservation(
    teamId: string,
    adminId: string,
    memberId: string,
  ): Promise<{ preserved: boolean; message: string }> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can remove members");
    }

    if (memberId === adminId) {
      throw AppError.badRequest("Cannot remove yourself as admin");
    }

    // Get member info before removal
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId: memberId },
      include: { user: true },
    });

    if (!member) {
      throw AppError.notFound("Member not found");
    }

    // Store historical record before removal
    await prisma.$transaction([
      // Remove team membership but keep user data intact
      prisma.teamMember.deleteMany({
        where: { teamId, userId: memberId },
      }),
      // Create an alert for admin about removal
      prisma.teamAlert.create({
        data: {
          teamId,
          memberId,
          memberName: member.user.name,
          type: "inactive",
          message: `${member.user.name} was removed from the team. Historical data preserved.`,
        },
      }),
    ]);

    return {
      preserved: true,
      message: `Member ${member.user.name} removed. Historical progress data preserved for reporting.`,
    };
  }

  /**
   * Generate team progress report (11.7)
   */
  async generateReport(
    teamId: string,
    adminId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      format?: "json" | "csv";
    } = {},
  ): Promise<{
    teamId: string;
    teamName: string;
    generatedAt: Date;
    period: { start: Date; end: Date };
    summary: {
      totalMembers: number;
      activeMembers: number;
      averageProgress: number;
      totalStudyHours: number;
      goalsCompleted: number;
      goalsTotal: number;
    };
    memberDetails: Array<{
      userId: string;
      userName: string;
      progress: number;
      studyHours: number;
      questionsAnswered: number;
      accuracy: number;
      lastActiveDate: Date | null;
    }>;
    csvData?: string;
  }> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { user: true } },
        goals: true,
      },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden("Only team admin can generate reports");
    }

    const endDate = options.endDate || new Date();
    const startDate =
      options.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get member details
    const memberDetails = await Promise.all(
      team.members.map(async (member) => {
        const [progress, studyStats, practiceStats, lastActivity] =
          await Promise.all([
            this.getMemberStudyProgress(member.userId),
            this.getMemberStudyStats(member.userId, startDate, endDate),
            this.getMemberPracticeStats(member.userId, startDate, endDate),
            this.getLastActivity(member.userId),
          ]);

        return {
          userId: member.userId,
          userName: member.user.name,
          progress,
          studyHours: Math.round((studyStats.totalMinutes / 60) * 10) / 10,
          questionsAnswered: practiceStats.total,
          accuracy: practiceStats.accuracy,
          lastActiveDate: lastActivity,
        };
      }),
    );

    // Calculate summary
    const activeMembers = memberDetails.filter(
      (m) => m.progress > 0 || m.questionsAnswered > 0,
    );
    const totalStudyHours = memberDetails.reduce(
      (sum, m) => sum + m.studyHours,
      0,
    );
    const avgProgress =
      memberDetails.length > 0
        ? Math.round(
            memberDetails.reduce(
              (sum: number, m: (typeof memberDetails)[0]) => sum + m.progress,
              0,
            ) / memberDetails.length,
          )
        : 0;

    // Calculate goal completion
    const goalsWithProgress = await Promise.all(
      team.goals.map(async (goal) => {
        const progress = await this.calculateGoalProgress(
          team.id,
          goal.type,
          team.members.length,
        );
        return progress >= goal.target;
      }),
    );
    const goalsCompleted = goalsWithProgress.filter(Boolean).length;

    const report = {
      teamId,
      teamName: team.name,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      summary: {
        totalMembers: team.members.length,
        activeMembers: activeMembers.length,
        averageProgress: avgProgress,
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
        goalsCompleted,
        goalsTotal: team.goals.length,
      },
      memberDetails,
      csvData: undefined as string | undefined,
    };

    // Generate CSV if requested
    if (options.format === "csv") {
      const headers = [
        "User ID",
        "Name",
        "Progress %",
        "Study Hours",
        "Questions",
        "Accuracy %",
        "Last Active",
      ];
      const rows = memberDetails.map((m) => [
        m.userId,
        m.userName,
        m.progress.toString(),
        m.studyHours.toString(),
        m.questionsAnswered.toString(),
        m.accuracy.toString(),
        m.lastActiveDate?.toISOString() || "N/A",
      ]);
      report.csvData = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
    }

    return report;
  }

  /**
   * Helper: Calculate goal progress
   */
  private async calculateGoalProgress(
    teamId: string,
    goalType: string,
    memberCount: number,
  ): Promise<number> {
    switch (goalType) {
      case "completion": {
        // Average completion percentage across members
        const members = await prisma.teamMember.findMany({
          where: { teamId },
          select: { userId: true },
        });
        const progresses = await Promise.all(
          members.map((m: (typeof members)[0]) =>
            this.getMemberStudyProgress(m.userId),
          ),
        );
        return Math.round(
          progresses.reduce((sum: number, p: number) => sum + p, 0) /
            memberCount,
        );
      }
      case "accuracy": {
        // Average practice accuracy
        const members = await prisma.teamMember.findMany({
          where: { teamId },
          select: { userId: true },
        });
        const stats = await Promise.all(
          members.map((m: (typeof members)[0]) =>
            this.getMemberPracticeStats(m.userId),
          ),
        );
        const validStats = stats.filter((s: (typeof stats)[0]) => s.total > 0);
        return validStats.length > 0
          ? Math.round(
              validStats.reduce(
                (sum: number, s: (typeof stats)[0]) => sum + s.accuracy,
                0,
              ) / validStats.length,
            )
          : 0;
      }
      case "study_time": {
        // Total study hours
        const members = await prisma.teamMember.findMany({
          where: { teamId },
          select: { userId: true },
        });
        const stats = await Promise.all(
          members.map((m: (typeof members)[0]) =>
            this.getMemberStudyStats(m.userId),
          ),
        );
        return Math.round(
          stats.reduce(
            (sum: number, s: (typeof stats)[0]) => sum + s.totalMinutes,
            0,
          ) / 60,
        );
      }
      default:
        return 0;
    }
  }

  /**
   * Helper: Get member study stats
   */
  private async getMemberStudyStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ totalMinutes: number; sessions: number }> {
    const where: any = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const activities = await prisma.studyActivity.findMany({
      where,
      select: { durationMs: true },
    });

    const totalMs = activities.reduce((sum, a) => sum + a.durationMs, 0);
    return {
      totalMinutes: Math.round(totalMs / 60000),
      sessions: activities.length,
    };
  }

  /**
   * Helper: Get member practice stats
   */
  private async getMemberPracticeStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ total: number; correct: number; accuracy: number }> {
    const where: any = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const attempts = await prisma.questionAttempt.findMany({
      where,
      select: { isCorrect: true },
    });

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }
}

export const teamService = new TeamService();
