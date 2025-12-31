import { TeamRole, TeamAlertType, CreateTeamInput } from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import crypto from 'crypto';

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
  async createTeam(adminId: string, data: CreateTeamInput): Promise<TeamResponse> {
    // Verify user has corporate subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: adminId },
      include: { tier: true },
    });

    if (!subscription || subscription.tier.name !== 'corporate') {
      throw AppError.forbidden('Corporate subscription required');
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
        role: 'admin',
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
    const isMember = team.members.some(m => m.userId === userId);
    if (!isMember) {
      throw AppError.forbidden('Not a team member');
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

    return memberships.map(m => this.mapTeam(m.team));
  }

  /**
   * Invite a member to the team
   */
  async inviteMember(
    teamId: string,
    adminId: string,
    email: string
  ): Promise<TeamInvitationResponse> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden('Only team admin can invite members');
    }

    // Check license count
    if (team.members.length >= team.licenseCount) {
      throw AppError.badRequest('Team license limit reached');
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
      throw AppError.badRequest('Invitation already sent to this email');
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const isMember = team.members.some(m => m.userId === existingUser.id);
      if (isMember) {
        throw AppError.badRequest('User is already a team member');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
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
      throw AppError.notFound('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw AppError.badRequest('Invitation already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw AppError.badRequest('Invitation has expired');
    }

    // Verify user email matches invitation
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invitation.email) {
      throw AppError.forbidden('Invitation is for a different email');
    }

    // Check license count
    if (invitation.team.members.length >= invitation.team.licenseCount) {
      throw AppError.badRequest('Team license limit reached');
    }

    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: 'member',
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
  async removeMember(teamId: string, adminId: string, memberId: string): Promise<void> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden('Only team admin can remove members');
    }

    if (memberId === adminId) {
      throw AppError.badRequest('Cannot remove yourself as admin');
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
    role: TeamRole
  ): Promise<void> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.adminId !== adminId) {
      throw AppError.forbidden('Only team admin can update roles');
    }

    await prisma.teamMember.updateMany({
      where: { teamId, userId: memberId },
      data: { role },
    });
  }

  /**
   * Get team dashboard
   */
  async getTeamDashboard(teamId: string, userId: string): Promise<TeamDashboardResponse> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: true },
        },
        alerts: {
          where: { acknowledged: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!team) {
      throw AppError.notFound('Team not found');
    }

    // Verify user is a member
    const isMember = team.members.some(m => m.userId === userId);
    if (!isMember) {
      throw AppError.forbidden('Not a team member');
    }

    // Calculate member stats
    const memberStats: MemberStatsResponse[] = await Promise.all(
      team.members.map(async member => {
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
      })
    );

    // Calculate team averages
    const activeMembers = memberStats.filter(m => m.progress > 0);
    const avgProgress =
      activeMembers.length > 0
        ? Math.round(activeMembers.reduce((sum, m) => sum + m.progress, 0) / activeMembers.length)
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
        })
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
      throw AppError.forbidden('Only team admin can acknowledge alerts');
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

    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  }

  /**
   * Helper: Get last activity timestamp
   */
  private async getLastActivity(userId: string): Promise<Date | null> {
    const activity = await prisma.studyActivity.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
      members: team.members.map(m => ({
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
}

export const teamService = new TeamService();
