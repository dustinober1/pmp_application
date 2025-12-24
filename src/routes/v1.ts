/**
 * API Version 1 Routes
 *
 * All API routes are versioned under /api/v1/*
 * This allows for future API changes without breaking existing clients.
 *
 * Versioning Strategy:
 * - /api/v1/* - Current stable API (v1)
 * - /api/* - Alias to latest version (currently v1)
 * - Future versions: /api/v2/*, etc.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

// Import route modules
import questionRoutes from './questions';
import flashcardRoutes from './flashcards';
import practiceRoutes from './practice';
import authRoutes from './auth';
import progressRoutes from './progress';
import adminRoutes from './admin';

const router = Router();

// =============================================================================
// Observability Middleware
// =============================================================================
import { observability } from '../services/observability';

router.use((req, res, next) => {
  observability.trackApiVersion('v1');
  next();
});

// =============================================================================
// Rate Limiters
// =============================================================================
const isProd = process.env.NODE_ENV === 'production';

// Stricter rate limiter for auth endpoints (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 10 : 100, // 10 attempts in production, 100 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: false,
});

// =============================================================================
// API Routes
// =============================================================================

// Authentication routes
router.use('/auth', authLimiter, authRoutes);

// Question management
router.use('/questions', questionRoutes);

// Flashcard routes
router.use('/flashcards', flashcardRoutes);

// Practice test routes
router.use('/practice', practiceRoutes);

// User progress tracking
router.use('/progress', progressRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// =============================================================================
// API Info Endpoint
// =============================================================================
router.get('/', (req, res) => {
  res.json({
    name: 'PMP Application API',
    version: 'v1',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      questions: '/api/v1/questions',
      flashcards: '/api/v1/flashcards',
      practice: '/api/v1/practice',
      progress: '/api/v1/progress',
      admin: '/api/v1/admin',
    },
  });
});

export default router;
