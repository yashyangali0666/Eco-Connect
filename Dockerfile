# Multi-Stage Dockerfile for EcoCollect Production Deployment
# Compatible with Google Cloud Run, Docker Compose, and Container Orchestration

# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY server/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl ca-certificates

# Copy server production dependencies & built assets
COPY --from=server-builder /app/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/@prisma ./node_modules/@prisma

# Copy client built static assets to expected dist directory
COPY --from=client-builder /app/client/dist /app/client/dist

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
