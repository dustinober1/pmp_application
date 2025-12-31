import { Router, Request, Response, NextFunction } from 'express';
import { formulaService } from '../services/formula.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/tier.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const formulaIdSchema = z.object({
  id: z.string().uuid('Invalid formula ID'),
});

const categoryQuerySchema = z.object({
  category: z.enum(['earned_value', 'scheduling', 'cost', 'communication', 'other']).optional(),
});

const calculateSchema = z.object({
  inputs: z.record(z.string(), z.number()),
});

/**
 * GET /api/formulas
 * Get all formulas (optionally filtered by category)
 */
router.get(
  '/',
  authMiddleware,
  validateQuery(categoryQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query.category as string | undefined;
      const formulas = await formulaService.getFormulas(category as FormulaCategory);

      res.json({
        success: true,
        data: { formulas, count: formulas.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/formulas/variables
 * Get EVM variable definitions
 */
router.get('/variables', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const variables = formulaService.getEVMVariables();

    res.json({
      success: true,
      data: { variables },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/formulas/:id
 * Get a formula by ID
 */
router.get(
  '/:id',
  authMiddleware,
  validateParams(formulaIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const formula = await formulaService.getFormulaById(req.params.id!);

      if (!formula) {
        res.status(404).json({
          success: false,
          error: { code: 'FORMULA_001', message: 'Formula not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: { formula },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/formulas/:id/questions
 * Get practice questions related to a formula
 */
router.get(
  '/:id/questions',
  authMiddleware,
  validateParams(formulaIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10;
      const questionIds = await formulaService.getRelatedQuestions(req.params.id!, limit);

      res.json({
        success: true,
        data: { questionIds, count: questionIds.length },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/formulas/:id/calculate
 * Calculate a formula with given inputs (High-End/Corporate tier)
 */
router.post(
  '/:id/calculate',
  authMiddleware,
  requireFeature('formulaCalculator'),
  validateParams(formulaIdSchema),
  validateBody(calculateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await formulaService.calculateFormula(req.params.id!, req.body.inputs);

      res.json({
        success: true,
        data: { result },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
