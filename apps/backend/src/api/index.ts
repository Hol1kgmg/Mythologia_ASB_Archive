import { Hono } from 'hono';
import type { DatabaseAdapter } from '@/types/database';
import { createTribesAPI } from './tribes';
import { createCardsAPI } from './cards';
import { createCardSetsAPI } from './cardSets';

export function createAPIRouter(db: DatabaseAdapter): Hono {
  const app = new Hono();

  // Mount API routes
  app.route('/tribes', createTribesAPI(db));
  app.route('/cards', createCardsAPI(db));
  app.route('/card-sets', createCardSetsAPI(db));

  // API info endpoint
  app.get('/', (c) => {
    return c.json({
      success: true,
      message: '神託のメソロギア 非公式カード情報データベース API',
      version: '0.1.0',
      endpoints: {
        tribes: '/api/tribes',
        cards: '/api/cards',
        cardSets: '/api/card-sets',
        health: '/api/health',
      },
      documentation: 'https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge',
    });
  });

  return app;
}