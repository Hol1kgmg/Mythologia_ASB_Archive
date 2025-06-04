import { pgTable, varchar, date, integer, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const cardSets = pgTable('card_sets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  releaseDate: date('release_date').notNull(),
  cardCount: integer('card_count').default(0),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});