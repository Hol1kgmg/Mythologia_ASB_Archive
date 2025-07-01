// Import types from other DTOs
import type { TribeDTO } from './tribe.dto.js';
import type { CategoryDto } from './category.dto.js';
import type { CardSetDto } from './card-set.dto.js';
import type { RarityDto } from './rarity.dto.js';
import type { CardTypeDto } from './card-type.dto.js';

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
  tribe?: TribeDTO;
  category?: CategoryDto;
  cardSet?: CardSetDto;
  rarity?: RarityDto;
  cardType?: CardTypeDto;
  
  // 表示用の計算済みプロパティ
  displayName?: string;        // レアリティプレフィックス付き名前
  formattedCost?: string;      // 「3コスト」等の表示形式
}

export interface CardEffectDto {
  type: number;                // TriggerType: 1:召喚時, 2:攻撃成功時, 3:防御成功時, 4:手札発動, 5:戦場発動, 6:特性
  text: string;                // 効果テキスト
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