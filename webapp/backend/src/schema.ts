import { pgTable, varchar, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

// adminsテーブルのみ - 最小構成
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});