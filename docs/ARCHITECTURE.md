# PMP Application Architecture

## Overview

This is a full-stack PMP (Project Management Professional) exam preparation application built with a monolith architecture.

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

## Architecture Decisions

### ADR-001: Monolith Architecture
**Status**: Accepted
**Context**: Application started with microservices consideration
**Decision**: Committed to monolith for simplicity and deployment ease
**Consequences**: 
- Simpler deployment and debugging
- Single codebase to maintain
- Easier local development

### ADR-002: JWT with Refresh Tokens
**Status**: Accepted
**Context**: Need for secure, stateless authentication
**Decision**: Short-lived access tokens (15min) with longer refresh tokens (7 days)
**Consequences**:
- Access tokens validated without database lookup
- Token blacklist service for logout
- Redis-backed for performance

### ADR-003: Prisma for Database Access
**Status**: Accepted
**Context**: Need type-safe database access
**Decision**: Use Prisma ORM over raw SQL or other ORMs
**Consequences**:
- Type-safe queries with TypeScript
- Migration management included
- Slight learning curve

### ADR-004: Redis for Caching and Sessions
**Status**: Accepted
**Context**: Need fast cache layer and token storage
**Decision**: Redis for both caching and session management
**Consequences**:
- Standardized TTL constants for consistency
- Pattern-based invalidation
- Additional infrastructure dependency

## Directory Structure

```
/
├── src/                    # Backend source code
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── schemas/            # Zod validation schemas
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── client/client/          # Frontend source code
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API service layer
│   │   └── test/           # Test files
├── prisma/                 # Database schema and migrations
├── docs/                   # Documentation
└── .github/                # CI/CD workflows
```

## API Design

### Versioning
- Current: `/api/v1/*`
- Alias: `/api/*` routes to latest version
- Version info: `GET /api/versions`

### Authentication
All protected routes require `Authorization: Bearer <token>`

### Rate Limiting
- General: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes

## Database Schema

### Core Models
- **User**: Application users
- **Domain**: PMP exam domains (People, Process, Business)
- **Question**: Practice exam questions
- **FlashCard**: Study flashcards
- **PracticeTest**: Test configurations
- **UserTestSession**: User's test attempts

### Performance Indexes
Composite indexes for common query patterns:
- `FlashCard(isActive, domainId)`
- `FlashCardReview(userId, nextReviewAt)`
- `UserTestSession(userId, status)`

## Security Features

### Authentication
- bcrypt password hashing (12 rounds)
- JWT access tokens (15 min expiry)
- Refresh token rotation
- Token blacklist on logout

### Account Protection
- Account lockout after 5 failed attempts
- Progressive lockout (doubles each time)
- Maximum 24-hour lockout

### Input Validation
- Zod schemas for all inputs
- Password complexity enforcement
- Input sanitization utilities

### HTTP Security
- Helmet security headers
- CORS configuration
- Rate limiting
- Content Security Policy

## Caching Strategy

### TTL Constants
- SHORT: 60s (user progress)
- MEDIUM: 300s (flashcards, questions)
- LONG: 3600s (domains)
- EXTENDED: 86400s (static data)

### Cache Invalidation
- Pattern-based deletion
- User cache invalidation on logout
- CRUD operation cache clearing

## Error Handling

### Standardized Response Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

### Error Classes
- `AppError`: Base error class
- `ErrorFactory`: Factory for common errors
- Centralized error handler middleware

## Logging

Winston logger with:
- Correlation ID tracking
- Log levels: error, warn, info, http, debug
- File and console transports
- Request/response logging via Morgan

## Testing Strategy

### Backend
- Jest for unit tests
- Supertest for API tests
- Test database with migrations

### Frontend
- Vitest for unit tests
- React Testing Library for component tests
- Mock service worker for API mocking

## Deployment

### Docker
- Production: Multi-stage build with Alpine
- Development: Hot reload support
- Health checks included

### CI/CD
- GitHub Actions workflow
- Lint, test, build, security scan
- Dependabot for dependency updates

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `JWT_SECRET`: Token signing secret;

### Optional
- `ALLOWED_ORIGINS`: CORS allowed origins
- `DB_CONNECTION_LIMIT`: Pool size (default: 10)
- `NODE_ENV`: Environment mode

---

Last updated: 2024-12-24
