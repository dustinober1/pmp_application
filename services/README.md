# PMP Application - Microservices Architecture

This directory contains the microservices implementation of the PMP Practice Application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                           │
│                            Port: 5173                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                 │
│                           Port: 3000                                 │
│                                                                      │
│  • Rate Limiting      • CORS            • Request Routing           │
│  • Correlation IDs    • Health Checks   • Auth Forwarding           │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   Auth Service    │   │ Questions Service │   │ Analytics Service │
│    Port: 3001     │   │    Port: 3002     │   │    Port: 3003     │
├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ • Login/Register  │   │ • Questions       │   │ • Progress        │
│ • JWT Tokens      │   │ • Flashcards      │   │ • Dashboard       │
│ • Refresh Tokens  │   │ • Practice Tests  │   │ • Study Streaks   │
│ • Profile         │   │ • Admin CRUD      │   │ • History         │
│ • Password Change │   │ • Caching (Redis) │   │ • Domain Stats    │
└─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
          │                       │                       │
          └───────────────────────┴───────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐           ┌───────────────┐
            │  PostgreSQL   │           │     Redis     │
            │   Port: 5432  │           │  Port: 6379   │
            └───────────────┘           └───────────────┘
```

## Services

### 1. API Gateway (`/gateway`)
- **Port:** 3000
- **Purpose:** Single entry point for all API requests
- **Features:**
  - Request routing to appropriate services
  - Rate limiting (general + auth-specific)
  - CORS handling
  - Correlation ID propagation
  - Service health monitoring
  - Auth header forwarding

### 2. Auth Service (`/auth-service`)
- **Port:** 3001
- **Purpose:** Authentication and user management
- **Endpoints:**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login and get tokens
  - `POST /api/auth/refresh` - Refresh access token
  - `POST /api/auth/logout` - Logout (revoke tokens)
  - `GET /api/auth/me` - Get current user
  - `PUT /api/auth/profile` - Update profile
  - `PUT /api/auth/password` - Change password

### 3. Questions Service (`/questions-service`)
- **Port:** 3002
- **Purpose:** Question bank, flashcards, and practice tests
- **Endpoints:**
  - `GET /api/questions` - List questions
  - `GET /api/questions/:id` - Get question
  - `GET /api/questions/domains/list` - Get domains
  - `GET /api/flashcards` - List flashcards
  - `GET /api/flashcards/:id` - Get flashcard
  - `GET /api/flashcards/categories/list` - Get categories
  - `GET /api/practice/tests` - List practice tests
  - `POST /api/practice/sessions` - Start test session
  - `POST /api/practice/sessions/:id/answer` - Submit answer
  - `POST /api/practice/sessions/:id/complete` - Complete test
  - `GET/POST/PUT /api/admin/*` - Admin endpoints

### 4. Analytics Service (`/analytics-service`)
- **Port:** 3003
- **Purpose:** Progress tracking and analytics
- **Endpoints:**
  - `GET /api/progress/user/:userId` - Get user progress
  - `GET /api/progress/dashboard/:userId` - Get dashboard data
  - `POST /api/progress/streak/:userId` - Update study streak
  - `POST /api/progress/domain` - Update domain progress
  - `GET /api/progress/history/:userId` - Get study history

### 5. Shared Library (`/shared`)
- Common utilities used across all services
- Includes: Logger, Errors, Middleware, Auth utils, Service Registry

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Install dependencies for each service:**
```bash
# Shared library
cd services/shared && npm install && npm run build

# Gateway
cd ../gateway && npm install

# Auth Service
cd ../auth-service && npm install

# Questions Service
cd ../questions-service && npm install

# Analytics Service
cd ../analytics-service && npm install
```

2. **Set up environment variables:**
```bash
# Copy template to each service
cp .env.example .env
```

3. **Run with Docker Compose:**
```bash
cd services
docker-compose -f docker-compose.microservices.yml up --build
```

4. **Run services individually (development):**
```bash
# Terminal 1: Gateway
cd gateway && npm run dev

# Terminal 2: Auth Service
cd auth-service && npm run dev

# Terminal 3: Questions Service
cd questions-service && npm run dev

# Terminal 4: Analytics Service
cd analytics-service && npm run dev
```

## Service Communication

### Correlation IDs
All requests receive a unique correlation ID that is:
- Added to the `X-Correlation-ID` header
- Propagated across all service calls
- Logged with every request for tracing

### Health Checks
Each service exposes a `/health` endpoint:
```json
{
  "status": "OK",
  "service": "auth-service",
  "timestamp": "2024-12-23T00:00:00.000Z"
}
```

The gateway aggregates health from all services:
```json
{
  "status": "OK",
  "timestamp": "2024-12-23T00:00:00.000Z",
  "services": {
    "auth": { "status": "healthy", "latency": 15 },
    "questions": { "status": "healthy", "latency": 12 },
    "analytics": { "status": "healthy", "latency": 18 }
  }
}
```

## Environment Variables

### Gateway
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Gateway port | 3000 |
| AUTH_SERVICE_URL | Auth service URL | http://localhost:3001 |
| QUESTIONS_SERVICE_URL | Questions service URL | http://localhost:3002 |
| ANALYTICS_SERVICE_URL | Analytics service URL | http://localhost:3003 |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:5173 |

### All Services
| Variable | Description |
|----------|-------------|
| NODE_ENV | Environment (development/production) |
| DATABASE_URL | PostgreSQL connection string |
| REDIS_URL | Redis connection string |
| JWT_SECRET | JWT signing secret |

## Scaling Considerations

### Horizontal Scaling
Each service can be scaled independently:
```bash
docker-compose up --scale questions-service=3 --scale analytics-service=2
```

### Load Balancing
For production, add a load balancer (nginx, HAProxy) in front of the gateway.

### Caching Strategy
- Questions and flashcards: Redis with 5-min TTL
- Individual items: 1-hour TTL
- User-specific data: Not cached (real-time)

## Monitoring

### Logging
All services use structured logging:
- Development: Colored console output
- Production: JSON format for log aggregation (ELK, CloudWatch)

### Metrics (Future)
- Prometheus endpoints can be added
- Grafana dashboards for visualization

## Migration from Monolith

The original monolith (`/src`) is still functional. To migrate:

1. Deploy microservices alongside monolith
2. Route traffic gradually using feature flags
3. Verify functionality at each step
4. Decommission monolith when ready

## Troubleshooting

### Service won't start
- Check DATABASE_URL is accessible
- Verify Prisma migrations are applied
- Check port availability

### Gateway can't reach services
- Verify service URLs in environment
- Check Docker network connectivity
- Ensure services are healthy

### Performance issues
- Check Redis connection
- Monitor database connections
- Review rate limiting settings
