# FIREX Fire & Safety Management - Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy server, built frontend, and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server

# Persistent database storage mount point
VOLUME ["/app/server/data"]

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server/index.js"]
