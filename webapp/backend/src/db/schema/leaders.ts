import { boolean, integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * Leadersテーブル - リーダー情報管理
 *
 * 各リーダーの基本情報、テーマカラー、戦略特性などを管理
 * カードはリーダーに直接依存せず、種族・カテゴリを通じて間接的に関連
 */
export const leaders = pgTable('leaders', {
  // 基本フィールド
  id: integer('id').primaryKey(), // 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
  name: varchar('name', { length: 50 }).notNull().unique(), // リーダー名（日本語）
  nameEn: varchar('name_en', { length: 50 }).notNull().unique(), // リーダー名（英語）
  subName: varchar('sub_name', { length: 100 }), // サブネーム（例：「機械と魔法の融合」）
  description: varchar('description', { length: 500 }), // リーダー説明

  // UI関連
  color: varchar('color', { length: 7 }).notNull(), // テーマカラー（HEX形式：#RRGGBB）
  iconUrl: varchar('icon_url', { length: 500 }), // アイコンURL
  imageUrl: varchar('image_url', { length: 500 }), // リーダー画像URL

  // 管理フィールド
  sortOrder: integer('sort_order').default(0), // 表示順序
  isActive: boolean('is_active').default(true), // アクティブフラグ

  // タイムスタンプ
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // 論理削除用
});

export type Leader = typeof leaders.$inferSelect;
export type NewLeader = typeof leaders.$inferInsert;
