# Backend + Shared Build Image
FROM node:20-alpine AS base

# Prepare dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY shared/package.json ./shared/
RUN npm ci --only=production

# Build Stage
FROM base AS builder
WORKDIR /app

COPY package*.json ./
COPY shared ./shared
COPY . .

RUN npm ci

# Build shared first
RUN npm run build --workspace=@mythologia-asb/shared
# Then backend
RUN npm run build --workspace=@mythologia-asb/backend

# Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 honojs

COPY --from=deps --chown=honojs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=honojs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=honojs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=honojs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=honojs:nodejs /app/backend/package.json ./backend/package.json

USER honojs
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: process.env.PORT || 8787, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

CMD ["node", "backend/dist/index.js"]
