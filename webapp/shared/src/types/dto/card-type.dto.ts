export interface CardTypeDto {
  id: number;                    // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
  name: string;                  // アタッカー, ブロッカー, チャージャー
  nameEn: string;                // Attacker, Blocker, Charger
  description?: string;          // タイプの説明
  icon?: string;                 // アイコン文字
  color?: string;                // テーマカラー（HEX形式）
  sortOrder: number;             // 表示順序
  isActive: boolean;             // アクティブフラグ
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CardTypeListDto {
  cardTypes: CardTypeDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
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