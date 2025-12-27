import { Request, Response, NextFunction } from "express";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";
import {
  createStudyPlanForUser,
  getActiveStudyPlan,
  getStudyPlanTasksForUser,
  completeStudyTaskForUser,
  updateStudyPlanForUser,
} from "../services/studyPlanService";

export const createStudyPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const { targetExamDate, hoursPerDay } = req.body;
    const plan = await createStudyPlanForUser({
      userId: req.user.id,
      targetExamDate: new Date(targetExamDate),
      hoursPerDay,
    });

    res.status(201).json(plan);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error creating study plan:", error);
    next(ErrorFactory.internal("Failed to create study plan"));
  }
};

export const getActivePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const plan = await getActiveStudyPlan(req.user.id);
    if (!plan) {
      throw ErrorFactory.notFound("No active study plan");
    }
    res.json(plan);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching active study plan:", error);
    next(ErrorFactory.internal("Failed to fetch active study plan"));
  }
};

export const updateStudyPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const { id } = req.params;
    const { targetExamDate, hoursPerDay, status, progressStatus } = req.body;

    const plan = await updateStudyPlanForUser({
      userId: req.user.id,
      planId: id,
      targetExamDate: targetExamDate ? new Date(targetExamDate) : undefined,
      hoursPerDay,
      status,
      progressStatus,
    });

    res.json(plan);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Update study plan error:", error);
    next(ErrorFactory.internal("Failed to update study plan"));
  }
};

export const getStudyPlanTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const { id } = req.params;
    const tasks = await getStudyPlanTasksForUser(req.user.id, id);
    res.json(tasks);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Get study plan tasks error:", error);
    next(ErrorFactory.internal("Failed to fetch study plan tasks"));
  }
};

export const completeStudyTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }

    const { taskId } = req.params;
    const result = await completeStudyTaskForUser({
      userId: req.user.id,
      taskId,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Complete study task error:", error);
    next(ErrorFactory.internal("Failed to complete study task"));
  }
};
