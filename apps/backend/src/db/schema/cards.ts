import { pgTable, varchar, integer, text, boolean, timestamp, json } from 'drizzle-orm/pg-core';
import { tribes } from './tribes';
import { cardSets } from './cardSets';

export const cards = pgTable('cards', {
  id: varchar('id', { length: 36 }).primaryKey(),
  cardNumber: varchar('card_number', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  leaderId: integer('leader_id'),
  tribeId: integer('tribe_id').references(() => tribes.id),
  rarityId: integer('rarity_id').notNull(),
  cardTypeId: integer('card_type_id').notNull(),
  cost: integer('cost').notNull(),
  power: integer('power').notNull(),
  effects: json('effects').notNull(),
  flavorText: text('flavor_text'),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  artist: varchar('artist', { length: 100 }),
  cardSetId: varchar('card_set_id', { length: 36 }).notNull().references(() => cardSets.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});