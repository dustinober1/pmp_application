# AGENTS.md - PMP Study Pro Development Guidelines

This file contains guidelines for agentic coding agents working on the PMP Study Pro repository.

## Build, Lint & Test Commands

### Root Level Commands

```bash
# Development
npm run dev                    # Start both API (3001) and Web (3000) concurrently
npm run dev:api               # Start API only
npm run dev:web               # Start Web only

# Building
npm run build                 # Build all packages
npm run build:api             # Build API only
npm run build:web             # Build Web only
npm run build:shared          # Build shared package

# Testing
npm run test                  # Run all tests
npm run test:api              # Run API tests (Jest)
npm run test:web              # Run Web unit tests (Vitest)
npm run test:e2e              # Run E2E tests (Playwright)

# Linting & Formatting
npm run lint                  # Run ESLint
npm run lint:fix              # Auto-fix linting errors
npm run format                # Format with Prettier

# Database (Prisma)
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Run migrations
npm run db:seed               # Seed database
npm run db:studio             # Open Prisma Studio GUI
```

### Single Test Commands

```bash
# API Tests (Jest)
cd packages/api && npm test -- auth.service.test
cd packages/api && npm test -- --testNamePattern="should register user"
cd packages/api && npm run test:coverage

# Web Unit Tests (Vitest)
cd packages/web && vitest run components/Navbar.test.tsx
cd packages/web && vitest run --reporter=verbose
cd packages/web && vitest run --coverage

# E2E Tests (Playwright)
cd packages/web && npm run test:e2e -- auth-flow.spec.ts
cd packages/web && npm run test:e2e -- --grep="should login successfully"
cd packages/web && npm run test:e2e:chromium
```

## Code Style Guidelines

### Import Organization

```typescript
// 1. Node.js built-ins
import path from "path";
import { promises as fs } from "fs";

// 2. External packages (alphabetical)
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";

// 3. Internal packages (use @pmp/ prefix)
import { logger } from "@pmp/api/utils/logger";
import { AuthResult } from "@pmp/shared";

// 4. Local modules (relative imports)
import { AppError } from "../middleware/error.middleware";
import { env } from "../config/env";
```

### Type Imports

Use type-only imports for types to enable tree-shaking:

```typescript
import type { User, AuthResult } from "@pmp/shared";
import type { Request, Response } from "express";
```

### Naming Conventions

- **Files**: kebab-case (auth.service.ts, navbar.component.tsx)
- **Classes**: PascalCase (AuthService, DatabaseService)
- **Functions/Methods**: camelCase (getUserById, validateInput)
- **Constants**: UPPER_SNAKE_CASE (MAX_FAILED_ATTEMPTS, API_BASE_URL)
- **Interfaces/Types**: PascalCase with descriptive suffixes (UserProfile, LoginInput)
- **Variables**: camelCase (currentUser, isAuthenticated)

### Error Handling

```typescript
// Use AppError class for consistent error responses
throw AppError.badRequest("Invalid email format", "AUTH_001");

// Async error handling with try-catch
try {
  const result = await someOperation();
  return result;
} catch (error) {
  logger.error("Operation failed", { error, context });
  throw AppError.internal("Operation failed");
}

// Use express-async-errors for async route handlers
app.get("/users/:id", async (req: Request, res: Response) => {
  const user = await userService.findById(req.params.id);
  res.json(user);
});
```

### TypeScript Guidelines

- **Strict typing**: Enable strict mode, avoid `any` when possible
- **Prefer interfaces** for object shapes that might be extended
- **Use types** for unions, primitives, and utility types
- **Null safety**: Use optional chaining and nullish coalescing
- **Function parameters**: Prefix unused params with underscore (`_`)

```typescript
// Good examples
interface UserProfile {
  id: string;
  email: string;
  name?: string; // Optional property
}

type AuthResult = SuccessResult | ErrorResult;

const user = data?.user ?? null; // Nullish coalescing

const processItem = (item: Item, _index: number) => {
  // Unused param
  return item.processed;
};
```

### React/Next.js Guidelines

