import { z } from 'zod';

// カード検索・フィルタースキーマ
export const cardFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  leaderId: z.number().int().min(1).max(5).optional(),
  tribeId: z.number().int().positive().optional(),
  rarityId: z.number().int().min(1).max(4).optional(),
  cardTypeId: z.number().int().min(1).max(3).optional(),
  costMin: z.number().int().min(0).max(10).optional(),
  costMax: z.number().int().min(0).max(10).optional(),
  powerMin: z.number().int().min(0).optional(),
  powerMax: z.number().int().min(0).optional(),
  search: z.string().max(100).optional(),
  cardSetId: z.string().optional(),
  sortBy: z.enum(['name', 'cost', 'power', 'releaseDate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CardFilterInput = z.infer<typeof cardFilterSchema>;