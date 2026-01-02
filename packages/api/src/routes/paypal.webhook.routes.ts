import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import express from 'express';
import { paypalService } from '../services/paypal.service';
import { subscriptionService } from '../services/subscription.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

// PayPal webhook requires raw body for signature verification
router.use(express.raw({ type: 'application/json' }));

interface PayPalWebhookEvent {
    id: string;
    event_type: string;
    resource: {
        id: string;
        status: string;
        supplementary_data?: {
            related_ids?: {
                order_id?: string;
            };
        };
        custom_id?: string;
    };
}

/**
 * POST /api/webhooks/paypal
 * Handle PayPal webhook events
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookId = env.PAYPAL_WEBHOOK_ID;

        if (!webhookId) {
            logger.warn('PAYPAL_WEBHOOK_ID not configured - skipping signature verification');
        } else {
            // Verify webhook signature
            const isValid = await paypalService.verifyWebhookSignature(
                webhookId,
                {
                    'paypal-auth-algo': req.headers['paypal-auth-algo'] as string,
                    'paypal-cert-url': req.headers['paypal-cert-url'] as string,
                    'paypal-transmission-id': req.headers['paypal-transmission-id'] as string,
                    'paypal-transmission-sig': req.headers['paypal-transmission-sig'] as string,
                    'paypal-transmission-time': req.headers['paypal-transmission-time'] as string,
                },
                req.body.toString()
            );

            if (!isValid) {
                logger.error('Invalid PayPal webhook signature');
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
        }

        const event = JSON.parse(req.body.toString()) as PayPalWebhookEvent;

        logger.info(`PayPal webhook received: ${event.event_type} (${event.id})`);

        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                // Payment was successfully captured
                logger.info(`Payment captured: ${event.resource.id}`);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
            case 'PAYMENT.CAPTURE.REFUNDED':
                // Payment failed or was refunded - could trigger subscription cancellation
                logger.warn(`Payment issue: ${event.event_type} for ${event.resource.id}`);
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                // Handle subscription billing events if using PayPal subscriptions
                const customId = event.resource.custom_id;
                if (customId) {
                    try {
                        await subscriptionService.cancelSubscription(customId);
                        logger.info(`Subscription cancelled for user: ${customId}`);
                    } catch (error) {
                        logger.error(`Failed to cancel subscription for ${customId}: ${error}`);
                    }
                }
                break;

            default:
                logger.info(`Unhandled webhook event type: ${event.event_type}`);
        }

        // Always acknowledge receipt
        res.status(200).json({ received: true });
    } catch (error) {
        logger.error(`Webhook processing error: ${error}`);
        next(error);
    }
});

export default router;
