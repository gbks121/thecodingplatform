# Multi-stage Dockerfile for The Coding Platform - Optimised
# Uses Alpine Linux for minimal footprint

# Stage 1: Build all packages together
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy all source code
COPY packages ./packages
COPY apps ./apps

# Install all dependencies (including dev for build)
RUN npm ci

# Remove any stray TypeScript incremental build files left in the context
# to ensure `tsc` performs a fresh build in CI/docker.
RUN find . -name "*.tsbuildinfo" -delete || true

# Build all packages in the correct order using the root script.
# This runs `build:shared`, `build:server`, then `build:client`.
RUN npm run build

# Stage 2: Production dependencies only
FROM node:lts-alpine AS deps

WORKDIR /app

# Copy root package.json for workspace structure
COPY package*.json ./

# Copy only the backend package files for production dependencies
COPY apps/server/package.json ./apps/server/package.json
COPY backend-package.json ./

# Install ONLY production dependencies using backend-package.json
RUN npm install --omit=dev

# Stage 3: Final production image
FROM node:lts-alpine AS final

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend files
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/dist ./frontend

# Copy built backend files
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/dist ./backend

# Copy shared package
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared ./packages/shared

# Copy production dependencies only (from deps stage)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy backend package.json for reference
COPY --from=deps --chown=nextjs:nodejs /app/backend-package.json ./backend-package.json

# Create nginx configuration directory and file
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script directly in the container to avoid line ending issues
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start nginx in background' >> /app/start.sh && \
    echo 'nginx -c /etc/nginx/conf.d/default.conf &' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Wait a moment for nginx to start' >> /app/start.sh && \
    echo 'sleep 2' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start backend server' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'NODE_ENV=production PORT=3001 node index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start the application as root to handle nginx
USER root
CMD ["/bin/sh", "/app/start.sh"]
