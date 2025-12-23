# PMP Practice Test Application

A comprehensive, full-stack application for PMP (Project Management Professional) certification exam preparation. Built with React, Node.js, Express, and PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 🎯 Features

### 📊 Progress Dashboard
- Study streak tracking with calendar heatmap
- Domain mastery breakdown with visual progress
- Exam readiness score
- Recent activity timeline
- Performance analytics

### 📝 Practice Tests
- 180-question full-length practice exams
- Domain-specific question filtering
- Real-time timer with pause functionality
- Question flagging for review
- Detailed explanations for all answers

### 🧠 Spaced Repetition Flashcards
- **SM-2 Algorithm** for optimal memory retention
- Confidence ratings: Again, Hard, Good, Easy
- Daily review goals with progress tracking
- Mastery levels: Learning, Reviewing, Mastered
- Category and domain filtering

### 📱 Enhanced Test Experience
- Post-test **Review Mode** with detailed analysis
- **Question flagging** during tests
- **Time-per-question analytics**
- Domain performance breakdown
- Filter by: All, Incorrect, Flagged, Correct

### ⚙️ Admin Panel
- User management with role assignment
- Question CRUD operations
- Practice test management
- Flashcard management
- Dashboard with usage statistics

### 📲 Mobile Optimization
- PWA-ready with manifest
- Touch-friendly 44px+ tap targets
- Bottom navigation bar
- Safe area support for notched devices
- Offline-capable architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (recommended)
- Or: PostgreSQL 14+ and Redis 7+ (for manual setup)

### Option 1: Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/dustinober1/pmp_application.git
cd pmp_application

# Create environment file
cp .env.example .env
# Edit .env to set JWT_SECRET (required)

# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# Wait for services to be healthy, then seed the database
docker-compose exec backend npx prisma db seed
```

The backend will be available at `http://localhost:3001`.

For the frontend:
```bash
cd client/client
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

### Option 2: Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/dustinober1/pmp_application.git
cd pmp_application
```

2. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd client/client && npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pmp_practice"
JWT_SECRET="your-secure-secret-key"  # REQUIRED - generate a strong random string
REDIS_URL="redis://localhost:6379"
PORT=3001
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
NODE_ENV="development"
```

4. **Set up database**
```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed  # Optional: seed initial data
```

5. **Start development servers**
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client/client && npm run dev
```

6. **Open the app**
```
Frontend: http://localhost:5173
Backend:  http://localhost:3001
API Docs: http://localhost:3001/api-docs
Health:   http://localhost:3001/health
```

## 🐳 Docker Commands

```bash
# Development mode (with hot reloading)
docker-compose up

# View logs
docker-compose logs -f backend

# Run tests
docker-compose --profile test run test

# Production build (uses multi-stage Dockerfile)
docker-compose --profile production up backend-prod

# Stop all containers
docker-compose down

# Reset database
docker-compose down -v  # Removes volumes
docker-compose up -d
```

## 📁 Project Structure

```
pmp_application/
├── client/client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── styles/         # CSS stylesheets
│   └── public/             # Static assets
├── prisma/
│   ├── schema.prisma       # Database schema (PostgreSQL)
│   ├── migrations/         # Database migrations
│   └── seed.ts             # Seed data
├── src/
│   ├── config/             # Configuration (Swagger, etc.)
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Express middleware (auth, validation)
│   ├── routes/             # API routes
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # Business logic (database, cache)
│   └── utils/              # Utilities (logger, AppError)
├── tests/                  # Test files
│   ├── controllers/        # Controller unit tests
│   ├── integration/        # API integration tests
│   ├── middleware/         # Middleware tests
│   └── setup.ts            # Test configuration
├── Dockerfile              # Production multi-stage build
├── Dockerfile.dev          # Development build
└── docker-compose.yml      # Docker services
```

## 🔌 API Reference

Interactive API documentation available at `/api-docs` when the server is running.

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/profile` | PUT | Update profile |
| `/api/auth/password` | PUT | Change password |

### Questions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/questions` | GET | List questions (paginated) |
| `/api/questions/:id` | GET | Get single question |
| `/api/questions/domains` | GET | List all domains |

