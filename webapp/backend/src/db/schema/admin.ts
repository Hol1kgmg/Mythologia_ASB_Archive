import { pgTable, varchar, boolean, timestamp, json, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Enum for admin roles
export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'admin', 'viewer']);

// Admins table
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: adminRoleEnum('role').default('admin').notNull(),
  permissions: json('permissions').$type<string[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  createdBy: uuid('created_by').references(() => admins.id),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin sessions table
export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').references(() => admins.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin activity logs table
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').references(() => admins.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }),
  targetId: varchar('target_id', { length: 36 }),
  details: json('details').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type inference
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type NewAdminActivityLog = typeof adminActivityLogs.$inferInsert;

// Zod schemas for validation
export const insertAdminSchema = createInsertSchema(admins);
export const selectAdminSchema = createSelectSchema(admins);
export const insertAdminSessionSchema = createInsertSchema(adminSessions);
export const selectAdminSessionSchema = createSelectSchema(adminSessions);
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs);
export const selectAdminActivityLogSchema = createSelectSchema(adminActivityLogs);