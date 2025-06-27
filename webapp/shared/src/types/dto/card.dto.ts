// Import types from other DTOs
import type { TribeDto } from './tribe.dto.js';
import type { CategoryDto } from './category.dto.js';
import type { CardSetDto } from './card-set.dto.js';

export interface CardDto {
  id: string;
  cardNumber: string;          // カード番号（10015等）
  name: string;
  cost: number;
  power: number;
  imageUrl?: string;           // カード画像URL（NULL可）
  tribeId: number;             // 種族ID（必須）
  categoryId?: number;         // カテゴリID（NULL可）
  rarityId: number;            // 1:BRONZE, 2:SILVER, 3:GOLD, 4:LEGEND
  cardTypeId: number;          // 1:ATTACKER, 2:BLOCKER, 3:CHARGER
  cardSetId: string;           // カードセットID
  flavorText?: string;         // フレーバーテキスト
  artist?: string;             // イラストレーター
  effects?: CardEffectDto[];   // カード効果（JSON形式）
  isActive: boolean;           // アクティブフラグ
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // 関連データ（JOIN時に含まれる）
  tribe?: TribeDto;
  category?: CategoryDto;
  cardSet?: CardSetDto;
  
  // 表示用の計算済みプロパティ
  displayName?: string;        // レアリティプレフィックス付き名前
  formattedCost?: string;      // 「3コスト」等の表示形式
}

export interface CardEffectDto {
  description?: string;        // 効果説明文
  abilities?: Array<{
    type: string;              // 効果タイプ
    value?: number;            // 効果値
    target?: string;           // 対象
  }>;
  triggers?: Array<{
    type: string;              // トリガータイプ
    condition?: string;        // 発動条件
  }>;
}

export interface CardListDto {
  cards: CardDto[];
  pagination: PaginationDto;
  filters: {
    totalCount: number;
    tribeDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    costDistribution: Record<number, number>;
    rarityDistribution: Record<string, number>;
    typeDistribution: Record<string, number>;
  };
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}