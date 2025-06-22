import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Enum for admin roles
export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'admin', 'viewer']);

// Admins table
export const admins = pgTable(
  'admins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: adminRoleEnum('role').default('admin').notNull(),
    permissions: json('permissions').$type<string[]>().default([]).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
    createdBy: uuid('created_by'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    createdByFK: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [table.id],
    }),
  })
);

// Admin sessions table
export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    adminFK: foreignKey({
      columns: [table.adminId],
      foreignColumns: [admins.id],
    }),
    adminIdIdx: index('admin_sessions_admin_id_idx').on(table.adminId),
    expiresAtIdx: index('admin_sessions_expires_at_idx').on(table.expiresAt),
    adminExpiresIdx: index('admin_sessions_admin_expires_idx').on(table.adminId, table.expiresAt),
  })
);

// Admin activity logs table
export const adminActivityLogs = pgTable(
  'admin_activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    targetType: varchar('target_type', { length: 50 }),
    targetId: varchar('target_id', { length: 36 }),
    details: json('details').$type<Record<string, any>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    adminFK: foreignKey({
      columns: [table.adminId],
      foreignColumns: [admins.id],
    }),
    adminIdIdx: index('admin_activity_logs_admin_id_idx').on(table.adminId),
    createdAtIdx: index('admin_activity_logs_created_at_idx').on(table.createdAt),
    adminCreatedIdx: index('admin_activity_logs_admin_created_idx').on(
      table.adminId,
      table.createdAt
    ),
    actionIdx: index('admin_activity_logs_action_idx').on(table.action),
    actionCreatedIdx: index('admin_activity_logs_action_created_idx').on(
      table.action,
      table.createdAt
    ),
    targetIdx: index('admin_activity_logs_target_idx').on(table.targetType, table.targetId),
  })
);

// Relations (defined separately to avoid circular references)
export const adminsRelations = relations(admins, ({ many, one }) => ({
  sessions: many(adminSessions),
  activityLogs: many(adminActivityLogs),
  createdByAdmin: one(admins, {
    fields: [admins.createdBy],
    references: [admins.id],
  }),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(admins, {
    fields: [adminSessions.adminId],
    references: [admins.id],
  }),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [adminActivityLogs.adminId],
    references: [admins.id],
  }),
}));

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
