import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Middleware to add correlation ID to each request for distributed tracing
 * The correlation ID is either taken from the incoming request header or generated
 */
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Check for existing correlation ID from header (useful for distributed systems)
  const existingCorrelationId = req.headers["x-correlation-id"] as string;

  // Use existing or generate new correlation ID
  const correlationId = existingCorrelationId || uuidv4();

  // Attach to request object
  req.correlationId = correlationId;

  // Add to response headers for client tracking
  res.setHeader("X-Correlation-ID", correlationId);

  next();
};

export default correlationIdMiddleware;
