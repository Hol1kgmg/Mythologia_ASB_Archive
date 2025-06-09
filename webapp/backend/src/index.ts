import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimit } from './infrastructure/auth/middleware/rate-limit.js'
import { apiRoutes } from './routes/index.js'

const app = new Hono()

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET;
const HMAC_SECRET = process.env.HMAC_SECRET;

if (!JWT_SECRET || !HMAC_SECRET) {
  console.error('Missing required environment variables: JWT_SECRET, HMAC_SECRET');
  process.exit(1);
}

// CORS middleware
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://mythologia-admirals-ship-bridge.vercel.app'
  ],
  allowHeaders: ['Authorization', 'Content-Type', 'X-HMAC-Signature', 'X-Timestamp'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// Rate limiting for all routes
app.use('*', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
}))

// Public routes (no authentication required)
app.get('/', (c) => {
  return c.json({ 
    message: 'Mythologia Admiral Ship Bridge API',
    version: '1.0.0',
    status: 'online'
  })
})

// Basic health check (public)
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Mount API routes
app.route('/api', apiRoutes)

const port = Number(process.env.PORT) || 8000

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
}, (info) => {
  const domain = process.env.RAILWAY_PRIVATE_DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || '0.0.0.0'
  console.log(`🚀 Mythologia Backend Server is running on http://${domain}:${info.port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Port: ${info.port}`)
})
