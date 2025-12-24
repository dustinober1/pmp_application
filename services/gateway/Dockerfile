# Gateway Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy shared library first
COPY ../shared ./shared
WORKDIR /app/shared
RUN npm install && npm run build

# Copy gateway source
WORKDIR /app/gateway
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "start"]
