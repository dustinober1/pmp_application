# Analytics Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy shared library first
COPY ../shared ./shared
WORKDIR /app/shared
RUN npm install && npm run build

# Copy Prisma schema
WORKDIR /app/analytics-service
COPY ../../prisma ./prisma

# Copy analytics service source
COPY package*.json ./
RUN npm install

# Generate Prisma client
RUN npx prisma generate

COPY . .
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

EXPOSE 3003

CMD ["npm", "start"]
