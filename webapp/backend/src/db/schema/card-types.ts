import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Card Typesテーブル - カードタイプ管理
 * 
 * カードのタイプ情報を管理
 * ID: 1:ATTACKER, 2:BLOCKER, 3:CHARGER
 */
export const cardTypes = pgTable('card_types', {
  // 基本フィールド
  id: integer('id').primaryKey(), // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
  name: varchar('name', { length: 50 }).notNull().unique(), // アタッカー, ブロッカー, チャージャー
  nameEn: varchar('name_en', { length: 50 }).notNull().unique(), // Attacker, Blocker, Charger
  description: varchar('description', { length: 500 }), // タイプの説明
  
  // UI関連
  icon: varchar('icon', { length: 10 }), // アイコン文字（⚔, 🛡, ⚡等）
  color: varchar('color', { length: 7 }), // テーマカラー（HEX形式）
  
  // 管理フィールド
  sortOrder: integer('sort_order').default(0), // 表示順序（低い値が先）
  isActive: boolean('is_active').default(true), // アクティブフラグ
  
  // タイムスタンプ
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // 論理削除用
});

export type CardType = typeof cardTypes.$inferSelect;
export type NewCardType = typeof cardTypes.$inferInsert;