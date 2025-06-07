/**
 * 管理者リポジトリインターフェース
 * マイルストーン1: システム管理者認証基盤
 */

import type { Admin, AdminSession, AdminActivityLog } from '../models/Admin';
import type { AdminRole } from '@mythologia/shared';

export interface CreateAdminParams {
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: string; // JSON string
  isSuperAdmin: boolean;
  createdBy: string | null;
}

export interface UpdateAdminParams {
  username?: string;
  email?: string;
  passwordHash?: string;
  role?: AdminRole;
  permissions?: string; // JSON string
  isActive?: boolean;
  isSuperAdmin?: boolean;
  lastLoginAt?: Date;
}

export interface AdminFilters {
  isActive?: boolean;
  role?: AdminRole;
  createdBy?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSessionParams {
  adminId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface LogActivityParams {
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AdminRepository {
  // 管理者アカウント操作
  findById(id: string): Promise<Admin | null>;
  findByUsername(username: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  findMany(filters: AdminFilters): Promise<{ admins: Admin[]; total: number }>;
  create(params: CreateAdminParams): Promise<Admin>;
  update(id: string, params: UpdateAdminParams): Promise<Admin>;
  delete(id: string): Promise<void>; // ソフトデリート（is_active = false）

  // セッション管理
  createSession(params: CreateSessionParams): Promise<AdminSession>;
  findSessionByToken(refreshToken: string): Promise<AdminSession | null>;
  deleteSession(sessionId: string): Promise<void>;
  deleteAdminSessions(adminId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>; // 削除された件数を返す

  // アクティビティログ
  logActivity(params: LogActivityParams): Promise<AdminActivityLog>;
  getAdminActivity(adminId: string, limit?: number, offset?: number): Promise<{
    logs: AdminActivityLog[];
    total: number;
  }>;
  getSystemActivity(limit?: number, offset?: number): Promise<{
    logs: AdminActivityLog[];
    total: number;
  }>;

  // 統計・ダッシュボード
  getAdminCount(): Promise<number>;
  getActiveAdminCount(): Promise<number>;
  getRecentLoginCount(hours: number): Promise<number>;
}