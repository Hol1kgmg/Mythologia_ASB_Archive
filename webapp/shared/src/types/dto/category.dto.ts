import type { TribeDTO } from './tribe.dto.js';

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
  tribe?: TribeDTO;
}

export interface CategoryListDto {
  categories: CategoryDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    tribeDistribution: Record<string, number>;
  };
}

// PaginationDtoは他のファイルからimport

interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}