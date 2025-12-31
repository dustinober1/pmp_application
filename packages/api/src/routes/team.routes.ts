import { Router, Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTier } from '../middleware/tier.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  licenseCount: z.number().min(5).max(1000).optional().default(10),
});

const teamIdSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email'),
});

const memberIdSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
  memberId: z.string().uuid('Invalid member ID'),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * All team routes require corporate tier
 */
router.use(authMiddleware, requireTier('corporate'));

/**
 * GET /api/teams
 * Get user's teams
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await teamService.getUserTeams(req.user!.userId);

    res.json({
      success: true,
      data: { teams, count: teams.length },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/teams
 * Create a new team
 */
router.post(
  '/',
  validateBody(createTeamSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await teamService.createTeam(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { team },
        message: 'Team created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/teams/:id
 * Get team by ID
 */
router.get(
  '/:id',
  validateParams(teamIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await teamService.getTeam(req.params.id!, req.user!.userId);

      if (!team) {
        res.status(404).json({
          success: false,
          error: { code: 'TEAM_001', message: 'Team not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/teams/:id/dashboard
 * Get team dashboard
 */
router.get(
  '/:id/dashboard',
  validateParams(teamIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboard = await teamService.getTeamDashboard(req.params.id!, req.user!.userId);

      res.json({
        success: true,
        data: { dashboard },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/teams/:id/invitations
 * Invite a member to the team
 */
router.post(
  '/:id/invitations',
  validateParams(teamIdSchema),
  validateBody(inviteMemberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitation = await teamService.inviteMember(
        req.params.id!,
        req.user!.userId,
        req.body.email
      );

      res.status(201).json({
        success: true,
        data: { invitation },
        message: 'Invitation sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/teams/invitations/accept
 * Accept a team invitation
 */
router.post(
  '/invitations/accept',
  validateBody(acceptInvitationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await teamService.acceptInvitation(req.body.token, req.user!.userId);

      res.json({
        success: true,
        message: 'Invitation accepted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/teams/:id/members/:memberId
 * Remove a member from the team
 */
router.delete(
  '/:id/members/:memberId',
  validateParams(memberIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await teamService.removeMember(req.params.id!, req.user!.userId, req.params.memberId!);

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/teams/:id/members/:memberId/role
 * Update member role
 */
router.patch(
  '/:id/members/:memberId/role',
  validateParams(memberIdSchema),
  validateBody(updateRoleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await teamService.updateMemberRole(
        req.params.id!,
        req.user!.userId,
        req.params.memberId!,
        req.body.role
      );

      res.json({
        success: true,
        message: 'Member role updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/teams/:id/alerts/:alertId/acknowledge
 * Acknowledge an alert
 */
router.post(
  '/:id/alerts/:alertId/acknowledge',
  validateParams(
    z.object({
      id: z.string().uuid(),
      alertId: z.string().uuid(),
    })
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await teamService.acknowledgeAlert(req.params.alertId!, req.user!.userId);

      res.json({
        success: true,
        message: 'Alert acknowledged',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Goal validation schemas
const createGoalSchema = z.object({
  type: z.enum(['completion', 'accuracy', 'study_time']),
  target: z.number().min(1).max(1000),
  deadline: z.string().transform(val => new Date(val)),
});

const goalIdSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
  goalId: z.string().uuid('Invalid goal ID'),
});

/**
 * GET /api/teams/:id/goals
 * Get team goals with progress
 */
router.get(
  '/:id/goals',
  validateParams(teamIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals = await teamService.getGoals(req.params.id!, req.user!.userId);

      res.json({
        success: true,
        data: { goals, count: goals.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/teams/:id/goals
 * Create a new team goal
 */
router.post(
  '/:id/goals',
  validateParams(teamIdSchema),
  validateBody(createGoalSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goal = await teamService.createGoal(req.params.id!, req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: { goal },
        message: 'Goal created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/teams/:id/goals/:goalId
 * Delete a team goal
 */
router.delete(
  '/:id/goals/:goalId',
  validateParams(goalIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await teamService.deleteGoal(req.params.id!, req.user!.userId, req.params.goalId!);

      res.json({
        success: true,
        message: 'Goal deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/teams/:id/members/:memberId/preserve
 * Remove member with data preservation
 */
router.delete(
  '/:id/members/:memberId/preserve',
  validateParams(memberIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await teamService.removeMemberWithDataPreservation(
        req.params.id!,
        req.user!.userId,
        req.params.memberId!
      );

      res.json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Report validation schema
const reportOptionsSchema = z.object({
  startDate: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

/**
 * POST /api/teams/:id/reports
 * Generate a team progress report
 */
router.post(
  '/:id/reports',
  validateParams(teamIdSchema),
  validateBody(reportOptionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await teamService.generateReport(req.params.id!, req.user!.userId, req.body);

      // If CSV format requested, set appropriate headers
      if (req.body.format === 'csv' && report.csvData) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="team-report-${report.teamId}-${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(report.csvData);
        return;
      }

      res.json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/teams/:id/reports
 * Get a quick JSON report (convenience endpoint)
 */
router.get(
  '/:id/reports',
  validateParams(teamIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await teamService.generateReport(req.params.id!, req.user!.userId, {
        format: 'json',
      });

      res.json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
