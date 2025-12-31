import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

// Health check endpoint
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'disconnected',
      },
      error: 'Database connection failed',
    });
  }
});

// Liveness probe
router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

// Readiness probe
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;
