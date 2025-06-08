import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    message: 'Mythologia Admiral Ship Bridge API',
    version: '1.0.0',
    status: 'online'
  })
})

app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

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
