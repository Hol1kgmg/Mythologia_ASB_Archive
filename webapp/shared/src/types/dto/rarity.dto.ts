export interface RarityDto {
  id: number;                    // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
  name: string;                  // ブロンズ, シルバー, ゴールド, レジェンド
  nameEn: string;                // Bronze, Silver, Gold, Legend
  color: string;                 // テーマカラー（HEX形式）
  icon?: string;                 // アイコン文字
  maxInDeck: number;             // デッキ内最大枚数
  dropRate: number;              // パック排出率
  sortOrder: number;             // 表示順序
  isActive: boolean;             // アクティブフラグ
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface RarityListDto {
  rarities: RarityDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    dropRateDistribution: Record<string, number>;
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