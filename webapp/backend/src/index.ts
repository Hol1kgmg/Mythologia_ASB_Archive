import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { validateAuthEnvironment } from './config/auth'
import { apiRoutes } from './routes/index'

const app = new Hono()

// Environment variables validation
validateAuthEnvironment();

// CORS middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000']; // デフォルトはローカル開発のみ

app.use('*', cors({
  origin: allowedOrigins,
  allowHeaders: ['Authorization', 'Content-Type', 'X-HMAC-Signature', 'X-Timestamp'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// Rate limiting is handled by individual route middlewares

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
