import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cards, leaders, tribes, debug } from './routes';

const app = new Hono();

// ミドルウェア
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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
