import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { cards, categories } from './card';

/**
 * Card Categoriesテーブル - カードとカテゴリの多対多関係
 * 
 * カードは複数のカテゴリに属することができる
 * 1つのカードに対して主カテゴリ（is_primary=true）を1つ設定可能
 */
export const cardCategories = pgTable(
  'card_categories',
  {
    // 複合主キー
    cardId: uuid('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    
    // 関係性の設定
    isPrimary: boolean('is_primary').default(false), // 主カテゴリフラグ（1カードに1つまで）
    
    // 管理フィールド  
    isActive: boolean('is_active').default(true), // アクティブフラグ
    
    // タイムスタンプ
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'), // 論理削除用
  },
  (table) => ({
    // 複合主キー
    pk: primaryKey({ columns: [table.cardId, table.categoryId] }),
    
    // インデックス
    cardIdx: index('card_categories_card_idx').on(table.cardId),
    categoryIdx: index('card_categories_category_idx').on(table.categoryId),
    primaryIdx: index('card_categories_primary_idx').on(table.cardId, table.isPrimary), // 主カテゴリ検索用
    activeIdx: index('card_categories_active_idx').on(table.isActive),
  })
);

export type CardCategory = typeof cardCategories.$inferSelect;
export type NewCardCategory = typeof cardCategories.$inferInsert;