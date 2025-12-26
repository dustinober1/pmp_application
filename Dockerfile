# =============================================================================
# PMP Application - Production Dockerfile (Full Stack)
# =============================================================================
# Multi-stage build for both frontend and backend
# 
# Security features:
# - Pinned base image versions
# - Non-root user execution
# - Minimal attack surface (alpine-based)
# - Health checks enabled
# - No unnecessary packages
# =============================================================================

# -----------------------------------------------------------------------------
# Frontend Build Stage
# -----------------------------------------------------------------------------
FROM node:20.10-alpine3.19 AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/client/package*.json ./

# Install frontend dependencies
RUN npm ci --no-audit --no-fund

# Copy frontend source
COPY client/client/ ./

# Set the API URL for production build
ENV VITE_API_URL=/api

# Build frontend
RUN npm run build

# -----------------------------------------------------------------------------
# Backend Build Stage
# -----------------------------------------------------------------------------
FROM node:20.10-alpine3.19 AS backend-builder

LABEL maintainer="dustinober1"
LABEL org.opencontainers.image.source="https://github.com/dustinober1/pmp_application"
LABEL org.opencontainers.image.description="PMP Practice Application - Build Stage"

WORKDIR /app

# Install OpenSSL for Prisma (required for database connections)
RUN apk add --no-cache openssl

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove development dependencies after build
RUN npm prune --production

# -----------------------------------------------------------------------------
# Production Stage
# -----------------------------------------------------------------------------
FROM node:20.10-alpine3.19 AS runner

LABEL maintainer="dustinober1"
LABEL org.opencontainers.image.source="https://github.com/dustinober1/pmp_application"
LABEL org.opencontainers.image.description="PMP Practice Application - Production"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache \
    openssl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs appuser

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm pkg delete scripts.prepare \
    && npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Generate Prisma client in production
RUN npx prisma generate

# Copy built backend from builder stage
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/client/dist ./public

# Copy JSON data files for seeding
COPY pmp_2026_people_bank.json ./data/
COPY pmp_2026_process_bank.json ./data/
COPY pmp_2026_business_bank.json ./data/
COPY pmp_flashcards_master.json ./data/

# Copy startup script
COPY scripts/startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Set ownership to non-root user
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Environment variables (non-sensitive defaults)
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application using the startup script
CMD ["./startup.sh"]
