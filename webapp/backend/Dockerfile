# Backend Build Image
FROM node:20-alpine AS base

# Prepare dependencies
FROM base AS deps
WORKDIR /app
# Copy backend package.json (context is ./webapp)
COPY backend/package*.json ./backend/
# Copy shared if it exists
COPY shared/package.json ./shared/ 2>/dev/null || true

# Install dependencies
RUN cd backend && npm ci --only=production

# Build Stage
FROM base AS builder
WORKDIR /app

# Copy everything from webapp directory
COPY . .

# Install all dependencies
RUN cd backend && npm ci

# Build backend
RUN cd backend && npm run build

# Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 honojs

# Copy dependencies and built files
COPY --from=deps --chown=honojs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=honojs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=honojs:nodejs /app/backend/package.json ./backend/package.json

# Copy shared if it exists
COPY --from=builder --chown=honojs:nodejs /app/shared/dist ./shared/dist 2>/dev/null || true

USER honojs
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["node", "backend/dist/index.js"]
