import type { OpenAPIV3_1 } from "openapi-types";

/**
 * OpenAPI Configuration
 */
export const openapiConfig: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: "PMP Study Application API",
    description: `# PMP Study Application API

Comprehensive API for the PMP Study Application, a learning platform for PMP exam preparation.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **User Management**: User registration, profile management
- **Subscription Management**: Tiered access control (Free, Mid-Level, High-End, Corporate)
- **Ebook System**: Chapter-based learning content with progress tracking
- **Practice Questions**: Adaptive practice sessions with mock exams
- **Flashcards**: Spaced repetition learning system
- **Analytics**: Dashboard with progress tracking and readiness scores
- **Payment Integration**: Stripe checkout for premium subscriptions

## Authentication

Most endpoints require authentication using Bearer JWT tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API endpoints are rate-limited:
- General API: 100 requests per 15 minutes
- Authentication endpoints: 20 requests per 15 minutes

## Error Responses

All errors follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
\`\`\`

## Versioning

Current API version: **1.0.0**

## Support

For API support, contact: support@pmpstudy.com`,
    version: "1.0.0",
    contact: {
      name: "PMP Study API Support",
      email: "support@pmpstudy.com",
    },
    license: {
      name: "Proprietary",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
    {
      url: "https://api-staging.pmpstudy.com",
      description: "Staging server",
    },
    {
      url: "https://api.pmpstudy.com",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Health check and monitoring endpoints",
    },
    {
      name: "Authentication",
      description: "User authentication and authorization",
    },
    {
      name: "Subscriptions",
      description: "Subscription management and payment processing",
    },
    {
      name: "Ebooks",
      description: "Ebook content and progress tracking",
    },
    {
      name: "Practice",
      description: "Practice questions and mock exams",
    },
    {
      name: "Flashcards",
      description: "Flashcard management and spaced repetition",
    },
    {
      name: "Dashboard",
      description: "User dashboard and analytics",
    },
    {
      name: "Domains",
      description: "PMP knowledge domain management",
    },
    {
      name: "Formulas",
      description: "PMP formulas and calculations",
    },
    {
      name: "Teams",
      description: "Team management for corporate accounts",
    },
    {
      name: "Search",
      description: "Search functionality across content",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT authentication token. Obtain from /api/auth/login or /api/auth/register",
      },
    },
    schemas: {
      // Common schemas
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "VALIDATION_ERROR",
                description: "Machine-readable error code",
              },
              message: {
                type: "string",
                example: "Invalid input data",
                description: "Human-readable error message",
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            description: "Response data (varies by endpoint)",
          },
          message: {
            type: "string",
            description: "Optional success message",
          },
        },
      },
      // User schemas
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "User unique identifier",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
          name: {
            type: "string",
            description: "User display name",
          },
          isVerified: {
            type: "boolean",
            description: "Email verification status",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
          },
        },
      },
    },
  },
};

export default openapiConfig;
