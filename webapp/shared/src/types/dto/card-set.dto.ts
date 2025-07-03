export interface CardSetDto {
  id: string;
  name: string;
  code: string;
  releaseDate: string;         // ISO date string
  cardCount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // 統計情報（必要に応じて含まれる）
  stats?: {
    totalCards: number;
    rarityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
    costDistribution: Record<number, number>;
  };
}

export interface CardSetListDto {
  cardSets: CardSetDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    releaseYearDistribution: Record<string, number>;
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