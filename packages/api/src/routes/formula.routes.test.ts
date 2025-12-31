/**
 * Comprehensive integration tests for formula.routes
 */

jest.mock('../services/formula.service');
jest.mock('../middleware/auth.middleware');
jest.mock('../middleware/tier.middleware', () => ({
    requireFeature: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

import request from 'supertest';
import express, { Express } from 'express';
import formulaRoutes from './formula.routes';
import { formulaService } from '../services/formula.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

let app: Express;
const mockUserId = 'user-123';
const mockFormulaId = '123e4567-e89b-12d3-a456-426614174000';

beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/formulas', formulaRoutes);
    app.use(errorHandler);

    jest.clearAllMocks();

    (authMiddleware as jest.Mock).mockImplementation((req: any, _res: any, next: any) => {
        req.user = { userId: mockUserId, email: 'test@example.com' };
        next();
    });
});

describe('Formula Routes', () => {
    describe('GET /api/formulas', () => {
        it('should get all formulas', async () => {
            (formulaService.getFormulas as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get('/api/formulas');
            expect(response.status).toBe(200);
        });

        it('should filter by category', async () => {
            (formulaService.getFormulas as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get('/api/formulas?category=earned_value');
            expect(response.status).toBe(200);
            expect(formulaService.getFormulas).toHaveBeenCalledWith('earned_value');
        });

        it('should fail with invalid category', async () => {
            const response = await request(app).get('/api/formulas?category=invalid');
            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/formulas/variables', () => {
        it('should get variables (public)', async () => {
            // Note: this route is public in router definition, but mocks are global.
            // However, authMiddleware is not mounted on this specific path in the router file
            // Only router.get('/', authMiddleware...) uses it.
            // router.get('/variables', ...) does NOT use it.
            // So we don't need auth mock for it to succeed logically, but app setup has mocked it.
            // Wait, `router.get('/variables')` is defined BEFORE `router.get('/:id')` which uses auth.
            // It doesn't use authMiddleware.
            (formulaService.getEVMVariables as jest.Mock).mockReturnValue({});
            const response = await request(app).get('/api/formulas/variables');
            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/formulas/:id', () => {
        it('should get formula by id', async () => {
            (formulaService.getFormulaById as jest.Mock).mockResolvedValue({ id: mockFormulaId });
            const response = await request(app).get(`/api/formulas/${mockFormulaId}`);
            expect(response.status).toBe(200);
        });

        it('should return 404 if not found', async () => {
            (formulaService.getFormulaById as jest.Mock).mockResolvedValue(null);
            const response = await request(app).get(`/api/formulas/${mockFormulaId}`);
            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/formulas/:id/questions', () => {
        it('should get related questions', async () => {
            (formulaService.getRelatedQuestions as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get(`/api/formulas/${mockFormulaId}/questions`);
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/formulas/:id/calculate', () => {
        it('should calculate formula', async () => {
            (formulaService.calculateFormula as jest.Mock).mockResolvedValue(42);
            const response = await request(app).post(`/api/formulas/${mockFormulaId}/calculate`).send({ inputs: { a: 1 } });
            expect(response.status).toBe(200);
            expect(response.body.data.result).toBe(42);
        });
    });
});
