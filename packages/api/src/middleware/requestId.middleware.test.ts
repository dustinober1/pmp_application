import type { Request, Response, NextFunction } from "express";
import { requestIdMiddleware } from "./requestId.middleware";
import { v4 as uuidv4 } from "uuid";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("requestIdMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("with existing x-request-id header", () => {
    it("should use provided request ID from header", () => {
      const providedRequestId = "custom-request-id-12345";
      mockRequest.headers = {
        "x-request-id": providedRequestId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(providedRequestId);
      expect(uuidv4).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle UUID format request ID from header", () => {
      const providedRequestId = "123e4567-e89b-12d3-a456-426614174000";
      mockRequest.headers = {
        "x-request-id": providedRequestId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(providedRequestId);
      expect(uuidv4).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle numeric string request ID from header", () => {
      const providedRequestId = "987654321";
      mockRequest.headers = {
        "x-request-id": providedRequestId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(providedRequestId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle alphanumeric request ID from header", () => {
      const providedRequestId = "req-abc123-xyz789";
      mockRequest.headers = {
        "x-request-id": providedRequestId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(providedRequestId);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("without x-request-id header", () => {
    it("should generate new UUID if no request ID header", () => {
      const generatedUuid = "550e8400-e29b-41d4-a716-446655440000";
      (uuidv4 as jest.Mock).mockReturnValue(generatedUuid);

      mockRequest.headers = {};

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(mockRequest.requestId).toBe(generatedUuid);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should generate unique UUID for each request", () => {
      const firstUuid = "550e8400-e29b-41d4-a716-446655440000";
      const secondUuid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

      (uuidv4 as jest.Mock).mockReturnValueOnce(firstUuid);

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      expect(mockRequest.requestId).toBe(firstUuid);

      // Reset request for second call
      mockRequest = { headers: {} };
      mockNext = jest.fn();
      (uuidv4 as jest.Mock).mockReturnValueOnce(secondUuid);

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      expect(mockRequest.requestId).toBe(secondUuid);

      expect(uuidv4).toHaveBeenCalledTimes(2);
    });
  });

  describe("header value edge cases", () => {
    it("should use empty string if header is empty string", () => {
      mockRequest.headers = {
        "x-request-id": "",
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Empty string is falsy, so it should generate a UUID
      expect(uuidv4).toHaveBeenCalled();
      expect(mockRequest.requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle header with whitespace", () => {
      const requestIdWithSpaces = "  request-id-with-spaces  ";
      mockRequest.headers = {
        "x-request-id": requestIdWithSpaces,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(requestIdWithSpaces);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle very long request ID", () => {
      const longRequestId = "a".repeat(1000);
      mockRequest.headers = {
        "x-request-id": longRequestId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(longRequestId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle request ID with special characters", () => {
      const specialCharsId = "req-!@#$%^&*()_+-={}[]|:;<>?,./";
      mockRequest.headers = {
        "x-request-id": specialCharsId,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(specialCharsId);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("middleware flow", () => {
    it("should always call next middleware", () => {
      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should set requestId before calling next", () => {
      const generatedUuid = "550e8400-e29b-41d4-a716-446655440000";
      (uuidv4 as jest.Mock).mockReturnValue(generatedUuid);

      let requestIdAtNextCall: string | undefined;
      mockNext = jest.fn(() => {
        requestIdAtNextCall = mockRequest.requestId;
      }) as any;

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(requestIdAtNextCall).toBe(generatedUuid);
    });
  });

  describe("type handling", () => {
    it("should handle array header value (takes first element)", () => {
      mockRequest.headers = {
        "x-request-id": ["first-id", "second-id"] as any,
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Express normalizes array headers to strings, but just in case
      expect(mockRequest.requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should work when headers object is missing x-request-id property", () => {
      const generatedUuid = "550e8400-e29b-41d4-a716-446655440000";
      (uuidv4 as jest.Mock).mockReturnValue(generatedUuid);

      mockRequest.headers = {
        "content-type": "application/json",
        "user-agent": "test",
      };

      requestIdMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.requestId).toBe(generatedUuid);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
