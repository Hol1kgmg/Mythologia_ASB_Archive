/**
 * 種族DTOs（Data Transfer Objects）
 * フロントエンド・バックエンド間で共有される種族関連の型定義
 */

// 種族基本情報
export interface TribeDTO {
  id: number;
  name: string;
  leaderId: number | null;
  thematic: string | null;
  description: string | null;
  isActive: boolean;
  masterCardId: string | null;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// 種族詳細情報（リーダー情報含む）
export interface TribeDetailDTO extends TribeDTO {
  leaderName?: string | null; // リーダーの表示名
}

// 種族作成パラメータ
export interface CreateTribeDTO {
  name: string;
  leaderId?: number | null;
  thematic?: string | null;
  description?: string | null;
  isActive?: boolean;
  masterCardId?: string | null;
}

// 種族更新パラメータ
export interface UpdateTribeDTO {
  name?: string;
  leaderId?: number | null;
  thematic?: string | null;
  description?: string | null;
  isActive?: boolean;
  masterCardId?: string | null;
}

// 種族一覧フィルター
export interface TribeListFiltersDTO {
  page?: number;
  limit?: number;
  leaderId?: number;
  isActive?: boolean;
  search?: string; // name検索
}