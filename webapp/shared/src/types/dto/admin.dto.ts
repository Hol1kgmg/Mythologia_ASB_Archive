/**
 * 管理者DTOs（Data Transfer Objects）
 * フロントエンド・バックエンド間で共有される管理者関連の型定義
 */

// 管理者権限
export interface AdminPermissionDTO {
  resource: 'cards' | 'users' | 'admins' | 'system';
  actions: Array<'create' | 'read' | 'update' | 'delete'>;
}

// 管理者ロール
export type AdminRole = 'admin' | 'super_admin';

// 管理者基本情報
export interface AdminDTO {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermissionDTO[];
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// 管理者詳細情報（作成者情報含む）
export interface AdminDetailDTO extends AdminDTO {
  createdBy: string | null;
  createdByName?: string | null; // 作成者の表示名
}

// 管理者セッション情報
export interface AdminSessionDTO {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
  createdAt: string; // ISO 8601 string
  lastUsedAt: string; // ISO 8601 string
}

// 管理者アクティビティログ
// TODO: 行動ログ機能は優先度が低いため、後で実装予定
export interface AdminActivityLogDTO {
  id: string;
  adminId: string;
  adminName?: string; // 管理者の表示名
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string; // ISO 8601 string
}

// 管理者作成パラメータ
export interface CreateAdminDTO {
  username: string;
  email: string;
  password: string;
  role?: AdminRole;
  permissions?: AdminPermissionDTO[];
  isSuperAdmin?: boolean;
}

// 管理者更新パラメータ
export interface UpdateAdminDTO {
  username?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  permissions?: AdminPermissionDTO[];
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

// プロフィール更新パラメータ
export interface UpdateProfileDTO {
  username?: string;
  email?: string;
}

// パスワード変更パラメータ
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ログインパラメータ
export interface LoginDTO {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 認証結果
export interface AuthResultDTO {
  admin: AdminDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

// トークン更新結果
export interface TokenRefreshResultDTO {
  accessToken: string;
  expiresIn: number; // seconds
}

// 管理者一覧フィルター
export interface AdminListFiltersDTO {
  page?: number;
  limit?: number;
  role?: AdminRole;
  isActive?: boolean;
  createdBy?: string;
  search?: string; // username/email検索
}

// 統計情報
export interface AdminStatisticsDTO {
  totalAdmins: number;
  activeAdmins: number;
  superAdmins: number;
  recentLogins: number; // 過去24時間のログイン数
  activeSessions: number;
}