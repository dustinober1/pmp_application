# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

---

## Questions Endpoints

### List Questions
```http
GET /questions
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| domain | string | - | Filter by domain ID |
| difficulty | string | - | EASY, MEDIUM, or HARD |
| methodology | string | - | Filter by methodology |

**Response (200):**
```json
{
  "questions": [
    {
      "id": "uuid",
      "questionText": "What is the best approach...",
      "scenario": "A project manager is...",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 2,
      "explanation": "The correct answer is C because...",
      "difficulty": "MEDIUM",
      "domain": {
        "id": "uuid",
        "name": "People",
        "color": "#3B82F6"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 180,
    "pages": 9
  }
}
```

### Get Single Question
```http
GET /questions/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "questionText": "...",
  "choices": ["A", "B", "C", "D"],
  "correctAnswerIndex": 0,
  "explanation": "...",
  "domain": { ... }
}
```

### Get All Domains
```http
GET /questions/domains
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "People",
    "description": "Managing and leading the project team",
    "weightPercentage": 42,
    "color": "#3B82F6"
  },
  {
    "id": "uuid",
    "name": "Process",
    "description": "Technical aspects of project management",
    "weightPercentage": 50,
    "color": "#10B981"
  },
  {
    "id": "uuid",
    "name": "Business Environment",
    "description": "Connection between projects and strategy",
    "weightPercentage": 8,
    "color": "#8B5CF6"
  }
]
```

---

## Flashcard Endpoints

### List Flashcards
```http
GET /flashcards
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| domain | string | Filter by domain ID |
| category | string | Filter by category |
| difficulty | string | EASY, MEDIUM, or HARD |
| limit | number | Max cards to return |
| offset | number | Skip cards |

**Response (200):**
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "frontText": "What is WBS?",
      "backText": "Work Breakdown Structure - A hierarchical...",
      "category": "Planning",
      "difficulty": "MEDIUM",
      "domain": {
        "id": "uuid",
        "name": "Process",
        "color": "#10B981"
      }
    }
  ],
  "total": 50
}
```

### Get Due Cards (Spaced Repetition)
```http
GET /flashcards/due
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max cards (default: 30) |
| domain | string | Filter by domain |

**Response (200):**
```json
{
  "cards": [
    {
      "id": "uuid",
      "frontText": "...",
      "backText": "...",
      "domain": { ... },
      "reviewInfo": {
        "easeFactor": 2.5,
        "interval": 3,
        "lapses": 0,
        "reviewCount": 2,
        "lastReviewedAt": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "dueCount": 15,
  "newCount": 5
}
```

### Review Card
```http
POST /flashcards/:id/review
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "difficulty": "GOOD"
}
```

**Difficulty Options:**
| Value | Description | Effect |
|-------|-------------|--------|
| AGAIN | Completely forgot | Reset to 1 day |
| HARD | Difficult recall | 1.2× interval |
| GOOD | Correct with effort | Standard SM-2 |
| EASY | Instant recall | 1.3× bonus |

**Response (200):**
```json
{
  "message": "Card reviewed successfully",
  "review": {
    "id": "uuid",
    "easeFactor": 2.5,
    "interval": 7,
    "nextReviewAt": "2024-01-22T00:00:00Z"
  }
}
```

### Get Study Statistics
```http
GET /flashcards/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "overview": {
    "totalCards": 200,
    "reviewedCards": 85,
    "newCards": 115,
    "dueToday": 12,
    "reviewedToday": 8
  },
  "mastery": {
    "learning": 25,
    "reviewing": 40,
    "mastered": 20
  },
  "dailyGoal": {
    "flashcardGoal": 20,
    "cardsReviewedToday": 8,
    "questionsGoal": 25,
    "questionsAnsweredToday": 15
  }
}
```

### Update Daily Goals
```http
PUT /flashcards/goals
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "flashcardGoal": 25,
  "questionsGoal": 30
}
```

---

## Practice Test Endpoints

### List Practice Tests
```http
GET /practice/tests
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Full Practice Exam #1",
    "description": "Complete 180-question exam",
    "totalQuestions": 180,
    "timeLimitMinutes": 230,
    "isActive": true
  }
]
```

### Start Test Session
```http
POST /practice/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "testId": "uuid"
}
```

**Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "startedAt": "2024-01-15T10:00:00Z"
  },
  "questions": [
    {
      "id": "uuid",
      "questionText": "...",
      "scenario": "...",
      "choices": ["A", "B", "C", "D"],
      "difficulty": "MEDIUM"
    }
  ],
  "timeLimit": 230
}
```

### Submit Answer
```http
POST /practice/sessions/answer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sessionId": "uuid",
  "questionId": "uuid",
  "selectedAnswerIndex": 2,
  "timeSpentSeconds": 45,
  "isFlagged": false
}
```

### Toggle Flag
```http
POST /practice/sessions/flag
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sessionId": "uuid",
  "questionId": "uuid"
}
```

### Complete Session
```http
PUT /practice/sessions/:sessionId/complete
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "status": "COMPLETED",
    "score": 78.5,
    "totalCorrect": 141,
    "totalQuestions": 180
  },
  "analytics": {
    "totalTimeSpent": 12300,
    "avgTimePerQuestion": 68,
    "flaggedCount": 5
  }
}
```

### Get Session Review
```http
GET /practice/sessions/:sessionId/review
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "score": 78.5,
    "status": "COMPLETED"
  },
  "questions": [
    {
      "id": "uuid",
      "questionText": "...",
      "choices": ["A", "B", "C", "D"],
      "correctAnswerIndex": 2,
      "selectedAnswerIndex": 1,
      "isCorrect": false,
      "isFlagged": true,
      "explanation": "...",
      "domain": { ... }
    }
  ],
  "domainBreakdown": [
    {
      "domain": "People",
      "correct": 35,
      "total": 45,
      "percentage": 77.8
    }
  ]
}
```

---

## Progress Endpoints

### Get Dashboard Data
```http
GET /progress/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "examReadiness": 72,
  "studyStreak": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastStudyDate": "2024-01-15"
  },
  "questionsStats": {
    "total": 180,
    "answered": 120,
    "correct": 95
  },
  "flashcardStats": {
    "reviewed": 85,
    "mastered": 40
  },
  "recentActivity": [
    {
      "type": "test",
      "score": 82,
      "date": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Admin Endpoints

*All admin endpoints require ADMIN role*

### Get Admin Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

### List Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search by name/email |

### Update User Role
```http
PUT /admin/users/:id/role
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

### CRUD Questions
```http
GET    /admin/questions         # List with filters
POST   /admin/questions         # Create
PUT    /admin/questions/:id     # Update
DELETE /admin/questions/:id     # Delete
```

### CRUD Flashcards
```http
GET    /admin/flashcards        # List
POST   /admin/flashcards        # Create
PUT    /admin/flashcards/:id    # Update
DELETE /admin/flashcards/:id    # Delete
```

### CRUD Tests
```http
GET    /admin/tests             # List
POST   /admin/tests             # Create
PUT    /admin/tests/:id         # Update
DELETE /admin/tests/:id         # Delete
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently not implemented. Consider adding for production.

## CORS

Configured to allow requests from:
- Development: `http://localhost:5173`
- Production: Set via `FRONTEND_URL` env variable
