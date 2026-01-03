/**
 * Team Service Tests
 * Comprehensive tests for team management functionality with 100% coverage
 */

import { TeamService } from './team.service';
import type { TeamRole } from '@pmp/shared';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Mock Prisma client
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    userSubscription: {
      findUnique: jest.fn(),
    },
    team: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    teamMember: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
    teamInvitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    teamAlert: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    teamGoal: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    studySection: {
      count: jest.fn(),
    },
    studyProgress: {
      count: jest.fn(),
    },
    studyActivity: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    questionAttempt: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(callback => {
      if (typeof callback === 'function') {
        return callback(prisma);
      }
      return Promise.all(callback);
    }),
  },
}));

// Mock crypto.randomBytes
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-random-token-12345678901234567890'),
  })),
}));

describe('TeamService', () => {
  let teamService: TeamService;

  beforeEach(() => {
    teamService = new TeamService();
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a team successfully with corporate subscription', async () => {
      const adminId = 'admin-123';
      const teamData = { name: 'Engineering Team', licenseCount: 20 };
      const mockSubscription = {
        userId: adminId,
        tier: { name: 'corporate' },
      };
      const mockTeamResponse = {
        id: 'team-123',
        name: teamData.name,
        adminId,
        licenseCount: 20,
        createdAt: new Date(),
        members: [],
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.team.create as jest.Mock).mockResolvedValue(mockTeamResponse);
      (prisma.teamMember.create as jest.Mock).mockResolvedValue({
        id: 'member-123',
        teamId: 'team-123',
        userId: adminId,
        role: 'admin',
        joinedAt: new Date(),
      });

      const result = await teamService.createTeam(adminId, teamData);

      expect(prisma.userSubscription.findUnique).toHaveBeenCalledWith({
        where: { userId: adminId },
        include: { tier: true },
      });
      expect(prisma.team.create).toHaveBeenCalledWith({
        data: {
          name: teamData.name,
          adminId,
          licenseCount: 20,
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
      expect(prisma.teamMember.create).toHaveBeenCalledWith({
        data: {
          teamId: 'team-123',
          userId: adminId,
          role: 'admin',
        },
      });
      expect(result.id).toBe('team-123');
      expect(result.name).toBe(teamData.name);
    });

    it('should use specified license count', async () => {
      const adminId = 'admin-123';
      const teamData = { name: 'Engineering Team', licenseCount: 10 };
      const mockSubscription = {
        userId: adminId,
        tier: { name: 'corporate' },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
      (prisma.team.create as jest.Mock).mockResolvedValue({
        id: 'team-123',
        name: teamData.name,
        adminId,
        licenseCount: 10,
        createdAt: new Date(),
        members: [],
      });
      (prisma.teamMember.create as jest.Mock).mockResolvedValue({});

      await teamService.createTeam(adminId, teamData);

      expect(prisma.team.create).toHaveBeenCalledWith({
        data: {
          name: teamData.name,
          adminId,
          licenseCount: 10,
        },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
    });

    it('should throw forbidden error if user has no subscription', async () => {
      const adminId = 'admin-123';
      const teamData = { name: 'Engineering Team', licenseCount: 10 };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.createTeam(adminId, teamData)).rejects.toThrow(
        AppError.forbidden('Corporate subscription required')
      );
    });

    it('should throw forbidden error if subscription is not corporate tier', async () => {
      const adminId = 'admin-123';
      const teamData = { name: 'Engineering Team', licenseCount: 10 };
      const mockSubscription = {
        userId: adminId,
        tier: { name: 'pro' },
      };

      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

      await expect(teamService.createTeam(adminId, teamData)).rejects.toThrow(
        AppError.forbidden('Corporate subscription required')
      );
    });
  });

  describe('getTeam', () => {
    it('should return team if user is a member', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeamData = {
        id: teamId,
        name: 'Engineering Team',
        adminId: 'admin-123',
        licenseCount: 20,
        createdAt: new Date(),
        members: [
          {
            id: 'member-123',
            userId,
            teamId,
            role: 'member',
            joinedAt: new Date(),
            user: { id: userId, name: 'Test User', email: 'test@example.com' },
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeamData);

      const result = await teamService.getTeam(teamId, userId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(teamId);
      expect(result?.members).toHaveLength(1);
    });

    it('should return null if team not found', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await teamService.getTeam(teamId, userId);

      expect(result).toBeNull();
    });

    it('should throw forbidden error if user is not a member', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeamData = {
        id: teamId,
        name: 'Engineering Team',
        adminId: 'admin-123',
        licenseCount: 20,
        createdAt: new Date(),
        members: [
          {
            id: 'member-456',
            userId: 'other-user',
            teamId,
            role: 'member',
            joinedAt: new Date(),
            user: { id: 'other-user', name: 'Other User', email: 'other@example.com' },
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeamData);

      await expect(teamService.getTeam(teamId, userId)).rejects.toThrow(
        AppError.forbidden('Not a team member')
      );
    });
  });

  describe('getUserTeams', () => {
    it('should return all teams for a user', async () => {
      const userId = 'user-123';
      const mockMemberships = [
        {
          id: 'membership-1',
          userId,
          teamId: 'team-1',
          team: {
            id: 'team-1',
            name: 'Team 1',
            adminId: 'admin-1',
            licenseCount: 10,
            createdAt: new Date(),
            members: [
              {
                id: 'member-1',
                userId,
                teamId: 'team-1',
                role: 'member',
                joinedAt: new Date(),
                user: { id: userId, name: 'Test User', email: 'test@example.com' },
              },
            ],
          },
        },
        {
          id: 'membership-2',
          userId,
          teamId: 'team-2',
          team: {
            id: 'team-2',
            name: 'Team 2',
            adminId: userId,
            licenseCount: 15,
            createdAt: new Date(),
            members: [
              {
                id: 'member-2',
                userId,
                teamId: 'team-2',
                role: 'admin',
                joinedAt: new Date(),
                user: { id: userId, name: 'Test User', email: 'test@example.com' },
              },
            ],
          },
        },
      ];

      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const result = await teamService.getUserTeams(userId);

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe('team-1');
      expect(result[1]!.id).toBe('team-2');
    });

    it('should return empty array if user has no teams', async () => {
      const userId = 'user-123';

      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([]);

      const result = await teamService.getUserTeams(userId);

      expect(result).toEqual([]);
    });
  });

  describe('inviteMember', () => {
    it('should create invitation successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'newmember@example.com';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        licenseCount: 10,
        members: [{ userId: adminId }],
      };
      const mockInvitation = {
        id: 'invitation-123',
        teamId,
        email,
        token: 'mock-random-token-12345678901234567890',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
        createdAt: new Date(),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamInvitation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.teamInvitation.create as jest.Mock).mockResolvedValue(mockInvitation);

      const result = await teamService.inviteMember(teamId, adminId, email);

      expect(result.email).toBe(email);
      expect(result.teamId).toBe(teamId);
      expect(prisma.teamInvitation.create).toHaveBeenCalled();
    });

    it('should throw forbidden error if user is not team admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'newmember@example.com';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
        members: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.inviteMember(teamId, adminId, email)).rejects.toThrow(
        AppError.forbidden('Only team admin can invite members')
      );
    });

    it('should throw forbidden error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'newmember@example.com';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.inviteMember(teamId, adminId, email)).rejects.toThrow(
        AppError.forbidden('Only team admin can invite members')
      );
    });

    it('should throw error if license limit reached', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'newmember@example.com';
      const mockTeam = {
        id: teamId,
        adminId,
        licenseCount: 2,
        members: [{ userId: 'user-1' }, { userId: 'user-2' }],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.inviteMember(teamId, adminId, email)).rejects.toThrow(
        AppError.badRequest('Team license limit reached')
      );
    });

    it('should throw error if invitation already exists', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'newmember@example.com';
      const mockTeam = {
        id: teamId,
        adminId,
        licenseCount: 10,
        members: [{ userId: adminId }],
      };
      const existingInvite = {
        id: 'invite-123',
        teamId,
        email,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamInvitation.findFirst as jest.Mock).mockResolvedValue(existingInvite);

      await expect(teamService.inviteMember(teamId, adminId, email)).rejects.toThrow(
        AppError.badRequest('Invitation already sent to this email')
      );
    });

    it('should throw error if user is already a team member', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'existing@example.com';
      const existingUserId = 'existing-user-123';
      const mockTeam = {
        id: teamId,
        adminId,
        licenseCount: 10,
        members: [{ userId: adminId }, { userId: existingUserId }],
      };
      const existingUser = {
        id: existingUserId,
        email,
        name: 'Existing User',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamInvitation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(teamService.inviteMember(teamId, adminId, email)).rejects.toThrow(
        AppError.badRequest('User is already a team member')
      );
    });

    it('should allow invitation if user exists but is not a member', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const email = 'nonmember@example.com';
      const existingUserId = 'existing-user-123';
      const mockTeam = {
        id: teamId,
        adminId,
        licenseCount: 10,
        members: [{ userId: adminId }],
      };
      const existingUser = {
        id: existingUserId,
        email,
        name: 'Non-Member User',
      };
      const mockInvitation = {
        id: 'invitation-123',
        teamId,
        email,
        token: 'mock-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
        createdAt: new Date(),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamInvitation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (prisma.teamInvitation.create as jest.Mock).mockResolvedValue(mockInvitation);

      const result = await teamService.inviteMember(teamId, adminId, email);

      expect(result.email).toBe(email);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'test@example.com',
        token,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        team: {
          id: 'team-123',
          licenseCount: 10,
          members: [{ userId: 'admin-123' }],
        },
      };
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      await teamService.acceptInvitation(token, userId);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error if invitation not found', async () => {
      const token = 'invalid-token';
      const userId = 'user-123';

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.notFound('Invitation not found')
      );
    });

    it('should throw error if invitation already accepted', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'test@example.com',
        token,
        acceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.badRequest('Invitation already accepted')
      );
    });

    it('should throw error if invitation expired', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'test@example.com',
        token,
        acceptedAt: null,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.badRequest('Invitation has expired')
      );
    });

    it('should throw error if user email does not match invitation', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'invited@example.com',
        token,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        team: { members: [] },
      };
      const mockUser = {
        id: userId,
        email: 'different@example.com',
        name: 'Test User',
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.forbidden('Invitation is for a different email')
      );
    });

    it('should throw error if user not found', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'test@example.com',
        token,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        team: { members: [] },
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.forbidden('Invitation is for a different email')
      );
    });

    it('should throw error if team license limit reached', async () => {
      const token = 'valid-token';
      const userId = 'user-123';
      const mockInvitation = {
        id: 'invitation-123',
        teamId: 'team-123',
        email: 'test@example.com',
        token,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        team: {
          id: 'team-123',
          licenseCount: 2,
          members: [{ userId: 'user-1' }, { userId: 'user-2' }],
        },
      };
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      (prisma.teamInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(teamService.acceptInvitation(token, userId)).rejects.toThrow(
        AppError.badRequest('Team license limit reached')
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await teamService.removeMember(teamId, adminId, memberId);

      expect(prisma.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId, userId: memberId },
      });
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.removeMember(teamId, adminId, memberId)).rejects.toThrow(
        AppError.forbidden('Only team admin can remove members')
      );
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.removeMember(teamId, adminId, memberId)).rejects.toThrow(
        AppError.forbidden('Only team admin can remove members')
      );
    });

    it('should throw error if trying to remove self as admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.removeMember(teamId, adminId, adminId)).rejects.toThrow(
        AppError.badRequest('Cannot remove yourself as admin')
      );
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const newRole: TeamRole = 'admin';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await teamService.updateMemberRole(teamId, adminId, memberId, newRole);

      expect(prisma.teamMember.updateMany).toHaveBeenCalledWith({
        where: { teamId, userId: memberId },
        data: { role: newRole },
      });
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const newRole: TeamRole = 'admin';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(
        teamService.updateMemberRole(teamId, adminId, memberId, newRole)
      ).rejects.toThrow(AppError.forbidden('Only team admin can update roles'));
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const newRole: TeamRole = 'member';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        teamService.updateMemberRole(teamId, adminId, memberId, newRole)
      ).rejects.toThrow(AppError.forbidden('Only team admin can update roles'));
    });
  });

  describe('getTeamDashboard', () => {
    it('should return team dashboard with member stats', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        members: [
          {
            id: 'member-1',
            userId: 'user-123',
            user: { id: 'user-123', name: 'User 1', email: 'user1@example.com' },
          },
          {
            id: 'member-2',
            userId: 'user-456',
            user: { id: 'user-456', name: 'User 2', email: 'user2@example.com' },
          },
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'behind_schedule',
            message: 'Member behind schedule',
            memberId: 'member-2',
            memberName: 'User 2',
            createdAt: new Date(),
            acknowledged: false,
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock)
        .mockResolvedValueOnce(50) // User 1
        .mockResolvedValueOnce(30); // User 2
      (prisma.studyActivity.findFirst as jest.Mock)
        .mockResolvedValueOnce({ createdAt: new Date() })
        .mockResolvedValueOnce({ createdAt: new Date() });

      const result = await teamService.getTeamDashboard(teamId, userId);

      expect(result.teamId).toBe(teamId);
      expect(result.teamName).toBe('Engineering Team');
      expect(result.totalMembers).toBe(2);
      expect(result.memberStats).toHaveLength(2);
      expect(result.alerts).toHaveLength(1);
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.getTeamDashboard(teamId, userId)).rejects.toThrow(
        AppError.notFound('Team not found')
      );
    });

    it('should throw error if user is not a member', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        members: [
          {
            id: 'member-1',
            userId: 'other-user',
            user: { id: 'other-user', name: 'Other User', email: 'other@example.com' },
          },
        ],
        alerts: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.getTeamDashboard(teamId, userId)).rejects.toThrow(
        AppError.forbidden('Not a team member')
      );
    });

    it('should calculate correct averages with no active members', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        members: [
          {
            id: 'member-1',
            userId: 'user-123',
            user: { id: 'user-123', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        alerts: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValue(0);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await teamService.getTeamDashboard(teamId, userId);

      expect(result.activeMembers).toBe(0);
      expect(result.averageProgress).toBe(0);
    });

    it('should handle empty study sections', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        members: [
          {
            id: 'member-1',
            userId: 'user-123',
            user: { id: 'user-123', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        alerts: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(0);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValue(0);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await teamService.getTeamDashboard(teamId, userId);

      expect(result.memberStats[0]!.progress).toBe(0);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge alert successfully', async () => {
      const alertId = 'alert-123';
      const userId = 'admin-123';
      const mockAlert = {
        id: alertId,
        team: { adminId: userId },
      };

      (prisma.teamAlert.findUnique as jest.Mock).mockResolvedValue(mockAlert);
      (prisma.teamAlert.update as jest.Mock).mockResolvedValue({});

      await teamService.acknowledgeAlert(alertId, userId);

      expect(prisma.teamAlert.update).toHaveBeenCalledWith({
        where: { id: alertId },
        data: { acknowledged: true },
      });
    });

    it('should throw error if alert not found', async () => {
      const alertId = 'alert-123';
      const userId = 'admin-123';

      (prisma.teamAlert.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.acknowledgeAlert(alertId, userId)).rejects.toThrow(
        AppError.forbidden('Only team admin can acknowledge alerts')
      );
    });

    it('should throw error if user is not team admin', async () => {
      const alertId = 'alert-123';
      const userId = 'user-123';
      const mockAlert = {
        id: alertId,
        team: { adminId: 'different-admin' },
      };

      (prisma.teamAlert.findUnique as jest.Mock).mockResolvedValue(mockAlert);

      await expect(teamService.acknowledgeAlert(alertId, userId)).rejects.toThrow(
        AppError.forbidden('Only team admin can acknowledge alerts')
      );
    });
  });

  describe('createGoal', () => {
    it('should create goal successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalData = {
        type: 'completion',
        target: 80,
        deadline: new Date('2025-12-31'),
      };
      const mockTeam = {
        id: teamId,
        adminId,
      };
      const mockGoal = {
        id: 'goal-123',
        teamId,
        ...goalData,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamGoal.create as jest.Mock).mockResolvedValue(mockGoal);

      const result = await teamService.createGoal(teamId, adminId, goalData);

      expect(result.id).toBe('goal-123');
      expect(result.type).toBe('completion');
      expect(result.target).toBe(80);
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalData = {
        type: 'completion',
        target: 80,
        deadline: new Date('2025-12-31'),
      };
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.createGoal(teamId, adminId, goalData)).rejects.toThrow(
        AppError.forbidden('Only team admin can create goals')
      );
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalData = {
        type: 'completion',
        target: 80,
        deadline: new Date('2025-12-31'),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.createGoal(teamId, adminId, goalData)).rejects.toThrow(
        AppError.forbidden('Only team admin can create goals')
      );
    });
  });

  describe('getGoals', () => {
    it('should return goals with progress for completion type', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'user-123' }, { userId: 'user-456' }],
        goals: [
          {
            id: 'goal-1',
            type: 'completion',
            target: 80,
            deadline: new Date('2025-12-31'),
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-123' },
        { userId: 'user-456' },
      ]);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValueOnce(80).mockResolvedValueOnce(60);

      const result = await teamService.getGoals(teamId, userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.type).toBe('completion');
      expect(result[0]!.currentProgress).toBe(70); // (80 + 60) / 2
      expect(result[0]!.isComplete).toBe(false);
    });

    it('should return goals with progress for accuracy type', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'user-123' }, { userId: 'user-456' }],
        goals: [
          {
            id: 'goal-1',
            type: 'accuracy',
            target: 85,
            deadline: new Date('2025-12-31'),
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-123' },
        { userId: 'user-456' },
      ]);
      (prisma.questionAttempt.findMany as jest.Mock)
        .mockResolvedValueOnce([
          { isCorrect: true },
          { isCorrect: true },
          { isCorrect: false },
          { isCorrect: true },
        ])
        .mockResolvedValueOnce([{ isCorrect: true }, { isCorrect: true }]);

      const result = await teamService.getGoals(teamId, userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.type).toBe('accuracy');
      expect(result[0]!.currentProgress).toBeGreaterThan(0);
    });

    it('should return goals with progress for study_time type', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'user-123' }],
        goals: [
          {
            id: 'goal-1',
            type: 'study_time',
            target: 100,
            deadline: new Date('2025-12-31'),
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([{ userId: 'user-123' }]);
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([
        { durationMs: 3600000 }, // 60 minutes
        { durationMs: 1800000 }, // 30 minutes
      ]);

      const result = await teamService.getGoals(teamId, userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.type).toBe('study_time');
      expect(result[0]!.currentProgress).toBe(2); // 90 minutes / 60 = 1.5 hours, rounded to 2
    });

    it('should handle unknown goal type', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'user-123' }],
        goals: [
          {
            id: 'goal-1',
            type: 'unknown_type',
            target: 100,
            deadline: new Date('2025-12-31'),
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.getGoals(teamId, userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.currentProgress).toBe(0);
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.getGoals(teamId, userId)).rejects.toThrow(
        AppError.notFound('Team not found')
      );
    });

    it('should throw error if user is not a member', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'other-user' }],
        goals: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.getGoals(teamId, userId)).rejects.toThrow(
        AppError.forbidden('Not a team member')
      );
    });

    it('should handle accuracy calculation with no attempts', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const mockTeam = {
        id: teamId,
        members: [{ userId: 'user-123' }],
        goals: [
          {
            id: 'goal-1',
            type: 'accuracy',
            target: 85,
            deadline: new Date('2025-12-31'),
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([{ userId: 'user-123' }]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);

      const result = await teamService.getGoals(teamId, userId);

      expect(result[0]!.currentProgress).toBe(0);
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalId = 'goal-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamGoal.delete as jest.Mock).mockResolvedValue({});

      await teamService.deleteGoal(teamId, adminId, goalId);

      expect(prisma.teamGoal.delete).toHaveBeenCalledWith({
        where: { id: goalId },
      });
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalId = 'goal-123';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.deleteGoal(teamId, adminId, goalId)).rejects.toThrow(
        AppError.forbidden('Only team admin can delete goals')
      );
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const goalId = 'goal-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.deleteGoal(teamId, adminId, goalId)).rejects.toThrow(
        AppError.forbidden('Only team admin can delete goals')
      );
    });
  });

  describe('removeMemberWithDataPreservation', () => {
    it('should remove member and preserve data', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };
      const mockMember = {
        id: 'membership-123',
        teamId,
        userId: memberId,
        user: { id: memberId, name: 'Test Member', email: 'member@example.com' },
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(mockMember);
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await teamService.removeMemberWithDataPreservation(teamId, adminId, memberId);

      expect(result.preserved).toBe(true);
      expect(result.message).toContain('Test Member');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        teamService.removeMemberWithDataPreservation(teamId, adminId, memberId)
      ).rejects.toThrow(AppError.forbidden('Only team admin can remove members'));
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(
        teamService.removeMemberWithDataPreservation(teamId, adminId, memberId)
      ).rejects.toThrow(AppError.forbidden('Only team admin can remove members'));
    });

    it('should throw error if trying to remove self', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(
        teamService.removeMemberWithDataPreservation(teamId, adminId, adminId)
      ).rejects.toThrow(AppError.badRequest('Cannot remove yourself as admin'));
    });

    it('should throw error if member not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const memberId = 'member-123';
      const mockTeam = {
        id: teamId,
        adminId,
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        teamService.removeMemberWithDataPreservation(teamId, adminId, memberId)
      ).rejects.toThrow(AppError.notFound('Member not found'));
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive team report in JSON format', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        members: [
          {
            userId: 'user-1',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
          {
            userId: 'user-2',
            user: { id: 'user-2', name: 'User 2', email: 'user2@example.com' },
          },
        ],
        goals: [
          {
            id: 'goal-1',
            type: 'completion',
            target: 80,
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(60);
      (prisma.studyActivity.findMany as jest.Mock)
        .mockResolvedValueOnce([{ durationMs: 3600000 }])
        .mockResolvedValueOnce([{ durationMs: 1800000 }]);
      (prisma.questionAttempt.findMany as jest.Mock)
        .mockResolvedValueOnce([{ isCorrect: true }, { isCorrect: true }, { isCorrect: false }])
        .mockResolvedValueOnce([{ isCorrect: true }]);
      (prisma.studyActivity.findFirst as jest.Mock)
        .mockResolvedValueOnce({ createdAt: new Date() })
        .mockResolvedValueOnce({ createdAt: new Date() });
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-1' },
        { userId: 'user-2' },
      ]);

      const result = await teamService.generateReport(teamId, adminId);

      expect(result.teamId).toBe(teamId);
      expect(result.teamName).toBe('Engineering Team');
      expect(result.summary.totalMembers).toBe(2);
      expect(result.memberDetails).toHaveLength(2);
      expect(result.csvData).toBeUndefined();
    });

    it('should generate report with CSV format', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        members: [
          {
            userId: 'user-1',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        goals: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValue(50);
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([{ durationMs: 3600000 }]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([
        { isCorrect: true },
        { isCorrect: false },
      ]);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue({ createdAt: new Date() });

      const result = await teamService.generateReport(teamId, adminId, { format: 'csv' });

      expect(result.csvData).toBeDefined();
      expect(result.csvData).toContain('User ID,Name,Progress %');
    });

    it('should apply date range filter when provided', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        members: [
          {
            userId: 'user-1',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        goals: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValue(50);
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await teamService.generateReport(teamId, adminId, { startDate, endDate });

      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
    });

    it('should throw error if user is not admin', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        adminId: 'different-admin',
        members: [],
        goals: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      await expect(teamService.generateReport(teamId, adminId)).rejects.toThrow(
        AppError.forbidden('Only team admin can generate reports')
      );
    });

    it('should throw error if team not found', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.generateReport(teamId, adminId)).rejects.toThrow(
        AppError.forbidden('Only team admin can generate reports')
      );
    });

    it('should calculate goal completion correctly', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        members: [
          {
            userId: 'user-1',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        goals: [
          {
            id: 'goal-1',
            type: 'completion',
            target: 80,
          },
          {
            id: 'goal-2',
            type: 'completion',
            target: 50,
          },
        ],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock)
        .mockResolvedValueOnce(60) // Member progress
        .mockResolvedValueOnce(60) // Goal 1 progress
        .mockResolvedValueOnce(60); // Goal 2 progress
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.teamMember.findMany as jest.Mock).mockResolvedValue([{ userId: 'user-1' }]);

      const result = await teamService.generateReport(teamId, adminId);

      expect(result.summary.goalsCompleted).toBe(1); // Only goal-2 (target 50, progress 60)
      expect(result.summary.goalsTotal).toBe(2);
    });

    it('should handle missing last activity date', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        adminId,
        members: [
          {
            userId: 'user-1',
            user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          },
        ],
        goals: [],
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prisma.studySection.count as jest.Mock).mockResolvedValue(100);
      (prisma.studyProgress.count as jest.Mock).mockResolvedValue(0);
      (prisma.studyActivity.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.questionAttempt.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.studyActivity.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await teamService.generateReport(teamId, adminId, { format: 'csv' });

      expect(result.csvData).toContain('N/A');
    });
  });
});
