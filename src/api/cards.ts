import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { DatabaseAdapter } from '@/types/database';
import { 
  CreateCardSchema, 
  UpdateCardSchema, 
  CardParamsSchema,
  CardQuerySchema 
} from '@/types/validation';

export function createCardsAPI(db: DatabaseAdapter): Hono {
  const app = new Hono();

  // GET /cards - Get all cards with filtering
  app.get('/', zValidator('query', CardQuerySchema), async (c) => {
    try {
      const query = c.req.valid('query');
      let cards;

      // Apply filters based on query parameters
      if (query.leaderId) {
        cards = await db.getCardsByLeader(query.leaderId);
      } else if (query.tribeId) {
        cards = await db.getCardsByTribe(query.tribeId);
      } else if (query.rarityId) {
        cards = await db.getCardsByRarity(query.rarityId);
      } else if (query.cardTypeId) {
        cards = await db.getCardsByType(query.cardTypeId);
      } else {
        cards = await db.getCards();
      }

      // Apply pagination
      const offset = parseInt(query.offset);
      const limit = parseInt(query.limit);
      const paginatedCards = cards.slice(offset, offset + limit);

      return c.json({
        success: true,
        data: paginatedCards,
        count: paginatedCards.length,
        total: cards.length,
        pagination: {
          offset,
          limit,
          hasNext: offset + limit < cards.length,
          hasPrev: offset > 0,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch cards',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // GET /cards/:id - Get card by id
  app.get('/:id', zValidator('param', CardParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');
      const card = await db.getCard(id);
      
      if (!card) {
        return c.json({
          success: false,
          error: 'Card not found',
        }, 404);
      }

      return c.json({
        success: true,
        data: card,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch card',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // POST /cards - Create card
  app.post('/', zValidator('json', CreateCardSchema), async (c) => {
    try {
      const cardData = c.req.valid('json');
      const card = await db.createCard(cardData);
      
      return c.json({
        success: true,
        data: card,
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to create card',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // PUT /cards/:id - Update card
  app.put(
    '/:id',
    zValidator('param', CardParamsSchema),
    zValidator('json', UpdateCardSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const updateData = c.req.valid('json');

        // Check if card exists
        const existingCard = await db.getCard(id);
        if (!existingCard) {
          return c.json({
            success: false,
            error: 'Card not found',
          }, 404);
        }

        const updatedCard = await db.updateCard(id, updateData);
        
        return c.json({
          success: true,
          data: updatedCard,
        });
      } catch (error) {
        return c.json({
          success: false,
          error: 'Failed to update card',
          message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
      }
    }
  );

  // DELETE /cards/:id - Delete card (soft delete)
  app.delete('/:id', zValidator('param', CardParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');

      // Check if card exists
      const existingCard = await db.getCard(id);
      if (!existingCard) {
        return c.json({
          success: false,
          error: 'Card not found',
        }, 404);
      }

      const success = await db.deleteCard(id);
      
      if (!success) {
        return c.json({
          success: false,
          error: 'Failed to delete card',
        }, 500);
      }

      return c.json({
        success: true,
        message: 'Card deleted successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to delete card',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  return app;
}