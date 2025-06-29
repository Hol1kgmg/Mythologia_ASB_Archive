export interface LeaderDto {
  id: number;                    // 1:DRAGON, 2:ANDROID, 3:ELEMENTAL, 4:LUMINUS, 5:SHADE
  name: string;                  // リーダー名（日本語）
  nameEn: string;                // リーダー名（英語）
  description?: string;          // リーダー説明
  color: string;                 // テーマカラー（HEX形式）
  iconUrl?: string;              // アイコンURL
  imageUrl?: string;             // リーダー画像URL
  thematic?: string;             // テーマ特性
  focus: string;                 // 戦略フォーカス
  averageCost: number;           // 推奨平均コスト
  preferredCardTypes?: number[]; // 推奨カードタイプID配列
  keyEffects?: string[];         // 主要効果キーワード配列
  sortOrder: number;             // 表示順序
  isActive: boolean;             // アクティブフラグ
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface LeaderListDto {
  leaders: LeaderDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    focusDistribution: Record<string, number>;
  };
}

interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}