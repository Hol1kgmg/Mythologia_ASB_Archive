import 'dotenv/config';

// Debug information for Railway ESM troubleshooting
console.log('🔍 Starting Mythologia Backend...');
console.log('Node.js version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('Module resolution debug:');
console.log('- Current file URL:', import.meta.url);

// ESM-compatible debug info
import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('- __dirname:', __dirname);
console.log('- dist/index.js exists:', existsSync('./dist/index.js'));
console.log('- Directory contents:', readdirSync('.'));

try {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  console.log('- package.json type:', packageJson.type);
} catch (e) {
  console.log('- package.json read error:', e instanceof Error ? e.message : String(e));
}

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validateAuthEnvironment } from './config/auth.js';
import { apiRoutes } from './routes/index.js';

const app = new Hono();

// Environment variables validation
validateAuthEnvironment();

// CORS middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000']; // デフォルトはローカル開発のみ

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowHeaders: ['Authorization', 'Content-Type', 'X-HMAC-Signature', 'X-Timestamp', 'X-Admin-Secret-Path'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Rate limiting is handled by individual route middlewares

// Public routes (no authentication required)
app.get('/', (c) => {
  return c.json({
    message: 'Mythologia Admiral Ship Bridge API',
    version: '1.0.0',
    status: 'online',
  });
});

// Basic health check (public)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.route('/api', apiRoutes);

const port = Number(process.env.PORT) || 8000;

serve(
  {
    fetch: app.fetch,
    port: port,
    hostname: '0.0.0.0',
  },
  (info) => {
    const domain =
      process.env.RAILWAY_PRIVATE_DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || '0.0.0.0';
    console.log(`🚀 Mythologia Backend Server is running on http://${domain}:${info.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Port: ${info.port}`);
  }
);
