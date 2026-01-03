import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Generate Authentication endpoints OpenAPI spec
 */
export const authPaths: OpenAPIV3_1.PathsObject = {
  "/api/auth/csrf": {
    get: {
      tags: ["Authentication"],
      summary: "Get CSRF token",
      description:
        "Retrieve a CSRF token for form submissions. Used in double-submit cookie pattern.",
      security: [],
      responses: {
        "200": {
          description: "CSRF token retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      csrfToken: {
                        type: "string",
                        description: "CSRF token for form submissions",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register new user",
      description:
        "Create a new user account. Requires email verification before full access.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "name"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  description: "User email address",
                  example: "user@example.com",
                },
                password: {
                  type: "string",
                  minLength: 8,
                  maxLength: 64,
                  description:
                    "Password (min 8 chars, must contain uppercase, lowercase, and number)",
                  example: "Password123",
                },
                name: {
                  type: "string",
                  minLength: 1,
                  maxLength: 100,
                  description: "User display name",
                  example: "John Doe",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "User registered successfully",
          headers: {
            "Set-Cookie": {
              description: "HTTP-only cookies for refresh token and CSRF token",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      expiresIn: {
                        type: "number",
                        description: "Access token expiry time in seconds",
                        example: 3600,
                      },
                    },
                  },
                  message: {
                    type: "string",
                    example:
                      "Registration successful. Please verify your email.",
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Validation error or user already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "429": {
          description: "Too many registration attempts",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "User login",
      description: "Authenticate with email and password. Returns JWT tokens.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@example.com",
                },
                password: {
                  type: "string",
                  example: "Password123",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          headers: {
            "Set-Cookie": {
              description: "HTTP-only cookies for refresh token and CSRF token",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      expiresIn: {
                        type: "number",
                        example: 3600,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      description:
        "Obtain a new access token using the refresh token from cookies or request body.",
      security: [],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                refreshToken: {
                  type: "string",
                  description:
                    "Refresh token (optional if provided via cookie)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      expiresIn: { type: "number", example: 3600 },
                    },
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Invalid or expired refresh token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user",
      description: "Invalidate the refresh token and clear auth cookies.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Logged out successfully",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Request password reset",
      description:
        "Send a password reset email. Always returns 200 for security (user enumeration prevention).",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@example.com",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "If email exists, reset link sent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "If an account exists with this email, a password reset link has been sent.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Reset password",
      description: "Reset password using the token from the reset email.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "newPassword"],
              properties: {
                token: {
                  type: "string",
                  description: "Password reset token from email",
                },
                newPassword: {
                  type: "string",
                  minLength: 8,
                  maxLength: 64,
                  description:
                    "New password (same requirements as registration)",
                  example: "NewPassword123",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Password reset successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Password reset successful. You can now login with your new password.",
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Invalid or expired token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },

  "/api/auth/verify-email": {
    post: {
      tags: ["Authentication"],
      summary: "Verify email address",
      description:
        "Verify user email using the token sent to their email address.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token"],
              properties: {
                token: {
                  type: "string",
                  description: "Email verification token",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Email verified successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Email verified successfully.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/resend-verification": {
    post: {
      tags: ["Authentication"],
      summary: "Resend verification email",
      description:
        "Request a new email verification token. Requires authentication.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Verification email sent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Verification email sent. Please check your inbox.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get current user",
      description: "Retrieve the authenticated user profile.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "User profile retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
};
