# Contributing

## Prerequisites
- Node.js 18+
- Docker (optional, for Postgres/Redis)

## Setup
1. Install dependencies: `npm install`
2. Start infra (optional): `docker compose up -d`
3. Configure API env: `cp packages/api/.env.example packages/api/.env`
4. Configure web env (optional): `cp packages/web/.env.example packages/web/.env.local`
5. Run migrations: `npm run db:migrate`

## Development
- Run all packages: `npm run dev`
- API only: `npm run dev:api`
- Web only: `npm run dev:web`

## Quality
- Lint: `npm run lint`
- Format: `npm run format`
- Tests: `npm run test`

