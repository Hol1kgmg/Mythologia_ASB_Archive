/**
 * 管理者関連スキーマ定義
 * PostgreSQL・D1両対応のDrizzle ORMスキーマ
 */

import { pgTable, varchar, boolean, timestamp, json, text as pgText } from 'drizzle-orm/pg-core';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import type { AdminRole, AdminPermissionDTO } from '@mythologia/shared';

// PostgreSQL版スキーマ
export const adminsTablePg = pgTable('admins', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('admin').notNull().$type<AdminRole>(),
  permissions: json('permissions').$type<AdminPermissionDTO[]>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  createdBy: varchar('created_by', { length: 36 }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const adminSessionsTablePg = pgTable('admin_sessions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: varchar('admin_id', { length: 36 }).notNull(),
  refreshToken: varchar('refresh_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: pgText('user_agent'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const adminActivityLogsTablePg = pgTable('admin_activity_logs', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: varchar('admin_id', { length: 36 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }),
  targetId: varchar('target_id', { length: 36 }),
  details: json('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: pgText('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// D1/SQLite版スキーマ
export const adminsTableSqlite = sqliteTable('admins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin').notNull().$type<AdminRole>(),
  permissions: text('permissions', { mode: 'json' }).$type<AdminPermissionDTO[]>().default([]),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  isSuperAdmin: integer('is_super_admin', { mode: 'boolean' }).default(false).notNull(),
  createdBy: text('created_by'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const adminSessionsTableSqlite = sqliteTable('admin_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text('admin_id').notNull(),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const adminActivityLogsTableSqlite = sqliteTable('admin_activity_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text('admin_id').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  details: text('details', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull()
});

// リレーション定義（PostgreSQL）
export const adminsRelationsPg = relations(adminsTablePg, ({ one, many }) => ({
  createdByAdmin: one(adminsTablePg, {
    fields: [adminsTablePg.createdBy],
    references: [adminsTablePg.id]
  }),
  sessions: many(adminSessionsTablePg),
  activityLogs: many(adminActivityLogsTablePg)
}));

export const adminSessionsRelationsPg = relations(adminSessionsTablePg, ({ one }) => ({
  admin: one(adminsTablePg, {
    fields: [adminSessionsTablePg.adminId],
    references: [adminsTablePg.id]
  })
}));

export const adminActivityLogsRelationsPg = relations(adminActivityLogsTablePg, ({ one }) => ({
  admin: one(adminsTablePg, {
    fields: [adminActivityLogsTablePg.adminId],
    references: [adminsTablePg.id]
  })
}));

// リレーション定義（SQLite）
export const adminsRelationsSqlite = relations(adminsTableSqlite, ({ one, many }) => ({
  createdByAdmin: one(adminsTableSqlite, {
    fields: [adminsTableSqlite.createdBy],
    references: [adminsTableSqlite.id]
  }),
  sessions: many(adminSessionsTableSqlite),
  activityLogs: many(adminActivityLogsTableSqlite)
}));

export const adminSessionsRelationsSqlite = relations(adminSessionsTableSqlite, ({ one }) => ({
  admin: one(adminsTableSqlite, {
    fields: [adminSessionsTableSqlite.adminId],
    references: [adminsTableSqlite.id]
  })
}));

export const adminActivityLogsRelationsSqlite = relations(adminActivityLogsTableSqlite, ({ one }) => ({
  admin: one(adminsTableSqlite, {
    fields: [adminActivityLogsTableSqlite.adminId],
    references: [adminsTableSqlite.id]
  })
}));

// 型推論
export type AdminSelectPg = typeof adminsTablePg.$inferSelect;
export type AdminInsertPg = typeof adminsTablePg.$inferInsert;
export type AdminSessionSelectPg = typeof adminSessionsTablePg.$inferSelect;
export type AdminSessionInsertPg = typeof adminSessionsTablePg.$inferInsert;
export type AdminActivityLogSelectPg = typeof adminActivityLogsTablePg.$inferSelect;
export type AdminActivityLogInsertPg = typeof adminActivityLogsTablePg.$inferInsert;

export type AdminSelectSqlite = typeof adminsTableSqlite.$inferSelect;
export type AdminInsertSqlite = typeof adminsTableSqlite.$inferInsert;
export type AdminSessionSelectSqlite = typeof adminSessionsTableSqlite.$inferSelect;
export type AdminSessionInsertSqlite = typeof adminSessionsTableSqlite.$inferInsert;
export type AdminActivityLogSelectSqlite = typeof adminActivityLogsTableSqlite.$inferSelect;
export type AdminActivityLogInsertSqlite = typeof adminActivityLogsTableSqlite.$inferInsert;