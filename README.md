# PMP Practice Test Application

A comprehensive, full-stack application for PMP (Project Management Professional) certification exam preparation. Built with React, Node.js, Express, and PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

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
- PostgreSQL 14+
- npm or yarn

### Installation

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
JWT_SECRET="your-secure-secret-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
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
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts             # Seed data
├── src/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── services/           # Business logic
├── tests/                  # Test files
│   ├── controllers/
│   ├── middleware/
│   └── setup.ts
└── docs/                   # Documentation
```

## 🔌 API Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |

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
| `/api/practice/sessions` | POST | Start test session |
| `/api/practice/sessions/answer` | POST | Submit answer |
| `/api/practice/sessions/:id/complete` | PUT | Complete session |
| `/api/practice/sessions/:id/review` | GET | Get review data |

### Progress
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/progress/dashboard` | GET | Get dashboard data |
| `/api/progress/domains` | GET | Get domain progress |

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
```

### Test Structure
- **Unit tests**: Controllers, middleware, services
- **Integration tests**: API endpoints
- **Frontend tests**: Components (Vitest + RTL)

## 📊 Database Schema

### Core Models
- **User**: Authentication, roles, progress
- **Question**: PMP exam questions with choices
- **FlashCard**: Study flashcards with SM-2 data
- **Domain**: PMP exam domains (People, Process, Business)
- **PracticeTest**: Full-length exam configurations
- **UserTestSession**: User's test attempts
- **UserAnswer**: Individual question responses
- **FlashCardReview**: Spaced repetition tracking
- **DailyGoal**: Study goal configuration
- **StudyStreak**: Consecutive study tracking

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (USER, ADMIN)
- CORS configuration
- Helmet.js security headers
- Input validation

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

## 🚀 Deployment

### Production Build
```bash
# Backend
npm run build
npm start

# Frontend
cd client/client
npm run build
# Serve dist/ with any static server
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

- PMP exam content based on PMBOK Guide 7th Edition
- SM-2 Algorithm by Piotr Wozniak
- Icons from Heroicons
- Built with React, Express, Prisma, and PostgreSQL