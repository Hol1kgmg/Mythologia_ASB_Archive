# Backend Build Image
FROM node:20-alpine AS base

# Prepare dependencies
FROM base AS deps
WORKDIR /app
# Copy package files for dependency installation
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/ || true

# Install production dependencies
RUN cd backend && npm ci --only=production

# Build Stage
FROM base AS builder
WORKDIR /app

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

# Verify build output
RUN ls -la backend/dist/ && test -f backend/dist/index.js || (echo "❌ backend/dist/index.js not found!" && exit 1)

# Runtime
FROM base AS runner
WORKDIR /app/backend

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 honojs

# Copy backend files to current directory
COPY --from=builder --chown=honojs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=honojs:nodejs /app/backend/package.json ./package.json

# Copy shared artifacts to parent directory (for monorepo dependencies)
COPY --from=builder --chown=honojs:nodejs /app/shared/dist ../shared/dist || true

# Copy production dependencies
COPY --from=deps --chown=honojs:nodejs /app/backend/node_modules ./node_modules

# Final verification
RUN ls -la ./dist/ && test -f ./dist/index.js && echo "✅ index.js confirmed"

USER honojs
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["npm", "start"]