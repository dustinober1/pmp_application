import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { subscriptionService } from '../services/subscription.service';
// import { paypalService } from '../services/paypal.service';
import { stripeService } from '../services/stripe.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createSubscriptionSchema = z.object({
  tierId: z.string().uuid('Invalid tier ID'),
  quantity: z.number().int().min(1).optional().default(1),
});

// const activateSubscriptionSchema = z.object({
//   paypalOrderId: z.string().min(1, 'PayPal order ID is required'),
//   tierId: z.string().uuid('Tier ID is required'),
// });

/**
 * GET /api/subscriptions/tiers
 * Get all available subscription tiers
 */
router.get('/tiers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tiers = await subscriptionService.getTiers();
    res.json({
      success: true,
      data: { tiers },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subscriptions/current
 * Get current user's subscription
 */
router.get('/current', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(req.user!.userId);
    res.json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subscriptions/features
 * Get current user's feature limits
 */
router.get('/features', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const features = await subscriptionService.getUsageLimits(req.user!.userId);
    res.json({
      success: true,
      data: { features },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/subscriptions/create
 * Create a subscription (for free tier or to initiate upgrade)
 * For paid tiers, we now use the Stripe checkout flow (/stripe/checkout)
 */
router.post(
  '/create',
  authMiddleware,
  validateBody(createSubscriptionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tier = await subscriptionService.getTierById(req.body.tierId);

      if (!tier) {
        res.status(400).json({
          success: false,
          error: { code: 'SUB_002', message: 'Invalid tier ID' },
        });
        return;
      }

      // For free tier, activate immediately
      if (tier.price === 0) {
        const subscription = await subscriptionService.createSubscription(
          req.user!.userId,
          req.body.tierId
        );
        res.status(201).json({
          success: true,
          data: { subscription },
          message: 'Subscription activated',
        });
        return;
      }

      // Paid tiers must use Stripe Checkout
      res.status(400).json({
        success: false,
        message: 'Please use /stripe/checkout for paid subscriptions',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/subscriptions/stripe/checkout
 * Create a Stripe Checkout session
 */
router.post(
  '/stripe/checkout',
  authMiddleware,
  validateBody(createSubscriptionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tier = await subscriptionService.getTierById(req.body.tierId);

      if (!tier) {
        res.status(400).json({
          success: false,
          error: { code: 'SUB_002', message: 'Invalid tier ID' },
        });
        return;
      }

      if (tier.price === 0) {
        res.status(400).json({
          success: false,
          message: 'Free tier does not require checkout',
        });
        return;
      }

      const { sessionId, url } = await stripeService.createCheckoutSession(
        req.user!.userId,
        tier.id,
        tier.name,
        tier.price,
        tier.billingPeriod,
        req.body.quantity || 1
      );

      res.json({
        success: true,
        data: {
          sessionId,
          checkoutUrl: url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Route removed as we no longer use PayPal order activation
// router.post(
//   '/activate',
//   authMiddleware,
//   validateBody(activateSubscriptionSchema),
//   async (req: Request, res: Response, next: NextFunction) => { ... }
// );

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post('/cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await subscriptionService.cancelSubscription(req.user!.userId);
    res.json({
      success: true,
      message: 'Subscription cancelled. Access will continue until the end of your billing period.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/subscriptions/check-expiry
 * Trigger expiry check (Cron job endpoint)
 */
router.post('/check-expiry', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await subscriptionService.checkSubscriptionExpiry();
    res.json({
      success: true,
      data: result,
      message: `Processed ${result.processed} subscriptions. ${result.expired} expired.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/subscriptions/stripe/portal
 * Create a Stripe Customer Portal session
 */
router.post(
  '/stripe/portal',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = await stripeService.createBillingPortalSession(req.user!.userId);
      res.json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