### Flashcards
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/flashcards` | GET | List flashcards |
| `/api/flashcards/due` | GET | Get due cards (spaced rep) |
| `/api/flashcards/:id/review` | POST | Submit review |
| `/api/flashcards/stats` | GET | Get study statistics |
| `/api/flashcards/goals` | PUT | Update daily goals |

### Practice Tests
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/practice/tests` | GET | List practice tests |
| `/api/practice/tests/:testId/start` | POST | Start test session |
| `/api/practice/sessions/:sessionId/answer` | POST | Submit answer |
| `/api/practice/sessions/:sessionId/complete` | PUT | Complete session |
| `/api/practice/sessions/:sessionId/review` | GET | Get review data |

### Progress
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/progress` | GET | Get dashboard data |
| `/api/progress/domain/:domainId` | GET | Get domain progress |
| `/api/progress/activity` | POST | Record study activity |
| `/api/progress/history` | GET | Get study history |

### Admin (Requires ADMIN role)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Admin statistics |
| `/api/admin/users` | GET | List users |
| `/api/admin/users/:id/role` | PUT | Update user role |
| `/api/admin/questions` | GET/POST | Manage questions |
| `/api/admin/flashcards` | GET/POST | Manage flashcards |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in Docker
docker-compose --profile test run test
```

### Test Structure
- **Unit tests**: Controllers, middleware, services
- **Integration tests**: API endpoints with real database
- **Frontend tests**: Components (Vitest + React Testing Library)

## 📊 Database Schema

The application uses **PostgreSQL** (not SQLite). The schema includes:

### Core Models
- **User**: Authentication, roles, progress tracking
- **Question**: PMP exam questions with choices (JSON)
- **FlashCard**: Study flashcards with SM-2 algorithm data
- **Domain**: PMP exam domains (People, Process, Business)
- **PracticeTest**: Full-length exam configurations
- **UserTestSession**: User's test attempts
- **UserAnswer**: Individual question responses
- **FlashCardReview**: Spaced repetition tracking
- **DailyGoal**: Study goal configuration
- **StudyStreak**: Consecutive study tracking

## 🔐 Security

- JWT-based authentication with secure secret (required env var)
- Password hashing with bcrypt (12 rounds)
- Role-based access control (USER, ADMIN)
- CORS with configurable domain whitelist
- Helmet.js security headers
- Rate limiting on all endpoints (stricter on auth)
- Zod input validation on all endpoints
- Standardized error responses (no internal details in production)

## 🚀 Deployment

### Production Build

```bash
# Build backend
npm run build
npm start

# Build frontend
cd client/client
npm run build
# Serve dist/ with any static server
```

### Docker Production

```bash
# Build and run production container
docker build -t pmp-app .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e JWT_SECRET="<strong-secret>" \
  -e NODE_ENV="production" \
  -e FRONTEND_URL="https://your-domain.com" \
  -e ALLOWED_ORIGINS="https://your-domain.com" \
  pmp-app
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://...          # Required
REDIS_URL=redis://...                   # Required
JWT_SECRET=<strong-random-secret>       # Required - min 32 chars recommended
NODE_ENV=production                     # Required
FRONTEND_URL=https://your-domain.com    # Required
ALLOWED_ORIGINS=https://your-domain.com # Required - comma-separated
PORT=3001                               # Optional
```

## 🎨 Styling

- Custom CSS with utility classes
- Mobile-first responsive design
- CSS variables for theming
- Dark mode support (mobile nav)

## 📱 PWA Features

- Web App Manifest
- iOS standalone mode support
- Theme color: #4f46e5 (Indigo)
- Home screen installation
- Splash screen configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Development Guidelines
- Run tests before submitting PRs
- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

- PMP exam content based on PMBOK Guide 7th Edition
- SM-2 Algorithm by Piotr Wozniak
- Icons from Heroicons
- Built with React, Express, Prisma, and PostgreSQL