- **Components**: Use function components with hooks
- **Props**: Define interfaces for component props
- **State**: Prefer `useState` for simple state, `useReducer` for complex state
- **Side effects**: Use `useEffect` with proper dependency arrays
- **Performance**: Use `React.memo`, `useCallback`, `useMemo` appropriately

```typescript
interface NavbarProps {
  user?: User;
  onLogout: () => void;
}

const Navbar = React.memo<NavbarProps>(({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    onLogout();
    setMobileMenuOpen(false);
  }, [onLogout]);

  return <nav>...</nav>;
});
```

### API/Backend Guidelines

- **Route-Service Pattern**: Routes handle validation/response, Services handle business logic
- **Prisma Usage**: Use transactions for multi-table operations
- **Validation**: Use Zod schemas for input validation
- **Logging**: Use structured logger with context
- **Security**: Never expose secrets, validate all inputs

```typescript
// Route example
router.post("/register", async (req: Request, res: Response) => {
  const validated = registerSchema.parse(req.body);
  const result = await authService.register(validated);
  res.status(201).json(result);
});

// Service example
async function register(data: RegisterInput): Promise<AuthResult> {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    const subscription = await tx.subscription.create({
      data: subscriptionData,
    });
    return { user, subscription };
  });
}
```

### Database Guidelines

- **Prisma Schema**: Use descriptive model and field names
- **Migrations**: Review auto-generated migrations before applying
- **Queries**: Use `select` to limit returned fields, `include` for relations
- **Performance**: Add indexes for frequently queried fields
- **Transactions**: Use for operations that must succeed/fail together

### Testing Guidelines

- **Unit Tests**: Test individual functions/classes in isolation
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user journeys
- **Coverage**: Maintain >80% coverage for critical paths
- **Test Structure**: Use AAA pattern (Arrange, Act, Assert)

```typescript
// Example unit test
describe("AuthService", () => {
  describe("register", () => {
    it("should create a new user successfully", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test",
      };

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(result.user.email).toBe(userData.email);
      expect(result.user.id).toBeDefined();
    });
  });
});
```

### Environment Configuration

- Use `.env.example` as template for environment variables
- Never commit actual `.env` files
- Use `env` utility for type-safe environment access
- Provide sensible defaults where possible

### Git & Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Keep commits focused and atomic
- Use present tense: "Add feature" not "Added feature"
- Reference issue numbers when applicable

### Performance Guidelines

- **Frontend**: Implement code splitting, lazy loading, and caching
- **Backend**: Use connection pooling, query optimization, and response caching
- **Database**: Add appropriate indexes, avoid N+1 queries
- **Memory**: Monitor for memory leaks, especially in long-running processes

### Security Guidelines

- **Input Validation**: Validate all inputs with Zod schemas
- **Authentication**: Use JWT with httpOnly cookies and refresh tokens
- **Authorization**: Check user permissions for sensitive operations
- **Data Sanitization**: Sanitize user inputs to prevent XSS
- **Rate Limiting**: Implement rate limiting for API endpoints

## Package Structure

```
packages/
├── api/          # Express.js backend (TypeScript)
├── web/          # Next.js frontend (TypeScript, React)
└── shared/       # Shared types and utilities
```

## Key Dependencies

### Backend

- **Express**: Web framework
- **Prisma**: ORM and database toolkit
- **Jest**: Testing framework
- **Winston**: Logging
- **Zod**: Schema validation

### Frontend

- **Next.js**: React framework
- **React**: UI library
- **TailwindCSS**: Styling
- **Vitest**: Unit testing
- **Playwright**: E2E testing

## Development Workflow

1. **Setup**: Run `npm install` and `npm run db:generate`
2. **Development**: Use `npm run dev` for hot reloading
3. **Testing**: Run relevant tests before committing
4. **Linting**: Ensure code passes linting (`npm run lint`)
5. **Building**: Test build process (`npm run build`)

## Common Patterns

### Error Response Format

```typescript
{
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": "Please check your email and password"
  }
}
```

### API Response Format

```typescript
{
  "success": true,
  "data": { ... },
  "meta": { total: 100, page: 1 }
}
```

### Component Structure

```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. Helper functions
// 5. Export
```

Remember to follow these guidelines and maintain consistency across the codebase. When in doubt, look at existing code for patterns and conventions.
