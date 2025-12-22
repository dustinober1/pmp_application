# Developer Guide

## Overview

This guide covers the technical details for developers working on the PMP Practice Test Application.

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, React Query |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT, bcrypt |
| **Testing** | Jest, Supertest, React Testing Library |

### Directory Structure

```
pmp_application/
├── client/client/           # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # Basic UI components
│   │   │   └── Layout.tsx   # Main layout wrapper
│   │   ├── contexts/        # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/           # Route components
│   │   ├── services/        # API calls
│   │   │   ├── api.ts       # Axios instance
│   │   │   └── *.ts         # Service modules
│   │   └── styles/          # CSS files
│   └── public/              # Static assets
├── src/                     # Backend source
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── routes/              # Route definitions
│   └── services/            # Business logic
├── prisma/                  # Database
│   ├── schema.prisma        # Schema definition
│   └── migrations/          # Migration files
├── tests/                   # Test files
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

1. **Node.js 18+**
```bash
node --version  # Should be >= 18
```

2. **PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

3. **Create Database**
```bash
createdb pmp_practice
```

### Setup

1. **Clone and install**
```bash
git clone https://github.com/dustinober1/pmp_application.git
cd pmp_application
npm install
cd client/client && npm install
```

2. **Configure environment**
```bash
# Create .env from example
cp .env.example .env

# Edit with your values
DATABASE_URL="postgresql://user:pass@localhost:5432/pmp_practice"
JWT_SECRET="generate-a-secure-random-string"
```

3. **Initialize database**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Seed data (optional)**
```bash
npm run db:seed
npm run db:import-questions
```

## Development

### Running the App

**Backend (port 3001):**
```bash
npm run dev
```

**Frontend (port 5173):**
```bash
cd client/client
npm run dev
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (recommended)

### Making Changes

1. **Create a branch**
```bash
git checkout -b feature/my-feature
```

2. **Make changes and test**
```bash
npm test
npm run build
```

3. **Commit with clear messages**
```bash
git commit -m "Add: Feature description

- Bullet point details
- What changed and why"
```

## Database

### Schema Overview

```
Users
├── UserTestSession
│   └── UserAnswer
├── FlashCardReview
├── UserProgress
├── StudyStreak
└── DailyGoal

Questions
├── PracticeTest (via TestQuestion)
└── Domain

FlashCards
└── Domain
```

### Migrations

**Create migration:**
```bash
npx prisma migrate dev --name my_migration_name
```

**Apply migrations:**
```bash
npx prisma migrate deploy
```

**Reset database:**
```bash
npx prisma migrate reset
```

### Prisma Studio
```bash
npx prisma studio
# Opens browser GUI at localhost:5555
```

## API Development

### Adding a New Endpoint

1. **Create controller** (`src/controllers/myController.ts`):
```typescript
import { Request, Response } from 'express';
import { prisma } from '../services/database';

export const getMyData = async (req: Request, res: Response) => {
  try {
    const data = await prisma.myModel.findMany();
    return res.json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
};
```

2. **Add route** (`src/routes/myRoutes.ts`):
```typescript
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMyData } from '../controllers/myController';

const router = Router();

router.get('/', authenticateToken, getMyData);

export default router;
```

3. **Register in server** (`src/server.ts`):
```typescript
import myRoutes from './routes/myRoutes';
app.use('/api/my-endpoint', myRoutes);
```

### Authentication Middleware

```typescript
// Public route
router.get('/public', myHandler);

// Authenticated route
router.get('/private', authenticateToken, myHandler);

// Optional auth (user attached if token valid)
router.get('/mixed', optionalAuth, myHandler);

// Admin only
router.get('/admin', authenticateToken, requireAdmin, myHandler);
```

## Frontend Development

### Creating a New Page

1. **Create page component** (`src/pages/MyPage.tsx`):
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { myService } from '../services/myService';
import LoadingState from '../components/ui/LoadingState';

const MyPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data'],
    queryFn: myService.getData,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1>My Page</h1>
      {/* Content */}
    </div>
  );
};

export default MyPage;
```

2. **Create service** (`src/services/myService.ts`):
```typescript
import api from './api';

export const myService = {
  getData: async () => {
    const response = await api.get('/my-endpoint');
    return response.data;
  },
};
```

3. **Add route** (`src/App.tsx`):
```tsx
import MyPage from './pages/MyPage';

// In Routes:
<Route
  path="/my-page"
  element={
    <Layout>
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    </Layout>
  }
/>
```

### State Management

We use **React Query** for server state:

```tsx
// Queries (GET)
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFn,
});

// Mutations (POST/PUT/DELETE)
const mutation = useMutation({
  mutationFn: submitFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

### Authentication Context

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user.firstName}!</div>;
};
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests

**Controller test:**
```typescript
import { Request, Response } from 'express';
import { myHandler } from '../../src/controllers/myController';

jest.mock('../../src/services/database', () => ({
  prisma: {
    myModel: {
      findMany: jest.fn(),
    },
  },
}));

describe('myHandler', () => {
  it('should return data', async () => {
    const mockData = [{ id: 1 }];
    (prisma.myModel.findMany as jest.Mock).mockResolvedValue(mockData);

    const req = {} as Request;
    const res = {
      json: jest.fn(),
    } as unknown as Response;

    await myHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});
```

### Test Coverage Goals

| Metric | Target |
|--------|--------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

## SM-2 Spaced Repetition Algorithm

### Overview

The SM-2 algorithm optimizes flashcard review intervals:

```typescript
function calculateSM2(quality, easeFactor, interval) {
  // quality: 0 (Again) to 3 (Easy)
  
  if (quality === 0) { // AGAIN
    return { interval: 1, easeFactor: max(1.3, ef - 0.2) };
  }
  
  if (quality === 1) { // HARD
    return { interval: interval * 1.2, easeFactor: ef - 0.15 };
  }
  
  if (quality === 2) { // GOOD
    if (interval <= 1) return { interval: 3 };
    if (interval <= 3) return { interval: 7 };
    return { interval: interval * easeFactor };
  }
  
  if (quality === 3) { // EASY
    return { 
      interval: interval * easeFactor * 1.3,
      easeFactor: easeFactor + 0.15
    };
  }
}
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| easeFactor | 2.5 | Multiplier for interval |
| interval | 1 | Days until next review |
| lapses | 0 | Times answered "Again" |

## Deployment

### Building for Production

**Backend:**
```bash
npm run build
# Output: dist/
```

**Frontend:**
```bash
cd client/client
npm run build
# Output: dist/
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for JWT signing |
| PORT | No | Server port (default: 3001) |
| NODE_ENV | No | production/development |
| FRONTEND_URL | Yes | CORS allowed origin |

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## Troubleshooting

### Common Issues

**Prisma client not generated:**
```bash
npx prisma generate
```

**Database connection error:**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify database exists

**TypeScript errors:**
```bash
npx tsc --noEmit  # Check for type errors
```

**Port already in use:**
```bash
lsof -i :3001  # Find process
kill -9 <PID>  # Kill it
```

## Resources

- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [React Query](https://tanstack.com/query)
- [JWT.io](https://jwt.io)
