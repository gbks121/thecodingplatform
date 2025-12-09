# Multi-stage Dockerfile for The Coding Platform
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

# Install all dependencies
RUN npm ci

# Build packages in dependency order
RUN npm run build:shared
RUN npm run build:server
RUN npm run build:client

# Stage 2: Production image
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
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/package.json ./backend/
COPY backend-package.json /app/backend/package.json

# Copy shared package
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared ./packages/shared

# Copy production node_modules (only backend dependencies needed)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

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