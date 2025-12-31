/**
 * Comprehensive integration tests for team.routes
 */

jest.mock('../services/team.service');
jest.mock('../middleware/auth.middleware');
jest.mock('../middleware/tier.middleware', () => ({
    requireTier: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

import request from 'supertest';
import express, { Express } from 'express';
import teamRoutes from './team.routes';
import { teamService } from '../services/team.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

let app: Express;
const mockUserId = 'user-123';
const mockTeamId = '123e4567-e89b-12d3-a456-426614174000';
const mockGoalId = '123e4567-e89b-12d3-a456-426614174001';
const mockMemberId = '123e4567-e89b-12d3-a456-426614174002';
const mockAlertId = '123e4567-e89b-12d3-a456-426614174003';

beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/teams', teamRoutes);
    app.use(errorHandler);

    jest.clearAllMocks();

    (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
        req.user = { userId: mockUserId, email: 'test@example.com' };
        next();
    });
});

describe('Team Routes', () => {
    describe('GET /api/teams', () => {
        it('should get user teams', async () => {
            (teamService.getUserTeams as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get('/api/teams');
            expect(response.status).toBe(200);
            expect(teamService.getUserTeams).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe('POST /api/teams', () => {
        it('should create a team with valid data', async () => {
            const mockTeam = { id: mockTeamId, name: 'New Team' };
            (teamService.createTeam as jest.Mock).mockResolvedValue(mockTeam);

            const response = await request(app).post('/api/teams').send({ name: 'New Team', licenseCount: 20 });

            expect(response.status).toBe(201);
            expect(response.body.data.team).toEqual(mockTeam);
            expect(teamService.createTeam).toHaveBeenCalledWith(mockUserId, { name: 'New Team', licenseCount: 20 });
        });

        it('should fail validation for invalid name', async () => {
            const response = await request(app).post('/api/teams').send({ name: 'A' });
            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/teams/:id', () => {
        it('should get team by id', async () => {
            const mockTeam = { id: mockTeamId, name: 'Team A' };
            (teamService.getTeam as jest.Mock).mockResolvedValue(mockTeam);

            const response = await request(app).get(`/api/teams/${mockTeamId}`);
            expect(response.status).toBe(200);
            expect(response.body.data.team).toEqual(mockTeam);
        });

        it('should return 404 if team not found', async () => {
            (teamService.getTeam as jest.Mock).mockResolvedValue(null);
            const response = await request(app).get(`/api/teams/${mockTeamId}`);
            expect(response.status).toBe(404);
        });

        it('should validate uuid params', async () => {
            const response = await request(app).get(`/api/teams/invalid-uuid`);
            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/teams/:id/dashboard', () => {
        it('should get team dashboard', async () => {
            (teamService.getTeamDashboard as jest.Mock).mockResolvedValue({});
            const response = await request(app).get(`/api/teams/${mockTeamId}/dashboard`);
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/teams/:id/invitations', () => {
        it('should invite member', async () => {
            (teamService.inviteMember as jest.Mock).mockResolvedValue({ token: 'abc' });
            const response = await request(app).post(`/api/teams/${mockTeamId}/invitations`).send({ email: 'new@example.com' });
            expect(response.status).toBe(201);
            expect(teamService.inviteMember).toHaveBeenCalledWith(mockTeamId, mockUserId, 'new@example.com');
        });

        it('should fail if email is invalid', async () => {
            const response = await request(app).post(`/api/teams/${mockTeamId}/invitations`).send({ email: 'invalid-email' });
            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/teams/invitations/accept', () => {
        it('should accept invitation', async () => {
            (teamService.acceptInvitation as jest.Mock).mockResolvedValue(undefined);
            const response = await request(app).post('/api/teams/invitations/accept').send({ token: 'valid-token' });
            expect(response.status).toBe(200);
            expect(teamService.acceptInvitation).toHaveBeenCalledWith('valid-token', mockUserId);
        });
    });

    describe('DELETE /api/teams/:id/members/:memberId', () => {
        it('should remove member', async () => {
            (teamService.removeMember as jest.Mock).mockResolvedValue(undefined);
            const response = await request(app).delete(`/api/teams/${mockTeamId}/members/${mockMemberId}`);
            expect(response.status).toBe(200);
        });
    });

    describe('PATCH /api/teams/:id/members/:memberId/role', () => {
        it('should update role', async () => {
            (teamService.updateMemberRole as jest.Mock).mockResolvedValue(undefined);
            const response = await request(app).patch(`/api/teams/${mockTeamId}/members/${mockMemberId}/role`).send({ role: 'admin' });
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/teams/:id/alerts/:alertId/acknowledge', () => {
        it('should acknowledge alert', async () => {
            (teamService.acknowledgeAlert as jest.Mock).mockResolvedValue(undefined);
            const response = await request(app).post(`/api/teams/${mockTeamId}/alerts/${mockAlertId}/acknowledge`);
            expect(response.status).toBe(200);
        });
    });

    describe('Goals', () => {
        it('should get goals', async () => {
            (teamService.getGoals as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get(`/api/teams/${mockTeamId}/goals`);
            expect(response.status).toBe(200);
        });

        it('should create goal', async () => {
            const goalData = { type: 'completion', target: 50, deadline: new Date().toISOString() };
            (teamService.createGoal as jest.Mock).mockResolvedValue({});
            const response = await request(app).post(`/api/teams/${mockTeamId}/goals`).send(goalData);
            expect(response.status).toBe(201);
        });

        it('should delete goal', async () => {
            (teamService.deleteGoal as jest.Mock).mockResolvedValue(undefined);
            const response = await request(app).delete(`/api/teams/${mockTeamId}/goals/${mockGoalId}`);
            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /api/teams/:id/members/:memberId/preserve', () => {
        it('should remove member with preservation', async () => {
            (teamService.removeMemberWithDataPreservation as jest.Mock).mockResolvedValue({ message: 'done' });
            const response = await request(app).delete(`/api/teams/${mockTeamId}/members/${mockMemberId}/preserve`);
            expect(response.status).toBe(200);
        });
    });

    describe('Reports', () => {
        it('should generate report in json', async () => {
            (teamService.generateReport as jest.Mock).mockResolvedValue({});
            const response = await request(app).post(`/api/teams/${mockTeamId}/reports`).send({ format: 'json' });
            expect(response.status).toBe(200);
        });

        it('should generate report in csv', async () => {
            (teamService.generateReport as jest.Mock).mockResolvedValue({ csvData: 'col1,col2' });
            const response = await request(app).post(`/api/teams/${mockTeamId}/reports`).send({ format: 'csv' });
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('text/csv; charset=utf-8');
        });

        it('should get quick report via GET', async () => {
            (teamService.generateReport as jest.Mock).mockResolvedValue({});
            const response = await request(app).get(`/api/teams/${mockTeamId}/reports`);
            expect(response.status).toBe(200);
        });
    });
});
