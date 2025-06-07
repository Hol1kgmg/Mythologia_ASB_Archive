/**
 * テスト用API応答型定義
 * 各テストファイルで共有される型定義
 */

import type { AdminDTO, AdminDetailDTO, AuthResultDTO, TokenRefreshResultDTO, AdminActivityLogDTO } from '@mythologia/shared';

// 基本応答型
export interface ApiSuccessResponse {
  success: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// 管理者関連応答型
export interface AdminListResponse {
  admins: AdminDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminDetailResponse {
  admin: AdminDetailDTO;
}

// 認証関連応答型
export interface AuthResponse extends AuthResultDTO {}

export interface TokenRefreshResponse extends TokenRefreshResultDTO {}

export interface ProfileResponse {
  admin: AdminDTO;
}

// セッション関連応答型
export interface SessionListResponse {
  sessions: AdminSessionDTO[];
  total: number;
}

export interface AdminSessionDTO {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
  createdAt: string;
  lastUsedAt: string;
}

// アクティビティログ応答型
export interface ActivityLogResponse {
  activities: AdminActivityLogDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 型ガード関数
export function isErrorResponse(response: unknown): response is ApiErrorResponse {
  return typeof response === 'object' && response !== null && 'error' in response;
}

export function isSuccessResponse(response: unknown): response is ApiSuccessResponse {
  return typeof response === 'object' && response !== null && 'success' in response;
}