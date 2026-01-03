import Stripe from "stripe";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import prisma from "../config/database";
import { subscriptionService } from "./subscription.service";
import {
  withSpan,
  setExternalApiContext,
  setUserContext,
  setDatabaseContext,
  setBusinessContext,
  recordError,
  addEvent,
} from "../utils/tracing";

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
  ): Promise<{ sessionId: string; url: string | null }> {
    return withSpan("stripe.createCheckoutSession", async (span) => {
      // Add business context
      setBusinessContext(span, {
        feature: "subscription",
        action: "create_checkout",
        tier: tierName,
        billing_period: billingPeriod,
      });

      // Get user with span
      const user = await withSpan(
        "stripe.createCheckoutSession.getUser",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "User",
            operation: "findUnique",
          });

          return prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
          });
        },
      );

      if (!user) {
        throw new Error("User not found");
      }

      setUserContext(span, {
        id: user.id,
        email: user.email,
      });

      addEvent("user_found", { user_id: userId });

      // Create Stripe checkout session with span
      const session = await withSpan(
        "stripe.api.createCheckoutSession",
        async (apiSpan) => {
          setExternalApiContext(apiSpan, {
            name: "Stripe",
            method: "POST",
            url: "https://api.stripe.com/v1/checkout/sessions",
          });

          return stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `PMP Study Pro - ${tierName}`,
                    description: `${tierName} tier (${billingPeriod} billing)`,
                  },
                  unit_amount: Math.round(price * 100),
                  recurring: {
                    interval: billingPeriod === "annual" ? "year" : "month",
                  },
                },
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url: `${env.CORS_ORIGIN[0]}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.CORS_ORIGIN[0]}/checkout/cancel`,
            customer_email: user.email,
            metadata: {
              userId,
              tierId,
            },
          });
        },
      );

      addEvent("checkout_session_created", {
        session_id: session.id,
      });

      logger.info(
        `Stripe Checkout Session created: ${session.id} for user ${userId}`,
      );

      return {
        sessionId: session.id,
        url: session.url,
      };
    });
  }

  /**
   * Handle Stripe Webhook Events
   */
  async handleWebhook(body: string, signature: string): Promise<void> {
    return withSpan("stripe.handleWebhook", async (span) => {
      setBusinessContext(span, {
        feature: "subscription",
        action: "webhook",
      });

      let event: Stripe.Event;

      try {
        event = await withSpan("stripe.webhook.constructEvent", async () => {
          return stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET || "",
          );
        });

        addEvent("webhook_verified", {
          event_type: event.type,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        recordError(err as Error, {
          "webhook.verification_failed": "true",
        });
        logger.error(
          `Stripe Webhook signature verification failed: ${errorMessage}`,
        );
        throw new Error(`Webhook Error: ${errorMessage}`);
      }

      logger.info(`Processing Stripe Webhook event: ${event.type}`);

      span.setAttribute("stripe.event_type", event.type);

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
    });
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    await withSpan("stripe.handleCheckoutCompleted", async (span) => {
      const userId = session.metadata?.userId;
      const tierId = session.metadata?.tierId;

      if (!userId || !tierId) {
        const error = new Error(
          `Stripe Session missing metadata: ${session.id}`,
        );
        recordError(error, {
          "session.id": session.id,
        });
        logger.error(error.message);
        return;
      }

      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;

      span.setAttributes({
        "user.id": userId,
        "tier.id": tierId,
        "stripe.customer_id": stripeCustomerId,
        "stripe.subscription_id": stripeSubscriptionId,
      });

      // Update user subscription
      await withSpan(
        "stripe.handleCheckoutCompleted.upsertSubscription",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "UserSubscription",
            operation: "upsert",
          });

          return prisma.userSubscription.upsert({
            where: { userId },
            update: {
              tierId,
              status: "active",
              stripeCustomerId,
              stripeSubscriptionId,
              startDate: new Date(),
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
        },
      );

      // Record transaction
      await withSpan(
        "stripe.handleCheckoutCompleted.createTransaction",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "PaymentTransaction",
            operation: "create",
          });

          return prisma.paymentTransaction.create({
            data: {
              userId,
              stripeSessionId: session.id,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency || "USD",
              status: "completed",
              tierId,
              billingPeriod: "monthly",
            },
          });
        },
      );

      addEvent("subscription_activated", { user_id: userId });
      logger.info(`Subscription activated for user ${userId} via Stripe`);
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    await withSpan("stripe.handleInvoicePaymentSucceeded", async (span) => {
      if (!invoice.subscription) return;

      const subscription = await withSpan(
        "stripe.handleInvoicePaymentSucceeded.retrieveSubscription",
        async (apiSpan) => {
          setExternalApiContext(apiSpan, {
            name: "Stripe",
            method: "GET",
            url: `https://api.stripe.com/v1/subscriptions/${invoice.subscription}`,
          });

          return stripe.subscriptions.retrieve(invoice.subscription as string);
        },
      );

      const userId = subscription.metadata.userId;

      if (!userId) return;

      span.setAttribute("user.id", userId);

      // Extend subscription end date
      await withSpan(
        "stripe.handleInvoicePaymentSucceeded.updateSubscription",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "UserSubscription",
            operation: "update",
          });

          return prisma.userSubscription.update({
            where: { userId },
            data: {
              status: "active",
              endDate: new Date(subscription.current_period_end * 1000),
            },
          });
        },
      );

      addEvent("subscription_renewed", {
        user_id: userId,
        end_date: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
      });

      logger.info(
        `Subscription renewed for user ${userId} until ${new Date(subscription.current_period_end * 1000)}`,
      );
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await withSpan("stripe.handleSubscriptionDeleted", async (span) => {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      span.setAttribute("user.id", userId);

      await subscriptionService.expireSubscription(userId);

      addEvent("subscription_cancelled", { user_id: userId });
      logger.info(`Subscription expired/deleted for user ${userId}`);
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await withSpan("stripe.handleSubscriptionUpdated", async (span) => {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      span.setAttribute("user.id", userId);
      span.setAttribute(
        "stripe.cancel_at_period_end",
        subscription.cancel_at_period_end,
      );

      if (subscription.cancel_at_period_end) {
        await withSpan(
          "stripe.handleSubscriptionUpdated.markCancelled",
          async (dbSpan) => {
            setDatabaseContext(dbSpan, {
              table: "UserSubscription",
              operation: "update",
            });

            return prisma.userSubscription.update({
              where: { userId },
              data: { status: "cancelled" },
            });
          },
        );

        addEvent("subscription_marked_cancelled", { user_id: userId });
        logger.info(
          `Subscription set to cancel at period end for user ${userId}`,
        );
      } else {
        await withSpan(
          "stripe.handleSubscriptionUpdated.updateActive",
          async (dbSpan) => {
            setDatabaseContext(dbSpan, {
              table: "UserSubscription",
              operation: "update",
            });

            return prisma.userSubscription.update({
              where: { userId },
              data: {
                status: "active",
                endDate: new Date(subscription.current_period_end * 1000),
              },
            });
          },
        );

        addEvent("subscription_reactivated", { user_id: userId });
      }
    });
  }

  async cancelSubscription(userId: string): Promise<void> {
    return withSpan("stripe.cancelSubscription", async (span) => {
      span.setAttribute("user.id", userId);

      const subscription = await withSpan(
        "stripe.cancelSubscription.getSubscription",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "UserSubscription",
            operation: "findUnique",
          });

          return prisma.userSubscription.findUnique({
            where: { userId },
          });
        },
      );

      if (!subscription || !subscription.stripeSubscriptionId) {
        return;
      }

      const stripeSubId = subscription.stripeSubscriptionId;

      await withSpan(
        "stripe.cancelSubscription.updateStripe",
        async (apiSpan) => {
          setExternalApiContext(apiSpan, {
            name: "Stripe",
            method: "POST",
            url: `https://api.stripe.com/v1/subscriptions/${stripeSubId}`,
          });

          return stripe.subscriptions.update(stripeSubId, {
            cancel_at_period_end: true,
          });
        },
      );

      addEvent("subscription_cancel_initiated", { user_id: userId });
      logger.info(
        `Cancelled Stripe subscription ${subscription.stripeSubscriptionId} for user ${userId}`,
      );
    });
  }

  /**
   * Create a Stripe Customer Portal session for subscription management
   */
  async createBillingPortalSession(userId: string): Promise<{ url: string }> {
    return withSpan("stripe.createBillingPortalSession", async (span) => {
      span.setAttribute("user.id", userId);

      const subscription = await withSpan(
        "stripe.createBillingPortalSession.getSubscription",
        async (dbSpan) => {
          setDatabaseContext(dbSpan, {
            table: "UserSubscription",
            operation: "findUnique",
          });

          return prisma.userSubscription.findUnique({
            where: { userId },
          });
        },
      );

      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error("No Stripe customer found for this user");
      }

      const stripeCustomerId = subscription.stripeCustomerId;

      const session = await withSpan(
        "stripe.api.createBillingPortalSession",
        async (apiSpan) => {
          setExternalApiContext(apiSpan, {
            name: "Stripe",
            method: "POST",
            url: "https://api.stripe.com/v1/billing_portal/sessions",
          });

          return stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${env.CORS_ORIGIN[0]}/dashboard`,
          });
        },
      );

      addEvent("billing_portal_created", {
        customer_id: stripeCustomerId,
      });

      logger.info(
        `Stripe Billing Portal created for customer: ${subscription.stripeCustomerId}`,
      );

      return {
        url: session.url,
      };
    });
  }
}

export const stripeService = new StripeService();
