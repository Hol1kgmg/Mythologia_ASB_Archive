import { serve } from '@hono/node-server';
import app from './index';

const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Server is running on port ${port}`);
console.log(`📖 API Documentation: http://localhost:${port}/api`);
console.log(`💚 Health Check: http://localhost:${port}/api/health`);

serve({
  fetch: app.fetch,
  port,
});