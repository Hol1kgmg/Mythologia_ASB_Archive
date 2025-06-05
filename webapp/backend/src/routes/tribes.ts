import { Hono } from 'hono';
import { TribeSearchParams } from '../domain/models/Tribe';

const tribes = new Hono();

tribes.get('/', async (c) => {
  const query = c.req.query();
  const params: TribeSearchParams = {
    query: query.query,
    filters: {
      leaderId: query.leaderId ? Number(query.leaderId) : undefined,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
    },
    sortBy: query.sortBy as any,
    sortOrder: query.sortOrder as any,
  };
  
  // TODO: Implement actual repository call
  const mockResponse = {
    success: true,
    data: [],
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return c.json(mockResponse);
});

tribes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({
      success: false,
      error: 'Invalid tribe ID',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }, 400);
  }
  
  // TODO: Implement actual repository call
  const mockTribe = {
    success: true,
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return c.json(mockTribe);
});

export { tribes };