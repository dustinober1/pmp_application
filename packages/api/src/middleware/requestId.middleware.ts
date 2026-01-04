import type { FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
  }
}

export async function requestIdMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const requestId = (request.headers["x-request-id"] as string) || uuidv4();
  request.requestId = requestId;
}
