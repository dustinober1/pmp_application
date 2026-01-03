import type { Request, Response, NextFunction } from "express";
import type { TierName, TierFeatures } from "@pmp/shared";
import { TIER_HIERARCHY, SUBSCRIPTION_ERRORS } from "@pmp/shared";
import prisma from "../config/database";
import { AppError } from "./error.middleware";

export function requireTier(minimumTier: TierName) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const subscription = await prisma.userSubscription.findUnique({
        where: { userId: req.user.userId },
        include: { tier: true },
      });

      // Default to free tier if no subscription
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

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireFeature(feature: keyof TierFeatures) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      const subscription = await prisma.userSubscription.findUnique({
        where: { userId: req.user.userId },
        include: { tier: true },
      });

      // Check if subscription is active
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

      // Check boolean features
      if (typeof featureValue === "boolean" && !featureValue) {
        throw AppError.forbidden(
          SUBSCRIPTION_ERRORS.SUB_003.message,
          SUBSCRIPTION_ERRORS.SUB_003.code,
          "Upgrade your subscription to access this feature",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
