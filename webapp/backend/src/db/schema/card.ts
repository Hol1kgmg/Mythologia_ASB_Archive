import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { tribes } from './tribe.js';

// Card sets table (収録パック)
export const cardSets = pgTable(
  'card_sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    releaseDate: date('release_date').notNull(),
    cardCount: integer('card_count').default(0).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    codeIdx: index('card_sets_code_idx').on(table.code),
    releaseDateIdx: index('card_sets_release_date_idx').on(table.releaseDate),
    activeIdx: index('card_sets_active_idx').on(table.isActive),
  })
);

// Categories table (カテゴリ分類)
export const categories = pgTable(
  'categories',
  {
    id: integer('id').primaryKey(),
    tribeId: integer('tribe_id').notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    nameEn: varchar('name_en', { length: 50 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tribeFK: foreignKey({
      columns: [table.tribeId],
      foreignColumns: [tribes.id],
    }),
    tribeIdIdx: index('categories_tribe_id_idx').on(table.tribeId),
    nameIdx: index('categories_name_idx').on(table.name),
    nameEnIdx: index('categories_name_en_idx').on(table.nameEn),
    activeIdx: index('categories_active_idx').on(table.isActive),
    deletedAtIdx: index('categories_deleted_at_idx').on(table.deletedAt),
    // Unique constraints
    uniqueTribeName: index('categories_tribe_name_unique').on(table.tribeId, table.name),
    uniqueTribeNameEn: index('categories_tribe_name_en_unique').on(table.tribeId, table.nameEn),
  })
);

// Cards table (メインカードテーブル)
export const cards = pgTable(
  'cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardNumber: varchar('card_number', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    tribeId: integer('tribe_id').notNull(),
    categoryId: integer('category_id'),
    rarityId: integer('rarity_id').notNull(),
    cardTypeId: integer('card_type_id').notNull(),
    cost: integer('cost').notNull(),
    power: integer('power').notNull(),
    effects: json('effects').$type<{
      description?: string;
      abilities?: Array<{
        type: string;
        value?: number;
        target?: string;
      }>;
      triggers?: Array<{
        type: string;
        condition?: string;
      }>;
    }>(),
    flavorText: text('flavor_text'),
    imageUrl: varchar('image_url', { length: 500 }),
    artist: varchar('artist', { length: 100 }),
    cardSetId: uuid('card_set_id').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Foreign keys
    tribeFK: foreignKey({
      columns: [table.tribeId],
      foreignColumns: [tribes.id],
    }),
    categoryFK: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }),
    cardSetFK: foreignKey({
      columns: [table.cardSetId],
      foreignColumns: [cardSets.id],
    }),
    
    // Basic indexes
    nameIdx: index('cards_name_idx').on(table.name),
    cardNumberIdx: index('cards_card_number_idx').on(table.cardNumber),
    rarityIdIdx: index('cards_rarity_id_idx').on(table.rarityId),
    cardTypeIdIdx: index('cards_card_type_id_idx').on(table.cardTypeId),
    tribeIdIdx: index('cards_tribe_id_idx').on(table.tribeId),
    categoryIdIdx: index('cards_category_id_idx').on(table.categoryId),
    costIdx: index('cards_cost_idx').on(table.cost),
    powerIdx: index('cards_power_idx').on(table.power),
    cardSetIdx: index('cards_card_set_idx').on(table.cardSetId),
    activeIdx: index('cards_active_idx').on(table.isActive),
    deletedAtIdx: index('cards_deleted_at_idx').on(table.deletedAt),
    
    // Composite indexes (よく使われる組み合わせ)
    rarityTypeIdx: index('cards_rarity_type_idx').on(table.rarityId, table.cardTypeId),
    tribeTypeIdx: index('cards_tribe_type_idx').on(table.tribeId, table.cardTypeId),
    tribeCategoryIdx: index('cards_tribe_category_idx').on(table.tribeId, table.categoryId),
    costPowerIdx: index('cards_cost_power_idx').on(table.cost, table.power),
    setActiveIdx: index('cards_set_active_idx').on(table.cardSetId, table.isActive),
  })
);

// Relations
export const cardSetsRelations = relations(cardSets, ({ many }) => ({
  cards: many(cards),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  tribe: one(tribes, {
    fields: [categories.tribeId],
    references: [tribes.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  tribe: one(tribes, {
    fields: [cards.tribeId],
    references: [tribes.id],
  }),
  category: one(categories, {
    fields: [cards.categoryId],
    references: [categories.id],
  }),
  cardSet: one(cardSets, {
    fields: [cards.cardSetId],
    references: [cardSets.id],
  }),
}));

// Type inference
export type CardSet = typeof cardSets.$inferSelect;
export type NewCardSet = typeof cardSets.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

// Zod schemas for validation
export const insertCardSetSchema = createInsertSchema(cardSets);
export const selectCardSetSchema = createSelectSchema(cardSets);
export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export const insertCardSchema = createInsertSchema(cards);
export const selectCardSchema = createSelectSchema(cards);