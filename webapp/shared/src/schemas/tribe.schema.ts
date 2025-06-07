/**
 * 種族スキーマ定義
 * Zodを使用した種族関連データのバリデーション
 */

import { z } from 'zod';

// 種族基本スキーマ
export const TribeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(50),
  leaderId: z.number().int().positive().nullable(),
  thematic: z.string().max(100).nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  masterCardId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// 種族詳細スキーマ
export const TribeDetailSchema = TribeSchema.extend({
  leaderName: z.string().nullable().optional()
});

// 種族作成スキーマ
export const CreateTribeSchema = z.object({
  name: z.string().min(1).max(50),
  leaderId: z.number().int().positive().nullable().optional(),
  thematic: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  masterCardId: z.string().uuid().nullable().optional()
});

// 種族更新スキーマ
export const UpdateTribeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  leaderId: z.number().int().positive().nullable().optional(),
  thematic: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  masterCardId: z.string().uuid().nullable().optional()
});

// 種族一覧フィルタースキーマ
export const TribeListFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  leaderId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

// 型エクスポート
export type Tribe = z.infer<typeof TribeSchema>;
export type TribeDetail = z.infer<typeof TribeDetailSchema>;
export type CreateTribe = z.infer<typeof CreateTribeSchema>;
export type UpdateTribe = z.infer<typeof UpdateTribeSchema>;
export type TribeListFilters = z.infer<typeof TribeListFiltersSchema>;