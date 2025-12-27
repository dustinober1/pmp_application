import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notificationService";
import { AppError, ErrorFactory } from "../utils/AppError";
import Logger from "../utils/logger";

export const listNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const notifications = await notificationService.list(req.user.id);
    res.json(notifications);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error listing notifications", error);
    next(ErrorFactory.internal("Failed to list notifications"));
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const result = await notificationService.markRead(req.user.id, id);
    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error marking notification read", error);
    next(ErrorFactory.internal("Failed to update notification"));
  }
};

export const saveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { endpoint, keys } = req.body;
    const sub = await notificationService.saveSubscription({
      userId: req.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
    res.status(201).json(sub);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error saving subscription", error);
    next(ErrorFactory.internal("Failed to save subscription"));
  }
};

export const getPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const pref = await notificationService.getPreferences(req.user.id);
    res.json(pref);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching notification preferences", error);
    next(ErrorFactory.internal("Failed to fetch preferences"));
  }
};

export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const pref = await notificationService.updatePreferences(
      req.user.id,
      req.body,
    );
    res.json(pref);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating notification preferences", error);
    next(ErrorFactory.internal("Failed to update preferences"));
  }
};
