import { Hono } from 'hono';
import { CardSearchParams } from '../domain/models/Card';

const cards = new Hono();

cards.get('/', async (c) => {
  const query = c.req.query();
  const params: CardSearchParams = {
    query: query.query,
    filters: {
      rarity: query.rarity ? Number(query.rarity) : undefined,
      cardType: query.cardType ? Number(query.cardType) : undefined,
      archetype: query.archetype ? Number(query.archetype) : undefined,
      leaderId: query.leaderId ? Number(query.leaderId) : undefined,
      tribeId: query.tribeId ? Number(query.tribeId) : undefined,
      costMin: query.costMin ? Number(query.costMin) : undefined,
      costMax: query.costMax ? Number(query.costMax) : undefined,
      attackMin: query.attackMin ? Number(query.attackMin) : undefined,
      attackMax: query.attackMax ? Number(query.attackMax) : undefined,
      defenseMin: query.defenseMin ? Number(query.defenseMin) : undefined,
      defenseMax: query.defenseMax ? Number(query.defenseMax) : undefined,
      setCode: query.setCode,
    },
    sortBy: query.sortBy as any,
    sortOrder: query.sortOrder as any,
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
  };
  
  // TODO: Implement actual repository call
  const mockResponse = {
    success: true,
    data: {
      cards: [],
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return c.json(mockResponse);
});

cards.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  // TODO: Implement actual repository call
  const mockCard = {
    success: true,
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return c.json(mockCard);
});

export { cards };