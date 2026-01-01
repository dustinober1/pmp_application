# Docker Development Setup

This will run the entire application stack in Docker containers, isolated from your local environment.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Stop any local processes:**

   ```bash
   # Kill any node processes on ports 3000 or 3001
   lsof -ti :3000 | xargs kill -9 2>/dev/null || true
   lsof -ti :3001 | xargs kill -9 2>/dev/null || true
   ```

2. **Build and start all containers:**

   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - Web: http://localhost:3000
   - API: http://localhost:3001/api
   - API Health: http://localhost:3001/api/health

## Test User Credentials

- Email: **test@example.com**
- Password: **Password123**

## Stopping the Containers

```bash
docker compose down
```

## Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

## Resetting the Database

```bash
docker compose down -v  # Removes volumes
docker compose up --build  # Rebuilds and restarts
```

## Container Details

- **pmp_postgres**: PostgreSQL database on port 5432
- **pmp_redis**: Redis cache on port 6379
- **pmp_api**: Express API server on port 3001
- **pmp_web**: Next.js web application on port 3000
