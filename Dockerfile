# =============================================================================
# PMP Application - Production Dockerfile
# =============================================================================
# Multi-stage build for optimal image size and security
# 
# Security features:
# - Pinned base image versions
# - Non-root user execution
# - Minimal attack surface (alpine-based)
# - Health checks enabled
# - No unnecessary packages
# =============================================================================

# -----------------------------------------------------------------------------
# Build Stage
# -----------------------------------------------------------------------------
# Using specific pinned version for reproducible builds
FROM node:20.10-alpine3.19 AS builder

# Add labels for image metadata
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

# Add labels for image metadata
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
# Using fixed UID/GID for consistency across deployments
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

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
RUN chown -R appuser:nodejs /app

# Switch to non-root user
USER appuser

# Environment variables (non-sensitive defaults)
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check with proper intervals
# - interval: Time between health checks
# - timeout: Time to wait for response
# - start-period: Grace period for container startup
# - retries: Number of failures before unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init for proper signal handling (prevents zombie processes)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]
