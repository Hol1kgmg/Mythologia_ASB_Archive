import { z } from 'zod';
import { Rarity, CardType, Leader } from './enums';

// Tribe validation schemas
export const CreateTribeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(50),
  leaderId: z.number().int().min(1).max(5).optional(),
  thematic: z.string().max(100).optional(),
  description: z.string().optional(),
  masterCardId: z.string().uuid().optional(),
});

export const UpdateTribeSchema = CreateTribeSchema.partial().omit({ id: true });

// Card Set validation schemas
export const CreateCardSetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cardCount: z.number().int().min(0).default(0),
  description: z.string().optional(),
});

export const UpdateCardSetSchema = CreateCardSetSchema.partial().omit({ id: true });

// Card Effect schema
export const CardEffectSchema = z.object({
  description: z.string(),
  abilities: z.array(z.object({
    type: z.string(),
    value: z.number().optional(),
    target: z.string().optional(),
  })),
  triggers: z.array(z.object({
    type: z.string(),
    condition: z.string().optional(),
  })),
  targets: z.array(z.object({
    type: z.string(),
    filter: z.string().optional(),
  })),
});

// Card validation schemas
export const CreateCardSchema = z.object({
  id: z.string().uuid(),
  cardNumber: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  leaderId: z.nativeEnum(Leader).optional(),
  tribeId: z.number().int().positive().optional(),
  rarityId: z.nativeEnum(Rarity),
  cardTypeId: z.nativeEnum(CardType),
  cost: z.number().int().min(0),
  power: z.number().int().min(0),
  effects: CardEffectSchema,
  flavorText: z.string().optional(),
  imageUrl: z.string().url().max(500),
  artist: z.string().max(100).optional(),
  cardSetId: z.string().uuid(),
});

export const UpdateCardSchema = CreateCardSchema.partial().omit({ id: true });

// Query parameter schemas
export const TribeParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
});

export const CardSetParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CardParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CardQuerySchema = z.object({
  leaderId: z.string().transform((val) => parseInt(val, 10)).pipe(z.nativeEnum(Leader)).optional(),
  tribeId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
  rarityId: z.string().transform((val) => parseInt(val, 10)).pipe(z.nativeEnum(Rarity)).optional(),
  cardTypeId: z.string().transform((val) => parseInt(val, 10)).pipe(z.nativeEnum(CardType)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default('20'),
  offset: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(0)).default('0'),
});

// Export types
export type CreateTribeInput = z.infer<typeof CreateTribeSchema>;
export type UpdateTribeInput = z.infer<typeof UpdateTribeSchema>;
export type CreateCardSetInput = z.infer<typeof CreateCardSetSchema>;
export type UpdateCardSetInput = z.infer<typeof UpdateCardSetSchema>;
export type CreateCardInput = z.infer<typeof CreateCardSchema>;
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
export type CardQuery = z.infer<typeof CardQuerySchema>;