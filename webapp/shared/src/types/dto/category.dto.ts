export interface CategoryDto {
  id: number;
  tribeId: number;
  name: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // 関連データ（JOIN時に含まれる）
  tribe?: TribeDto;
}

export interface CategoryListDto {
  categories: CategoryDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    tribeDistribution: Record<string, number>;
  };
}

// TribeDtoとPaginationDtoは他のファイルからimport
interface TribeDto {
  id: number;
  name: string;
  thematic?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  masterCardId?: string;
}

interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}