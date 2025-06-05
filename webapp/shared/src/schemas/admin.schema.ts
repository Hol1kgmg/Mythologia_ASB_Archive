/**
 * 管理者スキーマ定義
 * Zodを使用した管理者関連データのバリデーション
 */

import { z } from 'zod';

// 管理者権限スキーマ
export const AdminPermissionSchema = z.object({
  resource: z.enum(['cards', 'users', 'admins', 'system']),
  actions: z.array(z.enum(['create', 'read', 'update', 'delete']))
});

// 管理者ロールスキーマ
export const AdminRoleSchema = z.enum(['admin', 'super_admin']);

// 管理者基本スキーマ
export const AdminSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  role: AdminRoleSchema,
  permissions: z.array(AdminPermissionSchema),
  isActive: z.boolean(),
  isSuperAdmin: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// 管理者詳細スキーマ
export const AdminDetailSchema = AdminSchema.extend({
  createdBy: z.string().uuid().nullable(),
  createdByName: z.string().nullable().optional()
});

// 管理者セッションスキーマ
export const AdminSessionSchema = z.object({
  id: z.string().uuid(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  isCurrent: z.boolean(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime()
});

// 管理者アクティビティログスキーマ
export const AdminActivityLogSchema = z.object({
  id: z.string().uuid(),
  adminId: z.string().uuid(),
  adminName: z.string().optional(),
  action: z.string().min(1).max(100),
  targetType: z.string().nullable(),
  targetId: z.string().uuid().nullable(),
  details: z.record(z.any()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime()
});

// 管理者作成スキーマ
export const CreateAdminSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens'
  }),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  }),
  role: AdminRoleSchema.default('admin'),
  permissions: z.array(AdminPermissionSchema).default([]),
  isSuperAdmin: z.boolean().default(false)
});

// 管理者更新スキーマ
export const UpdateAdminSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/).optional(),
  role: AdminRoleSchema.optional(),
  permissions: z.array(AdminPermissionSchema).optional(),
  isActive: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional()
});

// プロフィール更新スキーマ
export const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  email: z.string().email().optional()
});

// パスワード変更スキーマ
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  })
});

// ログインスキーマ
export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false)
});

// 認証結果スキーマ
export const AuthResultSchema = z.object({
  admin: AdminSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().positive()
});

// トークン更新結果スキーマ
export const TokenRefreshResultSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().positive()
});

// 管理者一覧フィルタースキーマ
export const AdminListFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  role: AdminRoleSchema.optional(),
  isActive: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional()
});

// 統計情報スキーマ
export const AdminStatisticsSchema = z.object({
  totalAdmins: z.number().nonnegative(),
  activeAdmins: z.number().nonnegative(),
  superAdmins: z.number().nonnegative(),
  recentLogins: z.number().nonnegative(),
  activeSessions: z.number().nonnegative()
});

// 型エクスポート
export type AdminPermission = z.infer<typeof AdminPermissionSchema>;
export type AdminRole = z.infer<typeof AdminRoleSchema>;
export type Admin = z.infer<typeof AdminSchema>;
export type AdminDetail = z.infer<typeof AdminDetailSchema>;
export type AdminSession = z.infer<typeof AdminSessionSchema>;
export type AdminActivityLog = z.infer<typeof AdminActivityLogSchema>;
export type CreateAdmin = z.infer<typeof CreateAdminSchema>;
export type UpdateAdmin = z.infer<typeof UpdateAdminSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type AuthResult = z.infer<typeof AuthResultSchema>;
export type TokenRefreshResult = z.infer<typeof TokenRefreshResultSchema>;
export type AdminListFilters = z.infer<typeof AdminListFiltersSchema>;
export type AdminStatistics = z.infer<typeof AdminStatisticsSchema>;