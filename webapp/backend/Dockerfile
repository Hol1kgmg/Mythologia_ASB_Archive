# Railway Backend Dockerfile for Mythologia Admiral Ship Bridge
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../shared/package.json ./shared/
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
COPY ../shared ./shared
RUN npm ci

# Copy source code
COPY . .

# Build shared package first
WORKDIR /app/shared
RUN npm run build

# Build backend
WORKDIR /app
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 honojs

# Copy built application
COPY --from=deps --chown=honojs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=honojs:nodejs /app/dist ./dist
COPY --from=builder --chown=honojs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=honojs:nodejs /app/package.json ./package.json

USER honojs

# Expose port (Railway will set $PORT)
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["npm", "start"]