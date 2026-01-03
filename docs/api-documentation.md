# PMP Study Application - API Documentation Guide

This guide explains how to use and maintain the API documentation system for the PMP Study Application.

## Table of Contents

- [Overview](#overview)
- [Accessing Documentation](#accessing-documentation)
- [Swagger UI Features](#swagger-ui-features)
- [Exporting Documentation](#exporting-documentation)
- [Postman Integration](#postman-integration)
- [Adding New Endpoints](#adding-new-endpoints)
- [Documentation Best Practices](#documentation-best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

The PMP Study Application API uses **OpenAPI 3.1 specification** for comprehensive API documentation. The documentation system includes:

- **Swagger UI**: Interactive API documentation at `/api-docs`
- **OpenAPI Specification**: Machine-readable JSON/YAML specs
- **Postman Collection**: Auto-generated for API testing
- **Auto-generation**: Documentation generated from route handlers and Zod validators

### Key Features

- **Interactive Testing**: "Try it out" functionality in Swagger UI
- **Authentication Support**: Bearer JWT token input
- **Type Safety**: Generated from Zod validation schemas
- **Always Current**: Auto-updates when routes change
- **Multiple Formats**: JSON, YAML, and Postman collection

## Accessing Documentation

### Development Environment

1. Start the API server:

   ```bash
   cd packages/api
   npm run dev
   ```

2. Open Swagger UI in your browser:

   ```
   http://localhost:4000/api-docs
   ```

3. Access raw OpenAPI spec:
   ```
   http://localhost:4000/openapi.json
   ```

### Staging Environment

- Swagger UI: `https://api-staging.pmpstudy.com/api-docs`
- OpenAPI JSON: `https://api-staging.pmpstudy.com/openapi.json`

### Production

**Note**: API documentation is **disabled in production** for security reasons.

## Swagger UI Features

### 1. Authentication Setup

To test authenticated endpoints:

1. Click the **"Authorize"** button (lock icon) at the top right
2. Enter your JWT token (obtained from `/api/auth/login` or `/api/auth/register`)
3. Click **"Authorize"**
4. Close the dialog

All subsequent requests will include the `Authorization: Bearer <token>` header.

### 2. Testing Endpoints

1. Find an endpoint in the documentation
2. Click **"Try it out"**
3. Fill in required parameters
4. Click **"Execute"**
5. View the response below

### 3. CSRF Protection

For POST/PUT/PATCH/DELETE requests, Swagger UI automatically:

- Retrieves CSRF token from `/api/auth/csrf`
- Includes `X-CSRF-Token` header in requests
- Handles cookies automatically

### 4. Response Examples

Each endpoint includes:

- **Example Value**: Sample response payload
- **Schema**: Full response structure
- **Status Codes**: All possible response codes with descriptions

## Exporting Documentation

### Export OpenAPI Specification

Export the current API specification to JSON and YAML:

```bash
cd packages/api
npm run export:openapi
```

This generates:

- `openapi/openapi.json` - JSON specification
- `openapi/openapi.yaml` - YAML specification

### Export Postman Collection

Generate a Postman collection for API testing:

```bash
cd packages/api
npm run generate:postman
```

This generates:

- `openapi/postman-collection.json` - Import into Postman

### Export All Documentation

Export both OpenAPI spec and Postman collection:

```bash
cd packages/api
npm run docs:export
```

## Postman Integration

### Import Collection

1. Open Postman
2. Click **"Import"** (top left)
3. Select `openapi/postman-collection.json`
4. Click **"Import"**

### Configure Collection

The collection includes two variables:

1. **`baseUrl`**: API base URL
   - Development: `http://localhost:4000`
   - Staging: `https://api-staging.pmpstudy.com`
   - Production: `https://api.pmpstudy.com`

2. **`token`**: JWT authentication token
   - Obtain from login/register endpoints
   - Set in collection variables for authenticated requests

### Using the Collection

1. Select a request from the folders
2. Ensure `token` variable is set (for authenticated endpoints)
3. Click **"Send"**
4. View response in the bottom panel

## Adding New Endpoints

When adding new API endpoints, follow these steps to document them:

### Step 1: Create Route Handler

```typescript
// src/routes/example.routes.ts
import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validation.middleware";

const router = Router();

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

router.post(
  "/items",
  validateBody(createItemSchema),
  async (req, res, next) => {
    // Implementation
  },
);
```

### Step 2: Create OpenAPI Generator

Create a new generator file or add to existing:

```typescript
// src/utils/openapi/generators/example.generator.ts
import type { OpenAPIV3_1 } from "openapi-types";

export const examplePaths: OpenAPIV3_1.PathObject = {
  "/api/items": {
    post: {
      tags: ["Items"],
      summary: "Create item",
      description: "Create a new item with validation",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                  minLength: 1,
                  description: "Item name",
                },
                description: {
                  type: "string",
                  description: "Item description",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Item created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      item: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
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
  },
};
```

### Step 3: Import and Register

```typescript
// src/utils/openapi/generate-spec.ts
import { examplePaths } from "./generators/example.generator";

export function generateOpenAPISpec(): any {
  return {
    ...openapiConfig,
    paths: {
      ...existingPaths,
      ...examplePaths,
    },
  };
}
```

### Step 4: Add Tag (Optional)

Add new tag to config:

```typescript
// src/config/openapi.ts
tags: [
  // ... existing tags
  {
    name: 'Items',
    description: 'Item management endpoints',
  },
],
```

### Step 5: Rebuild and Test

```bash
npm run build
npm run dev
# Visit http://localhost:4000/api-docs
```

## Documentation Best Practices

### 1. Summaries

- **Keep it concise**: Maximum 80 characters
- **Use active voice**: "Get user profile" not "User profile is retrieved"
- **Be specific**: "Create subscription" not "Manage subscriptions"

### 2. Descriptions

- **Provide context**: Explain what the endpoint does
- **Mention side effects**: "Invalidates refresh token"
- **List prerequisites**: "Requires active subscription"
- **Include examples**: Show usage patterns

### 3. Parameters

```json
{
  "name": "tierId",
  "in": "body",
  "required": true,
  "schema": { "type": "string", "format": "uuid" },
  "description": "Subscription tier ID (from GET /subscriptions/tiers)"
}
```

- **Always describe**: What the parameter is for
- **Mention constraints**: Valid values, ranges, formats
- **Reference other endpoints**: Where to get valid values

### 4. Responses

Document all possible responses:

```json
{
  "200": {
    "description": "Successful response",
    "content": {
      "application/json": {
        "schema": { ... },
        "example": { ... }
      }
    }
  },
  "400": {
    "description": "Validation error",
    "content": {
      "application/json": {
        "schema": { "$ref": "#/components/schemas/Error" }
      }
    }
  },
  "401": {
    "description": "Unauthorized",
    "content": {
      "application/json": {
        "schema": { "$ref": "#/components/schemas/Error" }
      }
    }
  }
}
```

### 5. Examples

Always include example values:

```json
{
  "example": {
    "success": true,
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

## CI/CD Integration

### Validate OpenAPI Spec

Create a CI job to validate the spec:

```yaml
# .github/workflows/api-docs.yml
name: API Documentation

on:
  pull_request:
    paths:
      - "packages/api/src/routes/**"
      - "packages/api/src/utils/openapi/**"

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: cd packages/api && npm install
      - run: cd packages/api && npm run export:openapi
      - name: Check for changes
        run: |
          if git diff --exit-code openapi/openapi.json; then
            echo "✅ OpenAPI spec is up to date"
          else
            echo "❌ OpenAPI spec is out of date. Run 'npm run docs:export'"
            exit 1
          fi
```

### Auto-Deploy Documentation

Update docs on merge to main:

```yaml
# In your deploy workflow
- name: Export API documentation
  run: cd packages/api && npm run docs:export

- name: Upload to S3/CDN
  run: aws s3 sync openapi/ s3://api-docs-bucket/
```

### Check Spec Freshness

Ensure spec reflects current code:

```bash
# In CI pipeline
cd packages/api
npm run export:openapi
git diff --exit-code openapi/openapi.json
```

If files differ, the spec is outdated and needs regeneration.

## Troubleshooting

### Swagger UI Not Loading

- Check NODE_ENV is not 'production'
- Verify middleware is registered in `src/index.ts`
- Check for port conflicts

### Missing Endpoints

- Ensure paths are registered in `generateOpenAPISpec()`
- Check route matches the pattern in OpenAPI spec
- Verify route is imported in main app

### Authentication Failures

- Verify JWT token is valid (not expired)
- Check `Authorization` header format: `Bearer <token>`
- Ensure token has required scopes

### CSRF Errors

- Call `/api/auth/csrf` first
- Include `X-CSRF-Token` header
- Check cookie settings in Swagger UI

## Additional Resources

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Zod Validation](https://zod.dev/)
- [Postman Learning Center](https://learning.postman.com/)

## Support

For API documentation issues:

1. Check existing GitHub issues
2. Create new issue with tag `api-documentation`
3. Contact: api-support@pmpstudy.com

---

**Last Updated**: January 2026
**API Version**: 1.0.0
**OpenAPI Version**: 3.1.0
