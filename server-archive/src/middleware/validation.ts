import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema, ZodIssue } from "zod";

export const validateResult =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((issue: ZodIssue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  };
