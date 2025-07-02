# Backend Build Image - Node.js 20 LTS for stability
FROM node:20.11.1-alpine AS base

# Set working directory from the start
WORKDIR /app

# Prepare dependencies
FROM base AS deps
# Copy package files for dependency installation
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/ 2>/dev/null || true

# Install production dependencies
RUN cd backend && npm ci --only=production && rm -rf ~/.npm

# Build Stage
FROM base AS builder

# Copy everything from webapp directory
COPY . .

# Install all dependencies (including dev dependencies for building)
RUN cd backend && npm ci

# Build shared first if it exists
RUN if [ -d "shared" ] && [ -f "shared/package.json" ]; then \
        cd shared && npm ci && npm run build; \
    fi

# Build backend
RUN cd backend && npm run build

# Verify build output and show structure
RUN echo "🔍 Build verification:" && \
    ls -la backend/ && \
    echo "📁 Dist contents:" && \
    ls -la backend/dist/ && \
    test -f backend/dist/index.js && echo "✅ backend/dist/index.js found" || (echo "❌ backend/dist/index.js not found!" && exit 1)

# Runtime
FROM base AS runner
# Set workdir to backend specifically for Runtime
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 honojs

# Copy built application
COPY --from=builder --chown=honojs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=honojs:nodejs /app/backend/package.json ./backend/package.json

# Copy shared artifacts if they exist
RUN mkdir -p shared 2>/dev/null || true
COPY --from=builder --chown=honojs:nodejs /app/shared/dist ./shared/dist 2>/dev/null || true

# Copy production dependencies
COPY --from=deps --chown=honojs:nodejs /app/backend/node_modules ./backend/node_modules

# Final verification and set working directory to backend
WORKDIR /app/backend
RUN ls -la . && \
    ls -la dist/ && \
    test -f dist/index.js && echo "✅ Runtime: index.js confirmed at $(pwd)/dist/index.js"

USER honojs
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["node", "dist/index.js"]