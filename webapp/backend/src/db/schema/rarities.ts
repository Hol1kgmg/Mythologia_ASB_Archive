import {
  boolean,
  decimal,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Raritiesテーブル - カードレアリティ管理
 * 
 * カードのレアリティ情報を管理
 * ID: 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
 */
export const rarities = pgTable('rarities', {
  // 基本フィールド
  id: integer('id').primaryKey(), // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
  name: varchar('name', { length: 50 }).notNull().unique(), // ブロンズ, シルバー, ゴールド, レジェンド
  nameEn: varchar('name_en', { length: 50 }).notNull().unique(), // Bronze, Silver, Gold, Legend
  
  // UI関連
  color: varchar('color', { length: 7 }).notNull(), // テーマカラー（HEX形式）
  icon: varchar('icon', { length: 10 }), // アイコン文字（★, ◆等）
  
  // ゲーム関連設定
  maxInDeck: integer('max_in_deck').default(3), // デッキ内最大枚数
  dropRate: decimal('drop_rate', { precision: 6, scale: 3 }).default('0.000'), // パック排出率（0.000-1.000）
  
  // 管理フィールド
  sortOrder: integer('sort_order').default(0), // 表示順序（低い値が先）
  isActive: boolean('is_active').default(true), // アクティブフラグ
  
  // タイムスタンプ
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // 論理削除用
});

export type Rarity = typeof rarities.$inferSelect;
export type NewRarity = typeof rarities.$inferInsert;