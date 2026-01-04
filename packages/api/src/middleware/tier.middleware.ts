import type { FastifyRequest, FastifyReply } from "fastify";
import type { TierName, TierFeatures } from "@pmp/shared";
import { TIER_HIERARCHY, SUBSCRIPTION_ERRORS } from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "./error.middleware";

type ExpressRequest = any;
type ExpressResponse = any;
type ExpressNext = any;

async function checkTier(
  _request: ExpressRequest | FastifyRequest,
  userId: string,
  minimumTier: TierName,
): Promise<void> {
  if (!userId) {
    throw AppError.unauthorized();
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { tier: true },
  });

  const userTierName = (subscription?.tier?.name as TierName) || "free";
  const userTierLevel = TIER_HIERARCHY[userTierName];
  const requiredTierLevel = TIER_HIERARCHY[minimumTier];

  if (userTierLevel < requiredTierLevel) {
    throw AppError.forbidden(
      SUBSCRIPTION_ERRORS.SUB_003.message,
      SUBSCRIPTION_ERRORS.SUB_003.code,
      `Upgrade to ${minimumTier} tier or higher to access this feature`,
    );
  }
}

async function checkFeature(
  _request: ExpressRequest | FastifyRequest,
  userId: string,
  feature: keyof TierFeatures,
): Promise<void> {
  if (!userId) {
    throw AppError.unauthorized();
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { tier: true },
  });

  if (
    subscription &&
    subscription.status !== "active" &&
    subscription.status !== "grace_period"
  ) {
    throw AppError.forbidden(
      SUBSCRIPTION_ERRORS.SUB_004.message,
      SUBSCRIPTION_ERRORS.SUB_004.code,
      "Please renew your subscription to access this feature",
    );
  }

  const features =
    (subscription?.tier?.features as unknown as TierFeatures) ||
    ({} as TierFeatures);
  const featureValue = features[feature];

  if (typeof featureValue === "boolean" && !featureValue) {
    throw AppError.forbidden(
      SUBSCRIPTION_ERRORS.SUB_003.message,
      SUBSCRIPTION_ERRORS.SUB_003.code,
      "Upgrade your subscription to access this feature",
    );
  }
}

export function requireTier(minimumTier: TierName) {
  const middleware = async (
    req: ExpressRequest | FastifyRequest,
    _res: ExpressResponse | FastifyReply,
    next: ExpressNext,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      await checkTier(req, userId, minimumTier);
      if (next) next();
    } catch (error) {
      if (next) next(error);
      throw error;
    }
  };
  return middleware;
}

export function requireFeature(feature: keyof TierFeatures) {
  const middleware = async (
    req: ExpressRequest | FastifyRequest,
    _res: ExpressResponse | FastifyReply,
    next: ExpressNext,
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      await checkFeature(req, userId, feature);
      if (next) next();
    } catch (error) {
      if (next) next(error);
      throw error;
    }
  };
  return middleware;
}

export { checkTier, checkFeature };
