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
router.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teams = await teamService.getUserTeams(req.user!.userId);

            res.json({
                success: true,
                data: { teams, count: teams.length },
            });
        } catch (error) {
            next(error);
        }
    }
);

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
            await teamService.removeMember(
                req.params.id!,
                req.user!.userId,
                req.params.memberId!
            );

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
    validateParams(z.object({
        id: z.string().uuid(),
        alertId: z.string().uuid(),
    })),
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

export default router;
