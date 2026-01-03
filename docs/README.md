# PMP Study Application - Documentation

This directory contains comprehensive documentation for the PMP Study Application.

## Table of Contents

- [API Documentation](#api-documentation)
- [Development Guides](#development-guides)
- [Architecture](#architecture)
- [Deployment](#deployment)

## API Documentation

### Interactive API Documentation (Swagger UI)

The PMP Study Application API includes interactive Swagger UI documentation:

- **Development**: `http://localhost:4000/api-docs`
- **Staging**: `https://api-staging.pmpstudy.com/api-docs`
- **Production**: Disabled for security

**Features:**

- Interactive API testing ("Try it out")
- Authentication support (JWT Bearer tokens)
- Request/response examples
- Schema validation
- Error response documentation

See [API Documentation Guide](./api-documentation.md) for detailed usage instructions.

### OpenAPI Specification

Machine-readable API specifications are auto-generated and exported to:

- `packages/api/openapi/openapi.json` - JSON format
- `packages/api/openapi/openapi.yaml` - YAML format

**Export specs:**

```bash
cd packages/api
npm run export:openapi
```

### Postman Collection

Auto-generated Postman collection for API testing:

- `packages/api/openapi/postman-collection.json`

**Generate collection:**

```bash
cd packages/api
npm run generate:postman
```

**Export all documentation:**

```bash
cd packages/api
npm run docs:export
```

## Development Guides

### Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pmp_application
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run development servers**

   ```bash
   # API server
   npm run dev:api

   # Frontend
   npm run dev:web
   ```

### Project Structure

```
pmp_application/
├── packages/
│   ├── api/              # Express API server
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/# Express middleware
│   │   │   └── utils/    # Utilities (logging, auth, etc.)
│   │   ├── openapi/      # Generated OpenAPI specs
│   │   └── prisma/       # Database schema & migrations
│   ├── shared/           # Shared TypeScript types
│   └── web/              # Frontend application
├── docs/                 # Documentation
└── .github/              # CI/CD workflows
```

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting with `npm run lint`
- **Prettier**: Code formatting with `npm run format`
- **Testing**: Jest with `npm test`

### Adding New Features

1. **API Endpoint**:
   - Add route handler in `packages/api/src/routes/`
   - Add service logic in `packages/api/src/services/`
   - Document with OpenAPI spec
   - Write tests

2. **Database Changes**:
   - Update Prisma schema
   - Run migration: `npm run db:migrate`
   - Update types in shared package

3. **Frontend Component**:
   - Create component in `packages/web/src/`
   - Add routing
   - Write tests

See [API Documentation Guide](./api-documentation.md) for adding API endpoints.

## Architecture

### Technology Stack

**API:**

- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Stripe payment integration
- OpenTelemetry observability

**Frontend:**

- React with TypeScript
- Vite build tool
- TailwindCSS
- React Router

**Infrastructure:**

- AWS (ECS, RDS, S3, CloudWatch)
- Docker containers
- GitHub Actions CI/CD

### API Design Principles

- **RESTful**: Resource-based URLs with HTTP verbs
- **Stateless**: JWT-based authentication
- **Versioned**: API versioning via URL path
- **Validated**: Zod schema validation
- **Documented**: OpenAPI 3.1 specification

### Database Schema

Prisma schema defines:

- Users & authentication
- Subscriptions & payments
- Ebook content & progress
- Practice questions & sessions
- Flashcards & reviews
- Analytics & metrics

See `packages/api/prisma/schema.prisma` for complete schema.

## Deployment

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
CORS_ORIGIN=http://localhost:5173

# Environment
NODE_ENV=development
PORT=4000
```

### CI/CD Pipeline

GitHub Actions workflows:

1. **API Documentation Validation** (`.github/workflows/api-docs.yml`)
   - Validates OpenAPI spec
   - Checks documentation coverage
   - Generates Postman collection

2. **Testing** (`.github/workflows/test.yml`)
   - Runs unit tests
   - Integration tests
   - E2E tests

3. **Deploy** (`.github/workflows/deploy.yml`)
   - Builds Docker images
   - Deploys to ECS
   - Runs database migrations

### Monitoring

- **Metrics**: Prometheus at `/metrics`
- **Health Checks**: `/api/health`
- **Logs**: CloudWatch Logs
- **Traces**: OpenTelemetry tracing

## Support

### Documentation

- [API Documentation Guide](./api-documentation.md)
- [Shipping Readiness Report](./shipping-readiness-report.md)
- Inline code comments

### Getting Help

- GitHub Issues: Report bugs and feature requests
- Email: support@pmpstudy.com
- Slack: #pmp-dev channel

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

See `CONTRIBUTING.md` for detailed guidelines.

## License

Proprietary - All rights reserved

---

**Last Updated**: January 2026
**Version**: 1.0.0
