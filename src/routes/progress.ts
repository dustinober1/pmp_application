import { Router } from 'express';
import {
    getDashboard,
    getDomainProgress,
    recordActivity,
    getHistory,
} from '../controllers/progress';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All progress routes require authentication
router.use(authenticateToken);

// Dashboard overview
router.get('/', getDashboard);

// Historical performance data
router.get('/history', getHistory);

// Domain-specific progress
router.get('/domain/:domainId', getDomainProgress);

// Record study activity (updates streak)
router.post('/activity', recordActivity);

export default router;
