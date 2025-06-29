import { boolean, index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { leaders } from './leaders';

// Tribes table (種族テーブル)
export const tribes = pgTable(
  'tribes',
  {
    id: integer('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    leaderId: integer('leader_id').references(() => leaders.id, { onDelete: 'set null' }), // リーダーID外部キー
    thematic: varchar('thematic', { length: 100 }),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    masterCardId: varchar('master_card_id', { length: 36 }),
  },
  (table) => ({
    nameIdx: index('tribes_name_idx').on(table.name),
    activeIdx: index('tribes_active_idx').on(table.isActive),
    leaderIdx: index('tribes_leader_idx').on(table.leaderId), // リーダーIDインデックス
  })
);

// Type inference
export type Tribe = typeof tribes.$inferSelect;
export type NewTribe = typeof tribes.$inferInsert;

// Zod schemas for validation
export const insertTribeSchema = createInsertSchema(tribes);
export const selectTribeSchema = createSelectSchema(tribes);
