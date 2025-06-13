# Backend Build Image
FROM node:20-alpine AS base

# Prepare dependencies
FROM base AS deps
WORKDIR /app
# Copy backend package.json from context root
COPY webapp/backend/package*.json ./webapp/backend/
# Copy shared if it exists
COPY webapp/shared/package.json ./webapp/shared/ 2>/dev/null || true
# Copy root package.json if using workspaces
COPY package*.json ./ 2>/dev/null || true

# Install dependencies based on what exists
RUN if [ -f "package.json" ]; then npm ci --only=production; \
    else cd webapp/backend && npm ci --only=production; fi

# Build Stage
FROM base AS builder
WORKDIR /app

# Copy everything from repository root
COPY . .

# Install all dependencies
RUN if [ -f "package.json" ]; then npm ci; \
    else cd webapp/backend && npm ci; fi

# Build based on workspace or direct
RUN if [ -f "package.json" ] && grep -q "workspaces" package.json; then \
      npm run build --workspace=@mythologia-asb/backend || true; \
    fi && \
    cd webapp/backend && npm run build

# Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 honojs

# Copy dependencies and built files
COPY --from=deps --chown=honojs:nodejs /app/webapp/backend/node_modules ./webapp/backend/node_modules 2>/dev/null || true
COPY --from=deps --chown=honojs:nodejs /app/node_modules ./node_modules 2>/dev/null || true
COPY --from=builder --chown=honojs:nodejs /app/webapp/backend/dist ./webapp/backend/dist
COPY --from=builder --chown=honojs:nodejs /app/webapp/backend/package.json ./webapp/backend/package.json

# Copy shared if it exists
COPY --from=builder --chown=honojs:nodejs /app/webapp/shared/dist ./webapp/shared/dist 2>/dev/null || true

USER honojs
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["node", "webapp/backend/dist/index.js"]
