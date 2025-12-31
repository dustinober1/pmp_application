# PMP Application Codebase Patterns

This document contains comprehensive patterns and templates for the PMP Study Application. Use this as a reference when creating new features, routes, services, or components.

## Table of Contents

1. [Project Structure](#project-structure)
2. [API Routes Pattern](#api-routes-pattern)
3. [API Services Pattern](#api-services-pattern)
4. [Zod Validators Pattern](#zod-validators-pattern)
5. [Prisma Query Patterns](#prisma-query-patterns)
6. [Frontend Components Pattern](#frontend-components-pattern)
7. [API Client Pattern](#api-client-pattern)
8. [Error Handling Pattern](#error-handling-pattern)
9. [Testing Pattern](#testing-pattern)
10. [Naming Conventions](#naming-conventions)

---

## Project Structure

```
packages/
├── api/                    # Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── src/
│       ├── config/         # Environment, database config
│       ├── middleware/     # Auth, validation, error handling
│       ├── routes/         # Express route handlers
│       ├── services/       # Business logic
│       ├── validators/     # Zod schemas
│       ├── test/           # Test setup
│       └── index.ts        # App entry point
├── web/                    # Next.js frontend
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       ├── contexts/       # React contexts (Auth, etc.)
│       └── lib/            # Utilities, API client
└── shared/                 # Shared types
    └── src/
        └── types/          # TypeScript types
```

---

## API Routes Pattern

### File: `packages/api/src/routes/[feature].routes.ts`

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { featureService } from '../services/feature.service';
import { validateBody } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTier } from '../middleware/tier.middleware';
import { createFeatureSchema, updateFeatureSchema } from '../validators/feature.validator';

const router = Router();

/**
 * POST /api/features
 * Create a new resource
 */
router.post(
  '/',
  authMiddleware,
  requireTier('mid-level'), // Optional: tier requirement
  validateBody(createFeatureSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await featureService.create(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Resource created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/features/:id
 * Get a single resource by ID
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await featureService.getById(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/features
 * List resources with optional filters
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await featureService.list(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/features/:id
 * Update a resource
 */
router.patch(
  '/:id',
  authMiddleware,
  validateBody(updateFeatureSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await featureService.update(req.params.id, req.body);
      res.json({
        success: true,
        data: result,
        message: 'Resource updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/features/:id
 * Delete a resource
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await featureService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Key Route Patterns

| Middleware                      | Purpose                      | Usage                                 |
| ------------------------------- | ---------------------------- | ------------------------------------- |
| `authMiddleware`                | Require authentication       | All protected routes                  |
| `optionalAuthMiddleware`        | Optional authentication      | Public routes with optional user data |
| `requireTier('tier-name')`      | Minimum tier requirement     | `requireTier('mid-level')`            |
| `requireFeature('featureName')` | Specific feature requirement | `requireFeature('mockExams')`         |
| `validateBody(schema)`          | Validate request body        | POST/PATCH routes                     |
| `validateQuery(schema)`         | Validate query params        | GET routes with filters               |
| `validateParams(schema)`        | Validate route params        | Routes with `:id`                     |

---

## API Services Pattern

### File: `packages/api/src/services/[feature].service.ts`

```typescript
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { FEATURE_ERRORS } from '@pmp/shared';

export class FeatureService {
  /**
   * Create a new resource
   */
  async create(userId: string, data: CreateInput): Promise<ResultType> {
    // Validate related resources exist
    const related = await prisma.relatedModel.findUnique({
      where: { id: data.relatedId },
    });

    if (!related) {
      throw AppError.badRequest('Related resource not found');
    }

    // Create resource
    const resource = await prisma.model.create({
      data: {
        userId,
        ...data,
      },
    });

    return this.mapToResponse(resource);
  }

  /**
   * Get resource by ID
   */
  async getById(id: string): Promise<ResultType> {
    const resource = await prisma.model.findUnique({
      where: { id },
      include: {
        relation: true, // Include related data if needed
      },
    });

    if (!resource) {
      throw AppError.notFound('Resource not found', FEATURE_ERRORS.FEATURE_001.code);
    }

    return this.mapToResponse(resource);
  }

  /**
   * List resources with filters
   */
  async list(filters: ListFilters = {}): Promise<ResultType[]> {
    const where: Record<string, unknown> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    const resources = await prisma.model.findMany({
      where,
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(r => this.mapToResponse(r));
  }

  /**
   * Update a resource
   */
  async update(id: string, data: UpdateInput): Promise<ResultType> {
    // Check existence
    const existing = await prisma.model.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound('Resource not found');
    }

    // Update
    const updated = await prisma.model.update({
      where: { id },
      data,
    });

    return this.mapToResponse(updated);
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    await prisma.model.delete({
      where: { id },
    });
  }

  /**
   * Map Prisma model to response type (removes internal fields)
   */
  private mapToResponse(model: ModelType): ResultType {
    return {
      id: model.id,
      field1: model.field1,
      field2: model.field2,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}

// Export singleton instance
export const featureService = new FeatureService();
```

### Service Method Patterns

| Operation   | Prisma Method               | Pattern                            |
| ----------- | --------------------------- | ---------------------------------- |
| Create one  | `prisma.model.create()`     | `{ data: { ... } }`                |
| Find one    | `prisma.model.findUnique()` | `{ where: { id } }`                |
| Find many   | `prisma.model.findMany()`   | `{ where, take, skip, orderBy }`   |
| Update      | `prisma.model.update()`     | `{ where: { id }, data: { ... } }` |
| Delete      | `prisma.model.delete()`     | `{ where: { id } }`                |
| Upsert      | `prisma.model.upsert()`     | `{ where, create, update }`        |
| Transaction | `prisma.$transaction()`     | `[op1, op2, op3]`                  |

---

## Zod Validators Pattern

### File: `packages/api/src/validators/[feature].validator.ts`

```typescript
import { z } from 'zod';

// Create schema
export const createFeatureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  quantity: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

// Update schema (all fields optional)
export const updateFeatureSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must not exceed 100 characters')
      .optional(),
    description: z.string().optional(),
    quantity: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  })
  .partial(); // Make all fields optional

// Query params schema
export const featureQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// Route params schema
export const featureParamsSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Export inferred types
export type CreateFeatureDto = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureDto = z.infer<typeof updateFeatureSchema>;
export type FeatureQueryDto = z.infer<typeof featureQuerySchema>;
```

### Common Zod Validation Patterns

```typescript
// String validations
z.string().min(1).max(100);
z.string().email('Invalid email');
z.string().url('Invalid URL');
z.string().uuid('Invalid UUID');

// Number validations
z.number().int('Must be an integer');
z.number().positive('Must be positive');
z.number().min(0).max(100);
z.number().optional().default(0);

// Enum validations
z.enum(['active', 'inactive', 'pending']);

// Array validations
z.array(z.string()).min(1).max(10);
z.array(z.object({ id: z.string() }));

// Optional/Nullable
z.string().optional();
z.string().nullable();
z.string().nullish(); // Optional or nullable

// Transform
z.string().transform(val => val.trim());
z.string().transform(Number); // "123" -> 123

// Refine (custom validation)
z.string().refine(val => val.length >= 8, { message: 'Must be at least 8 characters' });
```

---

## Prisma Query Patterns

### Basic Queries

```typescript
// Find unique
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// Find first
const user = await prisma.user.findFirst({
  where: { email: 'user@example.com' },
});

// Find many with filters
const users = await prisma.user.findMany({
  where: {
    role: 'admin',
    isActive: true,
  },
  take: 10,
  skip: 20,
  orderBy: { createdAt: 'desc' },
});
```

### Include Relations

```typescript
const userWithSubscription = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    subscription: {
      include: { tier: true },
    },
  },
});
```

### Select Specific Fields

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
  },
});
```

### Complex Where Clauses

```typescript
const results = await prisma.model.findMany({
  where: {
    AND: [{ status: 'active' }, { createdAt: { gte: startDate } }],
    OR: [{ category: 'A' }, { priority: { gt: 5 } }],
    NOT: {
      id: { in: excludedIds },
    },
  },
});
```

### Transactions

```typescript
await prisma.$transaction([
  prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
  }),
  prisma.payment.create({
    data: { userId, amount },
  }),
]);
```

---

## Frontend Components Pattern

### File: `packages/web/src/components/[ComponentName].tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { featureApi } from '@/lib/api';

interface ComponentProps {
    // Define props here
    id?: string;
    onAction?: () => void;
}

export function ComponentName({ id, onAction }: ComponentProps) {
    const { user, isAuthenticated } = useAuth();
    const [data, setData] = useState<DataType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (itemId: string) => {
        try {
            setLoading(true);
            const response = await featureApi.getById(itemId);
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            // Redirect to login
            return;
        }
        // Handle submit logic
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="card">
            {/* Component JSX */}
        </div>
    );
}
```

### Next.js App Router Page Pattern

### File: `packages/web/src/app/[route]/page.tsx`

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeaturePage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <h1>Feature Page</h1>
            {/* Page content */}
        </div>
    );
}
```

---

## API Client Pattern

### File: `packages/web/src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const accessToken = token ?? (await getToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data;
}

// Feature API group
export const featureApi = {
  list: (params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/features?${queryParams}`);
  },

  getById: (id: string) => apiRequest(`/features/${id}`),

  create: (data: CreateInput) => apiRequest('/features', { method: 'POST', body: data }),

  update: (id: string, data: UpdateInput) =>
    apiRequest(`/features/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) => apiRequest(`/features/${id}`, { method: 'DELETE' }),
};
```

---

## Error Handling Pattern

### AppError Class

```typescript
import { AppError } from '../middleware/error.middleware';
import { FEATURE_ERRORS } from '@pmp/shared';

// Throw specific errors
throw AppError.badRequest('Invalid input', FEATURE_ERRORS.FEATURE_001.code);
throw AppError.unauthorized('Authentication required', 'AUTH_REQUIRED');
throw AppError.forbidden('Access denied', 'FORBIDDEN', 'Upgrade your subscription');
throw AppError.notFound('Resource not found', 'NOT_FOUND');
throw AppError.conflict('Resource already exists', 'CONFLICT', 'Use a different name');
throw AppError.internal('An unexpected error occurred');
```

### Error Response Format

```typescript
{
    "error": {
        "code": "FEATURE_001",
        "message": "Resource not found",
        "details": { "field": "value" },  // Optional
        "suggestion": "Try checking the ID"  // Optional
    },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_abc123"
}
```

### Error Codes Reference

| Category     | Code Pattern                  | Example                                |
| ------------ | ----------------------------- | -------------------------------------- |
| Auth         | `AUTH_001` - `AUTH_999`       | `AUTH_003: Invalid credentials`        |
| Subscription | `SUB_001` - `SUB_999`         | `SUB_003: Feature not available`       |
| Content      | `CONTENT_001` - `CONTENT_999` | `CONTENT_004: Flashcard limit reached` |
| Session      | `SESSION_001` - `SESSION_999` | `SESSION_004: Mock exam time expired`  |
| Team         | `TEAM_001` - `TEAM_999`       | `TEAM_002: License limit reached`      |

---

## Testing Pattern

### Test Setup

```typescript
// packages/api/src/test/setup.ts
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    model: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

jest.setTimeout(30000);
```

### Service Test Example

```typescript
import { featureService } from '../services/feature.service';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

// Mock Prisma
jest.mock('../config/database');

describe('FeatureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return feature when found', async () => {
      const mockFeature = { id: '123', name: 'Test' };
      (prisma.model.findUnique as jest.Mock).mockResolvedValue(mockFeature);

      const result = await featureService.getById('123');

      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(prisma.model.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw not found when feature does not exist', async () => {
      (prisma.model.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(featureService.getById('123')).rejects.toThrow(AppError);
    });
  });
});
```

### Route/Integration Test Example

```typescript
import request from 'supertest';
import app from '../index';
import { authService } from '../services/auth.service';

describe('Feature Routes', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test user and get token
    const result = await authService.register({
      email: 'test@example.com',
      password: 'Test1234',
      name: 'Test User',
    });
    authToken = result.tokens.accessToken;
  });

  describe('GET /api/features', () => {
    it('should return features list', async () => {
      const response = await request(app)
        .get('/api/features')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/features').expect(401);
    });
  });
});
```

---

## Naming Conventions

### Files

| Type       | Pattern                  | Example              |
| ---------- | ------------------------ | -------------------- |
| Routes     | `[feature].routes.ts`    | `auth.routes.ts`     |
| Services   | `[feature].service.ts`   | `auth.service.ts`    |
| Validators | `[feature].validator.ts` | `auth.validator.ts`  |
| Middleware | `[name].middleware.ts`   | `auth.middleware.ts` |
| Types      | `[feature].ts`           | `auth.ts`            |
| Components | `[ComponentName].tsx`    | `Navbar.tsx`         |
| Pages      | `page.tsx` (in folder)   | `app/login/page.tsx` |

### Functions/Methods

| Pattern                                               | Example               |
| ----------------------------------------------------- | --------------------- |
| CRUD: `getById`, `list`, `create`, `update`, `delete` | `getById(id: string)` |
| Async actions: `startX`, `completeX`, `cancelX`       | `startSession()`      |
| Booleans: `isX`, `hasX`, `canX`                       | `isAuthenticated`     |
| Handlers: `handleX`                                   | `handleSubmit`        |
| Getters: `getX`                                       | `getUserById`         |

### Variables

| Pattern                            | Example                       |
| ---------------------------------- | ----------------------------- |
| Booleans: `isX`, `hasX`, `shouldX` | `isLoading`, `hasAccess`      |
| Arrays: plural                     | `users`, `flashcards`         |
| IDs: `xId`                         | `userId`, `sessionId`         |
| Timestamps: `xAt`, `xDate`         | `createdAt`, `nextReviewDate` |

### Constants

```typescript
// Upper case for constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// For objects, use camelCase
const SM2_DEFAULTS = {
  INITIAL_EASE_FACTOR: 2.5,
  MINIMUM_EASE_FACTOR: 1.3,
} as const;

// Error codes
const FEATURE_ERRORS = {
  FEATURE_001: { code: 'FEATURE_001', message: 'Not found' },
} as const;
```

---

## Import Patterns

### API Package Imports

```typescript
// External dependencies
import express, { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Shared types
import { User, RegisterInput, AuthResult, FEATURE_ERRORS } from '@pmp/shared';

// Config
import prisma from '../config/database';
import { env } from '../config/env';

// Middleware
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { AppError } from '../middleware/error.middleware';

// Validators
import { createFeatureSchema } from '../validators/feature.validator';

// Services
import { featureService } from '../services/feature.service';
```

### Web Package Imports

```typescript
// Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Context
import { useAuth } from '@/contexts/AuthContext';

// API client
import { featureApi } from '@/lib/api';

// Components
import { Navbar } from '@/components/Navbar';
```

---

## Shared Types Pattern

### File: `packages/shared/src/types/[feature].ts`

```typescript
/**
 * Feature related types
 */

// Basic entity type
export interface Feature {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input types
export interface CreateFeatureInput {
  name: string;
  description: string;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
}

// Response types
export interface FeatureResponse {
  feature: Feature;
  relatedData?: RelatedType;
}

// Constants
export const FEATURE_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESC_LENGTH: 1000,
} as const;
```

Then export from index:

```typescript
// packages/shared/src/index.ts
export * from './types/feature.js';
```

---

## Quick Reference: Adding a New Feature

### Step 1: Add Prisma Schema

```prisma
model NewFeature {
    id        String   @id @default(uuid())
    userId    String
    name      String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    user User @relation(fields: [userId], references: [id])

    @@map("new_features")
}
```

### Step 2: Add Types to Shared

```typescript
// packages/shared/src/types/newfeature.ts
export interface NewFeature {
  id: string;
  name: string;
  createdAt: Date;
}
```

### Step 3: Create Service

```typescript
// packages/api/src/services/newfeature.service.ts
export class NewFeatureService {
    async create(userId: string, data: CreateInput) { ... }
    async getById(id: string) { ... }
}
export const newFeatureService = new NewFeatureService();
```

### Step 4: Create Validator

```typescript
// packages/api/src/validators/newfeature.validator.ts
export const createNewFeatureSchema = z.object({
  name: z.string().min(1).max(100),
});
```

### Step 5: Create Routes

```typescript
// packages/api/src/routes/newfeature.routes.ts
router.post('/', authMiddleware, validateBody(createNewFeatureSchema), ...);
```

### Step 6: Add API Client

```typescript
// packages/web/src/lib/api.ts
export const newFeatureApi = {
  create: data => apiRequest('/newfeatures', { method: 'POST', body: data }),
};
```

### Step 7: Create Frontend Component

```typescript
// packages/web/src/components/NewFeature.tsx
export function NewFeature() { ... }
```

---

## Environment Variables

### Required (.env)

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT (min 32 chars each)
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"

# PayPal (optional)
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
```

### Optional

```bash
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="..."
SMTP_PASS="..."
FROM_EMAIL="noreply@example.com"

# Redis
REDIS_URL="redis://localhost:6379"
```
