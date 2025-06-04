import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

describe('API Basic Integration Tests', () => {
  describe('Application without Database', () => {
    it('should create Hono app and respond to basic endpoints', async () => {
      const app = new Hono();
      
      // Basic middleware
      app.use('*', logger());
      app.use('*', cors());
      app.use('*', prettyJSON());

      // Health endpoint
      app.get('/', (c) => {
        return c.json({
          message: '神託のメソロギア 非公式カード情報データベース API',
          version: '0.1.0',
          status: 'healthy',
          timestamp: new Date().toISOString(),
        });
      });

      app.get('/api/health', (c) => {
        return c.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
        });
      });

      // Database not configured response
      app.get('/api/*', (c) => {
        return c.json({
          success: false,
          error: 'Database not configured',
          message: 'Please set DATABASE_URL environment variable',
        }, 503);
      });

      // Test root endpoint
      const rootRes = await app.request('/');
      expect(rootRes.status).toBe(200);
      
      const rootData = await rootRes.json();
      expect(rootData).toMatchObject({
        message: '神託のメソロギア 非公式カード情報データベース API',
        version: '0.1.0',
        status: 'healthy',
      });

      // Test health endpoint
      const healthRes = await app.request('/api/health');
      expect(healthRes.status).toBe(200);
      
      const healthData = await healthRes.json() as { status: string };
      expect(healthData.status).toBe('ok');

      // Test database not configured
      const apiRes = await app.request('/api/tribes');
      expect(apiRes.status).toBe(503);
      
      const apiData = await apiRes.json();
      expect(apiData).toMatchObject({
        success: false,
        error: 'Database not configured',
      });
    });
  });

  describe('API Route Structure', () => {
    it('should handle different HTTP methods', async () => {
      const app = new Hono();
      
      app.get('/test', (c) => c.json({ method: 'GET' }));
      app.post('/test', (c) => c.json({ method: 'POST' }));
      app.put('/test', (c) => c.json({ method: 'PUT' }));
      app.delete('/test', (c) => c.json({ method: 'DELETE' }));

      const getRes = await app.request('/test', { method: 'GET' });
      expect(getRes.status).toBe(200);
      expect(await getRes.json()).toEqual({ method: 'GET' });

      const postRes = await app.request('/test', { method: 'POST' });
      expect(postRes.status).toBe(200);
      expect(await postRes.json()).toEqual({ method: 'POST' });

      const putRes = await app.request('/test', { method: 'PUT' });
      expect(putRes.status).toBe(200);
      expect(await putRes.json()).toEqual({ method: 'PUT' });

      const deleteRes = await app.request('/test', { method: 'DELETE' });
      expect(deleteRes.status).toBe(200);
      expect(await deleteRes.json()).toEqual({ method: 'DELETE' });
    });

    it('should handle query parameters', async () => {
      const app = new Hono();
      
      app.get('/search', (c) => {
        const query = c.req.query('q');
        const limit = c.req.query('limit') || '10';
        return c.json({ query, limit: parseInt(limit) });
      });

      const res = await app.request('/search?q=test&limit=20');
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toEqual({
        query: 'test',
        limit: 20,
      });
    });

    it('should handle JSON body parsing', async () => {
      const app = new Hono();
      
      app.post('/data', async (c) => {
        const body = await c.req.json();
        return c.json({ received: body });
      });

      const testData = { name: 'テスト', value: 123 };
      const res = await app.request('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      expect(res.status).toBe(200);
      
      const data = await res.json() as { received: any };
      expect(data.received).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const app = new Hono();
      
      app.get('/', (c) => c.json({ status: 'ok' }));

      const res = await app.request('/unknown');
      expect(res.status).toBe(404);
    });

    it('should handle errors in route handlers', async () => {
      const app = new Hono();
      
      app.get('/error', (_c) => {
        throw new Error('Test error');
      });

      app.onError((err, c) => {
        return c.json({
          error: 'Internal Server Error',
          message: err.message,
        }, 500);
      });

      const res = await app.request('/error');
      expect(res.status).toBe(500);
      
      const data = await res.json();
      expect(data).toMatchObject({
        error: 'Internal Server Error',
        message: 'Test error',
      });
    });
  });
});