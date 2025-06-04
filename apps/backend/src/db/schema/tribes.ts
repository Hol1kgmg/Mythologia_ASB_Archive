import { pgTable, integer, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const tribes = pgTable('tribes', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  leaderId: integer('leader_id'),
  thematic: varchar('thematic', { length: 100 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  masterCardId: varchar('master_card_id', { length: 36 }),
});