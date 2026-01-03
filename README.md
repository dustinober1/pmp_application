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

- **Frontend**: React 18 + Next.js + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Testing**: Jest + fast-check (property-based testing)
- **Payments**: Stripe

## Project Structure

```
pmp_application/
├── packages/
│   ├── api/           # Express backend API
│   ├── web/           # Next.js frontend
│   └── shared/        # Shared types and utilities
├── docker-compose.yml # PostgreSQL + Redis
└── package.json       # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- Redis (optional, or Docker)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the database (using Docker):

   ```bash
   docker-compose up -d
   ```

4. Set up environment variables:

   ```bash
   cp packages/api/.env.example packages/api/.env
   ```

5. Run database migrations:

   ```bash
   npm run db:migrate
   ```

6. Generate Prisma client:

   ```bash
   npm run db:generate
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

## Subscription Tiers

| Feature            | Free    | Mid-Level | High-End  | Corporate |
| ------------------ | ------- | --------- | --------- | --------- |
| Study Guides       | Limited | Full      | Full      | Full      |
| Flashcards         | 50      | Unlimited | Unlimited | Unlimited |
| Questions/Domain   | 25      | 100       | 200       | 200       |
| Mock Exams         | ❌      | ❌        | ✅        | ✅        |
| Formula Calculator | ❌      | ❌        | ✅        | ✅        |
| Custom Flashcards  | ❌      | ❌        | ✅        | ✅        |
| Advanced Analytics | ❌      | ✅        | ✅        | ✅        |
| Team Management    | ❌      | ❌        | ❌        | ✅        |

## License

Private - All rights reserved
