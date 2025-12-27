import { Request, Response, NextFunction } from "express";
import { discussionService } from "../services/discussionService";
import Logger from "../utils/logger";
import { AppError, ErrorFactory } from "../utils/AppError";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const sort = (req.query.sort as "newest" | "top") || "newest";
    const comments = await discussionService.listComments(
      id,
      sort,
      req.user?.id,
    );
    res.json(comments);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error fetching comments:", error);
    next(ErrorFactory.internal("Failed to fetch comments"));
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const { content, parentId } = req.body;
    const comment = await discussionService.createComment({
      questionId: id,
      userId: req.user.id,
      content,
      parentId,
    });
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error creating comment:", error);
    next(ErrorFactory.internal("Failed to create comment"));
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const { content } = req.body;
    const comment = await discussionService.updateComment({
      id,
      userId: req.user.id,
      content,
    });
    res.json(comment);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error updating comment:", error);
    next(ErrorFactory.internal("Failed to update comment"));
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    await discussionService.deleteComment({ id, userId: req.user.id });
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error deleting comment:", error);
    next(ErrorFactory.internal("Failed to delete comment"));
  }
};

export const voteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const result = await discussionService.voteComment({
      id,
      userId: req.user.id,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error voting comment:", error);
    next(ErrorFactory.internal("Failed to vote comment"));
  }
};

export const unvoteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const result = await discussionService.removeVote({
      id,
      userId: req.user.id,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error removing vote:", error);
    next(ErrorFactory.internal("Failed to remove vote"));
  }
};

export const reportComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized();
    }
    const { id } = req.params;
    const { reason } = req.body;
    await discussionService.reportComment({
      id,
      userId: req.user.id,
      reason,
    });
    res.status(201).json({ reported: true });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error reporting comment:", error);
    next(ErrorFactory.internal("Failed to report comment"));
  }
};

export const adminHideComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await discussionService.adminHide({ id });
    res.json(comment);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error hiding comment:", error);
    next(ErrorFactory.internal("Failed to hide comment"));
  }
};

export const adminVerifyComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await discussionService.adminVerify({ id });
    res.json(comment);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    Logger.error("Error verifying comment:", error);
    next(ErrorFactory.internal("Failed to verify comment"));
  }
};
