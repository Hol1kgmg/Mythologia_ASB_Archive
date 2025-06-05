import { Hono } from 'hono';
import { LeaderSearchParams } from '../domain/models/Leader';

const leaders = new Hono();

leaders.get('/', async (c) => {
  const query = c.req.query();
  const params: LeaderSearchParams = {
    query: query.query,
    filters: {
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      focus: query.focus,
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

leaders.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({
      success: false,
      error: 'Invalid leader ID',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }, 400);
  }
  
  // TODO: Implement actual repository call
  const mockLeader = {
    success: true,
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return c.json(mockLeader);
});

export { leaders };