import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { DatabaseAdapter } from '@/types/database';
import { 
  CreateTribeSchema, 
  UpdateTribeSchema, 
  TribeParamsSchema 
} from '@/types/validation';
import { transformTribeForDb, transformTribeUpdateForDb } from '@/utils/transform';

export function createTribesAPI(db: DatabaseAdapter): Hono {
  const app = new Hono();

  // GET /tribes - Get all tribes
  app.get('/', async (c) => {
    try {
      const tribes = await db.getTribes();
      return c.json({
        success: true,
        data: tribes,
        count: tribes.length,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch tribes',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // GET /tribes/:id - Get tribe by id
  app.get('/:id', zValidator('param', TribeParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');
      const tribe = await db.getTribe(id);
      
      if (!tribe) {
        return c.json({
          success: false,
          error: 'Tribe not found',
        }, 404);
      }

      return c.json({
        success: true,
        data: tribe,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch tribe',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // POST /tribes - Create tribe
  app.post('/', zValidator('json', CreateTribeSchema), async (c) => {
    try {
      const tribeData = c.req.valid('json');
      const tribe = await db.createTribe(transformTribeForDb(tribeData));
      
      return c.json({
        success: true,
        data: tribe,
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to create tribe',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  // PUT /tribes/:id - Update tribe
  app.put(
    '/:id',
    zValidator('param', TribeParamsSchema),
    zValidator('json', UpdateTribeSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const updateData = c.req.valid('json');

        // Check if tribe exists
        const existingTribe = await db.getTribe(id);
        if (!existingTribe) {
          return c.json({
            success: false,
            error: 'Tribe not found',
          }, 404);
        }

        const updatedTribe = await db.updateTribe(id, transformTribeUpdateForDb(updateData));
        
        return c.json({
          success: true,
          data: updatedTribe,
        });
      } catch (error) {
        return c.json({
          success: false,
          error: 'Failed to update tribe',
          message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
      }
    }
  );

  // DELETE /tribes/:id - Delete tribe (soft delete)
  app.delete('/:id', zValidator('param', TribeParamsSchema), async (c) => {
    try {
      const { id } = c.req.valid('param');

      // Check if tribe exists
      const existingTribe = await db.getTribe(id);
      if (!existingTribe) {
        return c.json({
          success: false,
          error: 'Tribe not found',
        }, 404);
      }

      const success = await db.deleteTribe(id);
      
      if (!success) {
        return c.json({
          success: false,
          error: 'Failed to delete tribe',
        }, 500);
      }

      return c.json({
        success: true,
        message: 'Tribe deleted successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to delete tribe',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, 500);
    }
  });

  return app;
}