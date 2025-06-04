import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createDatabaseAdapter } from '@/adapters';
import { createAPIRouter } from '@/api';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Environment detection and database adapter setup
function initializeDatabase() {
  const platform = (process.env.PLATFORM as 'vercel' | 'cloudflare') || 'vercel';
  
  if (platform === 'vercel') {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      // Development mode: provide mock adapter
      console.warn('⚠️  DATABASE_URL not set - running in development mode without database');
      return null;
    }
    return createDatabaseAdapter({ platform, connectionString });
  } else {
    // For Cloudflare, D1 database would be injected via bindings
    // This is a placeholder for development
    console.warn('⚠️  Cloudflare D1 setup not yet implemented for development environment');
    return null;
  }
}

// Initialize database adapter
const db = initializeDatabase();

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: '神託のメソロギア 非公式カード情報データベース API',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: process.env.PLATFORM || 'vercel',
  });
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    platform: process.env.PLATFORM || 'vercel',
  });
});

// Mount API routes (only if database is available)
if (db) {
  app.route('/api', createAPIRouter(db));
} else {
  app.get('/api/*', (c) => {
    return c.json({
      success: false,
      error: 'Database not configured',
      message: 'Please set DATABASE_URL environment variable',
    }, 503);
  });
}

export default app;