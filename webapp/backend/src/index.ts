import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cards, leaders, tribes, debug } from './routes';
import type { CloudflareEnv } from './config/env';

// Honoアプリケーションの型定義
type Bindings = {
  DB?: D1Database;
  CACHE?: KVNamespace;
  DATABASE_TYPE?: string;
  ENVIRONMENT?: string;
  DATABASE_URL?: string;
};

type Variables = {
  db?: D1Database;
  cache?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ミドルウェア
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8787',
      'https://mythologia.vercel.app', // 本番Vercel URL
      /^https:\/\/.*\.vercel\.app$/, // Vercelプレビュー環境
    ];
    
    if (!origin) return null;
    
    for (const allowed of allowedOrigins) {
      if (allowed instanceof RegExp && allowed.test(origin)) {
        return origin;
      } else if (typeof allowed === 'string' && allowed === origin) {
        return origin;
      }
    }
    
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 環境変数をコンテキストに注入
app.use('*', async (c, next) => {
  // Cloudflare Workers環境の場合
  if (c.env?.DB) {
    c.set('db', c.env.DB);
  }
  if (c.env?.CACHE) {
    c.set('cache', c.env.CACHE);
  }
  
  await next();
});

// ルート
app.get('/', (c) => {
  return c.json({ 
    message: 'Mythologia Admiral Ship Bridge API',
    version: '1.0.0',
    status: 'ok'
  });
});

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// APIルート
app.route('/api/cards', cards);
app.route('/api/leaders', leaders);
app.route('/api/tribes', tribes);

// 開発用デバッグルート
app.route('/debug', debug);

export default app;
