# PMP Study Application

A comprehensive study platform for the 2026 PMP (Project Management Professional) certification exam.

## Features

- 📚 **Study Guides** - Comprehensive content organized by PMI domains and tasks
- 🎴 **Flashcards** - Spaced repetition learning for key concepts
- ✅ **Practice Questions** - Exam-style questions with detailed explanations
- 📊 **Analytics Dashboard** - Track progress and identify weak areas
- 🧮 **Formula Calculator** - Practice EVM and other calculations
- 👥 **Team Management** - Corporate features for team progress tracking

## Tech Stack

- **Frontend**: React 18 + Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Testing**: Jest + Vitest + Playwright + fast-check (property-based testing)
- **Payments**: Stripe
- **Monitoring**: OpenTelemetry + Winston CloudWatch

## Project Structure

```
pmp_application/
├── packages/
│   ├── api/           # Express backend API
│   ├── web/           # Next.js frontend
│   └── shared/        # Shared types and utilities
└── package.json       # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Neon Database (or local PostgreSQL 15+)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp packages/api/.env.example packages/api/.env
   # Add your Neon DATABASE_URL and other secrets
   ```

4. Run database migrations:

   ```bash
   npm run db:migrate
   ```

5. Generate Prisma client:

   ```bash
   npm run db:generate
   ```

6. Seed the database:

   ```bash
   npm run db:seed
   npm run db:seed:ebook
   ```

7. Start the development servers:

   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Deployment

This application is configured for deployment on **Render**.

- **API**: Deployed as a Web Service.
- **Web**: Deployed as a Web Service (Static Site or SSR).
- **Database**: Managed by **Neon**.

## Subscription Tiers

| Feature            | Free    | Pro       | Corporate |
| ------------------ | ------- | --------- | --------- |
| Study Guides       | Limited | Full      | Full      |
| Flashcards         | 500     | 2000      | 2000      |
| Questions/Domain   | 25      | 200       | 200       |
| Mock Exams         | ❌      | ✅        | ✅        |
| Formula Calculator | ❌      | ✅        | ✅        |
| Custom Flashcards  | ❌      | ✅        | ✅        |
| Advanced Analytics | ❌      | ✅        | ✅        |
| Team Management    | ❌      | ❌        | ✅        |

## License

Private - All rights reserved
