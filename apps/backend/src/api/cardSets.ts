import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { DatabaseAdapter } from '@/types/database';
import { 
  CreateCardSetSchema, 
  UpdateCardSetSchema, 
  CardSetParamsSchema 
} from '@/types/validation';
import { transformCardSetForDb, transformCardSetUpdateForDb } from '@/utils/transform';

export function createCardSetsAPI(db: DatabaseAdapter): Hono {
  const app = new Hono();

  // GET /card-sets - Get all card sets
  app.get('/', async (c) => {
    try {
      const cardSets = await db.getCardSets();
      return c.json({
        success: true,
        data: cardSets,
        count: cardSets.length,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch card sets',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // GET /card-sets/:id - Get card set by id
  app.get('/:id', zValidator('param', CardSetParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');
      const cardSet = await db.getCardSet(id);
      
      if (!cardSet) {
        return c.json({
          success: false,
          error: 'Card set not found',
        }, 404);
      }

      return c.json({
        success: true,
        data: cardSet,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch card set',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // POST /card-sets - Create card set
  app.post('/', zValidator('json', CreateCardSetSchema), async (c) => {
    try {
      const cardSetData = c.req.valid('json');
      const cardSet = await db.createCardSet(transformCardSetForDb(cardSetData));
      
      return c.json({
        success: true,
        data: cardSet,
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to create card set',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // PUT /card-sets/:id - Update card set
  app.put(
    '/:id',
    zValidator('param', CardSetParamsSchema),
    zValidator('json', UpdateCardSetSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const updateData = c.req.valid('json');

        // Check if card set exists
        const existingCardSet = await db.getCardSet(id);
        if (!existingCardSet) {
          return c.json({
            success: false,
            error: 'Card set not found',
          }, 404);
        }

        const updatedCardSet = await db.updateCardSet(id, transformCardSetUpdateForDb(updateData));
        
        return c.json({
          success: true,
          data: updatedCardSet,
        });
      } catch (error) {
        return c.json({
          success: false,
          error: 'Failed to update card set',
          message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
      }
    }
  );

  // DELETE /card-sets/:id - Delete card set (soft delete)
  app.delete('/:id', zValidator('param', CardSetParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');

      // Check if card set exists
      const existingCardSet = await db.getCardSet(id);
      if (!existingCardSet) {
        return c.json({
          success: false,
          error: 'Card set not found',
        }, 404);
      }

      const success = await db.deleteCardSet(id);
      
      if (!success) {
        return c.json({
          success: false,
          error: 'Failed to delete card set',
        }, 500);
      }

      return c.json({
        success: true,
        message: 'Card set deleted successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to delete card set',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  return app;
}