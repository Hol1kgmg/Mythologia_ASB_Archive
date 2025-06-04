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
      throw new Error('DATABASE_URL environment variable is required for Vercel platform');
    }
    return createDatabaseAdapter({ platform, connectionString });
  } else {
    // For Cloudflare, D1 database would be injected via bindings
    // This is a placeholder for development
    throw new Error('Cloudflare D1 setup not yet implemented for development environment');
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

// Mount API routes
app.route('/api', createAPIRouter(db));

export default app;