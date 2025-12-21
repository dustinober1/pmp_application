# PMP Practice Test Application

A comprehensive web application designed to help professionals prepare for the Project Management Professional (PMP) certification exam. This application features realistic scenario-based questions and domain-specific flashcards aligned with the latest PMP exam weightings.

## Features

- **Practice Tests**: Full-length practice tests that mirror the actual PMP exam format
- **Domain-Specific Flashcards**: Study aids organized by PMP domains (People, Process, Business Environment)
- **Progress Tracking**: Monitor your performance and improvement over time
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Detailed explanations for each question

## Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **Prisma ORM** with SQLite database
- **JWT Authentication** (ready for implementation)

### Frontend
- **React 18** with TypeScript
- **Vite** as the build tool
- **React Router** for navigation
- **TanStack Query** for API state management
- **Tailwind CSS** for styling

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pmp_application
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client/client
npm install
```

4. Set up environment variables:
```bash
# Backend .env file
DATABASE_URL="file:./dev.db"
PORT=3001
FRONTEND_URL=http://localhost:5173

# Frontend .env file (in client/client/)
VITE_API_URL=http://localhost:3001/api
```

5. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. Start the frontend development server:
```bash
cd client/client
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## API Endpoints

### Questions
- `GET /api/questions` - Get questions with optional filters
- `GET /api/questions/domains` - Get all PMP domains
- `GET /api/questions/:id` - Get a specific question

### Flashcards
- `GET /api/flashcards` - Get flashcards with filters
- `GET /api/flashcards/categories` - Get flashcard categories
- `GET /api/flashcards/:id` - Get a specific flashcard

### Practice Tests
- `GET /api/practice/tests` - Get available practice tests
- `GET /api/practice/tests/:id` - Get a specific practice test
- `POST /api/practice/sessions/start` - Start a test session
- `POST /api/practice/sessions/answer` - Submit an answer
- `PUT /api/practice/sessions/:sessionId/complete` - Complete a test session

## Database Schema

The application uses the following main entities:
- **Users**: User accounts and authentication
- **Domains**: PMP exam domains (People, Process, Business Environment)
- **Questions**: Practice questions with scenarios and explanations
- **FlashCards**: Study cards for key concepts
- **PracticeTests**: Full-length test configurations
- **UserTestSessions**: Test attempts and results

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature description'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions, issues, or contributions, please open an issue in the repository.

---

**Admin Credentials (for testing):**
- Email: admin@pmp.com
- Password: admin123