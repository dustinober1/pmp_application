# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy package files for workspace
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/
COPY packages/web/package.json packages/web/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Generate Prisma Client
WORKDIR /app/packages/api
RUN npx prisma generate

# Build API package
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy root package files
COPY package.json package-lock.json ./

# Copy package files
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/
COPY packages/web/package.json packages/web/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/api/dist packages/api/dist
COPY --from=builder /app/packages/api/prisma packages/api/prisma
COPY --from=builder /app/node_modules/@prisma/client packages/api/node_modules/@prisma/client

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app/packages/api

EXPOSE 3001

# Start command handles migrations and then starts the server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]