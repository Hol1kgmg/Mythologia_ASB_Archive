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
  port: port
}, (info) => {
  console.log(`🚀 Mythologia Backend Server is running on http://localhost:${info.port}`)
})
