# @pmp/api

Express + TypeScript API for the PMP study platform.

## Development

- Install deps (from repo root): `npm install`
- Run API: `npm run dev:api`
- Run tests: `npm test` or `npm run test:api` (from root)

## Database

The API uses **Prisma** with a **PostgreSQL** database (Neon in production).

- Generate Prisma client: `npm run db:generate`
- Run migrations: `npm run db:migrate`
- Seed database: `npm run db:seed`
- Seed ebook content: `npm run db:seed:ebook`
- Open Prisma Studio: `npm run db:studio`

## Environment

Copy `packages/api/.env.example` to `packages/api/.env` and fill in required values.

Required variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon or local)
- `JWT_SECRET`: Secret for signing access tokens
- `JWT_REFRESH_SECRET`: Secret for signing refresh tokens
- `STRIPE_SECRET_KEY`: Stripe API secret
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

## Health Check

- `GET /api/health`

## Documentation

- OpenAPI/Swagger: `GET /api/docs` (when running in development)
- Export OpenAPI spec: `npm run export:openapi`
