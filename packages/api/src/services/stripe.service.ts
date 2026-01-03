import Stripe from "stripe";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import prisma from "../config/database";
import { subscriptionService } from "./subscription.service";

const stripe = new Stripe(env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as const,
});

export class StripeService {
  /**
   * Create a Stripe Checkout Session for a subscription tier
   */
  async createCheckoutSession(
    userId: string,
    tierId: string,
    tierName: string,
    price: number,
    billingPeriod: "monthly" | "annual",
    quantity: number = 1,
  ): Promise<{ sessionId: string; url: string | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `PMP Study Pro - ${tierName}`,
              description: `${tierName} tier (${billingPeriod} billing)${quantity > 1 ? ` - ${quantity} seats` : ""}`,
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: billingPeriod === "annual" ? "year" : "month",
            },
          },
          quantity: quantity,
        },
      ],
      mode: "subscription",
      success_url: `${env.CORS_ORIGIN[0]}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CORS_ORIGIN[0]}/checkout/cancel`,
      customer_email: user.email,
      metadata: {
        userId,
        tierId,
        quantity: quantity.toString(),
      },
    });

    logger.info(
      `Stripe Checkout Session created: ${session.id} for user ${userId} (${quantity} seats)`,
    );

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Handle Stripe Webhook Events
   */
  async handleWebhook(body: string, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET || "",
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error(
        `Stripe Webhook signature verification failed: ${errorMessage}`,
      );
      throw new Error(`Webhook Error: ${errorMessage}`);
    }

    logger.info(`Processing Stripe Webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaymentSucceeded(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        logger.debug(`Unhandled event type ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const tierId = session.metadata?.tierId;

    if (!userId || !tierId) {
      logger.error(`Stripe Session missing metadata: ${session.id}`);
      return;
    }

    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    // Update user subscription
    await prisma.userSubscription.upsert({
      where: { userId },
      update: {
        tierId,
        status: "active",
        stripeCustomerId,
        stripeSubscriptionId,
        startDate: new Date(),
        // End date will be handled by subscription updated/invoice events
        // but we set initial one here
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId,
        tierId,
        status: "active",
        stripeCustomerId,
        stripeSubscriptionId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Record transaction
    await prisma.paymentTransaction.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || "USD",
        status: "completed",
        tierId,
        billingPeriod: "monthly", // We should properly get this from metadata or price_data
      },
    });

    logger.info(`Subscription activated for user ${userId} via Stripe`);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );
    const userId = subscription.metadata.userId;

    if (!userId) return;

    // Extend subscription end date
    await prisma.userSubscription.update({
      where: { userId },
      data: {
        status: "active",
        endDate: new Date(subscription.current_period_end * 1000),
      },
    });

    logger.info(
      `Subscription renewed for user ${userId} until ${new Date(subscription.current_period_end * 1000)}`,
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) return;

    await subscriptionService.expireSubscription(userId);
    logger.info(`Subscription expired/deleted for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) return;

    if (subscription.cancel_at_period_end) {
      await prisma.userSubscription.update({
        where: { userId },
        data: { status: "cancelled" },
      });
      logger.info(
        `Subscription set to cancel at period end for user ${userId}`,
      );
    } else {
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          status: "active",
          endDate: new Date(subscription.current_period_end * 1000),
        },
      });
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return;
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info(
      `Cancelled Stripe subscription ${subscription.stripeSubscriptionId} for user ${userId}`,
    );
  }

  /**
   * Create a Stripe Customer Portal session for subscription management
   */
  async createBillingPortalSession(userId: string): Promise<{ url: string }> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error("No Stripe customer found for this user");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.CORS_ORIGIN[0]}/dashboard`,
    });

    logger.info(
      `Stripe Billing Portal created for customer: ${subscription.stripeCustomerId}`,
    );

    return {
      url: session.url,
    };
  }
}

export const stripeService = new StripeService();
